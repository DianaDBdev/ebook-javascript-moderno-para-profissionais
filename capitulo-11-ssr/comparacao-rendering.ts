// comparacao-rendering.ts — Seções 11.2 e 11.5: Core Web Vitals + métricas reais
// Capítulo 11 — Server-Side Rendering (SSR): Fundamentos
//
// Execute: npx tsx exemplos/comparacao-rendering.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.2 — Por que SSR voltou com tudo
// ─────────────────────────────────────────────────────────────

console.log('=== Por que SSR voltou ===\n');

// Problema 1: Core Web Vitals (Google — fator de ranking desde 2021)
const coreWebVitals = {
  LCP: { // Largest Contentful Paint
    spa: '2–4s',
    ssr: '0,5–1s',
    descricao: 'Tempo até o maior conteúdo ser visível',
  },
  INP: { // Interaction to Next Paint (substituiu FID em março 2024)
    spa: '200–500ms',
    ssr: '<100ms',
    descricao: 'Resposta a interações do usuário (substituiu FID em março de 2024)',
  },
  CLS: { // Cumulative Layout Shift
    spa: '0,1–0,25',
    ssr: '<0,1',
    descricao: 'Estabilidade visual — evitar layout shifts',
  },
};

console.log('Core Web Vitals (fator de ranking Google desde 2021):');
for (const [metric, data] of Object.entries(coreWebVitals)) {
  console.log(`\n  ${metric} — ${data.descricao}:`);
  console.log(`    SPA: ${data.spa}  |  SSR: ${data.ssr}`);
}
console.log('\n💡 Verifique web.dev/vitals para valores atualizados — variam por setor.');

// Problema 2: JavaScript bloat
console.log('\n=== JavaScript bloat (SPA típica com React) ===\n');

const bundle = [
  { lib: 'React',           kb: 40 },
  { lib: 'React DOM',       kb: 130 },
  { lib: 'Router',          kb: 15 },
  { lib: 'State management',kb: 20 },
  { lib: 'UI library',      kb: 50 },
  { lib: 'Seu código',      kb: 100 },
];

const total = bundle.reduce((s, b) => s + b.kb, 0);
bundle.forEach(({ lib, kb }) => {
  const bar = '█'.repeat(Math.round(kb / 10));
  console.log(`  ${lib.padEnd(20)}: ${String(kb).padStart(4)} KB  ${bar}`);
});
console.log(`  ${'TOTAL gzipped'.padEnd(20)}: ${String(total).padStart(4)} KB`);
console.log(`\n  Em 3G: download ${(total / 100).toFixed(1)}s + parse ~1s + execute ~0.5s`);
console.log(`  = ~${((total / 100) + 1.5).toFixed(1)}s de tela branca`);
console.log('\n  Com SSR: HTML chega em 200ms — usuário vê conteúdo imediatamente');
console.log('  O JavaScript ainda baixa, mas o conteúdo já está visível.');

// Problema 3: Progressive enhancement
console.log('\n=== Progressive Enhancement ===\n');
console.log('SPA (se JavaScript falha):');
console.log('  <div id="root"></div>  ← Nada. Página quebrada.');
console.log('\nSSR (se JavaScript falha):');
console.log('  <div id="root">');
console.log('    <h1>Título do Artigo</h1>');
console.log('    <p>Conteúdo completo aqui...</p>');
console.log('  </div>');
console.log('  ← Conteúdo legível — perde interatividade, não o conteúdo');
console.log('\n💡 Progressive enhancement: funciona sem JavaScript, fica melhor com JavaScript.');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.5 — Dados reais de performance
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso 1: E-commerce (SPA → SSR + ISR) ===\n');
const ecommerce = {
  'Time to Interactive':   { antes: '4,2s',  depois: '1,8s',   ganho: '-57%' },
  'First Contentful Paint':{ antes: '2,8s',  depois: '0,6s',   ganho: '-79%' },
  'Bounce rate':           { antes: '32%',   depois: '18%',    ganho: '-44%' },
  'Conversão':             { antes: '2,1%',  depois: '3,2%',   ganho: '+52%' },
};
for (const [m, { antes, depois, ganho }] of Object.entries(ecommerce)) {
  console.log(`  ${m.padEnd(28)}: ${antes.padEnd(8)} → ${depois.padEnd(8)} (${ganho})`);
}
console.log('\n  💡 +52% de conversão = impacto financeiro direto no negócio.');

