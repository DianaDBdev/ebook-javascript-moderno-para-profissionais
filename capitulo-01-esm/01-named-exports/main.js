// main.js — Importando named exports
// Só o que você importar será incluído no bundle final (tree-shaking).

import { formatCurrency, formatDate, API_URL } from './utils.js';

// ✅ Extensão .js é obrigatória em ESM no Node.js

console.log(formatCurrency(1500));       // R$ 1.500,00
console.log(formatDate(new Date()));     // ex: 23/03/2026
console.log(`API: ${API_URL}`);

// Import com alias — renomeia localmente sem afetar o módulo original
import { formatCurrency as formatMoney } from './utils.js';
console.log(formatMoney(2750.50));       // R$ 2.750,50
