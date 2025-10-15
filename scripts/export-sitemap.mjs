#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const pages = [
  '',
  'marketplace',
  'produit',
  'compte',
  'createur',
  'admin',
  'legal'
];

const baseUrl = process.env.BASE_URL ?? 'https://letsdoo.io';

const urls = pages
  .map((page) => `  <url>\n    <loc>${baseUrl}/${page ? `${page}.html` : ''}</loc>\n  </url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const outputPath = path.join(process.cwd(), 'src', 'web', 'sitemap.xml');
await fs.writeFile(outputPath, sitemap, 'utf-8');
console.log('🗺️  Sitemap généré dans', outputPath);
