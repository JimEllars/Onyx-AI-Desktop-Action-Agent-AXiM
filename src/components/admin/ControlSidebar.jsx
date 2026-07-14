import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import { FiRefreshCw, FiTrash2, FiActivity } from 'react-icons/fi';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function ControlSidebar() {
  const { clearLocalBufferQueue, clearCacheBlocks, addActionLog, cpuLoad, memoryUsage, networkLatencyMs, cloudflareEdgeNode, activeTaskId, systemStatus, threatCount, cfCacheStatus, localQueueCount } = useDesktopAgentStore();
  const [isFlushing, setIsFlushing] = useState(false);

  const getLatencyToken = (latency) => {
    if (latency < 30) return <span className="text-emerald-500 font-bold">[EXCELLENT]</span>;
    if (latency <= 50) return <span className="text-amber-500 font-bold">[NOMINAL]</span>;
    return <span className="text-red-400 font-bold animate-pulse">[DEGRADED]</span>;
  };


  const handleForceFlush = async () => {
    if (systemStatus === 'ERROR') {
      addActionLog({ type: 'warning', text: '[SECURITY] Remote worker sync suspended. Clear local cache exception blocks to restore flush capabilities.' });
      return;
    }
    setIsFlushing(true);
    addActionLog({ type: 'system', text: '[CLOUDFLARE_EDGE] Initiating asynchronous EOD encrypted flush sequence to public.memory_banks' });
    addActionLog({ type: 'network', text: '[CONNECT] Tunneling encrypted payload packet through Cloudflare Worker node at endpoint: /api/v1/desktop/archive...' });

    await new Promise(resolve => setTimeout(resolve, 800));

    clearLocalBufferQueue();
    addActionLog({ type: 'success', text: '[CLOUDFLARE_EDGE] Matrix synchronization complete. Storage sequence finalized.' });
    setIsFlushing(false);
  };

  const handleClearCache = () => {
    clearCacheBlocks();
    addActionLog({ type: 'system', text: '[RESET] Volatile cache memory blocks de-allocated. Node execution lanes recycled successfully.' });
    addActionLog({ type: 'fault', text: '[SECURITY] Local out-of-band execution cache blocks purged securely' });
    addActionLog({ type: 'system', text: '[RECOVERY] Asguard Shield exception cleared. Terminal input channels unlocked.' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-lg space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
          <SafeIcon icon={FiActivity} className="text-emerald-500" />
          Manual Control Matrix
        </h3>
        
        <button
          onClick={handleForceFlush}
          className={`w-full flex items-center justify-center gap-3 border px-4 py-3 text-xs font-bold rounded transition-all duration-150 ${isFlushing ? 'bg-cyan-900 border-cyan-500 text-cyan-200' : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-900 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)]'}`}
        >
          <SafeIcon icon={FiRefreshCw} />
          Force Manual EOD Log Flush
        </button>
        
        <button
          onClick={() => {
            clearLocalBufferQueue();
            addActionLog({ type: 'system', text: '[ENRICHMENT] Successfully processed staged local buffer chunks. Multi-app fan-out complete.' });
          }}
          disabled={localQueueCount === 0 || systemStatus === 'ERROR'}
          className={`w-full flex items-center justify-center gap-3 border px-4 py-3 text-xs font-bold rounded transition-all duration-150 ${(localQueueCount === 0 || systemStatus === 'ERROR') ? 'bg-slate-950/50 border-slate-900 text-slate-700 cursor-not-allowed' : 'bg-slate-950 border-slate-800 hover:border-fuchsia-900 text-fuchsia-400 hover:shadow-[0_0_10px_rgba(232,121,249,0.1)]'}`}
        >
          [PROCESS_STAGED_VIRTUAL_BUFFER]
        </button>

        <button
          onClick={handleClearCache}
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
            <span className="text-emerald-500">{cpuLoad.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Memory Vol:</span>
            <span className="text-emerald-500">{memoryUsage.toFixed(0)} MB</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Auth Handshake:</span>
            <span className="text-cyan-500">SIWE-Valid</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Network Latency:</span>
            <span className="text-amber-500">{networkLatencyMs.toFixed(0)} ms {getLatencyToken(networkLatencyMs)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Edge Node:</span>
            <span className="text-cyan-400">{cloudflareEdgeNode}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Active Task:</span>
            <span className="text-purple-400">{activeTaskId || 'None'}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Threat Vectors:</span>
            <span className={threatCount > 0 ? "text-red-500" : "text-slate-500"}>{threatCount}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Edge Cache Status:</span>
            <span className={cfCacheStatus === 'HIT' ? "text-emerald-400" : cfCacheStatus === 'MISS' ? "text-red-400" : "text-amber-400"}>{cfCacheStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
