import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_AXIM_CORE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_AXIM_CORE_ANON_KEY || '';

import { useDesktopAgentStore } from '../store/useDesktopAgentStore.js';

const customFetch = async (url, options) => {
  options = options || {};
  options.headers = options.headers || {};

  try {
    const operatorAddress = useDesktopAgentStore.getState().operatorAddress;
    options.headers['x-session-affinity'] = `ses_${operatorAddress || 'default_session'}`;
    options.headers['X-AXiM-Internal-Auth'] = import.meta.env.VITE_AXIM_INTERNAL_KEY || '';

    // Add a system log entry when session affinity is attached
    if (!options.headers['_log_attached']) {
      options.headers['_log_attached'] = 'true';
      setTimeout(() => {
         try {
           const address = operatorAddress || 'default_session';
           useDesktopAgentStore.getState().addActionLog({
             type: 'system',
             text: `[CLOUDFLARE_EDGE] Engaged prompt prefix caching via session affinity [ses_${address.substring(0, 8)}].`
           });
         } catch (err) { console.warn(err); }
      }, 0);
    }
  } catch (e) {
    // If store isn't available yet
    console.warn(e);
  }
  const response = await fetch(url, options);
  if (response.status === 401 || response.status === 403) {
    console.error('[CLOUDFLARE_EDGE_BLOCK] Unauthorized access intercepted by Zero Trust.');
    throw new Error('CLOUDFLARE_EDGE_BLOCK');
  }
  return response;
};

export const aximCoreClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: customFetch }
});
