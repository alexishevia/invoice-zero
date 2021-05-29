import { DataStore } from '@aws-amplify/datastore'
import { Transfer } from '.';
import { forEach } from './pagination';

export async function createTransfer(data) {
  await DataStore.save(new Transfer(data))
}

export async function getTransferByID(id) {
  const transfer = await DataStore.query(Transfer, id);
  return transfer
}

export async function updateTransfer(transfer, newData) {
  await DataStore.save(
    Transfer.copyOf(transfer, updated => {
      Object.entries(newData).forEach(([key, val]) => {
        updated[key] = val
      });
    })
  )
}

export async function deleteTransfer(transfer) {
  await DataStore.delete(transfer)
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
