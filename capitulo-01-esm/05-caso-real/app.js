// app.js — Caso real: usando path-helper em qualquer módulo ESM

import { getModulePath } from './utils/path-helper.js';

const { dirname: __dirname, filename: __filename } = getModulePath(import.meta.url);

console.log('Diretório atual:', __dirname);
console.log('Arquivo atual:',   __filename);

// Import de JSON (Node.js 20.10+)
// import pkg from '../../package.json' with { type: 'json' };
// console.log('Versão:', pkg.version);
