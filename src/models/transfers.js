import { Transfer } from '.';
import { forEach } from './pagination';

export async function forEachTransfer(func) {
  return forEach('Transfer', Transfer, func);
}
