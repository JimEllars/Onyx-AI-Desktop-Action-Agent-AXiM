import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiGlobe, FiLayers, FiActivity } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import TelemetryChart from './TelemetryChart';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function SystemSidebar() {
  const { communicationMode, cpuLoad, memoryUsage, networkLatencyMs, cloudflareEdgeNode, activeTaskId, cfCacheStatus, cfRayId, autopilotActive, toggleAutopilot, addActionLog } = useDesktopAgentStore();



  const getLatencyToken = (latency) => {
    if (latency < 30) return <span className="text-emerald-500 font-bold">[EXCELLENT]</span>;
    if (latency <= 50) return <span className="text-amber-500 font-bold">[NOMINAL]</span>;
    return <span className="text-red-400 font-bold animate-pulse">[DEGRADED]</span>;
  };


  const stats = [
    { label: 'CPU LOAD', val: `${cpuLoad.toFixed(1)}%`, width: `${cpuLoad}%`, icon: FiCpu, color: 'text-emerald-400' },
    { label: 'MEM VOL', val: `${memoryUsage.toFixed(0)} MB`, width: `${(memoryUsage / 500) * 100}%`, icon: FiLayers, color: 'text-cyan-400' },
    { label: 'LATENCY', val: `${networkLatencyMs.toFixed(0)} ms`, width: `${(networkLatencyMs / 100) * 100}%`, icon: FiGlobe, color: 'text-amber-400' }
  ];

  if (communicationMode !== 'TEXT') {
    stats.push({ label: 'WEBRTC_AUDIO', val: '64 kbps', width: '64%', icon: FiActivity, color: 'text-indigo-400' });
  }


  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 backdrop-blur-md shadow-inner relative overflow-hidden flex-1 flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3 flex justify-between items-center shrink-0">
        <span>Hardware HUD // {cloudflareEdgeNode}</span>
        <span className="text-[8px] animate-pulse text-emerald-500">LIVE_STREAM</span>
      </h3>
      
      <div className="space-y-5 shrink-0">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-950 border border-slate-800 rounded">
                  <SafeIcon icon={stat.icon} className={`text-xs ${stat.color}`} />
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{stat.label}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-200 font-mono tracking-tighter">{stat.label === "LATENCY" ? <>{stat.val} {getLatencyToken(networkLatencyMs)}</> : stat.val}</span>
            </div>
            <div className="h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: stat.width }}
                className={`h-full ${stat.color.replace('text', 'bg')} opacity-50`}
              />
            </div>
          </div>
        ))}
      </div>


      <div className="shrink-0 pt-4 border-t border-slate-800/50 space-y-3 mb-2">
        <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase block border-l-2 border-emerald-500 pl-2">Core Orchestration Mode</span>
        <button
          onClick={() => {
            toggleAutopilot();
            addActionLog({
              type: 'system',
              text: `[HITL] Operational execution parameters swapped. Autopilot state mutated to: [${!autopilotActive ? 'TRUE' : 'FALSE'}]`
            });
          }}
          className={
            autopilotActive
              ? 'w-full border border-emerald-500/30 text-emerald-400 bg-emerald-950/10 text-[9px] font-bold p-2 rounded tracking-widest text-center cursor-pointer block uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]'
              : 'w-full border border-amber-500/30 text-amber-500 bg-amber-950/10 text-[9px] font-bold p-2 rounded tracking-widest text-center cursor-pointer block uppercase animate-pulse'
          }
        >
          {autopilotActive ? '[AUTOPILOT_ACTIVE]' : '[MANUAL_OVERRIDE_LOCK]'}
        </button>
      </div>

      <div className="shrink-0 pt-4 border-t border-slate-800/50 space-y-3 mb-2">
        <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase block border-l-2 border-emerald-500 pl-2">Cloudflare Edge Gateway Context</span>
        <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Cache Status</span>
            <span className={`text-[10px] font-mono font-bold ${cfCacheStatus === 'HIT' ? 'text-emerald-400' : (cfCacheStatus === 'MISS' ? 'text-red-400' : 'text-amber-400')}`}>
              {cfCacheStatus}
            </span>
        </div>
        <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Ray ID</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
              {cfRayId?.substring(0, 12)}
            </span>
        </div>
      </div>

      <div className="shrink-0 pt-2 border-t border-slate-800/50">
          <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Active Task ID</span>
              <span className="text-[10px] text-purple-400 font-mono font-bold">{activeTaskId || 'IDLE'}</span>
          </div>
      </div>
      
      <div className="pt-4 border-t border-slate-800 flex-1 flex flex-col min-h-0">
        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-3 block shrink-0">Neural Pulse</span>
        <div className="flex-1 min-h-0">
          <TelemetryChart />
        </div>
      </div>
    </div>
  );
}
