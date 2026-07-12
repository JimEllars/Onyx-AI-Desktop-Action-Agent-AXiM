import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiActivity, FiGlobe, FiLayers } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import TelemetryChart from './TelemetryChart';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function SystemSidebar() {
  const { cpuLoad, memoryUsage, networkLatencyMs, updateTelemetry, cloudflareEdgeNode } = useDesktopAgentStore();

  useEffect(() => {
    const interval = setInterval(updateTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'CPU LOAD', val: `${cpuLoad.toFixed(1)}%`, icon: FiCpu, color: 'text-emerald-400' },
    { label: 'MEM VOL', val: `${memoryUsage.toFixed(0)} MB`, icon: FiLayers, color: 'text-cyan-400' },
    { label: 'LATENCY', val: `${networkLatencyMs.toFixed(0)} ms`, icon: FiGlobe, color: 'text-amber-400' }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 backdrop-blur-md shadow-inner relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3 flex justify-between items-center">
        <span>Hardware HUD // {cloudflareEdgeNode}</span>
        <span className="text-[8px] animate-pulse text-emerald-500">LIVE_STREAM</span>
      </h3>
      
      <div className="space-y-5">
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
                animate={{ width: stat.val.includes('%') ? stat.val : '40%' }}
                className={`h-full ${stat.color.replace('text', 'bg')} opacity-50`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-slate-800">
        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-3 block">Neural Pulse</span>
        <TelemetryChart />
      </div>
    </div>
  );
}