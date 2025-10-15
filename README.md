# Letsdoo — Marketplace Modules & Automatisations

Letsdoo est une marketplace francophone pour publier et distribuer des modules Odoo, templates et scripts Python. Ce dépôt contient :

- Une API Node.js/Express (TypeScript) modulaire avec authentification par session, RBAC, validations Zod et Prisma ORM.
- Un frontend multi-pages (HTML/CSS/JS vanilla) optimisé SEO, prêt à être encapsulé dans une WebView (Tauri, Capacitor, etc.).
- Des scripts de seed Prisma avec données de démonstration et une structure de stockage local pour les fichiers uploadés.

## 🚀 Démarrage rapide

```bash
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

L’application est accessible sur `http://localhost:3000`. Les pages statiques sont servies depuis `src/web`.

### Variables d’environnement

| Variable | Description |
| --- | --- |
| `PORT` | Port HTTP du serveur (défaut `3000`). |
| `SESSION_SECRET` | Secret pour signer les sessions (obligatoire en production). |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL (ou SQLite en développement). |
| `STORAGE_DRIVER` | `local` ou adaptateur S3 (placeholder). |
| `STRIPE_SECRET_KEY` | Clé API Stripe (simulée si vide). |
| `BASE_URL` | URL publique utilisée pour la génération du sitemap. |

## 🧱 Architecture

```
├─ prisma/          # ORM Prisma + migrations + seed
├─ src/
│  ├─ config/       # configuration (env, logger, sécurité)
│  ├─ core/         # middlewares partagés, erreurs, utilitaires, mailer
│  ├─ modules/      # modules fonctionnels (auth, produits, admin…)
│  └─ web/          # frontend multi-pages (HTML/CSS/JS)
├─ scripts/         # scripts dev/build/sitemap
└─ storage/         # uploads locaux (gitignored)
```

Chaque module regroupe son router, controller, service et validations pour respecter une approche « feature first ».

## 👥 Comptes de démonstration

Après `npm run db:seed` :

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Admin | `admin@letsdoo.io` | `Admin123!` |
| Créateur | `alice@letsdoo.io` | `Creator123!` |
| Client | `client@letsdoo.io` | `Client123!` |

## 🔐 Sécurité

- Sessions HTTP-only (`express-session` + store Postgres) avec rotation et SameSite Lax.
- Protection CSRF via `csurf` (token transmis dans `meta[name="csrf-token"]`).
- Helmet, CORS restreint, compression et rate limiting (auth & uploads).
- Mots de passe `bcrypt` (cost 12) et validations strictes via Zod.
- Middleware d’audit avec logs Pino (req/user/ip).

## 📦 Données & Prisma

- `prisma/schema.prisma` définit le modèle (utilisateurs, produits, versions, commandes, avis…).
- `prisma/migrations/**` contient la migration initiale SQL.
- `prisma/seed.ts` injecte un admin, des créateurs, produits, avis et commandes de démo.

Commandes utiles :

```bash
npm run db:push     # appliquer le schéma
npm run db:migrate  # exécuter les migrations en production
npm run db:seed     # insérer les données de démo
```

## 🧪 Tests

Le projet inclut des validations côté serveur (Zod) et une architecture prête à accueillir des tests (`jest` ou `vitest` selon préférence). Ajoutez vos suites dans `src/modules/**`.

## 🗺️ SEO & Assets

- Métadonnées descriptives par page, `robots.txt` et `sitemap.xml` générable via `npm run build` ou `node scripts/export-sitemap.mjs`.
- CSS unique (`styles/main.css`) avec support dark mode, composants responsives et lazy loading d’images.
- Données de démo (témoignages, produits) dans `src/web/data/seed`.

## 🚢 Déploiement

1. Configurer PostgreSQL managé (Render/Fly/Heroku).
2. Fournir `DATABASE_URL` et `SESSION_SECRET` sécurisés.
3. `npm run build` pour générer `dist/` et copier le frontend.
4. `npm start` pour lancer le serveur (`dist/server.js`).

Les fichiers uploadés doivent être servis via un volume persistant ou un bucket S3 compatible.

## 🤝 Contribution

- Respecter la structure modulaire.
- Écrire les commentaires et messages utilisateurs en français.
- Prévoir des validations côté serveur pour chaque nouvelle route.

Bon build !
