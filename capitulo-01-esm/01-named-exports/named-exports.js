// named-exports.js — Seção 1.2: Named exports e como usá-los
// Capítulo 1 — ESM: O Novo Padrão
//
// Execute: node exemplos/named-exports.js

// ─────────────────────────────────────────────────────────────
// 1. Definindo named exports (representa: utils.js)
// ─────────────────────────────────────────────────────────────

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export const API_URL = 'https://api.example.com';

// Importando named exports:
//   import { formatCurrency, formatDate, API_URL } from './utils.js';
//   console.log(formatCurrency(1500)); // R$ 1.500,00
//   console.log(formatDate(new Date())); // 27/12/2026
//
// Vantagens:
//   • Autocomplete funciona perfeitamente
//   • Tree-shaking automático — só importa o que usa
//   • Refatoração segura — renomear atualiza imports automaticamente
//   • Múltiplos exports por arquivo

// ─────────────────────────────────────────────────────────────
// 2. Import com alias — renomeia localmente sem afetar o módulo
// ─────────────────────────────────────────────────────────────

//   import { formatCurrency as formatMoney } from './utils.js';
//   formatMoney(1500); // Renomeou localmente

// ─────────────────────────────────────────────────────────────
// 3. Import de tudo (namespace)
// ─────────────────────────────────────────────────────────────

//   import * as utils from './utils.js';
//   utils.formatCurrency(1500);
//   utils.formatDate(new Date());

// 💡 Extensões .js são obrigatórias em ESM no Node.js.

// ─────────────────────────────────────────────────────────────
// 4. Named exports para múltiplas funções relacionadas
//    (representa: validators.js — seção 1.3)
// ─────────────────────────────────────────────────────────────

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password.length >= 8;
}

export function validatePhone(phone) {
  return /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(phone);
}

// ─────────────────────────────────────────────────────────────
// 5. Named exports para constantes (substitui module.exports = {...})
// ─────────────────────────────────────────────────────────────

export const TIMEOUT     = 5000;
export const MAX_RETRIES = 3;

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
console.log('formatCurrency(1500)  :', formatCurrency(1500));
console.log('formatDate(new Date()):', formatDate(new Date()));
console.log('validateEmail("diana@db.dev"):', validateEmail('diana@db.dev'));
console.log('validateEmail("invalido")    :', validateEmail('invalido'));
console.log('API_URL:', API_URL);

// ─────────────────────────────────────────────────────────────
// Versão stub (como aparece no capítulo na seção 1.3)
// Em produção real, estas funções teriam implementação completa:
// ─────────────────────────────────────────────────────────────

// export function validateEmail(email) { /* ... */ }
// export function validatePassword(password) { /* ... */ }
// export function validatePhone(phone) { /* ... */ }
//
// A implementação completa com regex está nas funções acima.

// ─────────────────────────────────────────────────────────────
// Live bindings — seção 1.1: ESM exporta referências vivas
// ─────────────────────────────────────────────────────────────

// CommonJS exporta CÓPIAS — quem importa não vê atualizações:
// // counter-cjs.js
// let count = 0;
// function increment() { count++; }
// module.exports = { count, increment };
// // main-cjs.js
// const { count, increment } = require('./counter-cjs');
// increment();
// console.log(count); // Ainda 0! — recebeu uma cópia

// ESM exporta live bindings — quem importa VÊ as atualizações:
// // counter-esm.js
// export let count = 0;
// export function increment() { count++; }
// // main-esm.js
// import { count, increment } from './counter-esm.js';
// increment();
// console.log(count); // 1 — referência viva!
// Live bindings são o que permite tree-shaking confiável.

// ─────────────────────────────────────────────────────────────
// Três fases do ESM (seção 1.1) — por que é diferente do CJS
// ─────────────────────────────────────────────────────────────

// Fase 1 — Parsing: motor lê todos imports/exports ANTES de executar
// Fase 2 — Linking: resolve dependências, cria live bindings
// Fase 3 — Evaluation: executa módulos na ordem correta
// CJS executa as três fases juntas, de forma síncrona, a cada require()

// ─────────────────────────────────────────────────────────────
// Re-exports — compondo módulos (seção 1.2)
// ─────────────────────────────────────────────────────────────

// Re-exports permitem que um módulo exponha funcionalidades de outros:
// export { validateEmail }   from './email.js';
// export { validatePassword } from './password.js';
// export { validatePhone }    from './phone.js';
// Base de bibliotecas bem organizadas e barrel files.

// ─────────────────────────────────────────────────────────────
// Imports de side-effect (seção 1.2)
// ─────────────────────────────────────────────────────────────

// Módulos que não exportam nada — executam como efeito colateral:
// import './polyfills.js';     // polyfills
// import './setup-globals.js'; // configurações globais
// O bundler nunca elimina esses imports por tree-shaking.

// ─────────────────────────────────────────────────────────────
// import.meta.glob — lazy loading em massa (Vite, seção 1.2)
// ─────────────────────────────────────────────────────────────

// const routes = import.meta.glob('./routes/*.js');
// const modules = import.meta.glob('./features/*.ts', { eager: true });
// Elimina a necessidade de manter listas de imports manuais.

// ─────────────────────────────────────────────────────────────
// ESM no navegador sem bundler (seção 1.2)
// ─────────────────────────────────────────────────────────────

// <script type="module" src="app.js"></script>
// <script type="module">
//   import { formatCurrency } from './utils.js';
//   console.log(formatCurrency(1500));
// </script>
// Módulos no browser: strict mode ativo, escopo isolado, defer por padrão, CORS.
