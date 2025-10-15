const header = document.getElementById('site-header');
const footer = document.getElementById('site-footer');

const navigation = `
  <div class="nav">
    <a class="nav__brand" href="index.html" aria-label="Accueil Letsdoo">
      <img src="assets/logo.svg" alt="Letsdoo" height="36" />
    </a>
    <div class="nav__links" id="nav-links">
      <a href="marketplace.html">Marketplace</a>
      <a href="createur.html" data-link="creator">Espace créateur</a>
      <a href="compte.html">Mon compte</a>
      <button class="btn btn-secondary" id="login-btn">Connexion</button>
      <button class="btn btn-text" id="logout-btn" hidden>Déconnexion</button>
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
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.getElementById('nav-links');

export async function syncSessionState() {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) throw new Error('unauthenticated');
    const { user } = await response.json();
    loginBtn?.setAttribute('hidden', '');
    logoutBtn?.removeAttribute('hidden');
    const creatorLink = navLinks?.querySelector('[data-link="creator"]');
    creatorLink?.classList.remove('is-disabled');
    if (user.role === 'ADMIN' && navLinks && !navLinks.querySelector('[data-link="admin"]')) {
      const adminLink = document.createElement('a');
      adminLink.href = '/admin';
      adminLink.dataset.link = 'admin';
      adminLink.textContent = 'Administration';
      adminLink.classList.add('nav__admin');
      navLinks.insertBefore(adminLink, logoutBtn ?? null);
    }
    if (user.role !== 'CREATOR' && creatorLink) {
      creatorLink.classList.add('is-disabled');
    }
  } catch {
    logoutBtn?.setAttribute('hidden', '');
    loginBtn?.removeAttribute('hidden');
    const adminLink = navLinks?.querySelector('[data-link="admin"]');
    adminLink?.remove();
    const creatorLink = navLinks?.querySelector('[data-link="creator"]');
    creatorLink?.classList.remove('is-disabled');
  }
}

if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    try {
      const email = prompt('Email');
      const password = prompt('Mot de passe');
      if (!email || !password) return;
      await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      showToast('Connecté avec succès');
      await syncSessionState();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      showToast('Déconnecté');
      await syncSessionState();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

await syncSessionState();
