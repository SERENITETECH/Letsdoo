import { Api } from './api.js';
import { apiFetch, showToast, requireAuth } from './app.js';

const params = new URLSearchParams(location.search);
const productId = params.get('id');

const cover = document.getElementById('product-cover');
const titleEl = document.getElementById('product-title');
const subtitleEl = document.getElementById('product-subtitle');
const priceEl = document.getElementById('product-price');
const descriptionEl = document.getElementById('product-description');
const compatEl = document.getElementById('product-compat');
const versionsEl = document.getElementById('product-versions');
const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const buyBtn = document.getElementById('buy-btn');
const downloadBtn = document.getElementById('download-btn');
const authorBlock = document.getElementById('author-block');

if (!productId) {
  showToast('Produit introuvable', 'error');
}

function formatPrice(cents) {
  if (!cents) return 'Gratuit';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

async function loadProduct() {
  try {
    const { product } = await Api.getProduct(productId);
    cover.src = product.coverUrl ?? 'assets/illustrations/dashboard.svg';
    titleEl.textContent = product.title;
    subtitleEl.textContent = product.subtitle ?? '';
    priceEl.textContent = formatPrice(product.priceCents);
    descriptionEl.innerHTML = product.descriptionMD.replace(/\n/g, '<br />');
    compatEl.innerHTML = product.compatibility.map((item) => `<li>${item}</li>`).join('');
    versionsEl.innerHTML = product.versions
      .map((version) => `<li><strong>${version.number}</strong> — ${version.changelogMD}</li>`)
      .join('');
    reviewsList.innerHTML = product.reviews
      .map(
        (review) => `
        <article class="card card--border">
          <strong>${review.user.displayName}</strong>
          <span>Note : ${review.rating}/5</span>
          <p>${review.comment}</p>
        </article>`
      )
      .join('');
    if (authorBlock) {
      authorBlock.innerHTML = `
        <div class="card">
          <h3>Auteur</h3>
          <p>${product.author.displayName}</p>
          <a class="link" href="marketplace.html?q=${encodeURIComponent(product.author.displayName)}">Voir ses autres modules</a>
        </div>`;
    }
    if (product.priceCents === 0) {
      buyBtn.hidden = true;
      downloadBtn.hidden = false;
      downloadBtn.addEventListener('click', () => {
        showToast('Téléchargement disponible après connexion.');
      });
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

if (buyBtn) {
  buyBtn.addEventListener('click', async () => {
    try {
      await requireAuth();
      await Api.createOrder([{ productId, qty: 1 }]);
      showToast('Commande confirmée ! Retrouvez votre archive dans votre compte.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (reviewForm) {
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(reviewForm);
    try {
      await requireAuth();
      const payload = {
        rating: Number(formData.get('rating')),
        comment: formData.get('comment'),
      };
      const { review } = await Api.createReview(productId, payload);
      reviewsList.insertAdjacentHTML(
        'afterbegin',
        `<article class="card card--border"><strong>Vous</strong><span>Note : ${review.rating}/5</span><p>${review.comment}</p></article>`
      );
      showToast('Merci pour votre avis !');
      reviewForm.reset();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

loadProduct();
