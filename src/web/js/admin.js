import { Api } from './api.js';
import { getCsrfToken, requireAuth, showToast } from './app.js';

const links = document.querySelectorAll('.admin__link');
const panels = document.querySelectorAll('.panel');
const statsGrid = document.getElementById('admin-stats');
const productsTable = document.getElementById('admin-products-table');
const categoriesTable = document.getElementById('admin-categories-table');
const usersTable = document.getElementById('admin-users-table');
const ordersTable = document.getElementById('admin-orders-table');
const addCategoryBtn = document.getElementById('add-category');

function switchPanel(id) {
  links.forEach((link) => link.classList.toggle('active', link.dataset.target === id));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === id));
}

links.forEach((link) => link.addEventListener('click', () => switchPanel(link.dataset.target)));

async function ensureAdmin() {
  const { user } = await requireAuth();
  if (user.role !== 'ADMIN') {
    showToast('Accès réservé aux administrateurs', 'error');
    throw new Error('forbidden');
  }
  return user;
}

async function loadDashboard() {
  try {
    await ensureAdmin();
    const [{ stats }, { items: products }, categories, users, orders] = await Promise.all([
      Api.listAdminStats(),
      Api.listAdminProducts(),
      Api.listCategories(),
      Api.listUsers(),
      Api.listOrders(),
    ]);
    statsGrid.innerHTML = `
      <div class="kpi"><span class="kpi__value">${stats.utilisateurs}</span><span class="kpi__label">Utilisateurs</span></div>
      <div class="kpi"><span class="kpi__value">${stats.produits}</span><span class="kpi__label">Produits</span></div>
      <div class="kpi"><span class="kpi__value">${(stats.revenusCents / 100).toFixed(2)} €</span><span class="kpi__label">Revenus</span></div>
      <div class="kpi"><span class="kpi__value">${stats.commandes}</span><span class="kpi__label">Commandes</span></div>`;

    productsTable.innerHTML = `
      <thead><tr><th>Titre</th><th>Auteur</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
      <tbody>
        ${products
          .map(
            (product) => `
              <tr>
                <td>${product.title}</td>
                <td>${product.author.displayName}</td>
                <td>${(product.priceCents / 100).toFixed(2)} €</td>
                <td>${product.status}</td>
                <td>
                  <button class="btn btn-secondary" data-action="publish" data-id="${product.id}">Publier</button>
                  <button class="btn btn-secondary" data-action="delete" data-id="${product.id}">Supprimer</button>
                </td>
              </tr>`
          )
          .join('')}
      </tbody>`;

    categoriesTable.innerHTML = `
      <thead><tr><th>Nom</th><th>Slug</th><th></th></tr></thead>
      <tbody>
        ${categories.categories
          .map(
            (category) => `
              <tr>
                <td>${category.name}</td>
                <td>${category.slug}</td>
                <td><button class="btn btn-secondary" data-cat="${category.id}">Supprimer</button></td>
              </tr>`
          )
          .join('')}
      </tbody>`;

    usersTable.innerHTML = `
      <thead><tr><th>Email</th><th>Nom</th><th>Rôle</th><th></th></tr></thead>
      <tbody>
        ${users.users
          .map(
            (user) => `
              <tr>
                <td>${user.email}</td>
                <td>${user.displayName}</td>
                <td>
                  <select data-user="${user.id}" class="role-select">
                    <option value="CLIENT" ${user.role === 'CLIENT' ? 'selected' : ''}>Client</option>
                    <option value="CREATOR" ${user.role === 'CREATOR' ? 'selected' : ''}>Créateur</option>
                    <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                  </select>
                </td>
                <td><button class="btn btn-secondary" data-delete="${user.id}">Supprimer</button></td>
              </tr>`
          )
          .join('')}
      </tbody>`;

    ordersTable.innerHTML = `
      <thead><tr><th>Commande</th><th>Acheteur</th><th>Total</th><th>Statut</th></tr></thead>
      <tbody>
        ${orders.orders
          .map(
            (order) => `
              <tr>
                <td>${order.id.slice(0, 6)}</td>
                <td>${order.buyer.displayName}</td>
                <td>${(order.totalCents / 100).toFixed(2)} €</td>
                <td>${order.status}</td>
              </tr>`
          )
          .join('')}
      </tbody>`;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

if (productsTable) {
  productsTable.addEventListener('click', async (event) => {
    const target = event.target.closest('button[data-action]');
    if (!target) return;
    const { action, id } = target.dataset;
    try {
      if (action === 'publish') {
        await Api.listAdminStats();
        await fetch(`/api/admin/products/${id}/publish`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
          body: JSON.stringify({ status: 'PUBLISHED' }),
        });
        showToast('Produit publié');
      }
      if (action === 'delete') {
        await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'X-CSRF-Token': getCsrfToken() },
        });
        showToast('Produit supprimé');
      }
      loadDashboard();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (categoriesTable) {
  categoriesTable.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-cat]');
    if (!button) return;
    try {
      await Api.deleteCategory(button.dataset.cat);
      showToast('Catégorie supprimée');
      loadDashboard();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (usersTable) {
  usersTable.addEventListener('change', async (event) => {
    const select = event.target.closest('select[data-user]');
    if (!select) return;
    try {
      await Api.updateUserRole(select.dataset.user, select.value);
      showToast('Rôle mis à jour');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
  usersTable.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-delete]');
    if (!button) return;
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await Api.deleteUser(button.dataset.delete);
      showToast('Utilisateur supprimé');
      loadDashboard();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (addCategoryBtn) {
  addCategoryBtn.addEventListener('click', async () => {
    const name = prompt('Nom de la catégorie');
    const slug = name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!name) return;
    try {
      await Api.createCategory({ name, slug });
      showToast('Catégorie créée');
      loadDashboard();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

loadDashboard();
