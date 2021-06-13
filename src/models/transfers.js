import * as api from '../api.mjs';

export async function createTransfer(data) {
  await api.post('/transfers', data);
}

export async function getTransferByID(id) {
  const transfer = await api.get(`/transfers/${id}`);
  return transfer
}

export async function updateTransfer(transfer, newData) {
  await api.patch(`/transfers/${transfer.id}`, newData);
}

export async function deleteTransfer(transfer) {
  await api.del(`/transfers/${transfer.id}`);
}

export async function getTransfers(query = {}) {
  const transfers = await api.get('/transfers', { query });
  return transfers;
}
