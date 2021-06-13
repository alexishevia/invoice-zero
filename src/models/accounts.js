import * as api from '../api.mjs';
// import { forEachTransfer } from './transfers';
// import { forEachIncome } from './incomes';
// import { forEachExpense } from './expenses';

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

// getAccountBalances returns balances for all accounts provided.
// returns an object with format:
//    { [accountID]: accountBalance }
// eg:
//    { "accA": 5.29, "accB": 8.20, "accC": 150.00 }
// export async function getAccountBalances(accounts) {
//   const balances = accounts.reduce((memo, account) => ({
//     ...memo, [account.id]: account.initialBalance
//   }), {});

//   await Promise.all([
//     forEachTransfer(({fromID, toID, amount}) => {
//       balances[fromID] = (balances[fromID] || 0) - amount;
//       balances[toID] = (balances[toID] || 0) + amount;
//     }),
//     forEachIncome(({ accountID, amount }) => {
//       balances[accountID] = (balances[accountID] || 0) + amount
//     }),
//     forEachExpense(({ accountID, amount }) => {
//       balances[accountID] = (balances[accountID] || 0) - amount
//     }),
//   ])


//   return balances;
// }
