import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCommand, FiTerminal } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';
import NeuralInterface from '../hud/NeuralInterface';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const { messages, addMessage, addActionLog, systemStatus, setSystemStatus, setActiveTaskId, updateCloudflareMetrics } = useDesktopAgentStore();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    if (systemStatus === 'READY') {
      inputRef.current?.focus();
    }
  }, [systemStatus]);

  const parseCommand = (input) => {
    const text = input.toLowerCase();
    if (text.includes('browser') || text.includes('open')) return 'OS_BROWSER_OPEN';
    if (text.includes('script') || text.includes('run')) return 'CLI_EXECUTE_SECURE';
    if (text.includes('upload') || text.includes('batch')) return 'INGESTION_TUNNEL_READY';
    return 'LLM_REASONING_CHAIN';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    updateCloudflareMetrics();

    addActionLog({ type: 'network', text: `[CONNECT] Routing instruction packet through Cloudflare edge worker tunnel at ray: [${useDesktopAgentStore.getState().cfRayId.substring(0, 8)}...]` });

    const userMsg = input;
    setInput('');
    addMessage({ role: 'user', text: userMsg });

    const lowerMsg = userMsg.toLowerCase();
    if (lowerMsg.includes('rm -rf') || lowerMsg.includes('sudo') || lowerMsg.includes('drop table') || lowerMsg.includes('format c:')) {
      addActionLog({ type: 'error', text: `[FAULT] Interceptor Shield blocked execution target for task node: ${userMsg.trim()}` });
      const errorText = "Security Protocol Violation. Destructive execution signature detected. This incident has been flagged and transmitted directly to the Asguard Security SOC Dashboard.";
      const msgId = Date.now();
      addMessage({ id: msgId, role: 'assistant', text: '' });

      let i = 0;
      const step = errorText.length > 150 ? 3 : 1;
      const intervalId = setInterval(() => {
        useDesktopAgentStore.getState().updateMessageText(msgId, errorText.slice(0, i + step));
        i += step;
        if (i >= errorText.length) {
          useDesktopAgentStore.getState().updateMessageText(msgId, errorText);
          clearInterval(intervalId);
          setSystemStatus('ERROR');
        }
      }, 30);
      return;
    }

    setSystemStatus('EXECUTING');

    const intent = parseCommand(userMsg);
    
    const taskId = 'ONYX-CMD-' + Math.floor(Math.random() * 10000);
    setActiveTaskId(taskId);

    setTimeout(() => {
      addActionLog({ type: 'task', text: `Intent Identified: ${intent}` });
      addActionLog({ type: 'action', text: `[EXECUTE] Native Bridge dispatching instruction matrix for intent: ${intent}...` });
      
      setTimeout(() => {
        addActionLog({ type: 'system', text: `[SUCCESS] Swarm execution sequence finalized down-tier. Telemetry logs transmitted.` });
        
        let response = "Instruction received. I've initiated the physical action sequence. Hardware telemetry remains stable.";
        if (intent === 'OS_BROWSER_OPEN') response = "Opening secure browser environment. Redirecting proxy through AXiM WAF.";
        if (intent === 'CLI_EXECUTE_SECURE') response = "PowerShell child-process spawned. Executing sanitized script parameters.";
        
        const msgId = Date.now();
        addMessage({ id: msgId, role: 'assistant', text: '' });

        let i = 0;
        const step = response.length > 150 ? 3 : 1;
        const intervalId = setInterval(() => {
          useDesktopAgentStore.getState().updateMessageText(msgId, response.slice(0, i + step));
          i += step;
          if (i >= response.length) {
            useDesktopAgentStore.getState().updateMessageText(msgId, response);
            clearInterval(intervalId);
            inputRef.current?.focus();
            setSystemStatus('READY');
            setActiveTaskId(null);
          }
        }, 30);
      }, 1200);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
        <NeuralInterface />
      </div>

      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Neural Link: Active</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[9px] text-slate-500">
            <SafeIcon icon={FiTerminal} />
            <span>BRIDGE_V1.8</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide relative z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] p-5 rounded-2xl text-[13px] leading-relaxed relative ${
                msg.role === 'user' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100' 
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200 backdrop-blur-md'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="absolute -top-3 -left-2 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">
                    OnyX Mk3
                  </div>
                )}
                {msg.role === 'assistant' && msg.text.includes("browser environment") && (
                  <div className="mb-2 inline-block text-cyan-400 text-[9px] font-bold tracking-widest border border-cyan-800 bg-cyan-950/40 px-2 py-0.5 rounded">
                    [VECTOR_ROUTE // OS_BROWSER_OPEN]
                  </div>
                )}
                {msg.role === 'assistant' && msg.text.includes("PowerShell") && (
                  <div className="mb-2 inline-block text-amber-500 text-[9px] font-bold tracking-widest border border-amber-800 bg-amber-950/40 px-2 py-0.5 rounded">
                    [TERMINAL_EXEC // CLI_EXECUTE_SECURE]
                  </div>
                )}
                {msg.timestamp && (
                  <span className="text-slate-500 font-mono text-[10px] select-none pr-2">
                    [{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                )}
                <span className={msg.role === 'assistant' && (msg.text.includes("browser environment") || msg.text.includes("PowerShell")) ? "block inline" : "inline"}>{msg.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 1 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div
              onClick={(e) => { if (systemStatus === 'EXECUTING' || systemStatus === 'ERROR') return; setSystemStatus("EXECUTING"); setInput("Run latency check"); setTimeout(() => handleSend(e), 50); }}
              className={`border text-[10px] font-mono p-2 rounded transition-colors text-center ${systemStatus === 'EXECUTING' || systemStatus === 'ERROR' ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/20 text-slate-400' : 'border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 bg-slate-950/40 cursor-pointer'}`}
            >
              [SYS_DIAGNOSTICS] Run latency check
            </div>
            <div
              onClick={(e) => { if (systemStatus === 'EXECUTING' || systemStatus === 'ERROR') return; setSystemStatus("EXECUTING"); setInput("Audit execution cache"); setTimeout(() => handleSend(e), 50); }}
              className={`border text-[10px] font-mono p-2 rounded transition-colors text-center ${systemStatus === 'EXECUTING' || systemStatus === 'ERROR' ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/20 text-slate-400' : 'border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 bg-slate-950/40 cursor-pointer'}`}
            >
              [SECURITY_SCAN] Audit execution cache
            </div>
            <div
              onClick={(e) => { if (systemStatus === 'EXECUTING' || systemStatus === 'ERROR') return; setSystemStatus("EXECUTING"); setInput("Verify bridge tunnels"); setTimeout(() => handleSend(e), 50); }}
              className={`border text-[10px] font-mono p-2 rounded transition-colors text-center ${systemStatus === 'EXECUTING' || systemStatus === 'ERROR' ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/20 text-slate-400' : 'border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 bg-slate-950/40 cursor-pointer'}`}
            >
              [INTEGRITY_CHECK] Verify bridge tunnels
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-8 bg-slate-900/60 border-t border-slate-800 backdrop-blur-xl flex flex-col gap-4">
        {systemStatus === 'EXECUTING' && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-3 text-cyan-400 text-xs font-mono animate-pulse">
            [WORKFLOW_EMULATION] Spawned PowerShell child-process. Monitoring native container stream vectors via secure edge-bridge...
          </div>
        )}
        {systemStatus === 'ERROR' && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 text-red-400 text-xs font-mono">
            [SECURITY NOTICE] Out-of-band terminal loop blocked by Asguard Interceptor Shield. Review the action ledger console to clear hardware boundaries.
          </div>
        )}
        <div className="relative flex items-center">
          <div className="absolute left-4 w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center">
            <SafeIcon icon={FiCommand} className="text-[10px] text-slate-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={systemStatus === 'ERROR' ? "TERMINAL LOCKED. Clear execution cache blocks to restore operations..." : systemStatus === 'EXECUTING' ? "Swarm execution sequence in progress... Awaiting edge confirmation" : "Issue physical action command, Sir..."}
            disabled={systemStatus === 'ERROR' || systemStatus === 'EXECUTING'}
            className={`w-full border rounded-xl py-4 pl-14 pr-14 text-sm outline-none transition-all font-mono ${
              systemStatus === 'ERROR'
                ? 'bg-red-950/20 border-red-900/40 text-red-300 focus:ring-0 placeholder:text-red-800/50'
                : 'bg-slate-950/50 border-slate-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 text-emerald-100 placeholder:text-slate-600'
            }`}
          />
          <button 
            type="submit" 
            disabled={systemStatus === 'ERROR' || systemStatus === 'EXECUTING'}
            className={`absolute right-4 p-2 border rounded-lg transition-all ${
              systemStatus === 'ERROR'
                ? 'bg-red-900/10 border-red-900/20 text-red-800/50 cursor-not-allowed'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            <SafeIcon icon={FiSend} />
          </button>
        </div>
      </form>
    </div>
  );
}