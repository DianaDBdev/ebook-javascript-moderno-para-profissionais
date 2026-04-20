// performance-budget.js — Seção 12.5: Performance Budgets
// Capítulo 12 — Deploy Moderno
//
// Execute: node exemplos/performance-budget.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 12.5 — Por que performance budgets?
// ─────────────────────────────────────────────────────────────

console.log('=== Por que performance budgets? ===\n');

// Sem budgets — degradação silenciosa:
const historicoBundleSize = [
  { pr: 'PR #101 — Dev A', adicaoKB: 50,  total: 180, comentario: 'parece razoável' },
  { pr: 'PR #102 — Dev B', adicaoKB: 30,  total: 210, comentario: 'também ok individualmente' },
  { pr: 'PR #103 — Dev C', adicaoKB: 40,  total: 250, comentario: 'ainda ok...' },
  { pr: 'auditoria',       adicaoKB: 0,   total: 250, comentario: 'LCP subiu de 1,2s → 3,8s 😱' },
];

console.log('Sem budgets — degradação silenciosa:');
historicoBundleSize.forEach(({ pr, adicaoKB, total, comentario }) => {
  const barra = '█'.repeat(Math.round(total / 20));
  const delta = adicaoKB > 0 ? `(+${adicaoKB}KB)` : '';
  console.log(`  ${pr.padEnd(20)}: ${String(total).padStart(4)}KB ${delta.padEnd(9)} ${barra}`);
  console.log(`    → ${comentario}`);
});

console.log('\n💡 Performance budget garante que cada PR que introduz');
console.log('   regressão é detectado imediatamente — no CI, não na auditoria.');

// ─────────────────────────────────────────────────────────────
// Lighthouse CI — lighthouserc.js
// ─────────────────────────────────────────────────────────────

const lighthouseConfig = {
  ci: {
    collect: {
      url:          ['http://localhost:3000', 'http://localhost:3000/blog'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Core Web Vitals
        'categories:performance':   ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint':   ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift':  ['error', { maxNumericValue: 0.1  }],
        'total-blocking-time':      ['warn',  { maxNumericValue: 300  }],
        // Tamanho de bundle
        'total-byte-weight':        ['error', { maxNumericValue: 500_000 }], // 500 KB
        'unused-javascript':        ['warn',  { maxNumericValue: 50_000  }], //  50 KB
        // SEO e acessibilidade
        'document-title':           'error',
        'meta-description':         'error',
        'image-alt':                'error',
      },
    },
    upload: {
      target:        'lhci',
      serverBaseUrl: 'process.env.LHCI_SERVER_URL',
      token:         'process.env.LHCI_TOKEN',
    },
  },
};

console.log('\n=== lighthouserc.js (Lighthouse CI) ===\n');
console.log('module.exports =', JSON.stringify(lighthouseConfig, null, 2).slice(0, 800) + '\n  ...');

// ─────────────────────────────────────────────────────────────
// size-limit — controle de bundle no CI
// ─────────────────────────────────────────────────────────────

const sizeLimitConfig = [
  { path: 'dist/assets/index.*.js',  limit: '200 KB' },
  { path: 'dist/assets/vendor.*.js', limit: '300 KB' },
  { path: 'dist/assets/*.css',       limit: '50 KB'  },
];

console.log('\n=== size-limit (package.json) ===\n');
console.log('"size-limit":', JSON.stringify(sizeLimitConfig, null, 2));
console.log('\n# No CI — falha o build se ultrapassar o limite:');
console.log('  run: npm run size');

// ─────────────────────────────────────────────────────────────
// Web Vitals em produção
// ─────────────────────────────────────────────────────────────

// Next.js Pages Router:
// export function reportWebVitals(metric: NextWebVitalsMetric) {
//   // válido no Pages Router — no App Router, use web-vitals diretamente
//   if (metric.label === 'web-vital') {
//     window.gtag?.('event', metric.name, {
//       value:          Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
//       event_category: 'Web Vitals',
//       event_label:    metric.id,
//       non_interaction: true,
//     });
//   }
// }

// Apps sem Next.js — web-vitals library:
// import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
// // onFID foi substituído por onINP na web-vitals v3+
//
// function sendToAnalytics(metric) {
//   fetch('/api/vitals', {
//     method: 'POST',
//     body: JSON.stringify({
//       name:   metric.name,
//       value:  metric.value,
//       rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
//     }),
//   });
// }
//
// onCLS(sendToAnalytics);
// onINP(sendToAnalytics);
// onLCP(sendToAnalytics);

// ─────────────────────────────────────────────────────────────
// Demo: simular budget check
// ─────────────────────────────────────────────────────────────

console.log('\n=== Simulação de budget check no CI ===\n');

function checkBudget(name, atual, limite) {
  const ok      = atual <= limite;
  const pct     = ((atual / limite) * 100).toFixed(0);
  const status  = ok ? '✅ PASS' : '❌ FAIL';
  const bar     = '█'.repeat(Math.min(Math.round(atual / 20), 20));
  const empty   = '░'.repeat(20 - Math.min(Math.round(atual / 20), 20));
  console.log(`  ${name.padEnd(25)}: ${String(atual).padStart(6)} KB / ${String(limite).padStart(6)} KB  [${bar}${empty}] ${pct}%  ${status}`);
  return ok;
}

const budgets = [
  { name: 'index.js (atual)',   atual: 185, limite: 200 },
  { name: 'vendor.js',          atual: 290, limite: 300 },
  { name: 'styles.css',         atual: 35,  limite: 50  },
  { name: 'LCP (ms)',           atual: 2100, limite: 2500 },
  { name: 'CLS (×1000)',        atual: 80,  limite: 100 },
  { name: 'bundle total',       atual: 520, limite: 500 }, // ← vai falhar
];

let allPassed = true;
budgets.forEach(({ name, atual, limite }) => {
  if (!checkBudget(name, atual, limite)) allPassed = false;
});

console.log(`\n${allPassed ? '✅ Todos os budgets respeitados — deploy pode prosseguir' : '❌ Budget ultrapassado — deploy bloqueado'}`);

// ─────────────────────────────────────────────────────────────
// Next.js bundle analyzer
// ─────────────────────────────────────────────────────────────

// next.config.js:
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });
// module.exports = withBundleAnalyzer(nextConfig);
//
// ANALYZE=true npm run build
// → Abre visualização interativa do bundle no browser
