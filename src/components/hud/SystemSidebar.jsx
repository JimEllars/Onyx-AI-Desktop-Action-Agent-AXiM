import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiGlobe, FiLayers, FiActivity } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import TelemetryChart from './TelemetryChart';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';
import { useState, useEffect } from 'react';

export default function SystemSidebar() {
  const [packetLoss, setPacketLoss] = useState("0.0%");
  const { heartbeatActive, fleetNodes, wafStrictMode, toggleWafMode, communicationMode, cpuLoad, memoryUsage, networkLatencyMs, cloudflareEdgeNode, activeTaskId, cfCacheStatus, cfRayId, autopilotActive, toggleAutopilot, addActionLog, audioBitrate, setAudioBitrate, telemetryBuffer, julesSessionState, approveJulesPlan, resetJulesSession, julesSourceRepo, fetchJulesSources } = useDesktopAgentStore();





  useEffect(() => {
    fetchJulesSources();
  }, [fetchJulesSources]);

  const getJulesStateClass = (state) => {
    switch (state) {
      case 'IN_PROGRESS':
      case 'PLANNING':
        return 'text-cyan-400 animate-pulse';
      case 'AWAITING_PLAN_APPROVAL':
        return 'text-amber-400 animate-pulse';
      case 'COMPLETED':
        return 'text-emerald-400 font-bold';
      case 'FAILED':
        return 'text-red-500 font-bold animate-pulse';
      case 'IDLE':
      default:
        return 'text-slate-500';
    }
  };

  const degradedNodeCount = fleetNodes.filter(n => n.status.includes('OUT_OF_SYNC') || n.status.includes('ERROR')).length;
  const cycleAudioBitrate = () => {
    let nextBitrate;
    if (audioBitrate === '64 kbps') nextBitrate = '128 kbps';
    else if (audioBitrate === '128 kbps') nextBitrate = '256 kbps (HD)';
    else nextBitrate = '64 kbps';
    setAudioBitrate(nextBitrate);

    setPacketLoss("1.2%");
    setTimeout(() => {
      setPacketLoss("0.4%");
      setTimeout(() => {
        setPacketLoss("0.0%");
      }, 800);
    }, 500);
  };

  const getLatencyToken = (latency) => {
    if (latency < 30) return <span className="text-emerald-500 font-bold">[EXCELLENT]</span>;
    if (latency <= 50) return <span className="text-amber-500 font-bold">[NOMINAL]</span>;
    return <span className="text-red-400 font-bold animate-pulse">[DEGRADED]</span>;
  };


  const stats = [
    { label: 'CPU LOAD', val: `${cpuLoad.toFixed(1)}%`, width: `${cpuLoad}%`, icon: FiCpu, color: 'text-emerald-400' },
    { label: 'MEM VOL', val: `${memoryUsage.toFixed(0)} MB`, width: `${(memoryUsage / 500) * 100}%`, icon: FiLayers, color: 'text-cyan-400' },
    { label: 'LATENCY', val: `${networkLatencyMs.toFixed(0)} ms`, width: `${(networkLatencyMs / 100) * 100}%`, icon: FiGlobe, color: 'text-amber-400' }
  ];

  if (communicationMode !== 'TEXT') {
    const widthVal = audioBitrate === '64 kbps' ? '64%' : audioBitrate === '128 kbps' ? '80%' : '100%';
    stats.push({ label: 'WEBRTC_AUDIO', val: `${audioBitrate} // LOSS: ${packetLoss}`, width: widthVal, icon: FiActivity, color: 'text-indigo-400' });
  }


  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 backdrop-blur-md shadow-inner relative overflow-hidden flex-1 flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3 flex justify-between items-center">
          <span>Hardware HUD // {cloudflareEdgeNode} {heartbeatActive ? <span className="text-emerald-500">[BEAT_SYNCED]</span> : <span className="text-amber-500 animate-pulse">[HEARTBEAT_DROPPED]</span>}</span>
          <span className="text-[8px] animate-pulse text-emerald-500">LIVE_STREAM</span>
        </h3>
        <div className="flex justify-between items-center text-[9px] mt-1 border-b border-slate-800/50 pb-1">
          <span className="text-slate-500">Offline Telemetry Buffer</span>
          <span className={telemetryBuffer.length > 0 ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
            {telemetryBuffer.length} {telemetryBuffer.length >= 100 ? '(MAX)' : ''}
          </span>
        </div>
        <div className="flex justify-between items-center text-[9px] mt-1 border-b border-slate-800/50 pb-1 flex-wrap">
          <span className="text-slate-500">Jules Code Agent</span>
          <span className={`font-bold font-mono ${getJulesStateClass(julesSessionState)}`}>[{julesSessionState}]</span>
          {julesSessionState === 'AWAITING_PLAN_APPROVAL' && (
            <button
              onClick={() => approveJulesPlan()}
              className="mt-1 w-full bg-amber-950/40 border border-amber-500/50 hover:bg-amber-900/60 text-amber-400 text-[8px] font-mono font-bold py-1 px-2 rounded transition-colors uppercase animate-pulse"
            >
              [APPROVE_JULES_PLAN]
            </button>
          )}
          {(julesSessionState === 'COMPLETED' || julesSessionState === 'FAILED') && (
            <button
              onClick={() => resetJulesSession()}
              className="mt-1 w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[8px] font-mono font-bold py-0.5 px-2 rounded transition-colors uppercase cursor-pointer"
            >
              [RESET_AGENT_STATE]
            </button>
          )}
        </div>
        <div className="flex justify-between items-center text-[9px] mt-1 border-b border-slate-800/50 pb-1">
          <span className="text-slate-500">Bound Repository</span>
          <span className="text-slate-300 font-mono font-semibold">{julesSourceRepo}</span>
        </div>
        <div className="flex justify-between items-center text-[9px] mt-1 border-b border-slate-800/50 pb-1">
          <span className="text-slate-500">Audio Trunk Security</span>
          {(communicationMode === 'AUDIO_ONLY' || communicationMode === 'DISCUSSION') ? (
            <span className="text-red-500 font-bold animate-pulse">[MIC: LIVE_PROXY]</span>
          ) : (
            <span className="text-emerald-500 font-bold">[MIC: SECURED]</span>
          )}
        </div>
      </div>
      
      <div className="space-y-5 shrink-0">
        {stats.map((stat, i) => {
          const isWebRTC = stat.label === 'WEBRTC_AUDIO';
          return (
            <div
              key={i}
              className={`space-y-2 ${isWebRTC ? 'cursor-pointer hover:border-indigo-500/50 transition-colors border border-transparent -m-1 p-1 rounded' : ''}`}
              onClick={isWebRTC ? cycleAudioBitrate : undefined}
              title={isWebRTC ? 'Click to cycle WebRTC audio stream quality' : undefined}
            >
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-950 border border-slate-800 rounded">
                    <SafeIcon icon={stat.icon} className={`text-xs ${stat.color}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{stat.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-200 font-mono tracking-tighter">{stat.label === "LATENCY" ? <>{stat.val} {getLatencyToken(networkLatencyMs)}</> : stat.val}</span>
              </div>
              <div className="h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: stat.width }}
                  className={`h-full ${stat.color.replace('text', 'bg')} opacity-50`}
                />
              </div>
            </div>
          );
        })}
      </div>


      <div className="shrink-0 pt-4 border-t border-slate-800/50 space-y-3 mb-2">
        <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase block border-l-2 border-emerald-500 pl-2">Core Orchestration Mode</span>
        <button
          onClick={() => {
            toggleAutopilot();
            addActionLog({
              type: 'system',
              text: `[HITL] Operational execution parameters swapped. Autopilot state mutated to: [${!autopilotActive ? 'TRUE' : 'FALSE'}]`
            });
          }}
          className={
            autopilotActive
              ? 'w-full border border-emerald-500/30 text-emerald-400 bg-emerald-950/10 text-[9px] font-bold p-2 rounded tracking-widest text-center cursor-pointer block uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]'
              : 'w-full border border-amber-500/30 text-amber-500 bg-amber-950/10 text-[9px] font-bold p-2 rounded tracking-widest text-center cursor-pointer block uppercase animate-pulse'
          }
        >
          {autopilotActive ? '[AUTOPILOT_ACTIVE]' : '[MANUAL_OVERRIDE_LOCK]'}
        </button>
        <button
          onClick={() => toggleWafMode()}
          className={
            wafStrictMode
              ? 'w-full mt-2 border border-emerald-500/30 text-emerald-400 bg-emerald-950/10 text-[9px] font-bold p-2 rounded tracking-widest text-center cursor-pointer block uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]'
              : 'w-full mt-2 border border-amber-500/30 text-amber-500 bg-amber-950/10 text-[9px] font-bold p-2 rounded tracking-widest text-center cursor-pointer block uppercase animate-pulse'
          }
        >
          {wafStrictMode ? '[WAF_STRICT_MODE_ACTIVE]' : '[WAF_MONITOR_ONLY]'}
        </button>
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
      {degradedNodeCount > 0 && (
        <div className="shrink-0 pt-2 border-t border-slate-800/50">
          <div className="flex justify-between items-center bg-amber-950/20 border border-amber-500/30 p-2 rounded">
            <span className="text-[9px] text-amber-500 font-bold tracking-widest uppercase">Degraded Mesh Nodes</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold animate-pulse">{degradedNodeCount} OFFLINE</span>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t border-slate-800 flex-1 flex flex-col min-h-0">
        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-3 block shrink-0">Neural Pulse</span>
        <div className="flex-1 min-h-0">
          <TelemetryChart />
        </div>
      </div>
    </div>
  );
}
