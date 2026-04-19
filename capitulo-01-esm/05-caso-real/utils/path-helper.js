// path-helper.js — Seção 1.5 / Caso Real: __dirname e JSON import em ESM
// Capítulo 1 — ESM: O Novo Padrão
//
// Execute: node exemplos/path-helper.js

import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';

// ─────────────────────────────────────────────────────────────
// Utilitário reutilizável para __dirname em ESM
// (surgiu do Caso Real: migração da API Express — seção 1.6)
// ─────────────────────────────────────────────────────────────

/**
 * Recria __dirname e __filename para módulos ESM.
 * Em CommonJS essas variáveis existem nativamente; em ESM não.
 *
 * @param {string} importMetaUrl — passe `import.meta.url`
 * @returns {{ filename: string, dirname: string }}
 *
 * @example
 *   import { getModulePath } from './utils/path-helper.js';
 *   const { dirname: __dirname } = getModulePath(import.meta.url);
 */
export function getModulePath(importMetaUrl) {
  const filename = fileURLToPath(importMetaUrl);
  return {
    filename,
    dirname: dirname(filename),
  };
}

// ─────────────────────────────────────────────────────────────
// Uso direto no módulo atual
// ─────────────────────────────────────────────────────────────
const { dirname: __dirname, filename: __filename } = getModulePath(import.meta.url);

console.log('__dirname :', __dirname);
console.log('__filename:', __filename);

// Construindo caminhos relativos ao arquivo (equivalente a path.join(__dirname, ...)):
const configPath = join(__dirname, '..', 'package.json');
console.log('configPath:', configPath);

// ─────────────────────────────────────────────────────────────
// Import de JSON — Node.js 20.10+ (Problema 2 do Caso Real)
// ─────────────────────────────────────────────────────────────

// Sintaxe moderna com import assertions:
//   import pkg from '../package.json' with { type: 'json' };
//   console.log('Versão:', pkg.version);
//
// Alternativa compatível com versões anteriores ao 20.10:
//   import { readFileSync } from 'fs';
//   const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// ─────────────────────────────────────────────────────────────
// Resumo: por que isso importa no Caso Real (seção 1.6)
// ─────────────────────────────────────────────────────────────
//
// Durante a migração da API Express com 40+ arquivos, __dirname
// quebrou em todos os módulos que faziam path.join(__dirname, ...).
// Criar este utilitário centralizado resolveu todos de uma vez,
// sem duplicar a lógica de fileURLToPath + dirname em cada arquivo.

// ─────────────────────────────────────────────────────────────
// Trecho exato do Caso Real (seção 1.6 do livro)
// ─────────────────────────────────────────────────────────────

// utils/path-helper.js — utilitário criado na migração da API Express:
//
//   import { fileURLToPath } from 'url';
//   import { dirname } from 'path';
//   export function getModulePath(importMetaUrl) {
//     const filename = fileURLToPath(importMetaUrl);
//     return { filename, dirname: dirname(filename) };
//   }
//
//   // Uso em qualquer módulo:
//   const { dirname } = getModulePath(import.meta.url);
//
// Este arquivo É o utilitário acima — pode ser copiado diretamente para utils/.
