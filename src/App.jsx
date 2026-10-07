import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronDown,
  Maximize2,
  Rocket,
  Train,
  Settings,
  ArrowUpDown,
  Navigation,
  Bell,
  Vibrate,
  Play,
  Square,
  Volume2,
  Gauge,
  Clock,
  MapPin,
  Check,
  TrendingUp,
  Sparkles,
  Info,
  Zap
} from 'lucide-react';

import { useSettings } from './hooks/useSettings';
import { useTracker } from './hooks/useTracker';
import { MetroMap } from './components/MetroMap';
import { SettingsModal } from './components/SettingsModal';
import { METRO_STATIONS, METRO_LINES, getCanonicalStationName } from './data/metroStations';
import { findRoute } from './lib/router';
import { formatDistance, formatSpeed, formatEta } from './lib/geo';

export default function App() {
  const {
    settings,
    updateSetting,
    saveCustomMusic,
    removeCustomMusic,
    customAudioLoaded
  } = useSettings();

  // Route Selection State
  const [fromStationId, setFromStationId] = useState('R01'); // Default: Miyapur
  const [destStationId, setDestStationId] = useState('R27'); // Default: LB Nagar
  const [isSimulateMode, setIsSimulateMode] = useState(false);
  const [simSpeed, setSimSpeed] = useState(4);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Compute calculated route
  const currentRoute = useMemo(() => {
    if (!fromStationId || !destStationId) return null;
    return findRoute(fromStationId, destStationId);
  }, [fromStationId, destStationId]);

  // Unique sorted list of stations for dropdowns
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

  // Tracking Engine
  const tracker = useTracker({
    activeRoute: isJourneyActive ? currentRoute : null,
    settings
  });

  // Keep simulation speed in sync
  useEffect(() => {
    tracker.setSimSpeedMultiplier(simSpeed);
  }, [simSpeed, tracker]);

  // Destination Arrival Celebration
  useEffect(() => {
    if (tracker.hasArrivedDestination) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#22d3ee', '#10b981', '#f59e0b', '#a855f7']
        });
      } catch (e) {}
    }
  }, [tracker.hasArrivedDestination]);

  const handleSwapStations = () => {
    const temp = fromStationId;
    setFromStationId(destStationId);
    setDestStationId(temp);
  };

  const handleStartJourney = () => {
    if (!currentRoute) return;
    setIsJourneyActive(true);
    if (isSimulateMode) {
      tracker.startSimulation();
    }
  };

  const handleStopJourney = () => {
    setIsJourneyActive(false);
    tracker.stopSimulation();
    tracker.resetJourney();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const quickStartRocketSim = () => {
    setIsSimulateMode(true);
    setSimSpeed(15);
    setIsJourneyActive(true);
    setTimeout(() => {
      tracker.startSimulation();
    }, 100);
  };

  return (
    <div className="app-shell">
      {/* ================= 1. Top Bar ================= */}
      <header className="top-bar">
        <button
          onClick={() => isJourneyActive && handleStopJourney()}
          className="icon-btn"
          aria-label="Back"
        >
          <ChevronLeft />
        </button>

        <div className="flex-row gap-sm" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <span>{isJourneyActive ? 'Journey Active' : 'Home'}</span>
          {isJourneyActive && (
            <span className={`status-pill ${isSimulateMode ? 'sim' : 'live'}`}>
              <span className={`status-dot ${isSimulateMode ? 'sim' : 'live'}`}></span>
              {isSimulateMode ? 'SIM' : 'LIVE'}
            </span>
          )}
        </div>

        <div className="top-bar-actions">
          <button
            onClick={toggleFullscreen}
            className="icon-btn"
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 />
          </button>
          <button
            onClick={quickStartRocketSim}
            className="icon-btn"
            title="Quick 15x Simulation"
            aria-label="Launch quick simulation"
          >
            <Rocket />
          </button>
        </div>
      </header>

      {/* ================= 2. App Header Card ================= */}
      <div className="app-header">
        <div className="app-header-left">
          <div className="app-logo">
            <Train />
          </div>
          <div className="app-header-text">
            <h1>Hyderabad Metro</h1>
            <p>Live tracking • alerts • vibration</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="icon-btn"
          title="Alert Settings"
          aria-label="Open settings"
        >
          <Settings />
        </button>
      </div>

      {/* ================= 3. Interactive Leaflet Map ================= */}
      <div className="map-section">
        <div className="map-container">
          <MetroMap
            userLocation={tracker.userLocation}
            activeRoute={currentRoute}
            currentStationIndex={tracker.currentStationIndex}
            onSelectStation={(st) => {
              if (!isJourneyActive) setFromStationId(st.id);
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* ================= 4. Route Selection or Active Journey Card ================= */}
        {!isJourneyActive ? (
          <div className="card">
            {/* From Station */}
            <div className="form-group">
              <label className="form-label">From station</label>
              <select
                value={fromStationId}
                onChange={(e) => setFromStationId(e.target.value)}
                className="form-select"
              >
                {uniqueStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getCanonicalStationName(s)} ({METRO_LINES[s.line]?.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="swap-btn-wrapper">
              <button
                onClick={handleSwapStations}
                className="swap-btn"
                title="Swap stations"
              >
                <ArrowUpDown />
              </button>
            </div>

            {/* Destination Station */}
            <div className="form-group">
              <label className="form-label">Destination</label>
              <select
                value={destStationId}
                onChange={(e) => setDestStationId(e.target.value)}
                className="form-select"
              >
                {uniqueStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getCanonicalStationName(s)} ({METRO_LINES[s.line]?.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Real GPS vs Simulate Toggle */}
            <div className="toggle-row" style={{ marginTop: '12px' }}>
              <span className={`toggle-label ${!isSimulateMode ? 'active' : 'inactive'}`}>
                <Navigation /> Real GPS
              </span>

              <label className="metro-toggle">
                <input
                  type="checkbox"
                  checked={isSimulateMode}
                  onChange={(e) => setIsSimulateMode(e.target.checked)}
                />
                <span className="metro-toggle-slider"></span>
              </label>

              <span className={`toggle-label ${isSimulateMode ? 'active' : 'inactive'}`}>
                <Train /> Simulate
              </span>
            </div>

            {/* Simulation Speed Slider */}
            {isSimulateMode && (
              <div className="slider-group" style={{ marginTop: '10px' }}>
                <div className="slider-header">
                  <span className="slider-header-label">
                    <Gauge /> Simulation speed
                  </span>
                  <span className="slider-value">{simSpeed}×</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(Number(e.target.value))}
                />
                <p className="slider-hint">
                  Test the full journey anywhere — no GPS needed.
                </p>
              </div>
            )}

            {/* Route Stats */}
            {currentRoute && (
              <div className="route-stats">
                <span className="route-stat">
                  <strong>{currentRoute.stations.length}</strong> Stops ({currentRoute.totalDistanceKm} km)
                </span>
                <span className="route-stat">
                  ~<strong>{currentRoute.totalDurationMinutes}</strong> min
                </span>
                <span className="route-stat fare">₹{currentRoute.fare}</span>
              </div>
            )}

            {/* Start Journey Button */}
            <button onClick={handleStartJourney} className="btn-primary">
              <Play style={{ width: 16, height: 16 }} />
              <span>Start journey</span>
            </button>
          </div>
        ) : (
          /* ================= Active Journey Dashboard Card ================= */
          <div className="card">
            <div className="journey-header">
              <div>
                <span className="journey-tag">Active Journey</span>
                <div className="journey-route-name">
                  {getCanonicalStationName(currentRoute?.stations[0])} → {getCanonicalStationName(currentRoute?.stations[currentRoute?.stations.length - 1])}
                </div>
              </div>

              <button onClick={handleStopJourney} className="btn-danger">
                <Square style={{ width: 12, height: 12 }} />
                <span>End</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar-fill"
                style={{ width: `${tracker.progressPercent}%` }}
              ></div>
            </div>

            {/* Speedometer & Progress */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Speed</span>
                <div className="stat-value">
                  {Math.round(tracker.userLocation?.speed || 0)}
                  <span className="stat-unit">km/h</span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-label">Progress</span>
                <div className="stat-value accent">
                  {tracker.progressPercent}
                  <span className="stat-unit">%</span>
                </div>
              </div>
            </div>

            {/* Next Upcoming Station Card */}
            <div className="next-station-card">
              <div className="next-station-header">
                <span className="next-station-label">
                  <MapPin />
                  {tracker.isAtStation ? 'AT STATION' : 'UPCOMING'}
                </span>
                <span className="next-station-badge">
                  Stop #{tracker.currentStationIndex + 1}
                </span>
              </div>

              <div className="next-station-name">
                {tracker.nextUpcomingStation ? getCanonicalStationName(tracker.nextUpcomingStation) : 'Calculating...'}
              </div>

              <div className="next-station-info">
                <span>Dist: <strong>{formatDistance(tracker.distanceToNextStation)}</strong></span>
                <span>ETA: <span className="eta-val">{formatEta(tracker.etaSeconds)}</span></span>
              </div>
            </div>

            {/* Last Passed Station */}
            <div className="last-station-card">
              <div className="last-station-left">
                <Clock />
                <div>
                  <div className="last-station-tag">Last Passed</div>
                  <div className="last-station-name">
                    {tracker.lastPassedStation ? getCanonicalStationName(tracker.lastPassedStation.station) : 'Starting point'}
                  </div>
                </div>
              </div>
              <span className="last-station-meta">
                {tracker.lastPassedStation ? `${tracker.lastPassedStation.timeStr} (${tracker.lastPassedStation.speedKmh} km/h)` : '--'}
              </span>
            </div>

            {/* Journey Controls */}
            <div className="journey-controls">
              {isSimulateMode && (
                <button
                  onClick={tracker.toggleSimPause}
                  className="btn-secondary"
                >
                  {tracker.isSimPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
              )}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn-secondary"
              >
                Alert Settings
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. "How it works" Card ================= */}
        <div className="card">
          <div className="info-section">
            <h3>How it works</h3>

            <div className="info-item">
              <div className="info-item-icon"><MapPin /></div>
              <p className="info-item-text">
                Picks your route across the Red, Blue & Green lines — including interchanges at Ameerpet, Parade Ground & MG Bus Station.
              </p>
            </div>

            <div className="info-item">
              <div className="info-item-icon"><Bell /></div>
              <p className="info-item-text">
                Notifies you before every station with the last, current & next stop, time and speed.
              </p>
            </div>

            <div className="info-item">
              <div className="info-item-icon"><Vibrate /></div>
              <p className="info-item-text">
                Vibrates distinctly at interchanges and your destination — pick a pattern or your own music.
              </p>
            </div>

            <div className="info-tip">
              <p>💡 Tip: Use Simulate to test the whole ride from anywhere, no GPS needed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 6. Alert Settings Modal ================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSetting={updateSetting}
        saveCustomMusic={saveCustomMusic}
        removeCustomMusic={removeCustomMusic}
        customAudioLoaded={customAudioLoaded}
      />
    </div>
  );
}
