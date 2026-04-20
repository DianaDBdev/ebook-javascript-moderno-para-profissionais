// rest-moderno.js — Seções 9.1 e 9.2: REST moderno + Fetch API avançado
// Capítulo 9 — Além do REST: Quando e Por Quê
//
// Execute: node exemplos/rest-moderno.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.1 — O que REST faz bem
// ─────────────────────────────────────────────────────────────

console.log('=== REST: o que ainda funciona ===\n');

// 1. Simplicidade e clareza:
//   GET    /users          // Lista usuários
//   GET    /users/123      // Busca usuário específico
//   POST   /users          // Cria usuário
//   PUT    /users/123      // Atualiza usuário
//   DELETE /users/123      // Deleta usuário
// 💡 Qualquer dev entende isso em 10 segundos.

// 2. Cache HTTP nativo — infraestrutura gratuita:
//   Cache-Control: public, max-age=3600
//   ETag: "abc123"
//   If-None-Match: "abc123"
//   → 304 Not Modified — zero bandwidth

// 3. Stateless e escalável:
//   Cada request é independente
//   Load balancer roteia qualquer request para qualquer servidor

// Problemas reais:
//
// Overfetching — você busca mais do que precisa:
//   GET /users/123 retorna id, name, email, bio(5KB), settings(2KB), metadata...
//   Você só queria name e email — baixou 11 KB desnecessários
//   ⚠️ Em mobile 3G/4G: gasta bateria, dados e aumenta latência.
//
// Underfetching — 3+ requests para uma tela:
//   const user     = await fetch('/users/123');
//   const posts    = await fetch(`/users/${user.id}/posts`);
//   const comments = await Promise.all(posts.map(p => fetch(`/posts/${p.id}/comments`)));
//   Latência mínima: 200ms × 3 = 600ms
//
// Real-time é forçado:
//   setInterval(async () => {
//     const msgs = await fetch('/messages');
//     // 90% das vezes: nenhuma mensagem nova — desperdício de bandwidth e bateria
//   }, 5000);

// Quando REST ainda é a melhor escolha:
const restarUsando = [
  'CRUD simples — blog, e-commerce, CMS, operações claras',
  'API pública — rate limiting simples, documentação OpenAPI é padrão',
  'Microserviços internos — comunicação server-to-server',
  'Time sem experiência em GraphQL/tRPC — curva de aprendizado zero',
];
console.log('✅ Use REST quando:');
restarUsando.forEach(r => console.log(`   • ${r}`));
console.log('\n💡 Regra: se você não tem dor clara com REST, não migre. Complexidade tem custo real.\n');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.2 — AbortController: cancelar requests
// ─────────────────────────────────────────────────────────────

// O problema — race condition em buscas:
// searchInput.addEventListener('input', async (e) => {
//   const results = await fetch(`/search?q=${e.target.value}`);
//   // Usuário digita rápido → múltiplos requests simultâneos
//   // Resultados antigos podem chegar DEPOIS dos novos → UI com dados desatualizados
// });

// A solução — cancelar o request anterior:
let controller;
function setupSearchWithAbort(searchFn) {
  return async function onInput(query) {
    if (controller) controller.abort(); // Cancela request anterior
    controller = new AbortController();
    try {
      const response = await searchFn(query, { signal: controller.signal });
      return response;
    } catch (err) {
      if (err.name === 'AbortError') return null; // Cancelado — tudo ok
      throw err;
    }
  };
}

// Timeout automático com AbortController:
function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}
// try {
//   const data = await fetchWithTimeout('/api/slow', {}, 3000);
// } catch (err) {
//   if (err.name === 'AbortError') console.error('Timeout após 3 s');
// }

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.2 — Request deduplication
// ─────────────────────────────────────────────────────────────

class RequestCache {
  #cache = new Map();

  async fetch(url, options = {}) {
    const key = JSON.stringify({ url, ...options });
    // opções com `signal` são ignoradas pelo JSON.stringify — adapte se necessário

    if (this.#cache.has(key)) {
      return this.#cache.get(key); // Reutiliza promise existente
    }

    const promise = fetch(url, options)
      .then(r => r.json())
      .finally(() => {
        setTimeout(() => this.#cache.delete(key), 1000);
      });

    this.#cache.set(key, promise);
    return promise;
  }
}

// const apiCache = new RequestCache();
// Componente A e B chamam ao mesmo tempo:
// const userA = await apiCache.fetch('/users/123'); // Faz o request
// const userB = await apiCache.fetch('/users/123'); // Reutiliza a promise!
// 💡 React Query e SWR implementam deduplication automaticamente.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.2 — Streaming responses
// ─────────────────────────────────────────────────────────────

// Download com progresso:
// async function downloadWithProgress(url) {
//   const response      = await fetch(url);
//   const contentLength = response.headers.get('content-length');
//   // pode ser null com gzip/brotli — verifique antes de usar
//   const total = parseInt(contentLength, 10);
//   let loaded = 0;
//   const reader = response.body.getReader();
//   const chunks = [];
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     chunks.push(value);
//     loaded += value.length;
//     updateProgressBar((loaded / total) * 100);
//   }
//   return new Blob(chunks);
// }

// Streaming de chat (LLMs):
// async function streamChatResponse(message) {
//   const response = await fetch('/api/chat', {
//     method:  'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body:    JSON.stringify({ message }),
//   });
//   const reader = response.body
//     .pipeThrough(new TextDecoderStream())
//     .getReader();
//   let fullText = '';
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     fullText += value;
//     displayPartialResponse(fullText); // Atualiza UI progressivamente
//   }
// }

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────

// AbortController demo (sem rede real)
const abortDemo = setupSearchWithAbort(async (query, { signal }) => {
  // Simula fetch com delay
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(`results for: ${query}`), 50);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); });
  });
});

console.log('=== AbortController demo ===');
const p1 = abortDemo('reac');  // será cancelado
const p2 = abortDemo('react'); // este vence
const [r1, r2] = await Promise.allSettled([p1, p2]);
console.log('request 1 (cancelado):', r1.status, r1.reason?.name ?? r1.value);
console.log('request 2 (completo) :', r2.status, r2.value);

console.log('\n=== RequestCache demo ===');
const cache = new RequestCache();
console.log('cache criado — em produção, múltiplos componentes compartilhariam a mesma promise');
console.log('cache tem:', cache['#cache']?.size ?? 0, 'entradas (Map privado)');

console.log('\n=== fetchWithTimeout interface ===');
console.log('fetchWithTimeout(url, options, timeoutMs) — AbortController com cleanup automático');

// Cheat sheet final
console.log('\n=== Cheat sheet: quando usar cada abordagem ===');
const cheat = [
  { api: 'REST',         quando: 'CRUD simples, API pública, team sem exp. em alternativas' },
  { api: 'Fetch moderno', quando: 'Sempre — AbortController, timeout, streaming, deduplication' },
  { api: 'GraphQL',      quando: 'Overfetching claro, múltiplos clients, real-time' },
  { api: 'tRPC',         quando: 'Monorepo TypeScript, API interna, DX é prioridade' },
];
cheat.forEach(({ api, quando }) => {
  console.log(`  ${api.padEnd(15)}: ${quando}`);
});

// Versionamento problemático (seção 9.1):
// GET /v1/users/123   // API antiga
// GET /v2/users/123   // API nova
// → Mantém 2 implementações em paralelo; clients antigos travados na v1

// Polling — o anti-padrão clássico (seção 9.1):
// setInterval(async () => {
//   const msgs = await fetch('/messages');
//   // 90% das vezes: nenhuma mensagem nova — desperdício
// }, 5000);
