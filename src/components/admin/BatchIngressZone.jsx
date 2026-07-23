import React from 'react';
import AgentHeader from './AgentHeader';
import DropZone from './DropZone';
import ControlSidebar from './ControlSidebar';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function BatchIngressZone() {
  const { targetApplication, setTargetApp, cfCacheStatus, cfRayId, fleetNodes, addActionLog, localQueueCount } = useDesktopAgentStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-mono selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto">
        <AgentHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Target App Filter Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/60 p-4 border border-slate-800/80 rounded shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Enrichment Route Vector:</span>
              <select 
                value={targetApplication} 
                onChange={(e) => {
                  const selectedRoute = e.target.value;
                  setTargetApp(selectedRoute);
                  addActionLog({
                    type: 'network',
                    text: `[ENRICHMENT_ROUTE] Selected ingress vector route updated: [${selectedRoute.toUpperCase()}] via Cloudflare Workers.`
                  });
                }}
                className="w-full sm:w-auto bg-slate-950 text-emerald-400 text-xs font-bold border border-slate-800 px-3 py-2 rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 flex-1 cursor-pointer transition-colors"
              >
                <option value="green_machine">The Green Machine (Ledger Sync)</option>
                <option value="nexus_crm">Nexus B2B CRM Core</option>
                <option value="asguard_soc">Asguard WAF Intelligence</option>
              </select>
              <div className="hidden sm:flex items-center gap-4 px-2 border-l border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">STAGED_QUEUE</span>
                  <span className="text-[10px] text-cyan-400 font-bold">{localQueueCount}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">CF_CACHE</span>
                  <span className={`text-[10px] font-bold ${cfCacheStatus === 'HIT' ? 'text-emerald-400' : cfCacheStatus === 'MISS' ? 'text-red-400' : 'text-amber-400'}`}>{cfCacheStatus}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">RAY_ID</span>
                  <span className="text-[10px] text-purple-400 font-bold uppercase">{cfRayId}</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/50 px-2 py-1 rounded ml-auto mt-2 sm:mt-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                WORKERS_AI_PARSER: TOMARKDOWN ACTIVE
              </div>
            </div>

            <DropZone targetApplication={targetApplication} />

            {/* Cluster Mesh Fleet Nodes Matrix */}
            <div className="bg-slate-900/40 border border-slate-800 text-[10px] font-mono p-5 rounded-xl space-y-4 shadow-md backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">Cluster Mesh Fleet Nodes Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fleetNodes.map((node) => (
                  <div key={node.id} className="flex flex-col gap-1 p-3 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Node ID {node.id}:</span>
                    <span className="text-slate-300">{node.uid}</span>
                    <span className="text-slate-500">OS: {node.os}</span>
                    <span className="text-slate-500">Build: {node.build}</span>
                    <span className={`${node.color} font-bold mt-1`}>{node.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ControlSidebar />
        </div>

        <footer className="mt-8 flex justify-between items-center text-[8px] text-slate-600 tracking-[0.3em] font-bold uppercase border-t border-slate-900 pt-4">
          <span>OnyX Mk3.5.2 // Build_7112026</span>
          <div className="flex gap-4">
            <span className="text-emerald-500/50 underline">System Integrity: 100%</span>
            <span>AXiM Corporate Systems</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
