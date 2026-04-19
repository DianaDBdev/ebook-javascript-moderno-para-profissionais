// event-loop.js — Seção 2.2: Entendendo o event loop em profundidade
// Capítulo 2 — Async/Await: Programação Assíncrona Sem Dor de Cabeça
//
// Execute: node exemplos/event-loop.js

// ─────────────────────────────────────────────────────────────
// 1. Ordem de execução: síncrono → microtasks → macrotasks
// ─────────────────────────────────────────────────────────────

console.log('=== Teste de ordem de execução ===');
console.log('1'); // Síncrono — executa imediatamente
setTimeout(() => {
  console.log('2'); // Macrotask — vai para a task queue
}, 0);
Promise.resolve().then(() => {
  console.log('3'); // Microtask — vai para a microtask queue
});
console.log('4'); // Síncrono — executa imediatamente

// Output esperado: 1, 4, 3, 2
// Por quê?
//   • 1 e 4: síncronos — executam imediatamente no call stack
//   • Call stack vazio → event loop verifica microtask queue PRIMEIRO
//   • 3 executa (promises têm prioridade sobre macrotasks)
//   • Microtask queue vazia → event loop verifica task queue
//   • 2 executa por último

// ─────────────────────────────────────────────────────────────
// 2. Async/await no event loop
// ─────────────────────────────────────────────────────────────

// async function fetchData() {
//   console.log('1 - Antes do await');
//   const data = await fetch('https://api.example.com/data');
//   // A função 'pausa' aqui e sai do call stack
//   console.log('2 - Depois do await');
//   return data;
// }
// console.log('3 - Antes de chamar');
// fetchData();
// console.log('4 - Depois de chamar');
//
// Output: 3 → 1 → 4 → 2
// await não bloqueia o event loop — pausa apenas a função async.

// ─────────────────────────────────────────────────────────────
// 3. sleep: bloqueante vs não-bloqueante
// ─────────────────────────────────────────────────────────────

// ❌ MAU — bloqueia o event loop (loop infinito)
// function sleep(ms) {
//   const start = Date.now();
//   while (Date.now() - start < ms) { } // Congela tudo
// }
// sleep(3000); // Congela tudo por 3 segundos

// ✅ BOM — não bloqueia
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// await sleep(3000); // Pausa a função, não o JavaScript

// ─────────────────────────────────────────────────────────────
// 4. Async/await no event loop — demonstração com timing
// ─────────────────────────────────────────────────────────────

async function demonstraEventLoop() {
  console.log('\n=== Demonstração event loop + async ===');
  console.log('[A] Síncrono antes do await');

  await sleep(0); // Cede o controle ao event loop por 1 ciclo

  console.log('[B] Após await sleep(0) — voltou ao call stack');

  // Microtask vs macrotask
  Promise.resolve().then(() => console.log('[C] Microtask (Promise.resolve)'));
  setTimeout(() => console.log('[D] Macrotask (setTimeout 0)'), 0);

  await Promise.resolve(); // Espera próxima microtask
  console.log('[E] Após await Promise.resolve()');
}

await demonstraEventLoop();

// ─────────────────────────────────────────────────────────────
// 5. Top-level await — seção 2.5
// ─────────────────────────────────────────────────────────────

// ✅ Top-level await (em módulos ESM):
//   const response = await fetch('https://api.example.com/config');
//   const config   = await response.json();
//   export default config;

// ⚠️ Cuidado: módulos com top-level await bloqueiam quem os importa:
//   // slow-module.js
//   await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
//   export const value = 42;
//   // main.js
//   import { value } from './slow-module.js';
//   // ↑ Todo o app espera 5 s aqui antes de continuar

// Use top-level await quando:
//   • É inicialização essencial e rápida (< 100 ms)
//   • Você controla todos os importadores
//   • Falhar no await deve falhar o app inteiro

console.log('\n✅ event-loop.js executado com sucesso');
