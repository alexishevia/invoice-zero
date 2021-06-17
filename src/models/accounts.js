import * as api from '../api.mjs';
import { dateToDayStr, monthStart, monthEnd } from '../helpers/date';

export async function createAccount(data) {
  await api.post('/accounts', data);
}

export async function getAccountByID(id) {
  const account = await api.get(`/accounts/${id}`);
  return account;
}

export async function updateAccount(account, newData) {
  await api.patch(`/accounts/${account.id}`, newData);
}

export async function deleteAccount(account) {
  await api.del(`/accounts/${account.id}`);
}

export async function getAccounts() {
  const accounts = await api.get('/accounts');
  return accounts;
}
