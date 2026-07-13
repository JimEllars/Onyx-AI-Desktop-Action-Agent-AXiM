import re

with open('src/store/useDesktopAgentStore.js', 'r') as f:
    content = f.read()

# Refactor updateTelemetry
# Find the newStatus and update the state
telemetry_target = """    const statuses = ['HIT', 'MISS', 'DYNAMIC'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const newRayId = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');"""

telemetry_replacement = """    const statuses = ['HIT', 'MISS', 'DYNAMIC'];
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
    }"""

content = content.replace(telemetry_target, telemetry_replacement)

# also update the return of updateTelemetry
telemetry_return_target = """      cfCacheStatus: newStatus,
      cfRayId: newRayId,
      pendingApprovals: newPendingApprovals,"""

telemetry_return_replacement = """      cfCacheStatus: newStatus,
      cfRayId: newRayId,
      pendingApprovals: newPendingApprovals,
      actionLogs: currentActionLogs"""

content = content.replace(telemetry_return_target, telemetry_return_replacement)

# Bind threat counters to clearCacheBlocks
clear_cache_target = """  clearCacheBlocks: () => set({
    cpuHistory: [],
    memoryHistory: [],
    latencyHistory: [],
    localQueueCount: 0,
    threatCount: 0,
    cpuLoad: 0,
    memoryUsage: 0,
    networkLatencyMs: 0,
    systemStatus: 'READY',
    pendingApprovals: []
  }),"""

clear_cache_replacement = """  clearCacheBlocks: () => set({
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
  }),"""

content = content.replace(clear_cache_target, clear_cache_replacement)

with open('src/store/useDesktopAgentStore.js', 'w') as f:
    f.write(content)
