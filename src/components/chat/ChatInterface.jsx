import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCommand, FiTerminal } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';
import NeuralInterface from '../hud/NeuralInterface';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const { messages, addMessage, addActionLog, setSystemStatus } = useDesktopAgentStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    const userMsg = input;
    setInput('');
    addMessage({ role: 'user', text: userMsg });
    setSystemStatus('EXECUTING');

    const intent = parseCommand(userMsg);
    
    setTimeout(() => {
      addActionLog({ type: 'task', text: `Intent Identified: ${intent}` });
      
      setTimeout(() => {
        addActionLog({ type: 'action', text: `Native Bridge executing ${intent}...` });
        
        let response = "Instruction received. I've initiated the physical action sequence. Hardware telemetry remains stable.";
        if (intent === 'OS_BROWSER_OPEN') response = "Opening secure browser environment. Redirecting proxy through AXiM WAF.";
        if (intent === 'CLI_EXECUTE_SECURE') response = "PowerShell child-process spawned. Executing sanitized script parameters.";
        
        addMessage({ role: 'assistant', text: response });
        setSystemStatus('READY');
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
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-8 bg-slate-900/60 border-t border-slate-800 backdrop-blur-xl">
        <div className="relative flex items-center">
          <div className="absolute left-4 w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center">
            <SafeIcon icon={FiCommand} className="text-[10px] text-slate-500" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Issue physical action command, Sir..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-14 pr-14 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-emerald-100 placeholder:text-slate-600 font-mono"
          />
          <button 
            type="submit" 
            className="absolute right-4 p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-500 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <SafeIcon icon={FiSend} />
          </button>
        </div>
      </form>
    </div>
  );
}