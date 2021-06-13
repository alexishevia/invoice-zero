import * as api from '../api.mjs';

export async function createIncome(data) {
  await api.post('/income', data);
}

export async function getIncomeByID(id) {
  const income = await api.get(`/income/${id}`);
  return income
}

export async function updateIncome(income, newData) {
  await api.patch(`/income/${income.id}`, newData);
}

export async function deleteIncome(income) {
  await api.del(`/income/${income.id}`);
}

export async function getIncomes(query = {}) {
  const income = await api.get('/income', { query });
  return income;
}
