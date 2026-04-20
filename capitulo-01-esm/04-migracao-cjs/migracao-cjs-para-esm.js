// migracao-cjs-para-esm.js — Seção 1.5: Migração prática de require() para import
// Capítulo 1 — ESM: O Novo Padrão
//
// Este arquivo mostra os padrões de conversão lado a lado.
// Não é executável diretamente — serve como referência durante a migração.

// ─────────────────────────────────────────────────────────────
// PASSO 1: Habilitar ESM no Node.js
// ─────────────────────────────────────────────────────────────

// Opção A (recomendada) — adicione no package.json:
//   { "type": "module" }
//
// Opção B — use a extensão .mjs nos arquivos.

// ─────────────────────────────────────────────────────────────
// PASSO 2: Padrões de conversão
// ─────────────────────────────────────────────────────────────

// --- ANTES (CommonJS) ---
//   const express        = require('express');
//   const { validateUser } = require('./validators');
//   const config         = require('./config');
//   module.exports = { app, startServer };

// --- DEPOIS (ESM) ---
//   import express          from 'express';
//   import { validateUser } from './validators.js';   // .js obrigatório em ESM
//   import config           from './config.js';
//   export { app, startServer };

// --- ANTES: module.exports de objeto ---
//   module.exports = {
//     API_URL:     'https://api.example.com',
//     TIMEOUT:     5000,
//     MAX_RETRIES: 3
//   };

// --- DEPOIS: named exports (recomendado) ---
export const API_URL     = 'https://api.example.com';
export const TIMEOUT     = 5000;
export const MAX_RETRIES = 3;

// ─────────────────────────────────────────────────────────────
// PASSO 3: Casos especiais
// ─────────────────────────────────────────────────────────────

// __ __dirname e __filename não existem em ESM __

// --- ANTES ---
//   console.log(__dirname);  // /Users/you/project
//   console.log(__filename); // /Users/you/project/app.js

// --- DEPOIS ---
import { fileURLToPath } from 'url';
import { dirname }       from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

console.log('__dirname :', __dirname);
console.log('__filename:', __filename);

// ─────────────────────────────────────────────────────────────
// require() condicional → dynamic import com top-level await
// ─────────────────────────────────────────────────────────────

// --- ANTES ---
//   let config;
//   if (process.env.NODE_ENV === 'production') {
//     config = require('./config.prod');
//   } else {
//     config = require('./config.dev');
//   }

// --- DEPOIS (top-level await — ver seção 2.5) ---
//   const env    = process.env.NODE_ENV || 'development';
//   const config = (await import(`./config.${env}.js`)).default;

// ─────────────────────────────────────────────────────────────
// Interoperabilidade CJS ↔ ESM no Node.js
// ─────────────────────────────────────────────────────────────

// ESM importando CommonJS — funciona normalmente:
//   import express from 'express'; // express é CJS → Node.js adapta automaticamente

// CommonJS importando ESM — requer dynamic import:
//   // ❌ Não funciona diretamente
//   const { myFunction } = require('./esm-module.js');
//
//   // ✅ Solução: dynamic import
//   (async () => {
//     const { myFunction } = await import('./esm-module.js');
//   })();

// ─────────────────────────────────────────────────────────────
// PASSO 4: Estratégia de migração incremental (ordem sugerida)
// ─────────────────────────────────────────────────────────────

//   git checkout -b migrate-to-esm
//
//   utils/       ← Comece aqui (sem dependências internas)
//   services/    ← Depois aqui
//   routes/      ← Por último
//   app.js       ← Final
//
//   Teste a cada módulo migrado. Commits pequenos e frequentes.

// ─────────────────────────────────────────────────────────────
// Exercício 1 (seção de exercícios do capítulo):
// Converta o código abaixo de CommonJS para ESM.
// Solução: ver exercicios/ex1-solucao.js
// ─────────────────────────────────────────────────────────────

// const fs   = require('fs');
// const path = require('path');
// function readConfig() {
//   const configPath = path.join(__dirname, 'config.json');
//   return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
// }
// module.exports = { readConfig };

// ─────────────────────────────────────────────────────────────
// 1.1 Problemas do CommonJS — exemplos do capítulo
// ─────────────────────────────────────────────────────────────

// Problema 1: carregamento síncrono
// const express = require('express');
// const bigLibrary = require('./huge-library'); // Bloqueia até carregar TUDO
// app.listen(3000);

// Problema 3: análise estática impossível
// const moduleName = getUserInput(); // função hipotética — ex: process.argv[2]
// const module = require(moduleName); // Ferramentas não conseguem analisar isso

// Problema 4: exports dinâmicos
// module.exports = someCondition ? ClassA : ClassB;
// if (process.env.NODE_ENV === 'production') {
//   module.exports = require('./prod-version');
// } else {
//   module.exports = require('./dev-version');
// }

// ─────────────────────────────────────────────────────────────
// 1.4 Dynamic imports — problema: CJS carrega tudo na init
// ─────────────────────────────────────────────────────────────

// const adminPanel = require('./admin-panel'); // 500 KB
// const dashboard  = require('./dashboard');   // 300 KB
// const reports    = require('./reports');     // 400 KB
// Usuário comum NUNCA acessa admin, mas carrega 500 KB à toa

