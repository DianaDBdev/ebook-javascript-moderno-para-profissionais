// nextjs-rsc.tsx — Seções 11.1 e 11.6: SPA vs SSR vs SSG vs ISR + Frameworks
// Capítulo 11 — Server-Side Rendering (SSR): Fundamentos
//
// Execute: npx tsx exemplos/nextjs-rsc.tsx

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.1 — SPA: HTML vazio, JavaScript faz o resto
// ─────────────────────────────────────────────────────────────

// <!-- HTML inicial de uma SPA -->
// <html><body>
//   <div id="root"></div>             <!-- Vazio -->
//   <script src="bundle.js"></script>  <!-- 300 KB+ -->
// </body></html>
// Timeline: conteúdo visível ~1000ms em boa conexão
//
// ✅ Vantagens: transições instantâneas, state management rico, deploy simples
// ❌ Desvantagens: SEO problemático, First Paint lento, sem JS = tela em branco

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.1 — SSR: servidor renderiza HTML completo
// ─────────────────────────────────────────────────────────────

// const html = ReactDOMServer.renderToString(<App />);
// res.send(`<html><body><div id="root">${html}</div>
//   <script src="bundle.js"></script></body></html>`);
// Timeline: HTML em ~200ms, conteúdo visível imediatamente
//
// ✅ SEO perfeito, First Paint rápido, funciona sem JavaScript
// ❌ Requer servidor Node.js — complexidade e custo

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.1 — SSG: páginas geradas em build time
// ─────────────────────────────────────────────────────────────

// pages/blog/[slug].js — Next.js Pages Router
// export async function getStaticPaths() {
//   const posts = await getAllPosts();
//   return {
//     paths:    posts.map(p => ({ params: { slug: p.slug } })),
//     fallback: false
//   };
// }
// export async function getStaticProps({ params }) {
//   const post = await getPost(params.slug);
//   return { props: { post } };
// }
// ✅ Performance máxima — HTML estático do CDN, SEO perfeito, custo baixíssimo
// ❌ Build lento com milhares de páginas, conteúdo desatualizado até o próximo build

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.1 — ISR: o meio-termo inteligente
// ─────────────────────────────────────────────────────────────

// export async function getStaticProps() {
//   const data = await fetchData();
//   return { props: { data }, revalidate: 60 }; // Regenera a cada 60s
// }
// ✅ Performance de SSG para páginas cacheadas, conteúdo atualizado automaticamente
// ❌ Primeira request pode ser lenta (cold start), requer edge functions

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.6 — Next.js: App Router (RSC — padrão 2026)
// ─────────────────────────────────────────────────────────────

// 💡 Nota 2026: RSC atingiu maturidade com React 19. App Router usa RSC por padrão.
//    Pages Router está em modo de manutenção — prefira App Router para projetos novos.

// app/blog/[slug]/page.tsx — App Router + RSC:
// async function BlogPost({ params }: { params: { slug: string } }) {
//   const post = await getPost(params.slug); // Server Component — direto ao banco
//   if (!post) notFound();
//   return (
//     <article>
//       <h1>{post.title}</h1>
//       <PostContent content={post.content} />
//     </article>
//   );
// }
// export const revalidate = 3600; // ISR — regenera a cada 1 hora

// pages/blog/[slug].tsx — Pages Router (SSG + ISR clássico):
// export async function getStaticPaths() {
//   const posts = await getTopPosts(1000);
//   return {
//     paths:    posts.map(p => ({ params: { slug: p.slug } })),
//     fallback: 'blocking' // ISR: gera o resto on-demand
//   };
// }
// export async function getStaticProps({ params }) {
//   const post = await getPost(params.slug);
//   if (!post) return { notFound: true };
//   return { props: { post }, revalidate: 3600 };
// }

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.6 — Remix: web fundamentals
// ─────────────────────────────────────────────────────────────

// app/routes/blog.$slug.tsx:
// export async function loader({ params }) {
//   const post = await getPost(params.slug);
//   if (!post) throw new Response('Not Found', { status: 404 });
//   return Response.json({ post });
//   // em Remix v2+, json() foi descontinuado — use Response.json() diretamente
// }
// export async function action({ request, params }) {
//   const formData = await request.formData();
//   await saveComment({ postId: params.slug, comment: formData.get('comment') });
//   return redirect(`/blog/${params.slug}`);
// }
// export default function BlogPost() {
//   const { post } = useLoaderData();
//   return (
//     <article>
//       <h1>{post.title}</h1>
//       <Form method="post">
//         <textarea name="comment" />
//         <button>Comentar</button>
//         {/* Form funciona SEM JavaScript! — progressive enhancement */}
//       </Form>
//     </article>
//   );
// }

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.6 — Astro: zero JavaScript por padrão
// ─────────────────────────────────────────────────────────────

// src/pages/blog/[slug].astro:
// ---
// const { post } = Astro.props;
// ---
// <html lang="pt-BR">
//   <head><title>{post.title}</title></head>
//   <body>
//     <h1>{post.title}</h1>
//     <div set:html={post.content} />
//     <!-- Hydrata só este componente quando entrar no viewport -->
//     <LikeButton client:visible postId={post.id} />
//   </body>
// </html>
// <!-- Bundle: 0 KB para páginas sem componentes interativos -->

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.6 — SvelteKit: compilador, não runtime
// ─────────────────────────────────────────────────────────────

