import re

with open('src/components/hud/ActionConsole.jsx', 'r') as f:
    content = f.read()

# Replace useDesktopAgentStore destructured properties
content = re.sub(
    r'(const \{ actionLogs \} = useDesktopAgentStore\(\);)',
    r'const { actionLogs, pendingApproval, approveAction, rejectAction, addActionLog } = useDesktopAgentStore();',
    content
)

# Add the HITL Review Card
hitl_card = """        <AnimatePresence initial={false}>
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
        <div ref={logsEndRef} />"""

content = re.sub(
    r'(<div ref=\{logsEndRef\} />)',
    hitl_card,
    content
)

with open('src/components/hud/ActionConsole.jsx', 'w') as f:
    f.write(content)
