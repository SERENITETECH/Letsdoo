import { Api } from './api.js';
import { showToast } from './app.js';

const featuredGrid = document.getElementById('featured-grid');
const testimonialsList = document.getElementById('testimonials-list');
const resultsGrid = document.getElementById('results-grid');
const resultsState = document.getElementById('results-state');
const filtersForm = document.getElementById('filters-form');
const loadMoreBtn = document.getElementById('load-more');

let page = 1;
let lastFilters = {};

async function loadFeatured() {
  if (!featuredGrid) return;
  try {
    const { items } = await Api.listProducts({ sort: 'popular', pageSize: 8 });
    featuredGrid.innerHTML = items
      .map(
        (product) => `
        <article class="card">
          <img src="${product.coverUrl ?? 'assets/illustrations/dashboard.svg'}" alt="${product.title}" loading="lazy" />
          <div class="card__content">
            <h3>${product.title}</h3>
            <p>${product.subtitle ?? ''}</p>
            <div class="card__footer">
              <span class="price">${formatPrice(product.priceCents)}</span>
              <a class="link" href="produit.html?id=${product.slug}">Voir la fiche</a>
            </div>
          </div>
        </article>`
      )
      .join('');
  } catch (error) {
    featuredGrid.innerHTML = '<p>Impossible de charger les produits.</p>';
  }
}

const testimonialData = [
  {
    author: 'Camille, Ops chez SaaSflow',
    quote: 'Letsdoo nous a permis de lancer 3 automatisations critiques en moins de deux semaines.',
  },
  {
    author: 'Louis, intégrateur Odoo',
    quote: 'La qualité des modules est excellente et la communauté réactive.',
  },
  {
    author: 'Sarah, fondatrice de DataPlus',
    quote: 'Une marketplace francophone enfin dédiée à l’automatisation professionnelle.',
  },
];

if (testimonialsList) {
  testimonialsList.innerHTML = testimonialData
    .map(
      (item) => `
      <figure class="card card--border">
        <blockquote>“${item.quote}”</blockquote>
        <figcaption>${item.author}</figcaption>
      </figure>`
    )
    .join('');
}

function formatPrice(cents) {
  if (!cents) return 'Gratuit';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

async function fetchResults(filters = {}) {
  if (!resultsGrid || !resultsState) return;
  if (filters.reset) {
    resultsGrid.innerHTML = '';
    page = 1;
  }
  resultsState.textContent = 'Chargement des modules…';
  try {
    const { items, total } = await Api.listProducts({ ...filters, page });
    resultsState.textContent = total === 0 ? 'Aucun produit trouvé.' : `${total} résultats`;
    if (items.length === 0 && page === 1) {
      resultsGrid.innerHTML = '';
    } else {
      resultsGrid.insertAdjacentHTML(
        'beforeend',
        items
          .map(
            (product) => `
            <article class="card">
              <img src="${product.coverUrl ?? 'assets/illustrations/dashboard.svg'}" alt="${product.title}" loading="lazy" />
              <div>
                <h3>${product.title}</h3>
                <p>${product.subtitle ?? ''}</p>
                <p class="tags">${product.tags.join(', ')}</p>
                <div class="card__footer">
                  <span class="price">${formatPrice(product.priceCents)}</span>
                  <a class="link" href="produit.html?id=${product.slug}">Voir</a>
                </div>
              </div>
            </article>`
          )
          .join('')
      );
    }
    loadMoreBtn.hidden = items.length < 20;
  } catch (error) {
    showToast(error.message, 'error');
    resultsState.textContent = 'Erreur de chargement.';
  }
}

if (filtersForm) {
  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(filtersForm);
    const compat = formData.getAll('compat');
    const type = formData.get('type');
    lastFilters = {
      q: formData.get('q') ?? undefined,
      type: type ? type : undefined,
      compat: compat,
      minPrice: formData.get('minPrice') || undefined,
      maxPrice: formData.get('maxPrice') || undefined,
      sort: formData.get('sort') || 'recent',
      reset: true,
    };
    fetchResults(lastFilters);
  });
  fetchResults({ reset: true });
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    page += 1;
    fetchResults({ ...lastFilters, reset: false });
  });
}

loadFeatured();
