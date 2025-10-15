import { promises as fs } from 'fs';
import path from 'path';
import { env } from '../../config/env.js';
import { v4 as uuid } from 'uuid';

const storageRoot = path.join(process.cwd(), 'storage');

export async function saveLocalFile(file: Express.Multer.File) {
  await fs.mkdir(storageRoot, { recursive: true });
  const extension = path.extname(file.originalname);
  const fileName = `${uuid()}${extension}`;
  const targetPath = path.join(storageRoot, fileName);
  await fs.writeFile(targetPath, file.buffer);
  return `/storage/${fileName}`;
}

export async function saveFile(file: Express.Multer.File) {
  if (env.storageDriver === 'local') {
    return saveLocalFile(file);
  }
  // Placeholder S3 compatible
  return saveLocalFile(file);
}
