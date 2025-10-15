const header = document.getElementById('site-header');
const footer = document.getElementById('site-footer');

const navigation = `
  <div class="nav">
    <a class="nav__brand" href="index.html" aria-label="Accueil Letsdoo">
      <img src="assets/logo.svg" alt="Letsdoo" height="36" />
    </a>
    <div class="nav__links">
      <a href="marketplace.html">Marketplace</a>
      <a href="createur.html">Espace créateur</a>
      <a href="compte.html">Mon compte</a>
      <a href="admin.html">Admin</a>
      <button class="btn btn-secondary" id="login-btn">Connexion</button>
    </div>
  </div>
`;

const footerContent = `
  <div class="footer-content">
    <p>© ${new Date().getFullYear()} Letsdoo · Marketplace francophone des automatisations.</p>
    <div class="nav__links">
      <a href="legal.html">Mentions légales</a>
      <a href="mailto:contact@letsdoo.io">Contact</a>
    </div>
  </div>
`;

if (header) header.innerHTML = navigation;
if (footer) footer.innerHTML = footerContent;

const toast = document.getElementById('toast');
export function showToast(message, type = 'info') {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

const csrfMeta = document.querySelector('meta[name="csrf-token"]');

async function refreshCsrf() {
  try {
    const response = await fetch('/api/auth/csrf', { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      if (csrfMeta) csrfMeta.setAttribute('content', data.token);
    }
  } catch (error) {
    console.error('Impossible de récupérer le token CSRF', error);
  }
}

await refreshCsrf();

export function getCsrfToken() {
  return csrfMeta?.getAttribute('content') ?? undefined;
}

export async function apiFetch(url, options = {}) {
  const token = getCsrfToken();
  const headers = new Headers(options.headers ?? {});
  if (token) headers.set('X-CSRF-Token', token);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
  if (response.status === 401) {
    showToast('Veuillez vous connecter pour continuer', 'warning');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message ?? 'Erreur inattendue');
  }
  return response.json();
}

export async function requireAuth() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) {
    showToast('Vous devez être connecté', 'warning');
    throw new Error('Unauthenticated');
  }
  return res.json();
}

const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    try {
      const email = prompt('Email');
      const password = prompt('Mot de passe');
      if (!email || !password) return;
      await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      showToast('Connecté avec succès');
      location.reload();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}
