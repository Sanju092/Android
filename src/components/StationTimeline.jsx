import React from 'react';
import { Check, MapPin, ArrowRight, CornerDownRight, Navigation, Info } from 'lucide-react';
import { METRO_LINES, getCanonicalStationName } from '../data/metroStations';

export function StationTimeline({
  activeRoute,
  currentStationIndex,
  onSelectStation
}) {
  if (!activeRoute || !activeRoute.stations) return null;

  const stations = activeRoute.stations;
  const totalStations = stations.length;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          Station Progression Timeline
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {stations.length} Stops Total
        </span>
      </div>

      <div className="flex flex-col gap-0 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
        {stations.map((station, idx) => {
          const isPassed = idx < currentStationIndex;
          const isCurrent = idx === currentStationIndex;
          const isDestination = idx === totalStations - 1;
          const isOrigin = idx === 0;
          const isInterchange = Boolean(station.isInterchange);
          const lineColor = METRO_LINES[station.line]?.color || '#888';
          const canonicalName = getCanonicalStationName(station);

          return (
            <div
              key={station.id + '-' + idx}
              onClick={() => onSelectStation && onSelectStation(station)}
              className={`flex items-start gap-3 relative py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-slate-800/90 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {/* Connecting line between timeline nodes */}
              {idx < totalStations - 1 && (
                <div
                  className={`absolute left-[27px] top-7 bottom-0 w-0.5 transition-colors ${
                    isPassed ? 'bg-emerald-500/80' : isCurrent ? 'bg-cyan-500' : 'bg-slate-700/60'
                  }`}
                />
              )}

              {/* Node Indicator */}
              <div className="relative z-10 flex-shrink-0 mt-0.5">
                {isPassed ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse">
                    <span className="text-xs">🚆</span>
                  </div>
                ) : isDestination ? (
                  <div className="w-7 h-7 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400">
                    <span className="text-xs">🎯</span>
                  </div>
                ) : (
                  <div
                    className="w-7 h-7 rounded-full bg-slate-900 border-2 flex items-center justify-center"
                    style={{ borderColor: lineColor }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lineColor }} />
                  </div>
                )}
              </div>

              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-semibold text-sm truncate ${
                      isCurrent
                        ? 'text-cyan-300 font-bold'
                        : isPassed
                        ? 'text-slate-400 line-through'
                        : 'text-slate-200'
                    }`}
                  >
                    {canonicalName}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 uppercase tracking-wider animate-bounce">
                      Next Stop
                    </span>
                  )}
                  {isOrigin && !isPassed && !isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Origin
                    </span>
                  )}
                  {isDestination && !isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      Destination
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.2 rounded"
                    style={{
                      backgroundColor: `${lineColor}22`,
                      color: lineColor,
                      border: `1px solid ${lineColor}44`
                    }}
                  >
                    {METRO_LINES[station.line]?.shortName}
                  </span>

                  {isInterchange && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <span>🔄 Interchange</span>
                    </span>
                  )}

                  {station.landmark && (
                    <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                      {station.landmark}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
