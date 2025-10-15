import { apiFetch } from './app.js';

export const Api = {
  async listProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return apiFetch(`/api/products?${searchParams.toString()}`);
  },
  async getProduct(id) {
    return apiFetch(`/api/products/${id}`);
  },
  async listReviews(productId) {
    return apiFetch(`/api/reviews/${productId}`);
  },
  async createReview(productId, payload) {
    return apiFetch(`/api/reviews/${productId}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async listOrders() {
    return apiFetch('/api/orders');
  },
  async createOrder(items) {
    return apiFetch('/api/orders', { method: 'POST', body: JSON.stringify({ items }) });
  },
  async listAdminStats() {
    return apiFetch('/api/admin/stats');
  },
  async listAdminProducts() {
    return apiFetch('/api/products?sort=recent&pageSize=50');
  },
  async listCategories() {
    return apiFetch('/api/categories');
  },
  async createCategory(payload) {
    return apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateCategory(id, payload) {
    return apiFetch(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteCategory(id) {
    return apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
  },
  async listUsers() {
    return apiFetch('/api/users');
  },
  async updateUserRole(id, role) {
    return apiFetch(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
  },
  async deleteUser(id) {
    return apiFetch(`/api/users/${id}`, { method: 'DELETE' });
  },
};
