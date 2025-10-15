#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

const root = process.cwd();
const srcWeb = path.join(root, 'src', 'web');
const destWeb = path.join(root, 'dist', 'web');
await copyDir(srcWeb, destWeb);
console.log('📦 Ressources web copiées vers dist/web');
