# Capítulo 9 — Além do REST: Quando e Por Quê

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- REST: quando ainda é a melhor escolha e suas limitações reais
- Fetch moderno: `AbortController`, timeout, streaming e request deduplication
- GraphQL: overfetching/underfetching resolvidos — e o problema N+1 que mata o banco
- tRPC: type-safety end-to-end para monorepos TypeScript
- Tabela de decisão e fluxograma: como escolher a abordagem certa
- Caso Real: migração REST → GraphQL — -60% latência, -78% bandwidth, -47% custo

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/rest-moderno.js`](exemplos/rest-moderno.js) | 9.1 + 9.2 | REST: limitações, `AbortController`, `fetchWithTimeout`, request deduplication, streaming, cheat sheet |
| [`exemplos/fetch-avancado.js`](exemplos/fetch-avancado.js) | 9.2 + 9.5 | Demo executável: cancelamento, deduplication com 3 componentes, streaming simulado, fluxograma de decisão |
| [`exemplos/graphql-client.js`](exemplos/graphql-client.js) | 9.3 | Apollo Server, schema/resolvers, problema N+1, DataLoader batching, subscriptions vs polling |
| [`exemplos/trpc-router.ts`](exemplos/trpc-router.ts) | 9.4 | tRPC router com Zod, client tipado, React Query, Express middleware, quando usar/não usar |
| [`exemplos/decisao-api.js`](exemplos/decisao-api.js) | 9.5 + Caso Real | Tabela de decisão completa, caso real da migração (métricas, fases, lições) |

---

## Como executar

```bash
cd capitulo-09-apis

node exemplos/rest-moderno.js
node exemplos/fetch-avancado.js
node exemplos/graphql-client.js
node exemplos/decisao-api.js

# TypeScript (requer tsx):
npx tsx exemplos/trpc-router.ts
```

---

## Mapa de exemplos por seção

### 9.1 — REST: o que ainda funciona (e o que não)
```js
// ✅ Simples, universal, cache HTTP nativo
GET /users/123   // Qualquer dev entende em 10 segundos

// ❌ Overfetching — você baixou 11 KB e usou 0,1 KB
// ❌ Underfetching — 3+ requests para uma tela
// ❌ /v1/ e /v2/ em paralelo para sempre
// ❌ Polling a cada 5s — 90% retorna "nada novo"
```

### 9.2 — Fetch moderno
```js
// AbortController — cancela request anterior ao digitar
let controller;
controller?.abort();
controller = new AbortController();
await fetch(url, { signal: controller.signal });

// Timeout automático
function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...options, signal: ctrl.signal });
}

// Deduplication — 3 componentes, 1 fetch
const cache = new RequestCache();
const [a, b, c] = await Promise.all([
  cache.fetch('/users/1'), // faz o request
  cache.fetch('/users/1'), // reutiliza a promise
  cache.fetch('/users/1'), // reutiliza a promise
]);
```

### 9.3 — GraphQL
```graphql
# 1 request, só os campos necessários
query {
  user(id: "123") { name email posts { title } }
}
```
```js
// N+1: 1 query para users + N para posts = 101 queries!
// Solução: DataLoader batching automático
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.post.findByUserIds(userIds); // 1 query
  return userIds.map(id => posts.filter(p => p.authorId === id));
});
// DataLoader deve ser criado POR REQUEST — não compartilhado globalmente.
```

### 9.4 — tRPC
```ts
// Backend — tipos inferidos automaticamente
const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.user.findById(input.id)),
});

// Frontend — autocomplete completo, erros em compile-time
const user = await trpc.getUser.query({ id: '123' });
//           ↑ TypeScript sabe exatamente o tipo de retorno
await trpc.createUser.mutate({ name: 'Maria', emal: '...' });
//                                             ↑ ❌ Erro em compile-time!
```

### 9.5 — Fluxograma de decisão
```
Monorepo TS + API interna?        → tRPC
Mobile + overfetching mensurável? → GraphQL
API pública ou CRUD simples?      → REST
Qualquer caso?                    → Fetch moderno (AbortController etc.)
💡 Se não tem dor clara com REST — não migre. Complexidade tem custo real.
```

---

## Caso Real — Dashboard analytics, 200k usuários/dia, 6 meses

**Problema:** 12 requests por pageview, 2,1 MB/sessão, 40% do tráfego era polling inútil.

| Métrica | Antes | Depois |
|---------|-------|--------|
| Load time (3G) | 4,5s | 1,8s (-60%) |
| Bandwidth/sessão | 2,1 MB | 450 KB (-78%) |
| Requests/pageview | 12–15 | 1–2 (-90%) |
| Polling inútil | 40% | 0% (subscriptions) |
| Custo infraestrutura | $15k/mês | $8k/mês (-47%) |

**Desafios inesperados:** N+1 em produção (resolvido com DataLoader obrigatório), query complexa travando o banco (resolvido com `costAnalysisPlugin`), curva de aprendizado real (4 semanas por dev).

---

## Recursos

- [Apollo GraphQL docs](https://www.apollographql.com/docs)
- [tRPC docs](https://trpc.io)
- [DataLoader](https://github.com/graphql/dataloader)
- [create.t3.gg — tRPC + Next.js](https://create.t3.gg)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
