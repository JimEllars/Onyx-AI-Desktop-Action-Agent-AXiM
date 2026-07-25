import { useEffect, useRef } from 'react';
import { aximCoreClient } from '../lib/supabaseClient.js';
import { useDesktopAgentStore } from '../store/useDesktopAgentStore.js';

export function useAgentConnection() {
  const { setLiveTelemetry, walletConnected, setLiveChannelConnected, addActionLog, localQueueCount, clearLocalBufferQueue } = useDesktopAgentStore();
  const prevStatusRef = useRef(null);

  useEffect(() => {
    if (!walletConnected) return;

    // Subscribe to the real-time agent_telemetry_stream channel
    const channel = aximCoreClient.channel('agent_telemetry_stream');

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
          console.error('[AGENT_CONNECTION] Channel subscription error or closed:', status);
          addActionLog({ type: 'warning', text: '[DISCONNECT] [CLOUDFLARE_EDGE] Real-time telemetry stream dropped. Falling back to local autopilot telemetry.' });
          setLiveChannelConnected(false);
          useDesktopAgentStore.getState().recordOfflineTelemetryGap();
        }
        prevStatusRef.current = status;
      });

    return () => {
      aximCoreClient.removeChannel(channel);
    };
  }, [setLiveTelemetry, walletConnected, setLiveChannelConnected, addActionLog]);
}
