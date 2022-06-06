import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initRoute } from './routes/index.mjs';
import { appConfig } from './configs/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

appConfig(app, __dirname);
initRoute(app);

export default app;
