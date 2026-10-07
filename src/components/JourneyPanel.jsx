import React from 'react';
import {
  Gauge,
  Navigation,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Volume2,
  Vibrate,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { METRO_LINES, getCanonicalStationName } from '../data/metroStations';
import { formatDistance, formatSpeed, formatEta } from '../lib/geo';
import { metroAudio } from '../lib/audio';
import { triggerHaptic } from '../lib/notifications';

export function JourneyPanel({
  activeRoute,
  userLocation,
  lastPassedStation,
  nextUpcomingStation,
  distanceToNextStation,
  etaSeconds,
  isAtStation,
  hasArrivedDestination,
  progressPercent,
  currentStationIndex,
  isSimulating,
  isSimPaused,
  simSpeedMultiplier,
  setSimSpeedMultiplier,
  startSimulation,
  stopSimulation,
  toggleSimPause,
  onEndJourney,
  settings
}) {
  if (!activeRoute) return null;

  const originStation = activeRoute.stations[0];
  const destStation = activeRoute.stations[activeRoute.stations.length - 1];
  const currentSpeed = userLocation?.speed || 0;
  const isInterchange = nextUpcomingStation?.isInterchange;
  const isDestination = currentStationIndex === activeRoute.stations.length - 1;

  const testAlertSoundAndVibe = () => {
    metroAudio.triggerAlertSound(isDestination ? 'DESTINATION' : isInterchange ? 'INTERCHANGE' : 'UPCOMING', settings);
    triggerHaptic(isDestination ? 'DESTINATION' : isInterchange ? 'INTERCHANGE' : 'UPCOMING');
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-5 text-white">
      {/* Top Header: Route summary & End journey */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Journey</div>
            <div className="text-sm md:text-base font-bold flex items-center gap-2">
              <span>{getCanonicalStationName(originStation)}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-cyan-400">{getCanonicalStationName(destStation)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEndJourney}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40 text-xs font-semibold transition-all"
        >
          Exit Route
        </button>
      </div>

      {/* Main Metric Cockpit: Speedometer, Next Station, Last Station */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speedometer Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" /> Train Velocity
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentSpeed > 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {currentSpeed > 10 ? 'Cruising' : 'Dwell / Stopped'}
            </span>
          </div>

          <div className="my-2 text-center">
            <div className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-baseline justify-center gap-1">
              {Math.round(currentSpeed)}
              <span className="text-xs font-semibold text-slate-500 uppercase">km/h</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentSpeed / 80) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>GPS Accuracy: ±{Math.round(userLocation?.accuracy || 8)}m</span>
            <span>Speed Limit: 80 km/h</span>
          </div>
        </div>

        {/* Current / Upcoming Station Card */}
        <div className={`col-span-1 md:col-span-1 border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all ${
          isDestination
            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            : isInterchange
            ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-4 h-4 text-yellow-400" />
                {isDestination ? 'DESTINATION STOP' : isAtStation ? 'CURRENT PLATFORM' : 'UPCOMING STOP'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isDestination
                  ? 'bg-cyan-500 text-slate-950 font-black animate-pulse'
                  : isInterchange
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {isDestination ? 'Final Stop' : isInterchange ? 'Interchange' : `Stop #${currentStationIndex + 1}`}
              </span>
            </div>

            <div className="text-xl font-bold text-white truncate">
              {nextUpcomingStation ? getCanonicalStationName(nextUpcomingStation) : 'Calculating...'}
            </div>

            {nextUpcomingStation && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: METRO_LINES[nextUpcomingStation.line]?.color || '#888' }}
                />
                <span className="text-xs text-slate-300 font-medium">
                  {METRO_LINES[nextUpcomingStation.line]?.shortName}
                </span>
                {nextUpcomingStation.isInterchange && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Switch Line
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Distance</div>
              <div className="text-sm font-bold text-cyan-300">
                {formatDistance(distanceToNextStation)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Est. Arrival</div>
              <div className="text-sm font-bold text-emerald-400">
                {formatEta(etaSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Last Passed Station Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> LAST PASSED STOP
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {lastPassedStation ? lastPassedStation.timeStr : '--:--'}
              </span>
            </div>

            <div className="text-lg font-bold text-slate-200 truncate">
              {lastPassedStation ? getCanonicalStationName(lastPassedStation.station) : 'Starting point'}
            </div>

            <div className="text-xs text-slate-400 mt-1">
              {lastPassedStation
                ? `Departed at ${lastPassedStation.speedKmh} km/h`
                : 'Journey just began from origin'}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Route Stops:</span>
            <span className="text-xs font-bold text-slate-200">
              {currentStationIndex + 1} / {activeRoute.stations.length}
            </span>
          </div>
        </div>
      </div>

      {/* Route Progress Bar */}
      <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Journey Progression
          </span>
          <span className="font-bold text-cyan-400">{progressPercent}% Completed</span>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Boarded: {getCanonicalStationName(originStation)}</span>
          <span>Destination: {getCanonicalStationName(destStation)}</span>
        </div>
      </div>

      {/* Simulator / Test Controls Bar */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Tester Controls:</span>
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> Start Train Sim
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSimPause}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {isSimPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isSimPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopSimulation}
                className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Stop Sim
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                {[1, 2, 5, 10].map((multiplier) => (
                  <button
                    key={multiplier}
                    onClick={() => setSimSpeedMultiplier(multiplier)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      simSpeedMultiplier === multiplier
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instant Sound & Vibration Tester Button */}
        <button
          onClick={testAlertSoundAndVibe}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5 transition-all"
          title="Test sound and vibration pattern"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <Vibrate className="w-3.5 h-3.5" />
          <span>Test Sound & Vibrate</span>
        </button>
      </div>
    </div>
  );
}
