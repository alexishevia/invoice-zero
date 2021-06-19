import * as api from '../api.mjs';

const cache = {
  categories: [],
};

export async function createCategory(data) {
  await api.post('/categories', data);
}

export async function getCategoryByID(id) {
  const category = await api.get(`/categories/${id}`);
  return category
}

export async function updateCategory(category, newData) {
  await api.patch(`/categories/${category.id}`, newData);
}

export async function deleteCategory(category) {
  await api.del(`/categories/${category.id}`);
}

async function refreshCategories() {
  const categories = await api.get('/categories');
  return cache.categories = categories;
}

export async function getCategories() {
  if (cache.categories.length) { // we have cached categories
    refreshCategories(); // refresh in the background
    return cache.categories; // return cached categories
  }
  await refreshCategories();
  return cache.categories;
}
