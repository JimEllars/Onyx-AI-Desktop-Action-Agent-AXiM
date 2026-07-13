import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiGlobe, FiLayers } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import TelemetryChart from './TelemetryChart';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function SystemSidebar() {
  const { cpuLoad, memoryUsage, networkLatencyMs, cloudflareEdgeNode, activeTaskId, cfCacheStatus, cfRayId } = useDesktopAgentStore();


  const stats = [
    { label: 'CPU LOAD', val: `${cpuLoad.toFixed(1)}%`, width: `${cpuLoad}%`, icon: FiCpu, color: 'text-emerald-400' },
    { label: 'MEM VOL', val: `${memoryUsage.toFixed(0)} MB`, width: `${(memoryUsage / 500) * 100}%`, icon: FiLayers, color: 'text-cyan-400' },
    { label: 'LATENCY', val: `${networkLatencyMs.toFixed(0)} ms`, width: `${(networkLatencyMs / 100) * 100}%`, icon: FiGlobe, color: 'text-amber-400' }
  ];

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
              <span className="text-[10px] font-bold text-slate-200 font-mono tracking-tighter">{stat.val}</span>
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
