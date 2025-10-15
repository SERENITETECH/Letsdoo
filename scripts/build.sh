#!/bin/bash
# Build production Letsdoo
set -euo pipefail
export NODE_ENV=production
npx prisma generate
npm run build
