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
