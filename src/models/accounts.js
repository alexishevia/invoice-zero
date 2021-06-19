import * as api from '../api.mjs';

const cache = {
  accounts: [],
};

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

async function refreshAccounts() {
  const accounts = await api.get('/accounts');
  cache.accounts = accounts;
}

export async function getAccounts() {
  if (cache.accounts.length) { // we have cached accounts
    refreshAccounts(); // refresh in the background
    return cache.accounts; // return cached accounts
  }
  await refreshAccounts();
  return cache.accounts;
}
