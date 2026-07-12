import React, { useState } from 'react';
import AgentHeader from './AgentHeader';
import DropZone from './DropZone';
import ControlSidebar from './ControlSidebar';

export default function BatchIngressZone() {
  const [targetApplication, setTargetApp] = useState('green_machine');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-mono selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto">
        <AgentHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            </div>

            <DropZone targetApplication={targetApplication} />
          </div>

          <ControlSidebar />
        </div>
      </div>
    </div>
  );
}