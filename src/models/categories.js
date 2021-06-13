import * as api from '../api.mjs';

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

export async function getCategories() {
  const categories = await api.get('/categories');
  return categories;
}
