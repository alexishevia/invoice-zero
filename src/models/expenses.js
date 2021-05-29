import { DataStore } from '@aws-amplify/datastore'
import { Expense } from '.';
import { forEach } from './pagination';

export async function createExpense(data) {
  await DataStore.save(new Expense(data));
}

export async function getExpenseByID(id) {
  const expense = await DataStore.query(Expense, id);
  return expense
}

export async function updateExpense(expense, newData) {
  await DataStore.save(
    Expense.copyOf(expense, updated => {
      Object.entries(newData).forEach(([key, val]) => {
        updated[key] = val
      });
    })
  )
}

export async function deleteExpense(expense) {
  await DataStore.delete(expense)
}

export async function getExpenses() {
  const transfers = await DataStore.query(Expense);
  return transfers
}

export function onExpensesChange(func) {
  return DataStore.observe(Expense).subscribe(func)
}

export async function forEachExpense(func) {
  return forEach('Expense', Expense, func);
}
