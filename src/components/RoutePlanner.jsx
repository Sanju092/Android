import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation2,
  ArrowUpDown,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  IndianRupee,
  Layers,
  Check
} from 'lucide-react';
import { METRO_STATIONS, METRO_LINES, getCanonicalStationName } from '../data/metroStations';
import { findRoute } from '../lib/router';

// Popular Hyderabad Commuter Journeys
const POPULAR_ROUTES = [
  { originId: 'R01', destId: 'B01', label: 'Miyapur ⇄ Raidurg (IT Corridor)' },
  { originId: 'B01', destId: 'R11', label: 'Raidurg ⇄ Ameerpet Hub' },
  { originId: 'R01', destId: 'R27', label: 'Miyapur ⇄ LB Nagar (Full Line 1)' },
  { originId: 'B22', destId: 'B01', label: 'Nagole ⇄ Raidurg (Full Line 3)' },
  { originId: 'G01', destId: 'G09', label: 'JBS ⇄ MGBS (Green Line)' }
];

export function RoutePlanner({
  onRouteSelected,
  nearestStation,
  currentRoute
}) {
  const [originId, setOriginId] = useState(() => currentRoute?.stations?.[0]?.id || 'R11'); // Default: Ameerpet
  const [destId, setDestId] = useState(() => currentRoute?.stations?.[currentRoute.stations.length - 1]?.id || 'B01'); // Default: Raidurg
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null); // 'origin' | 'dest' | null

  // Deduplicated stations for clean selection
  const uniqueStations = useMemo(() => {
    const map = new Map();
    METRO_STATIONS.forEach((s) => {
      const canonical = getCanonicalStationName(s);
      if (!map.has(canonical)) {
        map.set(canonical, s);
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      getCanonicalStationName(a).localeCompare(getCanonicalStationName(b))
    );
  }, []);

  const filteredOriginStations = useMemo(() => {
    return uniqueStations.filter((s) =>
      getCanonicalStationName(s).toLowerCase().includes(searchOrigin.toLowerCase())
    );
  }, [uniqueStations, searchOrigin]);

  const filteredDestStations = useMemo(() => {
    return uniqueStations.filter((s) =>
      getCanonicalStationName(s).toLowerCase().includes(searchDest.toLowerCase())
    );
  }, [uniqueStations, searchDest]);

  // Compute calculated route preview
  const plannedRoute = useMemo(() => {
    if (!originId || !destId || originId === destId) return null;
    return findRoute(originId, destId);
  }, [originId, destId]);

  const originStation = METRO_STATIONS.find((s) => s.id === originId);
  const destStation = METRO_STATIONS.find((s) => s.id === destId);

  const swapStations = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  const useNearestAsOrigin = () => {
    if (nearestStation?.station) {
      setOriginId(nearestStation.station.id);
    }
  };

  const handleStartJourney = () => {
    if (plannedRoute) {
      onRouteSelected(plannedRoute);
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-5 text-white">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Navigation2 className="w-5 h-5 text-cyan-400" />
          <span>Plan Metro Journey</span>
        </h2>

        {nearestStation && (
          <button
            onClick={useNearestAsOrigin}
            className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/30 font-medium flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Nearest: {getCanonicalStationName(nearestStation.station)}</span>
          </button>
        )}
      </div>

      {/* Origin & Destination Selectors */}
      <div className="flex flex-col md:flex-row items-center gap-3 relative">
        {/* Origin Selector */}
        <div className="flex-1 w-full relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Origin Station
          </label>
          <div
            onClick={() => setActiveDropdown(activeDropdown === 'origin' ? null : 'origin')}
            className="w-full bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="font-semibold text-sm truncate">
                {originStation ? getCanonicalStationName(originStation) : 'Select Start'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {originStation ? METRO_LINES[originStation.line]?.shortName : ''}
            </span>
          </div>

          {/* Origin Dropdown Menu */}
          {activeDropdown === 'origin' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 max-h-64 flex flex-col gap-1 backdrop-blur-2xl">
              <div className="relative mb-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search origin station..."
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-48 custom-scrollbar">
                {filteredOriginStations.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setOriginId(s.id);
                      setActiveDropdown(null);
                      setSearchOrigin('');
                    }}
                    className="p-2 hover:bg-slate-900 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <span className="font-medium">{getCanonicalStationName(s)}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ color: METRO_LINES[s.line]?.color }}
                    >
                      {METRO_LINES[s.line]?.shortName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={swapStations}
          className="p-2.5 rounded-full bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-700/60 shadow-md transition-all self-center md:mt-5"
          title="Swap origin and destination"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        {/* Destination Selector */}
        <div className="flex-1 w-full relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Destination Station
          </label>
          <div
            onClick={() => setActiveDropdown(activeDropdown === 'dest' ? null : 'dest')}
            className="w-full bg-slate-950 border border-slate-800 hover:border-red-500/50 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="font-semibold text-sm truncate">
                {destStation ? getCanonicalStationName(destStation) : 'Select Destination'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {destStation ? METRO_LINES[destStation.line]?.shortName : ''}
            </span>
          </div>

          {/* Destination Dropdown Menu */}
          {activeDropdown === 'dest' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 max-h-64 flex flex-col gap-1 backdrop-blur-2xl">
              <div className="relative mb-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search destination station..."
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-48 custom-scrollbar">
                {filteredDestStations.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setDestId(s.id);
                      setActiveDropdown(null);
                      setSearchDest('');
                    }}
                    className="p-2 hover:bg-slate-900 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <span className="font-medium">{getCanonicalStationName(s)}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ color: METRO_LINES[s.line]?.color }}
                    >
                      {METRO_LINES[s.line]?.shortName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Popular Routes */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
          Frequent Routes:
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROUTES.map((pr, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOriginId(pr.originId);
                setDestId(pr.destId);
              }}
              className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route Summary & Fare Card */}
      {plannedRoute && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Stops</div>
              <div className="text-lg font-bold text-white">{plannedRoute.stations.length} Stations</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Duration</div>
              <div className="text-lg font-bold text-cyan-400">~{plannedRoute.totalDurationMinutes} min</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Distance</div>
              <div className="text-lg font-bold text-slate-200">{plannedRoute.totalDistanceKm} km</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Standard Fare</div>
              <div className="text-lg font-bold text-emerald-400">₹{plannedRoute.fare}</div>
            </div>
          </div>

          {/* Transfers Info */}
          {plannedRoute.transfers.length > 0 ? (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-center gap-2">
              <span className="text-lg">🔄</span>
              <div>
                <span className="font-bold">Interchange Required:</span>{' '}
                {plannedRoute.transfers.map((t) => t.details).join('; ')}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Direct Non-Stop Ride (No interchange needed)</span>
            </div>
          )}

          {/* Start Journey CTA */}
          <button
            onClick={handleStartJourney}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 text-sm tracking-wide transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>START LIVE METRO TRACKING</span>
          </button>
        </div>
      )}
    </div>
  );
}
