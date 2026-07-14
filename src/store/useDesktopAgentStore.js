import { create } from 'zustand';

export const useDesktopAgentStore = create((set) => ({
  walletConnected: false,
  currentView: 'HUD',
  cpuHistory: [],
  memoryHistory: [],
  latencyHistory: [],
  operatorAddress: "0x742d...444",
  operatorRole: null,
  activeTaskId: null,
  localQueueCount: 0,
  threatCount: 0,
  networkLatencyMs: 24,
  systemStatus: 'AUTHENTICATING', // READY, EXECUTING, ERROR, AUTHENTICATING
  cloudflareEdgeNode: 'DFW-Core',
  cpuLoad: 12,
  memoryUsage: 142,
  cfCacheStatus: 'HIT',
  cfRayId: '8b42f6ad120ea31c',
  pendingApprovals: [
    { id: 'MCP-HITL-7112', agent: 'Pulse Triage Swarm', action: 'Database Subscription Patch', details: 'Modify database row parameter for Affiliate Account #321: adjust subscription_fee compute debt value from 120 to 0.' }
  ],
  messages: [
    { id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.', timestamp: new Date() }
  ],
  actionLogs: [
    { id: 1, type: 'system', text: 'Kernel loaded. Arbitrum SIWE handshake complete.', timestamp: new Date() }
  ],

  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, id: msg.id || Date.now(), timestamp: new Date() }]
  })),

  updateMessageText: (id, newText) => set((state) => ({
    messages: state.messages.map((msg) => msg.id === id ? { ...msg, text: newText } : msg)
  })),

  addActionLog: (log) => set((state) => {
    let newThreatCount = state.threatCount;
    const text = log.text.toLowerCase();
    if (text.includes('[error]') || text.includes('[fault]') || text.includes('exploit')) {
      newThreatCount += 1;
    }
    return {
      threatCount: newThreatCount,
      actionLogs: [{ ...log, id: Date.now(), timestamp: new Date() }, ...state.actionLogs].slice(0, 50)
    };
  }),

  approveAction: (id) => set((state) => ({ pendingApprovals: state.pendingApprovals.filter(p => p.id !== id) })),

  rejectAction: (id) => set((state) => ({ pendingApprovals: state.pendingApprovals.filter(p => p.id !== id) })),

  addPendingApproval: (approval) => set((state) => ({
    pendingApprovals: [...state.pendingApprovals, approval]
  })),

  updateCloudflareMetrics: () => set((state) => {
    const statuses = ['HIT', 'MISS', 'DYNAMIC'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const newRayId = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');

    let currentActionLogs = state.actionLogs;
    if (newStatus === 'MISS' || newStatus === 'DYNAMIC') {
      const newLog = {
        id: Date.now(),
        type: 'network',
        text: `[CLOUDFLARE_EDGE] Cache state: ${newStatus}. Re-routing proxy re-validation down-tier via ray id: [${newRayId.substring(0, 8)}]...`,
        timestamp: new Date()
      };
      currentActionLogs = [newLog, ...state.actionLogs].slice(0, 50);
    }
    return {
      cfCacheStatus: newStatus,
      cfRayId: newRayId,
    };
  }),

  updateTelemetry: () => set((state) => {
    const newCpu = Math.max(5, Math.min(95, state.cpuLoad + (Math.random() * 10 - 5)));
    const newMemory = Math.max(100, Math.min(500, state.memoryUsage + (Math.random() * 20 - 10)));
    const newLatency = Math.max(15, Math.min(60, state.networkLatencyMs + (Math.random() * 4 - 2)));

    // Cycle edge node occasionally
    const edges = ['DFW-Core', 'ORD-Transit', 'ATL-Ingress'];
    const newEdge = Math.random() > 0.8 ? edges[Math.floor(Math.random() * edges.length)] : state.cloudflareEdgeNode;

    const statuses = ['HIT', 'MISS', 'DYNAMIC'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const newRayId = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');

    let currentActionLogs = state.actionLogs;
    if (newStatus === 'MISS' || newStatus === 'DYNAMIC') {
      const newLog = {
        id: Date.now(),
        type: 'network',
        text: `[CLOUDFLARE_EDGE] Cache state: ${newStatus}. Re-routing proxy re-validation down-tier via ray id: [${newRayId.substring(0, 8)}]...`,
        timestamp: new Date()
      };
      currentActionLogs = [newLog, ...state.actionLogs].slice(0, 50);
    }

    let newPendingApprovals = state.pendingApprovals;
    if (state.systemStatus === 'READY' && state.pendingApprovals.length < 3 && Math.random() > 0.9) {
      newPendingApprovals = [...state.pendingApprovals, {
        id: 'MCP-SIM-' + Math.floor(Math.random() * 10000),
        agent: 'Ecosystem Bridge Node',
        action: 'Secure Token Rotation',
        details: 'Automated API token refresh cycle initiated by secure Cloudflare edge crons.'
      }];
    }

    return {
      cloudflareEdgeNode: newEdge,
      cpuLoad: newCpu,
      memoryUsage: newMemory,
      networkLatencyMs: newLatency,
      cpuHistory: [...state.cpuHistory, newCpu].slice(-20),
      memoryHistory: [...state.memoryHistory, newMemory].slice(-20),
      latencyHistory: [...state.latencyHistory, newLatency].slice(-20),
      cfCacheStatus: newStatus,
      cfRayId: newRayId,
      pendingApprovals: newPendingApprovals,
      actionLogs: currentActionLogs
    };
  }),

  clearCacheBlocks: () => set({
    cpuHistory: [],
    memoryHistory: [],
    latencyHistory: [],
    localQueueCount: 0,
    threatCount: 0, // Reset anomalous indicators during disaster recovery flushes
    cpuLoad: 0,
    memoryUsage: 0,
    networkLatencyMs: 0,
    systemStatus: 'READY',
    pendingApprovals: []
  }),

  setView: (viewName) => set({ currentView: viewName }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  incrementLocalBufferQueue: () => set((state) => ({ localQueueCount: state.localQueueCount + 1 })),
  clearLocalBufferQueue: () => set({ localQueueCount: 0 }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  loginUser: (address) => set((state) => ({
    walletConnected: true,
    operatorAddress: address,
    operatorRole: "Certified Engineer (SBT)",
    systemStatus: 'READY',
    actionLogs: [
      { id: Date.now(), type: 'system', text: `[IDENTITY] Cryptographic SIWE handshake verified via Cloudflare Access edge. Role claims mapped: Certified Engineer (SBT).`, timestamp: new Date() },
      ...state.actionLogs
    ]
  }))
}));
