/**
 * Metro Network Route Planner & Graph Pathfinding
 * Finds optimal route between any two Hyderabad Metro stations,
 * including single-line and cross-line transfers (Ameerpet, MGBS, Parade Ground).
 */

import { METRO_STATIONS, METRO_LINES, calculateMetroFare, getCanonicalStationName } from '../data/metroStations';
import { getDistanceMeters } from './geo';

/**
 * Builds an adjacency graph of the Hyderabad Metro network
 */
function buildMetroGraph() {
  const graph = new Map(); // stationId -> Array<{ toStationId, distanceKm, line, isTransfer }>

  const addEdge = (u, v, distKm, line, isTransfer = false) => {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push({ toStationId: v, distanceKm: distKm, line, isTransfer });
  };

  // Group stations by line
  const lines = { RED: [], BLUE: [], GREEN: [] };
  METRO_STATIONS.forEach((st) => {
    if (lines[st.line]) {
      lines[st.line].push(st);
    }
  });

  // Sort each line by order
  Object.keys(lines).forEach((lineKey) => {
    lines[lineKey].sort((a, b) => a.order - b.order);
    const stList = lines[lineKey];
    for (let i = 0; i < stList.length - 1; i++) {
      const s1 = stList[i];
      const s2 = stList[i + 1];
      const distKm = getDistanceMeters(s1.lat, s1.lng, s2.lat, s2.lng) / 1000;
      addEdge(s1.id, s2.id, distKm, lineKey, false);
      addEdge(s2.id, s1.id, distKm, lineKey, false);
    }
  });

  // Cross-line Interchange Virtual Edges (zero or walking distance)
  // 1. Ameerpet (R11 <-> B10)
  addEdge('R11', 'B10', 0.05, 'INTERCHANGE', true);
  addEdge('B10', 'R11', 0.05, 'INTERCHANGE', true);

  // 2. MG Bus Station (R20 <-> G09)
  addEdge('R20', 'G09', 0.05, 'INTERCHANGE', true);
  addEdge('G09', 'R20', 0.05, 'INTERCHANGE', true);

  // 3. Parade Ground / JBS Parade Ground (B15 <-> G01)
  addEdge('B15', 'G01', 0.15, 'INTERCHANGE', true);
  addEdge('G01', 'B15', 0.15, 'INTERCHANGE', true);

  return graph;
}

const metroGraph = buildMetroGraph();
const stationMap = new Map(METRO_STATIONS.map((s) => [s.id, s]));

/**
 * Finds shortest route using Dijkstra's algorithm
 */
export function findRoute(originStationId, destStationId) {
  if (!originStationId || !destStationId) return null;
  if (originStationId === destStationId) {
    const s = stationMap.get(originStationId);
    return {
      stations: [s],
      transfers: [],
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      fare: 10,
      linesUsed: [s.line]
    };
  }

  const distances = new Map();
  const previous = new Map();
  const edgeUsed = new Map();
  const visited = new Set();
  const queue = [{ id: originStationId, dist: 0 }];

  METRO_STATIONS.forEach((s) => distances.set(s.id, Infinity));
  distances.set(originStationId, 0);

  while (queue.length > 0) {
    // Sort to get node with smallest distance (min-priority queue)
    queue.sort((a, b) => a.dist - b.dist);
    const { id: currentId, dist: currentDist } = queue.shift();

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === destStationId) break;

    const neighbors = metroGraph.get(currentId) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.toStationId)) continue;

      // Penalize transfers slightly (add 3 km equivalent cost) to prefer direct routes if distance is close
      const edgeWeight = edge.isTransfer ? 3.0 : edge.distanceKm;
      const newDist = currentDist + edgeWeight;

      if (newDist < distances.get(edge.toStationId)) {
        distances.set(edge.toStationId, newDist);
        previous.set(edge.toStationId, currentId);
        edgeUsed.set(edge.toStationId, edge);
        queue.push({ id: edge.toStationId, dist: newDist });
      }
    }
  }

  // Backtrack path
  const pathStationIds = [];
  let curr = destStationId;
  while (curr) {
    pathStationIds.unshift(curr);
    curr = previous.get(curr);
  }

  if (pathStationIds[0] !== originStationId) {
    // Path not found
    return null;
  }

  const fullStations = pathStationIds.map((id) => stationMap.get(id));

  // Consolidate duplicate interchange stations for cleaner commuter display
  const cleanedStations = [];
  const transfers = [];
  let totalDistanceKm = 0;

  for (let i = 0; i < fullStations.length; i++) {
    const s = fullStations[i];
    const prevStation = cleanedStations[cleanedStations.length - 1];

    if (prevStation && getCanonicalStationName(prevStation) === getCanonicalStationName(s)) {
      // Interchange step!
      transfers.push({
        station: prevStation,
        fromLine: prevStation.line,
        toLine: s.line,
        details: `Switch from ${METRO_LINES[prevStation.line]?.shortName} to ${METRO_LINES[s.line]?.shortName} at ${getCanonicalStationName(s)}`
      });
      // Replace the prev station with the new line variant
      cleanedStations[cleanedStations.length - 1] = s;
    } else {
      if (prevStation) {
        totalDistanceKm += getDistanceMeters(prevStation.lat, prevStation.lng, s.lat, s.lng) / 1000;
      }
      cleanedStations.push(s);
    }
  }

  // Calculate duration: ~2 minutes per station stop + 4 minutes per transfer
  const stationsCount = cleanedStations.length;
  const estimatedDurationMinutes = Math.max(
    3,
    Math.round(stationsCount * 2.1 + transfers.length * 4.5)
  );

  const fare = calculateMetroFare(totalDistanceKm);
  const linesUsed = [...new Set(cleanedStations.map((s) => s.line))];

  return {
    stations: cleanedStations,
    rawStationIds: pathStationIds,
    transfers,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalDurationMinutes: estimatedDurationMinutes,
    fare,
    linesUsed
  };
}
