// spread-rest.js — Seção 3.2: Spread operator e rest parameters na prática
// Capítulo 3 — Novas Features do ES2015–ES2025
//
// Execute: node exemplos/spread-rest.js

// ─────────────────────────────────────────────────────────────
// 1. Spread em arrays
// ─────────────────────────────────────────────────────────────

const numbers     = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5]; // [1, 2, 3, 4, 5]
console.log(moreNumbers);

// Copiar array (shallow copy)
const copy = [...numbers];
copy.push(99);
console.log(numbers); // [1, 2, 3] — original intacto

// Combinar arrays
const arr1    = [1, 2];
const arr2    = [3, 4];
const combined = [...arr1, ...arr2];
console.log(combined); // [1, 2, 3, 4]

// Spread em chamadas de função
Math.max(...numbers); // equivalente a Math.max(1, 2, 3)
console.log('Math.max(...numbers):', Math.max(...numbers)); // 3

// ─────────────────────────────────────────────────────────────
// 2. Spread em objetos
// ─────────────────────────────────────────────────────────────

const user        = { name: 'João', age: 25 };
const updatedUser = { ...user, age: 26 };  // { name: 'João', age: 26 }
console.log(updatedUser);

// Merge com override — a ordem importa!
const defaults    = { timeout: 5000, retries: 3 };
const config      = { retries: 5 };
const finalConfig = { ...defaults, ...config };
// { timeout: 5000, retries: 5 } — config sobrescreve defaults
console.log(finalConfig);

// 💡 A ordem importa: a propriedade do último objeto vence.
//    Coloque defaults primeiro, overrides depois.

// ─────────────────────────────────────────────────────────────
// 3. Rest parameters
// ─────────────────────────────────────────────────────────────

function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Combinando com parâmetros normais
function logMessage(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}
logMessage('ERROR', 'Database', 'connection', 'failed');
// [ERROR] Database connection failed

// ─────────────────────────────────────────────────────────────
// 4. Casos de uso reais
// ─────────────────────────────────────────────────────────────

// Adicionar item imutavelmente (React style):
const todos    = ['Estudar', 'Praticar'];
const newTodos = [...todos, 'Nova tarefa'];
console.log(newTodos); // Original intacto

// Remover item imutavelmente:
const semIndice1 = [...todos.slice(0, 1), ...todos.slice(2)];
// Remove o índice 1 ('Praticar')
console.log(semIndice1); // ['Estudar']

// Atualizar objeto aninhado imutavelmente:
const userFull = { name: 'Ana', address: { city: 'SP', street: 'Av. Paulista' } };
const userRJ   = {
  ...userFull,
  address: { ...userFull.address, city: 'Rio de Janeiro' }
};
console.log(userFull.address.city); // 'SP' — intacto
console.log(userRJ.address.city);   // 'Rio de Janeiro'

// Merge de configurações:
function createServer(userConfig = {}) {
  const defaultConfig = { port: 3000, host: 'localhost', cors: true };
  return { ...defaultConfig, ...userConfig };
}
console.log(createServer({ port: 8080 }));
// { port: 8080, host: 'localhost', cors: true }

// ─────────────────────────────────────────────────────────────
// 5. Cuidado com shallow copy
// ─────────────────────────────────────────────────────────────

// ⚠️ Spread faz cópia superficial. Objetos/arrays aninhados compartilham referência.
const original = { name: 'João', hobbies: ['ler', 'correr'] };
const shallowCopy = { ...original };
shallowCopy.hobbies.push('nadar');
console.log(original.hobbies);   // ['ler', 'correr', 'nadar'] ← original foi modificado!

// Para clone profundo, use structuredClone (ES2022):
const deepCopy = structuredClone(original);
// atenção: não copia funções nem Symbols — use apenas para dados puros
deepCopy.hobbies.push('ciclismo');
console.log(original.hobbies);   // ['ler', 'correr', 'nadar'] — agora intacto
console.log(deepCopy.hobbies);   // ['ler', 'correr', 'nadar', 'ciclismo']
