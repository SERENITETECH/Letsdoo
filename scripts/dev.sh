#!/bin/bash
# Lance le serveur Express en mode développement avec rechargement
set -euo pipefail
export NODE_ENV=development
npx prisma generate
npm run dev
