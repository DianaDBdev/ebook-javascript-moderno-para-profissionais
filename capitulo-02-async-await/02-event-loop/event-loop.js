// event-loop.js — Entendendo a ordem de execução
// Execute: node 02-event-loop/event-loop.js

console.log('1 - Síncrono');                                    // executa imediatamente

setTimeout(() => console.log('2 - setTimeout (macrotask)'), 0); // fila de macrotasks

Promise.resolve().then(() => console.log('3 - Promise (microtask)')); // fila de microtasks

console.log('4 - Síncrono');                                    // executa imediatamente

// Output esperado: 1 → 4 → 3 → 2
// Por quê? Microtasks (Promises) têm prioridade sobre macrotasks (setTimeout).

// ──────────────────────────────────────────────
// Async/await no event loop
// ──────────────────────────────────────────────
async function fetchData() {
  console.log('\n[fetchData] 1 - Antes do await');
  await Promise.resolve(); // "pausa" e sai do call stack
  console.log('[fetchData] 2 - Depois do await');
}

console.log('\n[main] Antes de chamar fetchData');
fetchData();                   // inicia mas não bloqueia
console.log('[main] Depois de chamar fetchData');

// Output:
// [main] Antes de chamar fetchData
// [fetchData] 1 - Antes do await
// [main] Depois de chamar fetchData
// [fetchData] 2 - Depois do await
