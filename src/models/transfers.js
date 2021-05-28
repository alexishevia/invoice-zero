import { DataStore } from '@aws-amplify/datastore'
import { Transfer } from '.';
import { forEach } from './pagination';

export async function createTransfer(data) {
  await DataStore.save(new Transfer(data))
}

export async function getTransfers() {
  const transfers = await DataStore.query(Transfer);
  return transfers
}

export function onTransfersChange(func) {
  return DataStore.observe(Transfer).subscribe(func)
}

export async function forEachTransfer(func) {
  return forEach('Transfer', Transfer, func);
}
