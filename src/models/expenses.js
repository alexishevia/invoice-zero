import * as api from '../api.mjs';

export async function createExpense(data) {
  await api.post('/expenses', data);
}

// export async function getExpenseByID(id) {
//   const expense = await DataStore.query(Expense, id);
//   return expense
// }

// export async function updateExpense(expense, newData) {
//   await DataStore.save(
//     Expense.copyOf(expense, updated => {
//       Object.entries(newData).forEach(([key, val]) => {
//         updated[key] = val
//       });
//     })
//   )
// }

// export async function deleteExpense(expense) {
//   await DataStore.delete(expense)
// }

export async function getExpenses(query = {}) {
  const expenses = await api.get('/expenses', { query });
  return expenses;
}

// export async function queryExpenses({
//   fromDate,
//   toDate,
//   accountIDs,
//   categoryIDs,
// }) {
//   if (accountIDs && accountIDs.length === 0) {
//     return [];
//   }
//   if (categoryIDs && categoryIDs.length === 0) {
//     return [];
//   }
//   const expenses = await DataStore.query(Expense, t => (
//     t.transactionDate("ge", fromDate)
//     .transactionDate("le", toDate)
//     .or(t => accountIDs.reduce((query, id) => query.accountID("eq", id), t))
//     .or(t => categoryIDs.reduce((query, id) => query.categoryID("eq", id), t))
//   ));
//   return expenses
// }
