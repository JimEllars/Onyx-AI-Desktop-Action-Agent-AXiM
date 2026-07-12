import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function ActionConsole({ className = "" }) {
  const { actionLogs } = useDesktopAgentStore();
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
            const isError = log.text?.toLowerCase().includes('error');
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
                  isError ? 'text-red-400' :
                  log.type === 'action' ? 'text-cyan-400' :
                  log.type === 'task' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {log.text}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
