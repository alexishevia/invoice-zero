import { DataStore } from '@aws-amplify/datastore'
import { Account } from '.';
import { forEachTransfer } from './transfers';
import { forEachIncome } from './incomes';
import { forEachExpense } from './expense';

export async function getAccounts() {
  const accounts = await DataStore.query(Account);
  return accounts
}

export function onAccountsChange(func) {
  return DataStore.observe(Account).subscribe(func)
}

// getAccountBalances returns balances for all accounts provided.
// returns an object with format:
//    { [accountID]: accountBalance }
// eg:
//    { "accA": 5.29, "accB": 8.20, "accC": 150.00 }
export async function getAccountBalances(accounts) {
  const balances = accounts.reduce((memo, account) => ({
    ...memo, [account.id]: account.initialBalance
  }), {});

  await Promise.all([
    forEachTransfer(({fromID, toID, amount}) => {
      balances[fromID] = (balances[fromID] || 0) - amount;
      balances[toID] = (balances[toID] || 0) + amount;
    }),
    forEachIncome(({ accountID, amount }) => {
      balances[accountID] = (balances[accountID] || 0) + amount
    }),
    forEachExpense(({ accountID, amount }) => {
      balances[accountID] = (balances[accountID] || 0) - amount
    }),
  ])


  return balances;
}
