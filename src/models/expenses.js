import * as api from '../api.mjs';

export async function createExpense(data) {
  await api.post('/expenses', data);
}

export async function getExpenseByID(id) {
  const expense = await api.get(`/expenses/${id}`);
  return expense
}

export async function updateExpense(expense, newData) {
  await api.patch(`/expenses/${expense.id}`, newData);
}

export async function deleteExpense(expense) {
  await api.del(`/expenses/${expense.id}`);
}

export async function getExpenses(query = {}) {
  const expenses = await api.get('/expenses', { query });
  return expenses;
}
