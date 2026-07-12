import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import { FiRefreshCw, FiTrash2, FiActivity } from 'react-icons/fi';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function ControlSidebar() {
  const { incrementLocalBufferQueue, clearLocalBufferQueue } = useDesktopAgentStore();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-lg space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
          <SafeIcon icon={FiActivity} className="text-emerald-500" />
          Manual Control Matrix
        </h3>
        
        <button
          onClick={incrementLocalBufferQueue}
          className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-cyan-400 font-bold rounded transition-all duration-150 hover:border-cyan-900 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)]"
        >
          <SafeIcon icon={FiRefreshCw} />
          Force Manual EOD Log Flush
        </button>
        
        <button
          onClick={clearLocalBufferQueue}
          className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-amber-500 font-bold rounded transition-all duration-150 hover:border-amber-900 hover:shadow-[0_0_10px_rgba(245,158,11,0.1)]"
        >
          <SafeIcon icon={FiTrash2} />
          Clear In-Memory Cache Blocks
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-lg space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
          Node Telemetry
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-500">
            <span>CPU Delta:</span>
            <span className="text-emerald-500">1.2%</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Memory Vol:</span>
            <span className="text-emerald-500">142 MB</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Auth Handshake:</span>
            <span className="text-cyan-500">SIWE-Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
}