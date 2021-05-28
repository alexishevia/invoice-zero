import { Income } from '.';
import { forEach } from './pagination';

export async function forEachIncome(func) {
  return forEach('Income', Income, func);
}
