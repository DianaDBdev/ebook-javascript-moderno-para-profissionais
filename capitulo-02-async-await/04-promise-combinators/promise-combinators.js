// promise-combinators.js — Seção 2.4: Promise.all, race, allSettled, any
// Capítulo 2 — Async/Await: Programação Assíncrona Sem Dor de Cabeça
//
// Execute: node exemplos/promise-combinators.js

// ─────────────────────────────────────────────────────────────
// Stubs para simulação
// ─────────────────────────────────────────────────────────────
const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));
const fetchUser     = () => delay(50,  { id: 1, name: 'Diana' });
const fetchPosts    = () => delay(80,  [{ id: 1, title: 'Post' }]);
const fetchComments = () => delay(60,  [{ id: 1, text: 'Comentário' }]);
const fetchUser_id  = (id) => delay(30, { id, name: `User ${id}` });

// ─────────────────────────────────────────────────────────────
// PROBLEMA: operações sequenciais desnecessárias
// ─────────────────────────────────────────────────────────────

async function loadDashboardSequencial() {
  const user     = await fetchUser();     // 50 ms
  const posts    = await fetchPosts();    // 80 ms
  const comments = await fetchComments(); // 60 ms
  return { user, posts, comments };
  // Total: 190 ms — cada uma espera a anterior
  // ⚠️ Essas três operações são independentes! Não precisam esperar uma pela outra.
}

// ─────────────────────────────────────────────────────────────
// Promise.all — execução paralela
// ─────────────────────────────────────────────────────────────

async function loadDashboard() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),     // Dispara imediatamente
    fetchPosts(),    // Dispara imediatamente
    fetchComments()  // Dispara imediatamente
  ]);
  return { user, posts, comments };
  // Total: 80 ms — tempo do mais lento. Redução de 58%!
}

// 💡 Use Promise.all quando as operações são independentes e podem executar em paralelo.
// ⚠️ Se qualquer promise rejeitar, Promise.all rejeita imediatamente.

// ─────────────────────────────────────────────────────────────
// Promise.allSettled — resiliência (nunca rejeita)
// ─────────────────────────────────────────────────────────────

async function loadDashboardResilient() {
  const results = await Promise.allSettled([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  // results = [
  //   { status: 'fulfilled', value: userData },
  //   { status: 'rejected',  reason: Error   },
  //   { status: 'fulfilled', value: comments }
  // ]
  const user     = results[0].status === 'fulfilled' ? results[0].value : null;
  const posts    = results[1].status === 'fulfilled' ? results[1].value : [];
  const comments = results[2].status === 'fulfilled' ? results[2].value : [];
  return { user, posts, comments };
}

// Padrão útil — processamento em lote com fallback:
async function fetchMultipleUsers(userIds) {
  const results = await Promise.allSettled(
    userIds.map(id => fetchUser_id(id))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

// ─────────────────────────────────────────────────────────────
// Promise.race — primeiro a completar (sucesso ou erro)
// ─────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Outros casos de uso:
//   • Fallback entre múltiplos servidores — quem responder primeiro ganha
//   • Carregamento com timeout — aborta se demorar muito

// ─────────────────────────────────────────────────────────────
// Promise.any — primeira com SUCESSO (ignora rejeições)
// ─────────────────────────────────────────────────────────────

async function fetchFromMirrors(path) {
  const mirrors = [
    'https://cdn1.example.com',
    'https://cdn2.example.com',
    'https://cdn3.example.com'
  ];
  try {
    // Retorna o primeiro que responder com sucesso
    return await Promise.any(
      mirrors.map(mirror => fetch(`${mirror}${path}`))
    );
  } catch (err) {
    // AggregateError: todos falharam
    console.error('Todos os mirrors falharam:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Comparação visual: race vs any
// ─────────────────────────────────────────────────────────────

// const p1 = Promise.reject('erro');
// const p2 = Promise.resolve('sucesso');
//
// Promise.race — retorna a PRIMEIRA a completar (erro ou sucesso)
// await Promise.race([p1, p2]);   // ❌ Rejeita com 'erro' (p1 foi mais rápida)
//
// Promise.any — retorna a PRIMEIRA com SUCESSO
// await Promise.any([p1, p2]);    // ✅ Resolve com 'sucesso' (ignora p1)

// ─────────────────────────────────────────────────────────────
// Concurrency limiter — pMap (do Caso Real, seção 2.6)
// ─────────────────────────────────────────────────────────────

async function pMap(items, mapper, concurrency = Infinity) {
  const results = [], executing = [];
  for (const item of items) {
    const promise = Promise.resolve().then(() => mapper(item));
    results.push(promise);
    if (concurrency !== Infinity) {
      const execution = promise.then(() => {
        executing.splice(executing.indexOf(execution), 1);
      });
      executing.push(execution);
      if (executing.length >= concurrency) await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// Uso: máximo 3 requisições simultâneas
// const results = await pMap(urls, url => fetch(url).then(r => r.json()), 3);

// ─────────────────────────────────────────────────────────────
// Processamento em lote com controle de concorrência (do Caso Real)
// ─────────────────────────────────────────────────────────────

async function processBatch(items, concurrency = 5) {
  const results = [], errors = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.allSettled(
      chunk.map(item => fetchUser_id(item))
    );
    chunkResults.forEach((result, index) => {
      if (result.status === 'fulfilled') results.push(result.value);
      else errors.push({ item: chunk[index], error: result.reason.message });
    });
  }
  return { results, errors };
}

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
console.log('=== Promise.all (paralelo) ===');
const t1 = Date.now();
const dashboard = await loadDashboard();
console.log(`loadDashboard em ${Date.now() - t1}ms:`, JSON.stringify(dashboard));

console.log('\n=== Promise.allSettled (resiliente) ===');
const resilient = await loadDashboardResilient();
console.log('loadDashboardResilient:', JSON.stringify(resilient));

console.log('\n=== fetchMultipleUsers ===');
const users = await fetchMultipleUsers([1, 2, 3]);
console.log('fetchMultipleUsers:', users.map(u => u.name));

console.log('\n=== Promise.race vs Promise.any ===');
const p1 = Promise.reject(new Error('erro'));
const p2 = new Promise(r => setTimeout(() => r('sucesso'), 10));
try {
  await Promise.race([p1, p2]);
} catch (e) {
  console.log('Promise.race rejeitou:', e.message, '(p1 foi mais rápida)');
}
const anyResult = await Promise.any([p1, p2]);
console.log('Promise.any resolveu:', anyResult, '(ignorou p1)');

console.log('\n=== processBatch (concurrency=2) ===');
const batch = await processBatch([1,2,3,4,5], 2);
console.log(`processBatch: ${batch.results.length} ok, ${batch.errors.length} erros`);

console.log('\n=== pMap (concurrency=2) ===');
const pmapResult = await pMap([1,2,3,4], id => fetchUser_id(id), 2);
console.log('pMap:', pmapResult.map(u => u.name));
