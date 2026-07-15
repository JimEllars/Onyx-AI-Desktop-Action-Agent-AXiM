import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import { FiShield, FiDatabase, FiLock, FiAward } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function AgentHeader() {
  const { localNodeId, localQueueCount, operatorAddress, operatorRole, currentView, setView, systemStatus, cfCacheStatus, cfRayId, threatCount, isLiveChannelConnected } = useDesktopAgentStore();

  return (
    <header className="flex justify-between items-center border-b border-slate-800 pb-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
          <SafeIcon icon={FiShield} className="text-xl text-emerald-400 shadow-[0_0_10px_#10b981]" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-[0.3em] text-slate-100 uppercase">OnyX Mk3 // Action Agent</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {systemStatus === 'READY' && (
              <>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>
                <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]">System Status: {systemStatus}</span>
              </>
            )}
            {systemStatus === 'EXECUTING' && (
              <>
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#06b6d4]"></span>
                <span className="text-[9px] text-cyan-400 font-bold tracking-widest uppercase animate-pulse">System Status: {systemStatus}</span>
              </>
            )}
            {systemStatus === 'ERROR' && (
              <>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shadow-[0_0_5px_#ef4444]"></span>
                <span className="text-[9px] text-red-500 font-bold tracking-widest uppercase">System Status: {systemStatus}</span>
              </>
            )}
            {!['READY', 'EXECUTING', 'ERROR'].includes(systemStatus) && (
              <>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">System Status: {systemStatus}</span>
              </>
            )}
          </div>
        </div>
        <div className="ml-4 flex gap-2">
          <button onClick={() => setView('HUD')} className={`px-3 py-1 text-xs font-bold rounded ${currentView === 'HUD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-500 hover:text-slate-300'}`}>HUD</button>
          <button onClick={() => setView('INGRESS')} className={`px-3 py-1 text-xs font-bold rounded ${currentView === 'INGRESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-500 hover:text-slate-300'}`}>INGRESS</button>
        </div>
      </div>

      <div className="flex items-center gap-6">

        <div className="hidden md:flex flex-col items-end">
          <div className="border border-slate-800 text-slate-400 font-mono text-[9px] tracking-wider px-2 py-0.5 bg-slate-950/60 rounded mb-1 inline-block">
            MESH_NODE // {localNodeId}
          </div>
          <span className="text-[9px] text-slate-500 tracking-widest font-bold uppercase">Identity Verified</span>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400/80 font-bold">
            <SafeIcon icon={FiLock} className="text-[8px]" />
            {operatorAddress}
          </div>
          <AnimatePresence>
            {operatorRole && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-teal-950/30 border border-teal-500/30 rounded text-[8px] text-teal-400 font-bold tracking-widest uppercase"
              >
                {operatorRole}
                <SafeIcon icon={FiAward} className="text-teal-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex gap-2">
          {isLiveChannelConnected ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold font-mono px-2 py-1.5 rounded flex flex-col items-center justify-center min-w-[75px] tracking-widest drop-shadow-[0_0_2px_rgba(16,185,129,0.4)]">
              [EDGE_MESH]
            </div>
          ) : (
            <div className="bg-amber-950/20 border border-amber-500/30 text-amber-500 text-[9px] font-bold font-mono px-2 py-1.5 rounded flex flex-col items-center justify-center min-w-[75px] tracking-widest animate-pulse">
              [LOCAL_AUTOPILOT]
            </div>
          )}
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md shadow-inner flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] text-slate-500 font-bold tracking-tighter">CF_CACHE</span>
            <span className={`text-[11px] font-bold ${cfCacheStatus === 'HIT' ? 'text-emerald-400' : cfCacheStatus === 'MISS' ? 'text-red-400' : 'text-amber-400'}`}>{cfCacheStatus}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md shadow-inner flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] text-slate-500 font-bold tracking-tighter">RAY_ID</span>
            <span className="text-[11px] text-purple-400 font-bold uppercase">{cfRayId.substring(0, 8)}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md shadow-inner flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] text-slate-500 font-bold tracking-tighter">QUEUE</span>
            <span className="text-[11px] text-cyan-400 font-bold">{localQueueCount}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md shadow-inner flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] text-slate-500 font-bold tracking-tighter">THREATS</span>
            <span className={`text-[11px] font-bold ${threatCount > 0 ? 'text-red-500 animate-pulse text-shadow-glow' : 'text-emerald-400'}`}>{threatCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
