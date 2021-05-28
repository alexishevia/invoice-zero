import { DataStore } from '@aws-amplify/datastore'
import { Category } from '.';

export async function getCategories() {
  const accounts = await DataStore.query(Category);
  return accounts
}

export function onCategoriesChange(func) {
  return DataStore.observe(Category).subscribe(func)
}
