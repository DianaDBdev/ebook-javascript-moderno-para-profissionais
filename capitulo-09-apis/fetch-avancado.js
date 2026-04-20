// fetch-avancado.js — Seção 9.2 (demo executável) + 9.5 (decisão)
// Capítulo 9 — Além do REST: Quando e Por Quê
//
// Execute: node exemplos/fetch-avancado.js

// ─────────────────────────────────────────────────────────────
// AbortController — cancelamento e timeout
// ─────────────────────────────────────────────────────────────

// Função com AbortController + timeout
function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

// Demo com simulação de requests
async function simulateFetch(label, delayMs, shouldAbort = false) {
  const ctrl = new AbortController();
  if (shouldAbort) setTimeout(() => ctrl.abort(), 20);

  try {
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve(`OK: ${label}`), delayMs);
      ctrl.signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('AbortError', 'AbortError'));
      });
    });
    return { label, result: 'completed' };
  } catch (err) {
    if (err.name === 'AbortError') return { label, result: 'aborted' };
    throw err;
  }
}

console.log('=== AbortController: race condition solution ===');
const [fast, slow, aborted] = await Promise.all([
  simulateFetch('fast-request', 30),
  simulateFetch('slow-request', 100),
  simulateFetch('cancelled-request', 100, true),
]);
console.log(fast, slow, aborted);

// ─────────────────────────────────────────────────────────────
// Request deduplication
// ─────────────────────────────────────────────────────────────

class RequestCache {
  #pending = new Map();

  async get(key, fetcher) {
    if (this.#pending.has(key)) {
      console.log(`  → deduped: ${key}`);
      return this.#pending.get(key);
    }
    const promise = fetcher().finally(() =>
      setTimeout(() => this.#pending.delete(key), 1000)
    );
    this.#pending.set(key, promise);
    return promise;
  }
}

console.log('\n=== Request deduplication ===');
const cache = new RequestCache();
let fetchCount = 0;
const fakeFetch = () => {
  fetchCount++;
  return new Promise(r => setTimeout(() => r({ id: 1, name: 'Diana' }), 20));
};

// 3 componentes pedindo o mesmo dado simultaneamente
const [a, b, c] = await Promise.all([
  cache.get('user:1', fakeFetch),
  cache.get('user:1', fakeFetch), // deduped
  cache.get('user:1', fakeFetch), // deduped
]);
console.log(`3 componentes → apenas ${fetchCount} fetch real feito`);
console.log('Todos receberam:', a.name, b.name, c.name);

// ─────────────────────────────────────────────────────────────
// Streaming (simulado — sem servidor real)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Streaming response (simulado) ===');

// Simula o reader pattern do fetch streaming
async function* simulateStream(chunks) {
  for (const chunk of chunks) {
    await new Promise(r => setTimeout(r, 20));
    yield chunk;
  }
}

async function processStream(streamGen) {
  let fullText = '';
  for await (const chunk of streamGen) {
    fullText += chunk;
    process.stdout.write(chunk); // Atualiza progressivamente
  }
  console.log(); // nova linha
  return fullText;
}

// Simula LLM streaming
const chunks = ['Olá', ', este é', ' um exemplo', ' de streaming', ' response!'];
const result = await processStream(simulateStream(chunks));
console.log(`Texto completo recebido: "${result}"`);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.5 — Fluxograma de decisão
// ─────────────────────────────────────────────────────────────

console.log('\n=== Fluxograma de decisão (seção 9.5) ===\n');

function escolherAPI(contexto) {
  const { overfetching, underfetching, realtime, monorepoTS, apiPublica, mobile } = contexto;

  if (!overfetching && !underfetching && !realtime) return 'REST (sem dor clara — fique no REST)';
  if (realtime && !overfetching)                    return 'WebSockets (Capítulo 10)';
  if (monorepoTS && !apiPublica)                    return 'tRPC (type-safety automático)';
  if (mobile || overfetching || underfetching)      return 'GraphQL (overfetching/underfetching resolvidos)';
  return 'REST com fetch moderno (AbortController, timeout, deduplication)';
}

const cenarios = [
  { desc: 'Blog simples',              ctx: { overfetching: false, underfetching: false, realtime: false, monorepoTS: false, apiPublica: true } },
  { desc: 'Dashboard analytics',       ctx: { overfetching: true,  underfetching: true,  realtime: true,  monorepoTS: false, apiPublica: false } },
  { desc: 'App mobile 3G',             ctx: { overfetching: true,  underfetching: false, realtime: false, mobile: true,      apiPublica: false } },
  { desc: 'SaaS monorepo TypeScript',  ctx: { overfetching: false, underfetching: false, realtime: false, monorepoTS: true,  apiPublica: false } },
  { desc: 'Chat em tempo real',         ctx: { overfetching: false, underfetching: false, realtime: true,  monorepoTS: false } },
];

cenarios.forEach(({ desc, ctx }) => {
  console.log(`  ${desc.padEnd(30)}: ${escolherAPI(ctx)}`);
});
