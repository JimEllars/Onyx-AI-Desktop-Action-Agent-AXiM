import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function ActionConsole({ className = "" }) {
  const { actionLogs, pendingApprovals, approveAction, rejectAction, addActionLog } = useDesktopAgentStore();
  const [expandedMcpIds, setExpandedMcpIds] = React.useState([]);
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const filteredLogs = React.useMemo(() => {
    if (activeFilter === 'ALL') return actionLogs;
    return actionLogs.filter(log => {
      const t = log.text?.toLowerCase() || '';
      if (activeFilter === 'NET') {
        return log.type === 'network' || t.includes('[connect]') || t.includes('[cloudflare_edge]');
      }
      if (activeFilter === 'SEC') {
        return log.type === 'fault' || log.type === 'error' || t.includes('[security]') || t.includes('[asguard_shield]') || t.includes('[fault]');
      }
      if (activeFilter === 'SYS') {
        return log.type === 'system' || log.type === 'task' || t.includes('[hitl]') || t.includes('[identity]');
      }
      return true;
    });
  }, [actionLogs, activeFilter]);


  const toggleMcpExpansion = (id) => {
    setExpandedMcpIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLogs]);

  return (
    <div className={`bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col min-h-0 backdrop-blur-sm ${className}`}>
      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Action Ledger</h3>
        <div className="flex gap-2">
          {['ALL', 'NET', 'SEC', 'SYS'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-[9px] uppercase tracking-widest px-1 py-0.5 transition-colors ${
                activeFilter === f
                  ? 'text-emerald-400 border-b border-emerald-500 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              [{f}]
            </button>
          ))}
        </div>
      </div>
      {/* Setting flex-col-reverse so that standard prepend order makes items flow bottom up if needed, or just let it scroll normally */}
      <div className="flex-1 overflow-y-auto font-mono text-[9px] scrollbar-hide flex flex-col max-h-[140px] min-h-[100px] pr-1">
        <div className="mt-auto flex flex-col space-y-3">
        <AnimatePresence initial={false}>
          {filteredLogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-950/40 border border-slate-800/60 rounded p-4 text-center text-[9px] font-mono text-slate-600 mt-2"
            >
              [LEDGER_IDLE] No active logs recorded for selected filter scope.
            </motion.div>
          )}
          {/* actionLogs has the newest log at index 0. We want the oldest at the top and newest at the bottom if we scroll to the bottom. Let's reverse it visually or reverse the array. Reversing the array is fine. */}
          {[...filteredLogs].reverse().map((log) => {
            // Use simple regex or includes to find error syntax
            const isError = log.text?.includes('[ERROR]');
            const isFault = log.text?.includes('[FAULT]');
            const isIdentity = log.text?.includes('[IDENTITY]');
            const isConnect = log.text?.includes('[CONNECT]') || log.text?.includes('[CLOUDFLARE_EDGE]');
            const isRecovery = log.text?.includes('[RECOVERY]') || log.text?.includes('[RESET]');
            const isAsguardShield = log.text?.includes('[ASGUARD_SHIELD]');
            const isEnrichment = log.text?.includes('[ENRICHMENT]');
            const isHITL = log.text?.includes('[HITL]');
            const isSuccess = log.text?.includes('[SUCCESS]');
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 border-l-2 border-slate-800 pl-3 py-1 hover:border-emerald-500/50 transition-colors"
              >
                <span className="text-slate-600 shrink-0">
                  {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`${
                  isHITL ? 'text-fuchsia-400 font-semibold tracking-wider' :
                  isAsguardShield ? 'text-red-400 font-bold tracking-wide animate-pulse' :
                  isEnrichment ? 'text-emerald-400 tracking-wide font-medium' :
                  isSuccess ? 'text-cyan-400 font-bold' :
                  isIdentity ? 'text-amber-400 tracking-wide font-bold' :
                  isConnect ? 'text-purple-400' :
                  isRecovery ? 'text-cyan-400' :
                  isError ? 'text-red-400' :
                  isFault ? 'text-amber-500' :
                  log.type === 'action' ? 'text-cyan-400' :
                  log.type === 'task' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {log.text}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
                <AnimatePresence initial={false}>
          {pendingApprovals && pendingApprovals.map(approval => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-purple-950/20 border border-purple-500/30 rounded p-3 mb-3 flex flex-col gap-3"
            >
              <div className="text-purple-400 font-bold tracking-widest text-[10px]">[AWAITING_OPERATOR_SIGNATURE] - {approval.id}</div>
              <div className="grid grid-cols-[80px_1fr] gap-1 text-slate-300 text-[10px]">
                <span className="text-slate-500">AGENT:</span>
                <span>{approval.agent}</span>
                <span className="text-slate-500">ACTION:</span>
                <span className="text-emerald-400">{approval.action}</span>
                <span className="text-slate-500">DETAILS:</span>
                <span className="leading-relaxed">{approval.details}</span>
              </div>
              <div className="mt-1">
                <button
                  onClick={() => toggleMcpExpansion(approval.id)}
                  className="text-[9px] text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors font-mono"
                >
                  {expandedMcpIds.includes(approval.id) ? '[-]' : '[+]'} View Raw Schema
                </button>
                <AnimatePresence>
                  {expandedMcpIds.includes(approval.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="mt-2 bg-slate-950/80 border border-slate-800 p-2 rounded text-[8px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap">
{JSON.stringify({
  "tool": "onyx_mcp_system_patch",
  "execution_parameters": {
    "task_id": approval.id,
    "command_context": approval.action,
    "env_overrides": { "target_node": "win-device-0320a6", "origin_agent": approval.agent }
  }
}, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => {
                    approveAction(approval.id);
                    addActionLog({ type: 'system', text: `[HITL] Operator signature validated. Resuming onyx_mk3 MCP workflow execution thread for task node: ${approval.id}` });
                  }}
                  className="px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 transition-colors rounded text-[9px]"
                >
                  [APPROVE_EXECUTION]
                </button>
                <button
                  onClick={() => {
                    rejectAction(approval.id);
                    addActionLog({ type: 'error', text: `[HITL] Operator rejected proposal packet. Terminating execution loop for node: ${approval.id}` });
                  }}
                  className="px-3 py-1.5 bg-red-950/30 border border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors rounded text-[9px]"
                >
                  [REJECT_EXECUTION]
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {pendingApprovals.length === 0 && (
          <div className="bg-emerald-950/10 border border-emerald-900/30 text-emerald-400 text-[10px] font-bold p-3 rounded tracking-wide text-center uppercase shadow-inner mt-4 mb-2">
            [NOMINAL] All pending agent workflows approved. Swarm synchronized.
          </div>
        )}
        <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
