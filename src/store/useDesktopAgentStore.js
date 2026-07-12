import { create } from 'zustand';

export const useDesktopAgentStore = create((set) => ({
  walletConnected: true,
  operatorAddress: "0x742d...444",
  activeTaskId: null,
  localQueueCount: 0,
  networkLatencyMs: 24,
  systemStatus: 'READY', // READY, EXECUTING, ERROR, AUTHENTICATING
  cpuLoad: 12,
  memoryUsage: 142,
  messages: [
    { id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.' }
  ],
  actionLogs: [
    { id: 1, type: 'system', text: 'Kernel loaded. Arbitrum SIWE handshake complete.', timestamp: new Date() }
  ],

  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, id: Date.now() }] 
  })),

  addActionLog: (log) => set((state) => ({ 
    actionLogs: [{ ...log, id: Date.now(), timestamp: new Date() }, ...state.actionLogs].slice(0, 50)
  })),

  updateTelemetry: () => set((state) => ({
    cpuLoad: Math.max(5, Math.min(95, state.cpuLoad + (Math.random() * 10 - 5))),
    memoryUsage: Math.max(100, Math.min(500, state.memoryUsage + (Math.random() * 20 - 10))),
    networkLatencyMs: Math.max(15, Math.min(60, state.networkLatencyMs + (Math.random() * 4 - 2)))
  })),

  setSystemStatus: (status) => set({ systemStatus: status }),
  incrementLocalBufferQueue: () => set((state) => ({ localQueueCount: state.localQueueCount + 1 })),
  clearLocalBufferQueue: () => set({ localQueueCount: 0 })
}));