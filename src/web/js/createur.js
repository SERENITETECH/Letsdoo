import { Api } from './api.js';
import { apiFetch, getCsrfToken, requireAuth, showToast } from './app.js';

const form = document.getElementById('creator-form');
const tableBody = document.getElementById('creator-products');
const filesTable = document.getElementById('creator-files-table');
const filesTableBody = filesTable?.querySelector('tbody');
const versionForm = document.getElementById('creator-version-form');
const versionSelect = document.getElementById('version-product');
const kpiElements = document.querySelectorAll('[data-kpi]');

let creatorProductsCache = [];

function renderVersionTable() {
  if (!filesTableBody) return;
  if (!creatorProductsCache.length) {
    filesTableBody.innerHTML = '<tr><td colspan="5">Aucun fichier disponible pour le moment.</td></tr>';
    return;
  }
  filesTableBody.innerHTML = creatorProductsCache
    .map((product) =>
      product.versions.length
        ? product.versions
            .map(
              (version) => {
                const download = version.zipUrl
                  ? `<a href="${version.zipUrl}" class="link" download>Télécharger</a>`
                  : '<span class="muted">Lien en cours de génération</span>';
                const createdAt = new Date(version.createdAt).toLocaleDateString('fr-FR');
                return `
          <tr>
            <td>${product.title}</td>
            <td>${version.number}</td>
            <td>${createdAt}</td>
            <td>${download}</td>
            <td><button class="btn btn-text" data-remove-version="${version.id}" data-product="${product.id}">Retirer</button></td>
          </tr>`;
              }
            )
            .join('')
        : `
          <tr>
            <td>${product.title}</td>
            <td colspan="4">Aucune version publiée pour le moment.</td>
          </tr>`
    )
    .join('');
}

function populateVersionSelect() {
  if (!versionSelect) return;
  const submitBtn = versionForm?.querySelector('button[type="submit"]');
  if (!creatorProductsCache.length) {
    versionSelect.innerHTML = '<option value="" disabled selected>Aucun module disponible</option>';
    versionSelect.setAttribute('disabled', '');
    submitBtn?.setAttribute('disabled', '');
    return;
  }
  versionSelect.removeAttribute('disabled');
  submitBtn?.removeAttribute('disabled');
  versionSelect.innerHTML = creatorProductsCache
    .map((product) => `<option value="${product.id}">${product.title}</option>`)
    .join('');
}

async function loadCreatorData() {
  try {
    const { user } = await requireAuth();
    const { items } = await Api.listProducts({ pageSize: 50, sort: 'recent' });
    const myProducts = items.filter((product) => product.author.id === user.id);
    creatorProductsCache = myProducts;
    tableBody.innerHTML = myProducts.length
      ? myProducts
          .map(
            (product) => `
        <tr>
          <td>${product.title}</td>
          <td>${product.status}</td>
          <td>${(product.priceCents / 100).toFixed(2)} €</td>
          <td>${product.versions.length}</td>
        </tr>`
          )
          .join('')
      : '<tr><td colspan="4">Publiez votre premier module pour voir vos statistiques ici.</td></tr>';
    renderVersionTable();
    populateVersionSelect();
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
      await loadCreatorData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (versionForm) {
  versionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(versionForm);
    try {
      await requireAuth();
      const productId = formData.get('productId');
      if (!productId) {
        throw new Error('Sélectionnez un module.');
      }
      const archive = formData.get('archive');
      if (!archive || !(archive instanceof File) || !archive.size) {
        throw new Error('Sélectionnez une archive ZIP.');
      }
      const uploadZip = new FormData();
      uploadZip.append('archive', archive);
      const zipRes = await fetch('/api/uploads/zip', {
        method: 'POST',
        body: uploadZip,
        credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      if (!zipRes.ok) {
        const error = await zipRes.json().catch(() => ({}));
        throw new Error(error?.error?.message ?? 'Échec du téléversement');
      }
      const zipJson = await zipRes.json();
      await apiFetch(`/api/versions/${productId}`, {
        method: 'POST',
        body: JSON.stringify({
          number: formData.get('number'),
          changelogMD: formData.get('changelog'),
          zipUrl: zipJson.url,
        }),
      });
      showToast('Version ajoutée', 'success');
      versionForm.reset();
      await loadCreatorData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (filesTable) {
  filesTable.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-remove-version]');
    if (!button) return;
    if (!confirm('Supprimer cette version ?')) return;
    try {
      const response = await fetch(`/api/versions/${button.dataset.removeVersion}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message ?? 'Suppression impossible');
      }
      showToast('Version supprimée');
      await loadCreatorData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

loadCreatorData();
