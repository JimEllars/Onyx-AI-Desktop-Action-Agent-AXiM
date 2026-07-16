import React from 'react';
import ChatInterface from '../chat/ChatInterface';
import SystemSidebar from '../hud/SystemSidebar';
import ActionConsole from '../hud/ActionConsole';
import AgentHeader from '../admin/AgentHeader';
import DropZone from '../admin/DropZone';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function MainHUD() {
  const { localNodeId, isLiveChannelConnected } = useDesktopAgentStore();
  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 overflow-hidden flex flex-col font-mono selection:bg-emerald-500/30 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="relative z-10 flex flex-col h-full p-6 gap-6">
        <AgentHeader />
        
        <main className="flex-1 flex gap-6 min-h-0">
          {/* Left: Hardware & Logs */}
          <div className="w-80 flex flex-col gap-6 shrink-0 hidden xl:flex">
            <SystemSidebar />
            <ActionConsole />
          </div>

          {/* Center: AI Interaction */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900/20 border border-slate-800/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
            <ChatInterface />
          </div>

          {/* Right: Batch & Telemetry */}
          <div className="w-80 flex flex-col gap-6 shrink-0 hidden lg:flex">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl flex-1 flex flex-col gap-6 backdrop-blur-md">
              <div className="border border-slate-800/80 bg-slate-950 p-3 rounded-lg text-[9px] font-mono flex flex-col gap-1 shadow-inner">
                <span>NODE_ID: {localNodeId}</span>
                {isLiveChannelConnected ? (
                  <span className="text-emerald-400 font-bold">[MESH_CONNECTED]</span>
                ) : (
                  <span className="text-amber-500 font-bold">[AUTOPILOT_STANDALONE]</span>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3">Ingestion Node</h3>
                <DropZone targetApplication="green_machine" />
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <span className="text-[9px] text-emerald-500 font-bold block mb-1 uppercase tracking-widest">Security Protocol</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Zero-trust Arbitrum SIWE active. All physical actions are signed and cryptographically verified.
                  </p>
                </div>
              </div>
            </div>
            
            <ActionConsole className="xl:hidden" />
          </div>
        </main>

        <footer className="flex justify-between items-center text-[8px] text-slate-600 tracking-[0.3em] font-bold uppercase">
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