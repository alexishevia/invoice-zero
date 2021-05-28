import { DataStore } from '@aws-amplify/datastore'
import { Category } from '.';

export async function createCategory(data) {
  await DataStore.save(new Category(data));
}

export async function getCategoryByID(id) {
  const category = await DataStore.query(Category, id);
  return category
}

export async function updateCategory(category, newData) {
  await DataStore.save(
    Category.copyOf(category, updated => {
      Object.entries(newData).forEach(([key, val]) => {
        updated[key] = val
      });
    })
  )
}

export async function deleteCategory(category) {
  await DataStore.delete(category)
}

export async function getCategories() {
  const accounts = await DataStore.query(Category);
  return accounts
}

export function onCategoriesChange(func) {
  return DataStore.observe(Category).subscribe(func)
}
