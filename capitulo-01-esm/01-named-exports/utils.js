// utils.js — Named exports
// Cada função é exportada individualmente.
// Isso permite tree-shaking: o bundler inclui apenas o que for importado.

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
export const TIMEOUT = 5000;
