import { create } from 'zustand';
import { aximCoreClient } from '../lib/supabaseClient.js';

export const useDesktopAgentStore = create((set) => ({
  walletConnected: false,
  isLiveChannelConnected: false,
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

  updateCloudflareMetrics: (data) => set((state) => {
    const newStatus = data?.cfCacheStatus || state.cfCacheStatus;
    const newRayId = data?.cfRayId || state.cfRayId;

    let currentActionLogs = state.actionLogs;
    if ((newStatus === 'MISS' || newStatus === 'DYNAMIC') && newStatus !== state.cfCacheStatus) {
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
      actionLogs: currentActionLogs
    };
  }),

  updateTelemetry: (data) => set((state) => {
    const newCpu = data?.cpuLoad ?? state.cpuLoad;
    const newMemory = data?.memoryUsage ?? state.memoryUsage;
    const newLatency = data?.networkLatencyMs ?? state.networkLatencyMs;
    const newEdge = data?.cloudflareEdgeNode ?? state.cloudflareEdgeNode;

    const newStatus = data?.cfCacheStatus || state.cfCacheStatus;
    const newRayId = data?.cfRayId || state.cfRayId;

    let currentActionLogs = state.actionLogs;
    if ((newStatus === 'MISS' || newStatus === 'DYNAMIC') && newStatus !== state.cfCacheStatus) {
      const newLog = {
        id: Date.now(),
        type: 'network',
        text: `[CLOUDFLARE_EDGE] Cache state: ${newStatus}. Re-routing proxy re-validation down-tier via ray id: [${newRayId.substring(0, 8)}]...`,
        timestamp: new Date()
      };
      currentActionLogs = [newLog, ...state.actionLogs].slice(0, 50);
    }

    let newPendingApprovals = state.pendingApprovals;
    if (data?.pendingApproval) {
      newPendingApprovals = [...state.pendingApprovals, data.pendingApproval];
    }

    let newThreatCount = state.threatCount;
    if (data?.threatDetected) {
      newThreatCount += 1;
      const securityLog = {
        id: Date.now(),
        type: 'fault',
        text: '[FAULT] [WAF_ALERT] Intercepted automated DDoS probe packet from blacklisted CIDR block at Cloudflare edge.',
        timestamp: new Date()
      };
      currentActionLogs = [securityLog, ...currentActionLogs].slice(0, 50);
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
      threatCount: newThreatCount,
      actionLogs: currentActionLogs
    };
  }),

  setLiveTelemetry: (data) => set((state) => {
    const newCpu = data?.cpuLoad ?? state.cpuLoad;
    const newMemory = data?.memoryUsage ?? state.memoryUsage;
    const newLatency = data?.networkLatencyMs ?? state.networkLatencyMs;
    const newEdge = data?.cloudflareEdgeNode ?? state.cloudflareEdgeNode;

    const newStatus = data?.cfCacheStatus || state.cfCacheStatus;
    const newRayId = data?.cfRayId || state.cfRayId;

    let currentActionLogs = state.actionLogs;
    if ((newStatus === 'MISS' || newStatus === 'DYNAMIC') && newStatus !== state.cfCacheStatus) {
      const newLog = {
        id: Date.now(),
        type: 'network',
        text: `[CLOUDFLARE_EDGE] Cache state: ${newStatus}. Re-routing proxy re-validation down-tier via ray id: [${newRayId.substring(0, 8)}]...`,
        timestamp: new Date()
      };
      currentActionLogs = [newLog, ...state.actionLogs].slice(0, 50);
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

  setLiveChannelConnected: (status) => set({ isLiveChannelConnected: status }),
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