console.log('\n=== Caso 2: Blog de conteúdo (SPA → SSG) ===\n');
const blog = {
  'PageSpeed':          { antes: '45/100', depois: '98/100', ganho: '+118%' },
  'LCP':                { antes: '3,5s',   depois: '0,4s',   ganho: '-89%'  },
  'Tráfego orgânico':   { antes: '100k/mês', depois: '165k/mês', ganho: '+65%' },
  'Páginas indexadas':  { antes: '80%',     depois: '100%',    ganho: '+25%' },
};
for (const [m, { antes, depois, ganho }] of Object.entries(blog)) {
  console.log(`  ${m.padEnd(22)}: ${antes.padEnd(10)} → ${depois.padEnd(10)} (${ganho})`);
}
console.log('\n  💡 +65% de tráfego orgânico sem custo adicional de anúncios.');

console.log('\n=== Caso 3: Dashboard SaaS (CSR → SSR + code splitting) ===\n');
const saas = {
  'First Paint':          { antes: '3,2s',   depois: '0,8s',   ganho: '-75%' },
  'Bundle inicial':       { antes: '420 KB', depois: '180 KB', ganho: '-57%' },
  'Mobile score':         { antes: '32/100', depois: '78/100', ganho: '+144%' },
  'Engagement':           { antes: '45%',    depois: '62%',    ganho: '+38%' },
};
for (const [m, { antes, depois, ganho }] of Object.entries(saas)) {
  console.log(`  ${m.padEnd(22)}: ${antes.padEnd(10)} → ${depois.padEnd(10)} (${ganho})`);
}

// ─────────────────────────────────────────────────────────────
// CASO REAL — 100k páginas de SPA para SSG
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso Real: blog técnico, 100k artigos, SPA → SSG + ISR ===\n');

const casoPre = {
  'PageSpeed Insights':   '42/100',
  'LCP':                  '4,2s',
  'CLS':                  '0,25',
  'Tráfego orgânico':     '500k visitas/mês (estagnado 8 meses)',
  'Páginas indexadas':    '60k de 100k (40% invisíveis)',
  'Bounce rate':          '45%',
  'Custo infra':          'US$ 1.200/mês',
};

const casoPosResultados = {
  'PageSpeed':            '42 → 96  (+129%)',
  'LCP':                  '4,2s → 0,5s  (-88%)',
  'CLS':                  '0,25 → 0,02  (-92%)',
  'First Byte':           '800ms → 45ms  (-94%)',
  'Páginas indexadas':    '60k → 100k  (100%)',
  'Tráfego orgânico':    '500k → 820k/mês  (+64%)',
  'Bounce rate':          '45% → 23%  (-49%)',
  'Custo infra':          'US$ 1.200 → US$ 180/mês  (-85%)',
};

console.log('Antes:');
Object.entries(casoPre).forEach(([k, v]) => console.log(`  ${k.padEnd(25)}: ${v}`));

console.log('\nDepois (3 meses):');
Object.entries(casoPosResultados).forEach(([k, v]) => console.log(`  ${k.padEnd(25)}: ${v}`));

console.log('\nLições:');
const licoes = [
  "ISR com fallback: 'blocking' para grandes volumes — não gera tudo no build",
  'next/image com priority na imagem LCP — impacto direto na pontuação',
  'Metadata e canonical tag ausentes = Google ignora 40% do site',
  'Streaming para comentários — sem isso, o LCP teria piorado',
  'Medir antes e depois com PageSpeed e Google Search Console',
];
licoes.forEach(l => console.log(`  ✓ ${l}`));

// JavaScript bloat total: 355 KB gzipped em uma SPA típica com React.
// React (40) + React DOM (130) + Router (15) + State (20) + UI (50) + código (100) = 355 KB

// Zero JavaScript enviado ao cliente com React Server Components (RSC):
//   Server Component roda apenas no servidor — sem JS no bundle do cliente.
