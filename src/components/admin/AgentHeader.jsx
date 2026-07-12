import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import { FiShield, FiDatabase, FiLock } from 'react-icons/fi';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function AgentHeader() {
  const { localQueueCount, operatorAddress, currentView, setView, systemStatus, cfCacheStatus, cfRayId } = useDesktopAgentStore();

  return (
    <header className="flex justify-between items-center border-b border-slate-800 pb-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
          <SafeIcon icon={FiShield} className="text-xl text-emerald-400 shadow-[0_0_10px_#10b981]" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-[0.3em] text-slate-100 uppercase">OnyX Mk3 // Action Agent</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">System Status: {systemStatus}</span>
          </div>
        </div>
        <div className="ml-4 flex gap-2">
          <button onClick={() => setView('HUD')} className={`px-3 py-1 text-xs font-bold rounded ${currentView === 'HUD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-500 hover:text-slate-300'}`}>HUD</button>
          <button onClick={() => setView('INGRESS')} className={`px-3 py-1 text-xs font-bold rounded ${currentView === 'INGRESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-500 hover:text-slate-300'}`}>INGRESS</button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[9px] text-slate-500 tracking-widest font-bold uppercase">Identity Verified</span>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400/80 font-bold">
            <SafeIcon icon={FiLock} className="text-[8px]" />
            {operatorAddress}
          </div>
        </div>
        
        <div className="flex gap-2">
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
            <span className="text-[11px] text-emerald-400 font-bold">0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
