import { DataStore, Predicates } from '@aws-amplify/datastore'
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

export async function queryTransfers({
  fromDate,
  toDate,
  accountIDs,
}) {
  if (accountIDs && accountIDs.length === 0) {
    return [];
  }
  const transfers = await DataStore.query(Transfer, t => (
    t.transactionDate("ge", fromDate)
    .transactionDate("le", toDate)
    .or(t => accountIDs.reduce((query, id) => query.fromID("eq", id), t))
    .or(t => accountIDs.reduce((query, id) => query.toID("eq", id), t))
  ));
  return transfers
}

export async function *iterateTransfers() {
  let page = 0;
  const itemsPerPage = 100;
  const maxPages = 9999;
  while (true) {
    if (page >= maxPages) {
      throw new Error('maxPages queried');
    }
    const transfers = await DataStore.query(Transfer, Predicates.ALL, { page, limit: itemsPerPage });
    if (!Array.isArray(transfers) || !transfers.length) {
      return; // done
    }
    for (const transfer of transfers) {
      yield transfer
    }
    page += 1;
  }
}

export function onTransfersChange(func) {
  return DataStore.observe(Transfer).subscribe(func)
}

export async function forEachTransfer(func) {
  return forEach('Transfer', Transfer, func);
}
