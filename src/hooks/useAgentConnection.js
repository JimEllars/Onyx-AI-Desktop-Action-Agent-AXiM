import { useEffect } from 'react';
import { aximCoreClient } from '../lib/supabaseClient.js';
import { useDesktopAgentStore } from '../store/useDesktopAgentStore.js';

export function useAgentConnection() {
  const { setLiveTelemetry, walletConnected, setLiveChannelConnected } = useDesktopAgentStore();

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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AGENT_CONNECTION] Successfully subscribed to agent_telemetry_stream.');
          setLiveChannelConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('[AGENT_CONNECTION] Channel subscription error or closed:', status);
          setLiveChannelConnected(false);
        }
      });

    return () => {
      aximCoreClient.removeChannel(channel);
    };
  }, [setLiveTelemetry, walletConnected, setLiveChannelConnected]);
}
