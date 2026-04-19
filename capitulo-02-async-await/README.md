# Capítulo 2 — Async/Await: Programação Assíncrona Sem Dor de Cabeça

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- A evolução histórica: callbacks → promises → async/await
- Como o event loop funciona: macrotasks vs microtasks
- Error handling com try/catch, finally e granularidade
- Coordenação de promises: `Promise.all`, `race`, `allSettled`, `any`
- Top-level await: quando usar e quando evitar
- Os 6 antipadrões mais comuns e como fugir deles
- Padrões reutilizáveis: timeout, retry com backoff, pMap

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/evolucao-assincrona.js`](exemplos/evolucao-assincrona.js) | 2.1 + Caso Real | Callbacks → Promises → Async/Await; `util.promisify`; sistema de processamento de imagens |
| [`exemplos/event-loop.js`](exemplos/event-loop.js) | 2.2 + 2.5 | Ordem de execução, microtasks vs macrotasks, `sleep` bloqueante vs não-bloqueante, top-level await |
| [`exemplos/error-handling.js`](exemplos/error-handling.js) | 2.3 | try/catch vs .catch(), granularidade, `finally`, `withTimeout`, `retry` com backoff exponencial |
| [`exemplos/promise-combinators.js`](exemplos/promise-combinators.js) | 2.4 | `Promise.all`, `allSettled`, `race`, `any`; `pMap` (concurrency limiter); `processBatch` |
| [`exemplos/antipadroes.js`](exemplos/antipadroes.js) | 2.6 | Os 6 antipadrões do capítulo com exemplos executáveis lado a lado |

---

## Pré-requisitos

- Node.js 18+ (para top-level await em ESM)
- Nenhuma dependência npm necessária

---

## Como executar

```bash
cd capitulo-02-async-await

# Evolução histórica: callbacks → async/await
node exemplos/evolucao-assincrona.js

# Event loop: ordem de execução, microtasks vs macrotasks
node exemplos/event-loop.js

# Error handling: try/catch, finally, withTimeout, retry
node exemplos/error-handling.js

# Promise combinators: .all, .allSettled, .race, .any
node exemplos/promise-combinators.js

# Antipadrões: sequencial vs paralelo, wrappers desnecessários, etc.
node exemplos/antipadroes.js
```

---

## Mapa de exemplos por seção

### 2.1 — Callbacks → Promises → Async/Await
→ `evolucao-assincrona.js`
```js
// Era 1: Callbacks — pirâmide da perdição
downloadImage(url, function(err, buf) {
  validateImage(buf, function(err, isValid) { /* ... */ });
});

// Era 3: Async/Await — código linear
const imageBuffer = await download(imageUrl);
const isValid     = await validate(imageBuffer);
if (!isValid) throw new Error('Invalid image format');
```

### 2.2 — Event Loop: macrotasks vs microtasks
→ `event-loop.js`
```js
console.log('1'); // Síncrono
setTimeout(() => console.log('2'), 0);        // Macrotask
Promise.resolve().then(() => console.log('3')); // Microtask
console.log('4'); // Síncrono
// Output: 1, 4, 3, 2  ← Microtask antes de Macrotask!
```

### 2.3 — Error handling com try/catch vs .catch()
→ `error-handling.js`
```js
// ✅ try/catch preserva stack trace completo
async function loadUserData(userId) {
  try {
    const user = await fetchUser(userId);
    // ...
  } catch (err) {
    console.error('Erro ao carregar dados:', err.message);
    throw err;
  }
}

// ✅ finally sempre executa — ideal para cleanup
async function uploadFile(file) {
  const tempPath = await createTempFile();
  try {
    await processFile(file, tempPath);
  } finally {
    await deleteTempFile(tempPath); // SEMPRE executa
  }
}
```

### 2.4 — Promise combinators
→ `promise-combinators.js`
```js
// Paralelo — 55% mais rápido que sequencial
const [user, posts, comments] = await Promise.all([
  fetchUser(), fetchPosts(), fetchComments()
]);

// Resiliente — nunca rejeita, você decide o fallback
const results = await Promise.allSettled([fetchUser(), fetchPosts()]);

// Timeout pattern
return Promise.race([fetch(url), new Promise((_, r) => setTimeout(r, 5000))]);

// Mirrors — primeiro com sucesso
return Promise.any(mirrors.map(m => fetch(`${m}${path}`)));
```

### 2.5 — Top-level await
→ `event-loop.js`
```js
// ✅ Use para inicialização rápida e essencial
const config = await fetch('https://api.example.com/config').then(r => r.json());
export default config;

// ⚠️ Cuidado: bloqueia todos os importadores
await new Promise(resolve => setTimeout(resolve, 5000)); // 5s de espera!
export const value = 42;
```

### 2.6 — Antipadrões
→ `antipadroes.js`

| Antipadrão | ❌ Problema | ✅ Solução |
|------------|-------------|-----------|
| Async sem await | `async function getUser(id) { return users.find(...) }` | Remover o `async` |
| Await em loop | `for (const id of ids) { await fetchUser(id) }` | `Promise.all(ids.map(id => fetchUser(id)))` |
| Try/catch em excesso | try/catch individual por await | `Promise.allSettled` + único try/catch |
| Misturar async + .then() | `await user; return fetchPosts().then(...)` | Tudo com `await` |
| Esquecer de retornar | `processUser(user)` sem return/await | `return processUser(user)` |
| new Promise wrapper | `return new Promise(async (resolve, reject) => {...})` | `return fetchUser(id)` direto |

---

## Padrões para copiar

### Timeout reutilizável
```js
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
  ]);
}
const data = await withTimeout(fetch(url), 5000, 'API timeout after 5 s');
```

### Retry com exponential backoff
```js
async function retry(fn, options = {}) {
  const { retries = 3, delay = 1000, backoff = 2, onRetry = () => {} } = options;
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try { return await fn(); }
    catch (err) {
      lastError = err;
      if (attempt < retries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        onRetry(attempt, waitTime, err);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  throw lastError;
}
```

---

## Exercícios (do livro)

**Exercício 1:** Paralelize `loadUserProfile` — user, posts, followers, following são independentes.

**Exercício 2:** Implemente `fetchWithRetry` — 3 tentativas, backoff exponencial, só retry em erros de rede (não em 404).

**Exercício 3:** Rate limiting — processe um array de URLs com no máximo 5 simultâneos, aguardando 100ms entre lotes.

---

## Recursos

- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Jake Archibald — Event Loop](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
