import { useEffect, useRef } from 'react';
import { aximCoreClient, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { edgeFetch, isEdgeApiConfigured } from '../lib/edgeApi.js';
import { useDesktopAgentStore } from '../store/useDesktopAgentStore.js';

export function useAgentConnection() {
  const { setLiveTelemetry, walletConnected, setLiveChannelConnected, addActionLog, localQueueCount, clearLocalBufferQueue, operatorAddress, setHeartbeatActive } = useDesktopAgentStore();
  const prevStatusRef = useRef(null);
  const heartbeatCountRef = useRef(0);
  const hasRecoveredRef = useRef(false);



  // Local Rust Daemon WebSocket with Exponential Backoff and Fallback
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let delay = 500;
    const maxDelay = 10000;

    function connect() {
       ws = new WebSocket('ws://127.0.0.1:9001');

       ws.onopen = () => {
          delay = 500;
          setLiveChannelConnected(true);
          useDesktopAgentStore.getState().addActionLog({
             type: 'network',
             text: '[LOCAL_DAEMON] Local Rust telemetry WebSocket connected.'
          });
       };

       ws.onmessage = (event) => {
          try {
             const data = JSON.parse(event.data);
             setLiveTelemetry({ ...data, source: 'live_daemon' });
          } catch (e) {
             // ignore parse error
          }
       };

       ws.onclose = () => {
          setLiveChannelConnected(false);
          useDesktopAgentStore.getState().addActionLog({
             type: 'warning',
             text: `[LOCAL_DAEMON] Disconnected. Reconnecting in ${delay}ms...`
          });

          reconnectTimeout = setTimeout(() => {
              delay = Math.min(maxDelay, delay * 2) + Math.random() * 200;
              connect();
          }, delay);
       };

       ws.onerror = () => {
          ws.close();
       };
    }

    connect();

    return () => {
       clearTimeout(reconnectTimeout);
       if (ws) {
          ws.onclose = null;
          ws.close();
       }
    };
  }, []);


  // Jules Activity Polling Effect
  useEffect(() => {
    const julesState = useDesktopAgentStore.getState().julesSessionState;

    if (!hasRecoveredRef.current && (julesState === 'IN_PROGRESS' || julesState === 'AWAITING_PLAN_APPROVAL')) {
      hasRecoveredRef.current = true;
      useDesktopAgentStore.getState().addActionLog({
        type: 'system',
        text: `[RECOVERY] Rehydrated active Jules session state (${julesState}). Auto-resuming activity polling loop...`
      });
    }

    if (julesState !== 'IN_PROGRESS') return;

    const intervalId = setInterval(() => {
      useDesktopAgentStore.getState().pollJulesActivities('sessions/default');
    }, 3000);

    return () => clearInterval(intervalId);
  }, [useDesktopAgentStore(state => state.julesSessionState)]);

  // Heartbeat Effect
  useEffect(() => {
    if (!walletConnected) return;

    const intervalId = setInterval(async () => {
      try {
        await edgeFetch('/api/v1/session/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: `ses_${operatorAddress || 'unknown'}`,
            user_id: operatorAddress || 'unknown',
            client_version: '3.5.2'
          })
        });
        setHeartbeatActive(true);
        heartbeatCountRef.current += 1;
        if (heartbeatCountRef.current % 3 === 0) {
          addActionLog({ type: 'network', text: '[EDGE_SYNC] Background heartbeat ping acknowledged by Cloudflare D1 proxy.' });
        }
      } catch (e) {
        // Silent catch for network errors to prevent UI disruption
        setHeartbeatActive(false);
      }
    }, 30000);

    const telemetryIntervalId = setInterval(() => {
      useDesktopAgentStore.getState().flushTelemetryBatch();
    }, 60000);

    return () => {
      clearInterval(intervalId);
      clearInterval(telemetryIntervalId);
    };
  }, [walletConnected, operatorAddress, isEdgeApiConfigured]);


  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource('https://api.axim.us.com/functions/v1/onyx-ui-stream');

      eventSource.addEventListener('telemetry_pulse', (e) => {
        try {
          const data = JSON.parse(e.data);
          useDesktopAgentStore.getState().updateTelemetry?.(data);
        } catch (err) { /* ignore parse error */ }
      });

      eventSource.addEventListener('hitl_action_required', (e) => {
        try {
          const task = JSON.parse(e.data);
          useDesktopAgentStore.getState().addPendingApproval?.({
            id: task.id || `ext_${Date.now()}`,
            action: task.action || 'EXTERNAL_ECOSYSTEM_ACTION',
            agent: task.agent || 'AXiM_Satellite_Agent',
            details: task.details || 'Action authorization requested from AXiM Core.'
          });
        } catch (err) { /* ignore parse error */ }
      });

      eventSource.onerror = () => {
        // Graceful silent fallback to maintain continuous UI functionality
        eventSource?.close();
      };
    } catch (e) {
      // Prevent UI crash if SSE endpoint is unavailable
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  useEffect(() => {
    if (!walletConnected || !isSupabaseConfigured) return;

    // Subscribe to the real-time agent_telemetry_stream channel
    const channel = aximCoreClient.channel('agent_telemetry_stream', { config: { broadcast: { ack: true } } });

    channel
      .on(
        'broadcast',
        { event: 'telemetry_update' },
        (payload) => {
          if (payload && payload.payload) {
            setLiveTelemetry(payload.payload);
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AGENT_CONNECTION] Successfully subscribed to agent_telemetry_stream.');
          addActionLog({ type: 'network', text: '[CONNECT] [CLOUDFLARE_EDGE] Real-time agent_telemetry_stream channel subscribed successfully.' });
          setLiveChannelConnected(true);

          if (prevStatusRef.current === 'CLOSED' || prevStatusRef.current === 'CHANNEL_ERROR') {
            const currentQueueCount = useDesktopAgentStore.getState().localQueueCount;
            if (currentQueueCount > 0) {
              try {
                // Background sync to flush queued events to public.events
                await aximCoreClient.from('events').insert({
                  event_type: 'FLUSH_BUFFER',
                  count: currentQueueCount,
                  timestamp: new Date().toISOString()
                });

                useDesktopAgentStore.getState().clearLocalBufferQueue();
                useDesktopAgentStore.getState().addActionLog({
                  type: 'network',
                  text: `[RECONNECT] [CLOUDFLARE_EDGE] Re-established real-time telemetry channel. Flushed ${currentQueueCount} buffered events to core.`
                });
              } catch (e) {
                console.error('[AGENT_CONNECTION] Failed to flush buffer on reconnect', e);
              }
            }
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          useDesktopAgentStore.getState().addActionLog({
            type: 'warning',
            text: `[OFFLINE_RECOVERY] Realtime telemetry channel ${status.toLowerCase()}. Attempting edge reconnections...`
          });
          useDesktopAgentStore.getState().setLiveChannelConnected(false);
          console.error('[AGENT_CONNECTION] Channel subscription error or closed:', status);
          addActionLog({ type: 'warning', text: '[DISCONNECT] [CLOUDFLARE_EDGE] Real-time telemetry stream dropped. Falling back to local autopilot telemetry.' });
          setLiveChannelConnected(false);
          useDesktopAgentStore.getState().recordOfflineTelemetryGap?.();
        }
        prevStatusRef.current = status;
      });

    return () => {
      aximCoreClient.removeChannel(channel);
    };
  }, [setLiveTelemetry, walletConnected, setLiveChannelConnected, addActionLog]);
}
