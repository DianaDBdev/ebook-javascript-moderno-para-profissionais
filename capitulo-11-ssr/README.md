# Capítulo 11 — Server-Side Rendering (SSR): Fundamentos

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- SPA vs SSR vs SSG vs ISR: trade-offs reais de performance, SEO, custo e complexidade
- Por que SSR voltou: Core Web Vitals, JavaScript bloat e impacto mobile
- Hydration: o que é, mismatch e como evitar com `useEffect` e `useId`
- Streaming SSR e Suspense: React 18, selective hydration e React Server Components
- Dados reais: +52% conversão e-commerce, +65% tráfego orgânico blog
- Frameworks: Next.js, Remix, Astro, SvelteKit — quando usar cada um
- Caso Real: 100k páginas, PageSpeed 42→96, tráfego +64%, custo -85%

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/hidratacao.tsx`](exemplos/hidratacao.tsx) | 11.3 | Processo de hydration passo a passo, mismatch com Date/localStorage/window/Math.random, `suppressHydrationWarning`, `useId` React 18 |
| [`exemplos/streaming-suspense.tsx`](exemplos/streaming-suspense.tsx) | 11.4 | SSR tradicional vs Streaming, Suspense timeline simulado, selective hydration, RSC vs Client Components |
| [`exemplos/nextjs-rsc.tsx`](exemplos/nextjs-rsc.tsx) | 11.1 + 11.6 | SPA/SSR/SSG/ISR explicados com código, Next.js App Router + Pages Router, Remix, Astro, SvelteKit, fluxograma de decisão |
| [`exemplos/comparacao-rendering.ts`](exemplos/comparacao-rendering.ts) | 11.2 + 11.5 | Core Web Vitals (LCP/INP/CLS), JS bloat 355KB, progressive enhancement, 3 casos reais com métricas, Caso Real 100k páginas |

---

## Como executar

```bash
cd capitulo-11-ssr
npm install  # instala tsx + typescript

npx tsx exemplos/hidratacao.tsx
npx tsx exemplos/streaming-suspense.tsx
npx tsx exemplos/nextjs-rsc.tsx
npx tsx exemplos/comparacao-rendering.ts
```

---

## Mapa por seção

### 11.1 — SPA vs SSR vs SSG vs ISR

| Estratégia | HTML inicial | First Content | SEO | Servidor |
|------------|-------------|---------------|-----|---------|
| SPA | Vazio | ~1000ms | ❌ | Não |
| SSR | HTML completo | ~200ms | ✅ | Node.js |
| SSG | Pré-gerado | ~50ms (CDN) | ✅ | Não |
| ISR | Cacheado + refresh | ~50ms (cache) | ✅ | Edge functions |

**Fluxograma:**
```
Conteúdo muda por usuário? (dashboard, carrinho) → SSR ou SPA
Conteúdo estático e muda raramente? (blog, docs) → SSG
Conteúdo muda, mas não em tempo real? (e-commerce) → ISR
Interatividade > performance inicial? (editor)    → SPA
```

### 11.2 — Por que SSR voltou

```
Core Web Vitals (fator de ranking Google desde 2021):
  LCP: SPA=2–4s     vs SSR=0,5–1s
  INP: SPA=200–500ms vs SSR=<100ms   ← substituiu FID em março 2024
  CLS: SPA=0,1–0,25 vs SSR=<0,1

JavaScript bloat típico: React(40) + DOM(130) + Router(15) + State(20) + UI(50) + código(100)
= 355 KB gzipped → Em 3G: ~5s de tela branca

Com SSR: HTML em 200ms → usuário vê conteúdo imediatamente
Progressive enhancement: SSR funciona sem JS, fica melhor com JS
```

### 11.3 — Hydration

```ts
// Processo: servidor → HTML → hydrateRoot → event listeners
ReactDOM.hydrateRoot(document.getElementById('root'), <App initialData={data} />);
// O HTML NÃO é re-renderizado — apenas conectado ao React

// ❌ Mismatch — Date diferente no servidor e cliente
function App() {
  return <div>Hora: {new Date().toISOString()}</div>; // Mismatch!
}

// ✅ Correto — useEffect para código client-only
function App() {
  const [time, setTime] = useState(null);
  useEffect(() => { setTime(new Date().toISOString()); }, []);
  return <div>Hora: {time ?? 'Carregando...'}</div>;
}
```

### 11.4 — Streaming SSR

```tsx
// Sem streaming: servidor espera SlowDashboard (2s) para enviar QUALQUER HTML

// Com streaming (React 18 + Suspense):
<Suspense fallback={<Skeleton />}><UserProfile /></Suspense>     // 200ms
<Suspense fallback={<Skeleton />}><RecentActivity /></Suspense>  // 300ms
<Suspense fallback={<Skeleton />}><Analytics /></Suspense>       // 2s
// HTML inicial: 100ms — conteúdo progressivo, não espera 2s

// React Server Components (RSC) — zero JS no cliente:
async function UserProfile({ userId }) {
  const user = await db.users.findById(userId); // Direto ao banco!
  return <div>{user.name}</div>; // Zero JavaScript enviado ao cliente
}
```

### 11.6 — Frameworks

```ts
// Next.js App Router (padrão 2026, RSC nativo):
async function BlogPost({ params }) {
  const post = await getPost(params.slug); // Server Component
  return <article><h1>{post.title}</h1></article>;
}
export const revalidate = 3600; // ISR automático

// Remix — forms nativos que funcionam SEM JavaScript:
export async function action({ request }) {
  const formData = await request.formData();
  await saveComment(formData.get('comment'));
}
// Response.json() — json() foi descontinuado no Remix v2+

// Astro — 0 KB de JS por padrão:
// <LikeButton client:visible postId={post.id} />
// Hydrata apenas quando entrar no viewport

// SvelteKit — compilador elimina runtime:
// export const load = async ({ params }) => ({ post: await getPost(params.slug) });
```

---

## Caso Real — Blog técnico, 100k artigos, SPA → SSG + ISR

| Métrica | Antes | Depois |
|---------|-------|--------|
| PageSpeed | 42/100 | 96/100 (+129%) |
| LCP | 4,2s | 0,5s (-88%) |
| First Byte | 800ms | 45ms (-94%) |
| Tráfego orgânico | 500k/mês | 820k/mês (+64%) |
| Páginas indexadas | 60k | 100k (100%) |
| Bounce rate | 45% | 23% (-49%) |
| Custo infra | $1.200/mês | $180/mês (-85%) |

**Decisões-chave:**
- `fallback: 'blocking'` no ISR — não gera 100k páginas no build
- `<Image priority>` na imagem LCP — obrigatório para pontuação
- `<link rel="canonical">` — 40% do site estava "invisível" sem ela
- `<Suspense>` para comentários — não bloqueia o LCP

---

## Recursos

- [Next.js docs](https://nextjs.org/docs)
- [Remix docs](https://remix.run/docs)
- [Astro docs](https://docs.astro.build)
- [SvelteKit docs](https://kit.svelte.dev/docs)
- [Core Web Vitals](https://web.dev/vitals)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
