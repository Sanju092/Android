import React from 'react';
import { Bell, AlertCircle, MapPin, Zap, CheckCircle2, Radio } from 'lucide-react';

export function AlertsFeed({ alertsLog }) {
  if (!alertsLog || alertsLog.length === 0) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Live Station Alerts Feed
          </h3>
          <span className="text-xs text-slate-500 font-mono">Standby</span>
        </div>
        <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center gap-2">
          <Radio className="w-8 h-8 text-slate-700 animate-pulse" />
          <p>No alerts recorded yet.</p>
          <p className="text-[11px] text-slate-600">
            Station notifications and speed stamps will appear here as your train approaches stops.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          Live Station Alerts Feed
        </h3>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
          {alertsLog.length} Events
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {alertsLog.map((alert) => {
          const isDest = alert.type === 'DESTINATION';
          const isInterchange = alert.type === 'INTERCHANGE';

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-2xl border text-xs flex flex-col gap-1 transition-all ${
                isDest
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : isInterchange
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  {alert.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{alert.time}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{alert.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
