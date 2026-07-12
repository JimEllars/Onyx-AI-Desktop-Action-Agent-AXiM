import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function ActionConsole({ className = "" }) {
  const { actionLogs, pendingApproval, approveAction, rejectAction, addActionLog } = useDesktopAgentStore();
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLogs]);

  return (
    <div className={`bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col min-h-0 backdrop-blur-sm ${className}`}>
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Action Ledger</h3>
      {/* Setting flex-col-reverse so that standard prepend order makes items flow bottom up if needed, or just let it scroll normally */}
      <div className="flex-1 overflow-y-auto font-mono text-[9px] scrollbar-hide flex flex-col">
        <div className="mt-auto flex flex-col space-y-3">
        <AnimatePresence initial={false}>
          {/* actionLogs has the newest log at index 0. We want the oldest at the top and newest at the bottom if we scroll to the bottom. Let's reverse it visually or reverse the array. Reversing the array is fine. */}
          {[...actionLogs].reverse().map((log) => {
            // Use simple regex or includes to find error syntax
            const isError = log.text?.includes('[ERROR]');
            const isFault = log.text?.includes('[FAULT]');
            const isIdentity = log.text?.includes('[IDENTITY]');
            const isConnect = log.text?.includes('[CONNECT]') || log.text?.includes('[CLOUDFLARE_EDGE]');
            const isRecovery = log.text?.includes('[RECOVERY]') || log.text?.includes('[RESET]');
            const isAsguardShield = log.text?.includes('[ASGUARD_SHIELD]');
            const isEnrichment = log.text?.includes('[ENRICHMENT]');
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
                  isAsguardShield ? 'text-red-400 font-bold tracking-wide animate-pulse' :
                  isEnrichment ? 'text-emerald-400 tracking-wide font-medium' :
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
          {pendingApproval && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-purple-950/20 border border-purple-500/30 rounded p-4 mb-3"
            >
              <div className="text-purple-400 font-bold mb-2 tracking-widest">[AWAITING_OPERATOR_SIGNATURE]</div>
              <div className="grid grid-cols-[80px_1fr] gap-2 text-slate-300 mb-4">
                <span className="text-slate-500">AGENT:</span>
                <span>{pendingApproval.agent}</span>
                <span className="text-slate-500">ACTION:</span>
                <span className="text-emerald-400">{pendingApproval.action}</span>
                <span className="text-slate-500">DETAILS:</span>
                <span className="leading-relaxed">{pendingApproval.details}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    approveAction();
                    addActionLog({ type: 'system', text: `[HITL] Operator signature validated. Resuming onyx_mk3 MCP workflow execution thread for task node: ${pendingApproval.id}` });
                  }}
                  className="px-4 py-2 bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 transition-colors rounded"
                >
                  [APPROVE_EXECUTION]
                </button>
                <button
                  onClick={() => {
                    rejectAction();
                    addActionLog({ type: 'error', text: `[HITL] Operator rejected proposal packet. Terminating execution loop.` });
                  }}
                  className="px-4 py-2 bg-red-950/30 border border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors rounded"
                >
                  [REJECT_EXECUTION]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
