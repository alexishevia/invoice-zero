import * as api from '../api.mjs';

export async function getStats({ signal }) {
  const stats = await api.get(`/stats`, { signal });
  return stats;
}
