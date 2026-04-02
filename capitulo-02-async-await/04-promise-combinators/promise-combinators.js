// promise-combinators.js — Promise.all, race, allSettled, any
// Execute: node 04-promise-combinators/promise-combinators.js

// Simulação de requisições com latências diferentes
const delay = (ms, value) => new Promise(res => setTimeout(() => res(value), ms));
const falha  = (ms, msg)  => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

// ──────────────────────────────────────────────
// Promise.all — executa em paralelo, aguarda TODOS
// ──────────────────────────────────────────────
console.log('--- Promise.all ---');
const [usuario, pedidos, enderecos] = await Promise.all([
  delay(100, { id: 1, nome: 'Diana' }),
  delay(150, [{ id: 'P1' }, { id: 'P2' }]),
  delay(80,  [{ rua: 'Av. Brasil' }]),
]);
console.log('Todos carregados em paralelo:', { usuario, pedidos: pedidos.length, enderecos: enderecos.length });
// ⚠️ Se QUALQUER promise falhar, Promise.all rejeita imediatamente

// ──────────────────────────────────────────────
// Promise.allSettled — aguarda TODOS, mesmo com falhas
// ──────────────────────────────────────────────
console.log('\n--- Promise.allSettled ---');
const resultados = await Promise.allSettled([
  delay(100, 'OK'),
  falha(50, 'Serviço indisponível'),
  delay(200, 'Também OK'),
]);
resultados.forEach((r, i) => {
  if (r.status === 'fulfilled') console.log(`  [${i}] ✅ ${r.value}`);
  else                          console.log(`  [${i}] ❌ ${r.reason.message}`);
});

// ──────────────────────────────────────────────
// Promise.race — retorna o MAIS RÁPIDO
// ──────────────────────────────────────────────
console.log('\n--- Promise.race (timeout pattern) ---');
async function fetchComTimeout(promessa, ms) {
  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error(`Timeout após ${ms}ms`)), ms)
  );
  return Promise.race([promessa, timeout]);
}

try {
  const res = await fetchComTimeout(delay(500, 'dados lentos'), 200);
  console.log('Resultado:', res);
} catch (err) {
  console.log('Abortado:', err.message); // Timeout após 200ms
}
