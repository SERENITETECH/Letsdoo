import { Api } from './api.js';
import { requireAuth, showToast } from './app.js';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const accountName = document.getElementById('account-name');

function activateTab(id) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.target === id));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === id));
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.target));
});

async function loadAccount() {
  try {
    const { user } = await requireAuth();
    if (accountName) accountName.textContent = user.displayName;
    const { orders } = await Api.listOrders();
    const achats = document.getElementById('achats');
    const telechargements = document.getElementById('telechargements');
    const favoris = document.getElementById('favoris');
    if (achats) {
      achats.innerHTML = orders
        .map(
          (order) => `
          <article class="card card--border">
            <h3>Commande ${order.id.slice(0, 6)}</h3>
            <p>Total : ${(order.totalCents / 100).toFixed(2)} €</p>
            <p>${order.items.length} éléments</p>
          </article>`
        )
        .join('');
    }
    if (telechargements) {
      telechargements.innerHTML = orders
        .flatMap((order) => order.items)
        .map(
          (item) => `
          <article class="card card--border">
            <h3>${item.product.title}</h3>
            <button class="btn btn-secondary" type="button">Télécharger</button>
          </article>`
        )
        .join('');
    }
    if (favoris) {
      favoris.innerHTML = '<p>Les favoris arriveront avec la prochaine mise à jour.</p>';
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

loadAccount();
