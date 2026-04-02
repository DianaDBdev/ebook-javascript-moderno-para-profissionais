// app.js — DEPOIS: ESM (import/export)
// Requer "type": "module" no package.json

import express from 'express';
import path    from 'path';
import { fileURLToPath } from 'url';
import { dirname }       from 'path';

import { formatCurrency } from './utils.js';   // .js obrigatório em ESM
import config             from './config.js';

// __dirname não existe em ESM — recriamos assim:
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'API rodando',
    price: formatCurrency(config.defaultPrice),
    dir: __dirname,
  });
});

app.listen(3000, () => console.log('Servidor em http://localhost:3000'));

export { app };  // named export — mais explícito que module.exports
