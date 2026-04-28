import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8001),
  dataDir: process.env.DATA_DIR ?? path.resolve(__dirname, '../../data')
};
