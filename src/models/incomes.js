import { DataStore } from '@aws-amplify/datastore'
import { Income } from '.';
import { forEach } from './pagination';

export async function createIncome(data) {
  await DataStore.save(new Income(data));
}

export async function getIncomeByID(id) {
  const income = await DataStore.query(Income, id);
  return income
}

export async function updateIncome(income, newData) {
  await DataStore.save(
    Income.copyOf(income, updated => {
      Object.entries(newData).forEach(([key, val]) => {
        updated[key] = val
      });
    })
  )
}

export async function deleteIncome(income) {
  await DataStore.delete(income)
}

export async function getIncomes() {
  const transfers = await DataStore.query(Income);
  return transfers
}

export function onIncomesChange(func) {
  return DataStore.observe(Income).subscribe(func)
}

export async function forEachIncome(func) {
  return forEach('Income', Income, func);
}