// ─────────────────────────────────────────────────────────────
// 1.5 Passo 2 — conversão completa
// ─────────────────────────────────────────────────────────────

// ANTES:
// const express = require('express');
// const { validateUser } = require('./validators');
// const config = require('./config');
// module.exports = { app, startServer };

// DEPOIS:
// import express from 'express';
// import { validateUser } from './validators.js';
// import config from './config.js';          // .js obrigatório
// export { app, startServer };

// ─────────────────────────────────────────────────────────────
// 1.5 require() condicional → top-level await
// ─────────────────────────────────────────────────────────────

// ANTES:
// let config;
// if (process.env.NODE_ENV === 'production') {
//   config = require('./config.prod');
// } else {
//   config = require('./config.dev');
// }

// DEPOIS (top-level await — ver seção 2.5):
// const env    = process.env.NODE_ENV || 'development';
// const config = (await import(`./config.${env}.js`)).default;

// ─────────────────────────────────────────────────────────────
// 1.6 Vite e Babel para ambientes mais antigos
// ─────────────────────────────────────────────────────────────

// vite.config.js — alvo ES2015:
// export default {
//   build: {
//     target: 'es2015' // Transpila para ES2015
//   }
// };

// Babel — .babelrc:
// { "presets": [["@babel/preset-env", { "targets": "> 0.25%, not dead" }]] }

// ─────────────────────────────────────────────────────────────
// Passo 4: Dependências circulares (seção 1.5)
// ─────────────────────────────────────────────────────────────

// CommonJS esconde dependências circulares — resulta em undefined silencioso.
// ESM com live bindings resolve a maioria automaticamente SE usar funções:
//
// ✅ Funciona com funções (live bindings):
// // a.js: import { b } from './b.js'; export function a() { return b() + 1; }
// // b.js: import { a } from './a.js'; export function b() { return 1; }
//
// ❌ Falha com valores inicializados no topo:
// // a.js: import { B } from './b.js'; export const A = B + 1; // B é undefined aqui!
//
// Dependências circulares indicam problema de arquitetura.
// Use ESLint com import/no-cycle para detectá-las.
// Solução: extrair código compartilhado para um terceiro módulo.

// ─────────────────────────────────────────────────────────────
// Passo 5: Ferramentas de codemod (seção 1.5)
// ─────────────────────────────────────────────────────────────

// cjs-to-esm — converte automaticamente a maioria dos casos:
// npx cjs-to-esm src/
//
// jscodeshift — para transformações personalizadas:
// npx jscodeshift -t ./transform.js src/
//
// ⚠️ Nenhuma ferramenta acerta 100% dos casos.
// Sempre revise o diff, rode os testes. Trate como primeiro passo.

// ─────────────────────────────────────────────────────────────
// Migração incremental — ordem sugerida (seção 1.5)
// ─────────────────────────────────────────────────────────────

// Comece pelos módulos sem dependências (utils/, helpers/)
// Teste a cada módulo migrado. Commits pequenos e frequentes.
// Ordem sugerida:
//   utils/       ← Comece aqui (sem dependências internas)
//   models/
//   services/
//   routes/
//   app.js       ← Final

// ─────────────────────────────────────────────────────────────
// Seção 1.6: moduleResolution no tsconfig (seção 1.6)
// ─────────────────────────────────────────────────────────────

// "bundler"   — recomendado para Vite/esbuild. Permite omitir extensões, resolve index.ts.
// "node16"    — Node.js puro sem bundler. Extensões .js obrigatórias.
// "nodenext"  — similar a node16, para versões recentes do Node.js.
// "node"      — legado CommonJS. Evite em projetos novos.
//
// Exemplo tsconfig.json:
// { "compilerOptions": { "module": "ESNext", "moduleResolution": "bundler" } }

// ─────────────────────────────────────────────────────────────
// Import maps — ESM sem bundler no browser (seção 1.6)
// ─────────────────────────────────────────────────────────────

// <script type="importmap">
// {
//   "imports": {
//     "lodash": "https://cdn.jsdelivr.net/npm/lodash-es@4/lodash.js",
//     "react":  "https://esm.sh/react@18"
//   }
// }
// </script>
// <script type="module">
//   import { debounce } from 'lodash'; // funciona sem bundler!
// </script>
// Suportado em todos os browsers modernos desde 2023.

// ─────────────────────────────────────────────────────────────
// Caso Real — API Express (seção 1.6)
// ─────────────────────────────────────────────────────────────

// API Express com 40+ arquivos, 3 anos de idade, 10.000+ requisições/dia.
// Motivos da migração: nanoid/got/chalk só ESM, tree-shaking, onboarding.
//
// Semana 1 — Preparação:
//   Node.js 14 → 20, dependências atualizadas, suite de testes criada
//
// Semana 2 — Migração incremental:
//   Segunda: utils/ e config/
//   Terça: models/
//   Quarta: services/
//   Quinta: routes/ e app.js
//   Sexta: testes finais e deploy em staging
//
// Problema encontrado: dependência circular services/user.js ↔ services/auth.js
// Solução: extrair código compartilhado para services/base.js
//
// Resultado: bundle 35% menor, autocomplete melhorado, onboarding mais rápido
