import { Expense } from '.';
import { forEach } from './pagination';

export async function forEachExpense(func) {
  return forEach('Expense', Expense, func);
}
