import * as api from '../api.mjs';

export async function getStats() {
  const stats = await api.get(`/stats`);
  return stats;
}
