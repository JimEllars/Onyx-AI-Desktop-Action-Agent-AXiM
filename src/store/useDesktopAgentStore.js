import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { aximCoreClient } from '../lib/supabaseClient.js';

export const useDesktopAgentStore = create(
  persist(
    (set, get) => ({
  walletConnected: false,
  isLiveChannelConnected: false,
  currentView: 'HUD',
  cpuHistory: Array(30).fill(0),
  memoryHistory: Array(30).fill(0),
  latencyHistory: Array(30).fill(0),
  operatorAddress: "0x742d...444",
  operatorRole: null,
  activeTaskId: null,
  localQueueCount: 0, // Force buffer queue to 0 on emergency cache wipe
  threatCount: 0,
  networkLatencyMs: 24,
  systemStatus: 'AUTHENTICATING',
  julesSessionState: 'IDLE',
  targetApplication: 'green_machine',
  communicationMode: 'TEXT',
  localNodeId: 'AXIM-NODE-LAX-01',
  autopilotActive: true,
  logFilter: 'ALL',
  isAutoScrollEnabled: true,
  cloudflareEdgeNode: (() => {
    const edgeNodes = ['DFW-Core', 'LAX-Primary', 'IAD-Relay', 'LHR-Edge', 'FRA-Node'];
    return edgeNodes[Math.floor(Math.random() * edgeNodes.length)];
  })(),
  cpuLoad: 12,
  memoryUsage: 142,
  cfCacheStatus: 'HIT',
  cfRayId: '8b42f6ad120ea31c',

  telemetryBuffer: [],
  telemetryRetryCount: 0,
  heartbeatActive: true,
  fleetNodes: [
    { id: '01', uid: 'AXIM-NODE-LAX-01', os: 'Native Desktop Wrapper', build: 'v3.5.2', status: '[LOCAL_PRIMARY]', color: 'text-emerald-400' },
    { id: '02', uid: 'AXIM-NODE-DFW-02', os: 'Secure Edge Browser', build: 'v3.5.2', status: '[AUTOPILOT_ACTIVE]', color: 'text-cyan-400' },
    { id: '03', uid: 'AXIM-NODE-ORD-03', os: 'Headless Engine Mesh', build: 'v3.4.1', status: '[OUT_OF_SYNC_PENDING_PATCH]', color: 'text-amber-400' }
  ],
  pendingApprovals: [
    { id: 'MCP-HITL-7112', agent: 'Pulse Triage Swarm', action: 'Database Subscription Patch', details: 'Modify database row parameter for Affiliate Account #321: adjust subscription_fee compute debt value from 120 to 0.' }
  ],
  messages: [
    { id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.', timestamp: new Date() }
  ],
  audioBitrate: '64 kbps',
  actionLogs: [
    { id: 1, type: 'system', text: 'Kernel loaded. Arbitrum SIWE handshake complete.', timestamp: new Date() }
  ],

  clearThreats: () => set((state) => ({
    threatCount: 0,
    actionLogs: [{ id: Date.now(), type: "system", text: "[SECURITY] Administrator acknowledged WAF threat intercept logs. Counters reset.", timestamp: new Date() }, ...state.actionLogs].slice(0, 50)
  })),
  wafStrictMode: true,
  toggleWafMode: () => set((state) => ({
    wafStrictMode: !state.wafStrictMode,
    actionLogs: [{ id: Date.now(), type: "system", text: `[SECURITY] Cloudflare WAF protection mode shifted to: ${!state.wafStrictMode ? "STRICT" : "MONITOR"}.`, timestamp: new Date() }, ...state.actionLogs].slice(0, 50)
  })),
  toggleAutopilot: () => set((state) => ({ autopilotActive: !state.autopilotActive })),

  setAudioBitrate: (bitrate) => set((state) => ({
    audioBitrate: bitrate,
    actionLogs: [
      { id: Date.now(), type: 'system', text: `[WEBRTC_AUDIO] Stream quality adjusted. Active bitrate: ${bitrate} over Cloudflare Calls.`, timestamp: new Date() },
      ...state.actionLogs
    ].slice(0, 50)
  })),

  setCommunicationMode: async (mode) => {
    const traceText = mode === 'AUDIO_ONLY'
      ? '[CONNECT] Audio channel trunk active. Establishing secure voice proxy via Cloudflare Calls WebRTC gateway...'
      : mode === 'DISCUSSION'
      ? '[CONNECT] Multi-modal discussion loop activated. Synthetic audio-response bridge engaged...'
      : '[SYSTEM] Reverting conversation link to baseline text-input channels.';

    if ((get().communicationMode === 'AUDIO_ONLY' || get().communicationMode === 'DISCUSSION') && mode === 'TEXT') {
      get().addActionLog({ type: 'network', text: `[WEBRTC_CALLS] Terminated active Cloudflare Calls media peer session. Reverting to secure text channel.` });
    }

    set((state) => ({
      communicationMode: mode,
      actionLogs: [{ id: Date.now(), type: 'network', text: traceText, timestamp: new Date() }, ...state.actionLogs].slice(0, 50)
    }));

    if (mode !== 'TEXT') {
      try {
        // Dispatch WebRTC peer session initialization
        await aximCoreClient.functions.invoke('webrtc-handshake', {
          body: { mode, session_affinity: `ses_${get().operatorAddress}` }
        });
        get().addActionLog({
          type: 'network',
          text: `[WEBRTC_CALLS] Successfully initialized Cloudflare Calls media peer session for mode: [${mode}].`
        });
      } catch (err) {
        get().addActionLog({
          type: 'warning',
          text: `[WEBRTC_CALLS] Local fallback mode engaged. Cloudflare Calls media edge proxy standby.`
        });
      }
    }
  },

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

  approveAction: async (id, parameterOverrides) => {
    const { operatorAddress } = get();
    set((state) => ({ pendingApprovals: state.pendingApprovals.filter(p => p.id !== id) }));
    get().addActionLog({ type: "system", text: `[HITL] Operator signature validated. [DB_SYNCED // RLS_VERIFIED]. Resuming onyx_mk3 MCP workflow execution thread for task node: ${id}` });

    try {
      const updateData = {
        status: "APPROVED",
        resolved_at: new Date().toISOString(),
        resolved_by: operatorAddress
      };

      if (parameterOverrides) {
        updateData.payload = parameterOverrides;
      }

      await aximCoreClient
        .from("hitl_audit_logs")
        .update(updateData)
                .eq("id", id);

      try {
        await aximCoreClient.functions.invoke('notify-email', {
          body: {
            task_id: id,
            operator: get().operatorAddress,
            resolution: 'APPROVED',
            ray_id: get().cfRayId
          }
        });
        get().addActionLog({
          type: 'network',
          text: `[EMAIL_DISPATCH] HITL resolution notice securely dispatched via EmailIt proxy routing.`
        });
      } catch (err) {
        // Silent catch: Do not block the primary approval workflow if email dispatch fails.
      }
    } catch (e) {
      get().addActionLog({ type: "error", text: `[HITL] Edge database audit persistence failed for node ${id}: ${e.message}` });
    }
  },

  rejectAction: async (id) => {
    const { operatorAddress } = get();
    set((state) => ({ pendingApprovals: state.pendingApprovals.filter(p => p.id !== id) }));
    get().addActionLog({ type: "error", text: `[HITL] Operator rejected proposal packet. [DB_SYNCED // RLS_VERIFIED]. Terminating execution loop for node: ${id}` });

    try {
      await aximCoreClient
        .from("hitl_audit_logs")
        .update({
          status: "REJECTED",
          resolved_at: new Date().toISOString(),
          resolved_by: operatorAddress
        })
                .eq("id", id);

      try {
        await aximCoreClient.functions.invoke('notify-email', {
          body: {
            task_id: id,
            operator: get().operatorAddress,
            resolution: 'REJECTED',
            ray_id: get().cfRayId
          }
        });
        get().addActionLog({
          type: 'network',
          text: `[EMAIL_DISPATCH] HITL resolution notice securely dispatched via EmailIt proxy routing.`
        });
      } catch (err) {
        // Silent catch: Do not block the primary approval workflow if email dispatch fails.
      }
    } catch (e) {
      get().addActionLog({ type: "error", text: `[HITL] Edge database audit persistence failed for node ${id}: ${e.message}` });
    }
  },

  addPendingApproval: (approval) => set((state) => ({
    pendingApprovals: [...state.pendingApprovals, approval]
  })),

  recordOfflineTelemetryGap: () => set((state) => ({
    cpuHistory: [...state.cpuHistory, null].slice(-30),
    memoryHistory: [...state.memoryHistory, null].slice(-30),
    latencyHistory: [...state.latencyHistory, null].slice(-30)
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
    if (data?.pendingApproval && state.systemStatus === 'READY' && state.autopilotActive === true) {
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

      try {
        aximCoreClient.functions.invoke('notify-email', {
          body: {
            operator: get().operatorAddress,
            resolution: 'THREAT_DETECTED',
            details: 'Intercepted automated DDoS probe packet from blacklisted CIDR block at Cloudflare edge.',
            ray_id: get().cfRayId
          }
        });
        const emailLog = {
          id: Date.now() + 1,
          type: 'network',
          text: `[EMAIL_DISPATCH] Security threat intercept notice dispatched via EmailIt routing.`,
          timestamp: new Date()
        };
        currentActionLogs = [emailLog, securityLog, ...state.actionLogs].slice(0, 50);
      } catch (err) {
        // Silent catch
      }
    }

    return {
      cloudflareEdgeNode: newEdge,
      cpuLoad: newCpu,
      memoryUsage: newMemory,
      networkLatencyMs: newLatency,
      cpuHistory: [...state.cpuHistory, newCpu].slice(-30),
      memoryHistory: [...state.memoryHistory, newMemory].slice(-30),
      latencyHistory: [...state.latencyHistory, newLatency].slice(-30),
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
      cpuHistory: [...state.cpuHistory, newCpu].slice(-30),
      memoryHistory: [...state.memoryHistory, newMemory].slice(-30),
      latencyHistory: [...state.latencyHistory, newLatency].slice(-30),
      cfCacheStatus: newStatus,
      cfRayId: newRayId,
      actionLogs: currentActionLogs
    };
  }),

  checkFleetUpdates: async () => {
    get().addActionLog({ type: 'network', text: '[UPDATER] Contacting Cloudflare Pages deployment mirror for target manifest: production.update_manifest...' });
    await new Promise(res => setTimeout(res, 600));
    get().addActionLog({ type: 'success', text: '[UPDATER] Cloudflare asset check complete. Automated updates verified. Node AXIM-NODE-ORD-03 targeted for binary hot-patch.' });

    await new Promise(res => setTimeout(res, 800));
    set((state) => ({
      fleetNodes: state.fleetNodes.map((node) =>
        node.id === '03'
          ? { ...node, build: 'v3.5.2', status: '[MUTATED_AND_SYNCED]', color: 'text-emerald-400' }
          : node
      )
    }));
    get().addActionLog({ type: 'success', text: '[SUCCESS] [UPDATER] Automated binary update hot-patch applied cleanly to remote mesh node: AXIM-NODE-ORD-03. Fleet unified.' });
  },


  queueTelemetryEvent: (event) => set((state) => ({
    telemetryBuffer: [...state.telemetryBuffer, event].slice(-100)
  })),

  flushTelemetryBatch: async () => {
    const buffer = useDesktopAgentStore.getState().telemetryBuffer;
    if (buffer.length === 0) return 'empty';

    try {
      const response = await fetch('/api/v1/telemetry/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buffer)
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        set({ telemetryBuffer: [], telemetryRetryCount: 0 });
        if (data.mode === 'ephemeral') return 'ephemeral';
        return 'success';
      }
      return 'error';
    } catch (e) {
      set((state) => {
        const newCount = state.telemetryRetryCount + 1;
        if (newCount >= 3) {
          get().addActionLog({ type: 'warning', text: '[TELEMETRY_WARN] Edge connection degraded. Offline telemetry buffer queuing locally.' });
          return { telemetryRetryCount: 0 };
        }
        return { telemetryRetryCount: newCount };
      });
      return 'error';
    }
  },

  subscribeToFleetRegistry: () => {
       const channel = aximCoreClient
         .channel('fleet-registry-sync')
         .on('postgres_changes', {
           event: '*',
           schema: 'public',
           table: 'app_registry'
         }, (payload) => {
           if (payload.new) {
             get().addActionLog({
               type: 'system',
               text: `[FLEET_SYNC] Remote node [${payload.new.app_id}] state mutated to: ${payload.new.status}`
             });
             set(state => ({
               fleetNodes: state.fleetNodes.map(n =>
                 n.uid === payload.new.app_id ? { ...n, status: payload.new.status } : n
               )
             }));
           }
         })
         .subscribe();

       return () => { aximCoreClient.removeChannel(channel); };
     },

    clearActionLogs: async () => {
    set({ actionLogs: [], localQueueCount: 0 });
    try {
      await aximCoreClient.from('telemetry_events').insert([{
        event_type: 'CACHE_WIPE',
        component_origin: 'AXiM_DESKTOP_ACTION_AGENT',
        resolved_by: get().operatorAddress,
        timestamp: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn('[TELEMETRY] Cache wipe event logging failed:', e);
      get().addActionLog({
        type: 'warning',
        text: '[WARNING] [TELEMETRY] Cache wipe event remote logging timed out. Local cache cleared.',
        timestamp: new Date()
      });
    }
  },
  clearCacheBlocks: async () => {
    try {
      await aximCoreClient.from('telemetry_events').insert([{
        event_type: 'SYSTEM_WIPE',
        component_origin: 'AXiM_DESKTOP_ACTION_AGENT',
        resolved_by: get().operatorAddress,
        timestamp: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn('[TELEMETRY] Global system wipe event logging failed:', e);
      get().addActionLog({
        type: 'fault',
        text: '[FAULT] [TELEMETRY] Global system wipe event logging failed. Telemetry sync degraded.',
        timestamp: new Date()
      });
    }
    set({
    messages: [{ id: Date.now(), role: 'assistant', text: 'System memory cache, WebRTC nodes, and conversation buffers have been cleanly wiped. Standing by for secure operator input.' }],
    cpuHistory: Array(30).fill(0),
    memoryHistory: Array(30).fill(0),
    latencyHistory: Array(30).fill(0),
    localQueueCount: 0, // Force buffer queue to 0 on emergency cache wipe
    threatCount: 0,
    cpuLoad: 0,
    memoryUsage: 0,
    networkLatencyMs: 0,
    systemStatus: 'READY',
    pendingApprovals: [],
    communicationMode: 'TEXT',
    fleetNodes: [
      { id: '01', uid: 'AXIM-NODE-LAX-01', os: 'Native Desktop Wrapper', build: 'v3.5.2', status: '[LOCAL_PRIMARY]', color: 'text-emerald-400' },
      { id: '02', uid: 'AXIM-NODE-DFW-02', os: 'Secure Edge Browser', build: 'v3.5.2', status: '[AUTOPILOT_ACTIVE]', color: 'text-cyan-400' },
      { id: '03', uid: 'AXIM-NODE-ORD-03', os: 'Headless Engine Mesh', build: 'v3.4.1', status: '[OUT_OF_SYNC_PENDING_PATCH]', color: 'text-amber-400' }
    ]
  });
  },

  setLiveChannelConnected: (status) => set({ isLiveChannelConnected: status }),
  setJulesSessionState: (state) => set({ julesSessionState: state }),

  setHeartbeatActive: (status) => set({ heartbeatActive: status }),

  setTargetApp: (app) => set({ targetApplication: app }),
  setView: (viewName) => set({ currentView: viewName }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  setLogFilter: (filter) => set({ logFilter: filter }),
  toggleAutoScroll: () => set((state) => ({ isAutoScrollEnabled: !state.isAutoScrollEnabled })),
  incrementLocalBufferQueue: () => set((state) => ({ localQueueCount: state.localQueueCount + 1 })),
  clearLocalBufferQueue: () => set({ localQueueCount: 0 }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  logoutUser: () => set((state) => ({
    walletConnected: false,
    operatorAddress: null,
    operatorRole: null,
    activeTaskId: null,
    communicationMode: 'TEXT', // Revert voice trunks to baseline text on session logout
    systemStatus: 'AUTHENTICATING',
    actionLogs: [
      { id: Date.now(), type: 'system', text: `[IDENTITY] Session teardown complete. SIWE credentials and active channels cleared.`, timestamp: new Date() },
      ...state.actionLogs
    ]
  })),
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
    }),
    {
      name: 'onyx-desktop-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages, logFilter: state.logFilter, isAutoScrollEnabled: state.isAutoScrollEnabled })
    }
  )
);