// src/routes/blog/[slug]/+page.server.ts:
// export const load = async ({ params }) => {
//   const post = await getPost(params.slug);
//   if (!post) error(404, 'Não encontrado');
//   return { post };
// };
//
// +page.svelte:
// <script lang="ts">
//   export let data;
// </script>
// <article>
//   <h1>{data.post.title}</h1>
//   {@html data.post.content}
// </article>

// ─────────────────────────────────────────────────────────────
// CASO REAL — Next.js SSG + ISR para 100k páginas
// ─────────────────────────────────────────────────────────────

// 1. Pré-gerar top 5 mil, ISR para o resto:
// export async function getStaticPaths() {
//   // Pages Router — para projetos novos, prefira App Router
//   return {
//     paths:    topPosts.map(p => ({ params: { slug: p.slug } })),
//     fallback: 'blocking' // ISR: gera o resto on-demand
//   };
// }

// 2. next/image com priority na imagem LCP:
// <Image src={post.coverImage} alt={post.title}
//   width={1200} height={630}
//   priority  {/* Preload — esta é a imagem LCP */}
//   sizes="(max-width: 768px) 100vw, 1200px"
// />
// Gera automaticamente: WebP, AVIF, múltiplos tamanhos

// 3. Metadata completo para SEO:
// <Head>
//   <title>{post.title} | Blog Técnico</title>
//   <meta name="description"  content={post.excerpt} />
//   <meta property="og:image" content={post.coverImage} />
//   <link rel="canonical"    href={`https://blog.com/${post.slug}`} />
// </Head>

// 4. Streaming para comentários (não bloqueia LCP):
// <Suspense fallback={<CommentsLoader />}>
//   <Comments postId={post.id} />
// </Suspense>

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────

console.log('=== SPA vs SSR vs SSG vs ISR ===\n');

const estrategias = {
  SPA: {
    htmlInicial:   'Vazio (<div id="root"></div>)',
    javascript:    '300 KB+ (React + bundle)',
    firstContent:  '~1000ms (espera JS executar)',
    seo:           '❌ Problemático',
    servidor:      'Não (apenas CDN)',
    melhorPara:    'Dashboards, editores, apps com state complexo',
  },
  SSR: {
    htmlInicial:   'HTML completo do servidor',
    javascript:    'Bundle para hydration',
    firstContent:  '~200ms (HTML chega pronto)',
    seo:           '✅ Perfeito',
    servidor:      'Sim (Node.js)',
    melhorPara:    'E-commerce, páginas autenticadas, conteúdo dinâmico',
  },
  SSG: {
    htmlInicial:   'HTML pré-gerado no build',
    javascript:    'Bundle para hydration',
    firstContent:  '~50ms (CDN)',
    seo:           '✅ Perfeito',
    servidor:      'Não (apenas CDN)',
    melhorPara:    'Blogs, docs, landing pages',
  },
  ISR: {
    htmlInicial:   'HTML cacheado (regenerado periodicamente)',
    javascript:    'Bundle para hydration',
    firstContent:  '~50ms (cache) / ~200ms (cold start)',
    seo:           '✅ Perfeito',
    servidor:      'Edge functions (Vercel, Netlify)',
    melhorPara:    'E-commerce, portais com conteúdo que muda com frequência',
  },
};

for (const [tipo, info] of Object.entries(estrategias)) {
  console.log(`── ${tipo} ──`);
  Object.entries(info).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(15)}: ${v}`);
  });
  console.log();
}

console.log('=== Fluxograma de decisão ===\n');
const decisao = [
  { pergunta: 'Conteúdo muda por usuário? (dashboard, carrinho)',    resposta: 'SSR ou SPA' },
  { pergunta: 'Conteúdo é estático e muda raramente? (blog, docs)',  resposta: 'SSG' },
  { pergunta: 'Conteúdo muda, mas não em tempo real? (e-commerce)',  resposta: 'ISR' },
  { pergunta: 'Interatividade supera performance inicial? (editor)', resposta: 'SPA' },
];
decisao.forEach(({ pergunta, resposta }) => {
  console.log(`  ${pergunta}`);
  console.log(`  → ${resposta}\n`);
});

console.log('=== Frameworks por caso de uso ===\n');
const frameworks = [
  { fw: 'Next.js',    foco: 'Tudo em um',             melhor: 'Apps React complexos, e-commerce, SaaS' },
  { fw: 'Remix',      foco: 'Web fundamentals',        melhor: 'Apps com muitos formulários, progressive enhancement' },
  { fw: 'Astro',      foco: 'Zero JS por padrão',      melhor: 'Blogs, landing pages, documentação' },
  { fw: 'SvelteKit',  foco: 'Compilador, não runtime', melhor: 'Performance máxima, preferência por Svelte' },
];
frameworks.forEach(({ fw, foco, melhor }) => {
  console.log(`  ${fw.padEnd(12)}: ${foco.padEnd(25)} | ${melhor}`);
});

// 💡 A maioria dos projetos se beneficia de uma combinação:
//    SSG para conteúdo, SSR para páginas autenticadas, SPA para dashboards internos.
