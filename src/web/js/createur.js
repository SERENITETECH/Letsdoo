import { Api } from './api.js';
import { apiFetch, getCsrfToken, requireAuth, showToast } from './app.js';

const form = document.getElementById('creator-form');
const tableBody = document.getElementById('creator-products');
const kpiElements = document.querySelectorAll('[data-kpi]');

async function loadCreatorData() {
  try {
    const { user } = await requireAuth();
    const { items } = await Api.listProducts({ pageSize: 50, sort: 'recent' });
    const myProducts = items.filter((product) => product.author.id === user.id);
    tableBody.innerHTML = myProducts
      .map(
        (product) => `
        <tr>
          <td>${product.title}</td>
          <td>${product.status}</td>
          <td>${(product.priceCents / 100).toFixed(2)} €</td>
          <td>${product.versions.length}</td>
        </tr>`
      )
      .join('');
    kpiElements.forEach((el) => {
      const key = el.dataset.kpi;
      if (key === 'revenus') el.textContent = `${(myProducts.reduce((total, p) => total + p.priceCents, 0) / 100).toFixed(2)} €`;
      if (key === 'ventes') el.textContent = (myProducts.length * 3).toString();
      if (key === 'panier') el.textContent = '129 €';
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const compat = formData.getAll('compatibility');
    const tags = (formData.get('tags') ?? '').toString().split(',').map((tag) => tag.trim()).filter(Boolean);
    try {
      await requireAuth();
      const coverFile = formData.get('cover');
      const archiveFile = formData.get('archive');
      let coverUrl;
      let zipUrl;
      if (coverFile && coverFile.size) {
        const uploadCover = new FormData();
        uploadCover.append('image', coverFile);
        const coverRes = await fetch('/api/uploads/image', {
          method: 'POST',
          body: uploadCover,
          credentials: 'include',
          headers: { 'X-CSRF-Token': getCsrfToken() },
        });
        const coverJson = await coverRes.json();
        coverUrl = coverJson.url;
      }
      if (archiveFile && archiveFile.size) {
        const uploadZip = new FormData();
        uploadZip.append('archive', archiveFile);
        const zipRes = await fetch('/api/uploads/zip', {
          method: 'POST',
          body: uploadZip,
          credentials: 'include',
          headers: { 'X-CSRF-Token': getCsrfToken() },
        });
        const zipJson = await zipRes.json();
        zipUrl = zipJson.url;
      }
      const productPayload = {
        title: formData.get('title'),
        slug: formData.get('title').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: formData.get('type'),
        descriptionMD: formData.get('description'),
        subtitle: formData.get('subtitle'),
        priceCents: Math.round(Number(formData.get('price')) * 100),
        compatibility: compat,
        tags,
        coverUrl,
      };
      const { product } = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(productPayload) });
      if (zipUrl) {
        await apiFetch(`/api/versions/${product.id}`, {
          method: 'POST',
          body: JSON.stringify({ number: '1.0.0', changelogMD: formData.get('changelog'), zipUrl }),
        });
      }
      showToast('Module publié !', 'success');
      form.reset();
      loadCreatorData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

loadCreatorData();
