import * as api from '../api.mjs';

export async function createIncome(data) {
  await api.post('/income', data);
}

// export async function getIncomeByID(id) {
//   const income = await DataStore.query(Income, id);
//   return income
// }

// export async function updateIncome(income, newData) {
//   await DataStore.save(
//     Income.copyOf(income, updated => {
//       Object.entries(newData).forEach(([key, val]) => {
//         updated[key] = val
//       });
//     })
//   )
// }

// export async function deleteIncome(income) {
//   await DataStore.delete(income)
// }

export async function getIncomes(query = {}) {
  const income = await api.get('/income', { query });
  return income;
}

// export async function queryIncomes(query) {
//   const { fromDate, toDate, accountIDs, categoryIDs } = query;
//   if (accountIDs && accountIDs.length === 0) {
//     return [];
//   }
//   if (categoryIDs && categoryIDs.length === 0) {
//     return [];
//   }
//   const incomes = await DataStore.query(Income, t => (
//     t.transactionDate("ge", fromDate)
//     .transactionDate("le", toDate)
//     .or(t => accountIDs.reduce((query, id) => query.accountID("eq", id), t))
//     .or(t => categoryIDs.reduce((query, id) => query.categoryID("eq", id), t))
//   ));
//   return incomes
// }
