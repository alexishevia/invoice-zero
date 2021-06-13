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

// export async function getIncomes() {
//   const transfers = await DataStore.query(Income);
//   return transfers
// }

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

// export async function *iterateIncomes() {
//   let page = 0;
//   const itemsPerPage = 100;
//   const maxPages = 9999;
//   while (true) {
//     if (page >= maxPages) {
//       throw new Error('maxPages queried');
//     }
//     const incomes = await DataStore.query(Income, Predicates.ALL, { page, limit: itemsPerPage });
//     if (!Array.isArray(incomes) || !incomes.length) {
//       return; // done
//     }
//     for (const income of incomes) {
//       yield income
//     }
//     page += 1;
//   }
// }

// export function onIncomesChange(func) {
//   return DataStore.observe(Income).subscribe(func)
// }

// export async function forEachIncome(func) {
//   return forEach('Income', Income, func);
// }
