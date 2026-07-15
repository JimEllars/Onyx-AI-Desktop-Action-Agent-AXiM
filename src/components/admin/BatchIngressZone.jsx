import React, { useState } from 'react';
import AgentHeader from './AgentHeader';
import DropZone from './DropZone';
import ControlSidebar from './ControlSidebar';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function BatchIngressZone() {
  const [targetApplication, setTargetApp] = useState('green_machine');
  const { cfCacheStatus, cfRayId } = useDesktopAgentStore();

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
                onChange={(e) => setTargetApp(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 text-emerald-400 text-xs font-bold border border-slate-800 px-3 py-2 rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 flex-1 cursor-pointer transition-colors"
              >
                <option value="green_machine">The Green Machine (Ledger Sync)</option>
                <option value="nexus_crm">Nexus B2B CRM Core</option>
                <option value="asguard_soc">Asguard WAF Intelligence</option>
              </select>
              <div className="hidden sm:flex items-center gap-4 px-2 border-l border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">CF_CACHE</span>
                  <span className={`text-[10px] font-bold ${cfCacheStatus === 'HIT' ? 'text-emerald-400' : cfCacheStatus === 'MISS' ? 'text-red-400' : 'text-amber-400'}`}>{cfCacheStatus}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">RAY_ID</span>
                  <span className="text-[10px] text-purple-400 font-bold uppercase">{cfRayId}</span>
                </div>
              </div>
            </div>

            <DropZone targetApplication={targetApplication} />

            {/* Cluster Mesh Fleet Nodes Matrix */}
            <div className="bg-slate-900/40 border border-slate-800 text-[10px] font-mono p-5 rounded-xl space-y-4 shadow-md backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">Cluster Mesh Fleet Nodes Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 p-3 bg-slate-950 rounded border border-slate-800/80">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Node ID 01:</span>
                  <span className="text-slate-300">AXIM-NODE-LAX-01</span>
                  <span className="text-slate-500">OS: Native Desktop Wrapper</span>
                  <span className="text-slate-500">Build: v3.5.2</span>
                  <span className="text-emerald-400 font-bold mt-1">[LOCAL_PRIMARY]</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-950 rounded border border-slate-800/80">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Node ID 02:</span>
                  <span className="text-slate-300">AXIM-NODE-DFW-02</span>
                  <span className="text-slate-500">OS: Secure Edge Browser</span>
                  <span className="text-slate-500">Build: v3.5.2</span>
                  <span className="text-cyan-400 font-bold mt-1">[AUTOPILOT_ACTIVE]</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-950 rounded border border-slate-800/80">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Node ID 03:</span>
                  <span className="text-slate-300">AXIM-NODE-ORD-03</span>
                  <span className="text-slate-500">OS: Headless Engine Mesh</span>
                  <span className="text-slate-500">Build: v3.4.1</span>
                  <span className="text-amber-400 font-bold mt-1">[OUT_OF_SYNC_PENDING_PATCH]</span>
                </div>
              </div>
            </div>
          </div>

          <ControlSidebar />
        </div>
      </div>
    </div>
  );
}
