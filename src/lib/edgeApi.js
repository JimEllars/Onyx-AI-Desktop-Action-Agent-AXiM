const configuredBaseUrl = import.meta.env.VITE_ONYX_EDGE_API_URL?.trim().replace(/\/+$/, '');

export const isEdgeApiConfigured = Boolean(configuredBaseUrl);

export function edgeApiUrl(path) {
  if (!configuredBaseUrl) {
    throw new Error('VITE_ONYX_EDGE_API_URL is not configured.');
  }

  return `${configuredBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function edgeFetch(path, init) {
  return fetch(edgeApiUrl(path), init);
}

export async function getTelemetry(since, limit) {
  const params = new URLSearchParams();
  if (since) params.append('since', since);
  if (limit) params.append('limit', limit);
  const qs = params.toString();
  const url = `/api/telemetry${qs ? '?' + qs : ''}`;

  const res = await edgeFetch(url);
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export async function fetchRecentTelemetry(limit = 30) {
  const url = `/api/telemetry/recent?limit=${limit}`;
  const res = await edgeFetch(url);
  if (!res.ok) {
    if (res.status >= 500) throw new Error('Edge API Error');
    throw new Error('Failed to fetch telemetry');
  }
  return res.json();
}

export async function pushTelemetryBatch(batch) {
  const url = `/api/telemetry`;
  const res = await edgeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer MOCK_TOKEN'
    },
    body: JSON.stringify(batch)
  });
  if (!res.ok) {
    if (res.status >= 500) throw new Error('Edge API Error');
    throw new Error('Failed to push telemetry');
  }
  return res.json();
}
