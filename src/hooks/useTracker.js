/**
 * Core Live Metro Tracking & Geofence Engine for MetroTrack Hyderabad
 * High-accuracy station matching, hysteresis state machine, and multi-channel alerts.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getDistanceMeters,
  calculateETASeconds,
  formatDistance,
  formatSpeed,
  formatEta,
  findNearestStation,
  GPSFilter
} from '../lib/geo';
import { METRO_STATIONS, getCanonicalStationName } from '../data/metroStations';
import { metroAudio } from '../lib/audio';
import {
  triggerHaptic,
  speakAnnouncement,
  sendSystemNotification
} from '../lib/notifications';

export function useTracker({ activeRoute, settings }) {
  // GPS & Live Motion State
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, accuracy, speed, heading, timestamp }
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'locating' | 'tracking' | 'error' | 'simulating'
  const [gpsError, setGpsError] = useState(null);

  // Journey Progression State
  const [nearestStation, setNearestStation] = useState(null);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [lastPassedStation, setLastPassedStation] = useState(null); // { station, timestamp, speedKmh }
  const [nextUpcomingStation, setNextUpcomingStation] = useState(null);
  const [distanceToNextStation, setDistanceToNextStation] = useState(null);
  const [etaSeconds, setEtaSeconds] = useState(null);
  const [isAtStation, setIsAtStation] = useState(false);
  const [hasArrivedDestination, setHasArrivedDestination] = useState(false);
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);

  // Alerts Feed (History of triggered notifications)
  const [alertsLog, setAlertsLog] = useState([]);

  // Simulation Controls
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(2); // 1x, 2x, 5x, 10x
  const [isSimPaused, setIsSimPaused] = useState(false);

  // Internal references
  const filterRef = useRef(new GPSFilter(0.65));
  const alertedStationsRef = useRef(new Set()); // Prevents duplicate alerts for same station
  const lastAlertTimeRef = useRef(0);
  const simulationTimerRef = useRef(null);
  const simProgressRef = useRef(0); // 0.0 to 1.0 along the route

  /**
   * Helper to append to the live alerts log
   */
  const addAlertLog = useCallback((type, title, message, meta = {}) => {
    const newAlert = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, // 'UPCOMING' | 'ARRIVED' | 'INTERCHANGE' | 'DESTINATION' | 'INFO'
      title,
      message,
      meta
    };
    setAlertsLog((prev) => [newAlert, ...prev.slice(0, 49)]); // keep latest 50
  }, []);

  /**
   * Reset tracking state when route changes or ends
   */
  const resetJourney = useCallback(() => {
    setCurrentStationIndex(0);
    setLastPassedStation(null);
    setNextUpcomingStation(null);
    setDistanceToNextStation(null);
    setEtaSeconds(null);
    setIsAtStation(false);
    setHasArrivedDestination(false);
    setProgressPercent(0);
    alertedStationsRef.current.clear();
    filterRef.current.reset();
  }, []);

  /**
   * Handles approaching or arriving at a station along the route
   */
  const handleStationTransition = useCallback(
    (station, distanceMeters, currentSpeedKmh, isDestination, isInterchange, routeIndex) => {
      const canonicalName = getCanonicalStationName(station);
      const alertKey = `${station.id}-${routeIndex}`;

      // Trigger alerts only once per station arrival / approach
      if (!alertedStationsRef.current.has(alertKey)) {
        alertedStationsRef.current.add(alertKey);
        const now = Date.now();
        lastAlertTimeRef.current = now;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const speedFormatted = formatSpeed(currentSpeedKmh);

        if (isDestination) {
          // ================= DESTINATION REACHED =================
          setHasArrivedDestination(true);
          metroAudio.triggerAlertSound('DESTINATION', settings);
          if (settings.vibrationEnabled) triggerHaptic('DESTINATION');

          const alertTitle = `🎯 Arriving at Destination: ${canonicalName}`;
          const alertBody = `You have arrived at your destination ${canonicalName}. Please remember to collect your belongings and exit the train. Current Speed: ${speedFormatted}`;

          addAlertLog('DESTINATION', alertTitle, alertBody, { station, speedKmh: currentSpeedKmh });

          if (settings.voiceAnnounceEnabled) {
            speakAnnouncement(`Attention passengers, arrived at your destination: ${canonicalName}. Please mind the platform gap and prepare to exit.`);
          }

          if (settings.systemNotificationsEnabled) {
            sendSystemNotification({
              title: `🎯 Arrived: ${canonicalName}`,
              body: `Destination reached! Speed: ${speedFormatted} at ${timeStr}`
            });
          }
        } else if (isInterchange) {
          // ================= INTERCHANGE STATION =================
          metroAudio.triggerAlertSound('INTERCHANGE', settings);
          if (settings.vibrationEnabled) triggerHaptic('INTERCHANGE');

          const transferInfo = station.interchangeDetails || `Interchange station with ${station.interchangeWith?.join(', ')} Line`;
          const alertTitle = `🔄 Interchange Station: ${canonicalName}`;
          const alertBody = `${transferInfo}. Distance: ${formatDistance(distanceMeters)} | Speed: ${speedFormatted}`;

          addAlertLog('INTERCHANGE', alertTitle, alertBody, { station, speedKmh: currentSpeedKmh });

          if (settings.voiceAnnounceEnabled) {
            speakAnnouncement(`Approaching interchange station: ${canonicalName}. Passengers changing lines please prepare to deboard.`);
          }

          if (settings.systemNotificationsEnabled) {
            sendSystemNotification({
              title: `🔄 Interchange: ${canonicalName}`,
              body: `${transferInfo} | Speed: ${speedFormatted}`
            });
          }
        } else {
          // ================= UPCOMING INTERMEDIATE STATION =================
          metroAudio.triggerAlertSound('UPCOMING', settings);
          if (settings.vibrationEnabled) triggerHaptic('UPCOMING');

          let lastStationNotice = '';
          if (lastPassedStation) {
            lastStationNotice = ` | Last: ${getCanonicalStationName(lastPassedStation.station)} (${lastPassedStation.timeStr})`;
          }

          const alertTitle = `🚆 Approaching: ${canonicalName}`;
          const alertBody = `Next stop in ${formatDistance(distanceMeters)} (Speed: ${speedFormatted})${lastStationNotice}`;

          addAlertLog('UPCOMING', alertTitle, alertBody, { station, speedKmh: currentSpeedKmh });

          if (settings.voiceAnnounceEnabled) {
            speakAnnouncement(`Next station is ${canonicalName}.`);
          }

          if (settings.systemNotificationsEnabled) {
            sendSystemNotification({
              title: `🚆 Next Stop: ${canonicalName}`,
              body: `Approaching ${canonicalName} (${formatDistance(distanceMeters)}, ${speedFormatted})`
            });
          }
        }
      }
    },
    [settings, lastPassedStation, addAlertLog]
  );

  /**
   * Core Position Processing Function
   * Evaluates smoothed coordinates against metro stations & active route
   */
  const processLocationUpdate = useCallback(
    (rawLat, rawLng, rawSpeedKmh, rawHeading, accuracy) => {
      // Run through Kalman / Exponential noise filter
      const smoothed = filterRef.current.update(rawLat, rawLng, rawSpeedKmh);
      const currentSpeed = smoothed.speedKmh || 0;

      setUserLocation({
        lat: smoothed.lat,
        lng: smoothed.lng,
        speed: currentSpeed,
        heading: rawHeading || 0,
        accuracy: accuracy || 10,
        timestamp: Date.now()
      });

      // 1. Find globally nearest station
      const nearest = findNearestStation(smoothed.lat, smoothed.lng, METRO_STATIONS);
      if (nearest) {
        setNearestStation(nearest);
      }

      // 2. If no active route is set, we just track nearest station and return
      if (!activeRoute || !activeRoute.stations || activeRoute.stations.length === 0) {
        return;
      }

      const stations = activeRoute.stations;
      const totalStations = stations.length;
      const geofenceThreshold = settings.geofenceRadiusMeters || 300;

      // 3. Evaluate progress along the active route
      let bestIndex = currentStationIndex;
      let minDistance = Infinity;

      // Check current and upcoming stations along the route window
      const checkStart = Math.max(0, currentStationIndex - 1);
      const checkEnd = Math.min(totalStations - 1, currentStationIndex + 3);

      for (let i = checkStart; i <= checkEnd; i++) {
        const s = stations[i];
        const dist = getDistanceMeters(smoothed.lat, smoothed.lng, s.lat, s.lng);
        if (dist < minDistance) {
          minDistance = dist;
          bestIndex = i;
        }
      }

      // Hysteresis progression: Only advance forward if within station geofence or moving closer to next
      if (bestIndex > currentStationIndex) {
        // Record last passed station
        const passedStation = stations[currentStationIndex];
        setLastPassedStation({
          station: passedStation,
          timestamp: Date.now(),
          timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speedKmh: Math.round(currentSpeed)
        });
        setCurrentStationIndex(bestIndex);
      }

      const currentTargetStation = stations[bestIndex];
      const isDestination = bestIndex === totalStations - 1;
      const isInterchange = Boolean(currentTargetStation.isInterchange);
      const distToTarget = getDistanceMeters(smoothed.lat, smoothed.lng, currentTargetStation.lat, currentTargetStation.lng);

      setNextUpcomingStation(currentTargetStation);
      setDistanceToNextStation(distToTarget);

      // Calculate ETA
      const eta = calculateETASeconds(distToTarget, currentSpeed);
      setEtaSeconds(eta);

      // Check if inside station geofence
      const insideGeofence = distToTarget <= geofenceThreshold;
      setIsAtStation(insideGeofence);

      // If inside geofence, trigger alert
      if (insideGeofence) {
        handleStationTransition(
          currentTargetStation,
          distToTarget,
          currentSpeed,
          isDestination,
          isInterchange,
          bestIndex
        );
      }

      // Compute journey percentage
      const progress = Math.min(100, Math.round((bestIndex / Math.max(1, totalStations - 1)) * 100));
      setProgressPercent(progress);
    },
    [activeRoute, currentStationIndex, settings, handleStationTransition]
  );

  /**
   * Geolocation Watcher (Real Device GPS)
   */
  useEffect(() => {
    if (isSimulating) return;

    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('locating');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsStatus('tracking');
        setGpsError(null);

        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;
        const rawSpeed = position.coords.speed != null ? position.coords.speed * 3.6 : null; // m/s -> km/h
        const rawHeading = position.coords.heading;
        const accuracy = position.coords.accuracy;

        processLocationUpdate(rawLat, rawLng, rawSpeed, rawHeading, accuracy);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsStatus('error');
        setGpsError(err.message || 'Unable to retrieve location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isSimulating, processLocationUpdate]);

  /**
   * Simulation Engine: Allows realistic testing anywhere on earth!
   */
  const startSimulation = useCallback(() => {
    if (!activeRoute || !activeRoute.stations || activeRoute.stations.length < 2) {
      alert('Please select an origin and destination route to start simulation.');
      return;
    }

    setIsSimulating(true);
    setIsSimPaused(false);
    setGpsStatus('simulating');
    resetJourney();
    simProgressRef.current = 0;
    setJourneyStartTime(Date.now());

    addAlertLog('INFO', '🚀 Simulation Started', `Simulating train ride from ${activeRoute.stations[0].name} to ${activeRoute.stations[activeRoute.stations.length - 1].name}`);
  }, [activeRoute, resetJourney, addAlertLog]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setIsSimPaused(false);
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setGpsStatus('idle');
    addAlertLog('INFO', '⏹️ Simulation Stopped', 'Switched back to live GPS mode.');
  }, [addAlertLog]);

  const toggleSimPause = useCallback(() => {
    setIsSimPaused((prev) => !prev);
  }, []);

  /**
   * Simulation frame loop
   */
  useEffect(() => {
    if (!isSimulating || isSimPaused || !activeRoute || !activeRoute.stations) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      return;
    }

    const stations = activeRoute.stations;
    const totalLegs = stations.length - 1;
    if (totalLegs <= 0) return;

    // Base simulated train cruising speed is ~45 km/h
    const baseStep = 0.0035 * simSpeedMultiplier;

    simulationTimerRef.current = setInterval(() => {
      simProgressRef.current += baseStep;

      if (simProgressRef.current >= 1.0) {
        // Reached destination in simulation!
        simProgressRef.current = 1.0;
        const dest = stations[stations.length - 1];
        processLocationUpdate(dest.lat, dest.lng, 0, 0, 5);
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
        return;
      }

      // Calculate which leg of the journey we are on
      const currentFloatLeg = simProgressRef.current * totalLegs;
      const legIndex = Math.min(totalLegs - 1, Math.floor(currentFloatLeg));
      const legFraction = currentFloatLeg - legIndex;

      const s1 = stations[legIndex];
      const s2 = stations[legIndex + 1];

      // Linear interpolation between the two stations
      const simLat = s1.lat + (s2.lat - s1.lat) * legFraction;
      const simLng = s1.lng + (s2.lng - s1.lng) * legFraction;

      // Simulate realistic train acceleration & braking near stations
      let simSpeed = 48 + Math.sin(legFraction * Math.PI) * 14;
      if (legFraction < 0.15 || legFraction > 0.85) {
        simSpeed = 22 + Math.random() * 8; // slowing down at platform
      }

      processLocationUpdate(simLat, simLng, simSpeed, 90, 8);
    }, 400);

    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    };
  }, [isSimulating, isSimPaused, activeRoute, simSpeedMultiplier, processLocationUpdate]);

  return {
    userLocation,
    gpsStatus,
    gpsError,
    nearestStation,
    currentStationIndex,
    lastPassedStation,
    nextUpcomingStation,
    distanceToNextStation,
    etaSeconds,
    isAtStation,
    hasArrivedDestination,
    progressPercent,
    alertsLog,
    // Simulation controls
    isSimulating,
    isSimPaused,
    simSpeedMultiplier,
    setSimSpeedMultiplier,
    startSimulation,
    stopSimulation,
    toggleSimPause,
    resetJourney
  };
}
