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
