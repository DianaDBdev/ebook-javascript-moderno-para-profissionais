// rolldown-vite8.js — Seção 4.3b: Vite 8 + Rolldown + ecossistema Oxc
// Capítulo 4 — Build Tools: Além do Webpack
//
// Execute: node exemplos/rolldown-vite8.js

// ─────────────────────────────────────────────────────────────
// Vite 8 e Rolldown: a nova geração (seção 4.3b)
// ─────────────────────────────────────────────────────────────
//
// Em 2026, o Vite lançou sua versão 8 com uma mudança arquitetural:
// o Rolldown — bundler escrito em Rust — substituiu tanto o esbuild
// quanto o Rollup como motor único do Vite.

const vite8Changes = {
  antes: {
    dev:  'esbuild (Go)',
    prod: 'Rollup (JavaScript)',
    problema: 'Comportamentos diferentes entre dev e prod causavam surpresas'
  },
  depois: {
    dev:  'Rolldown (Rust)',
    prod: 'Rolldown (Rust)',
    beneficio: 'Motor único — zero surpresas entre ambientes'
  }
};

console.log('=== Vite 7 → Vite 8: mudança arquitetural ===');
console.log('\nAntes (Vite 7):');
console.log(`  Dev:  ${vite8Changes.antes.dev}`);
console.log(`  Prod: ${vite8Changes.antes.prod}`);
console.log(`  ⚠️  ${vite8Changes.antes.problema}`);

console.log('\nDepois (Vite 8):');
console.log(`  Dev:  ${vite8Changes.depois.dev}`);
console.log(`  Prod: ${vite8Changes.depois.prod}`);
console.log(`  ✅ ${vite8Changes.depois.beneficio}`);

// ─────────────────────────────────────────────────────────────
// O que muda na prática
// ─────────────────────────────────────────────────────────────

const melhorias = [
  'Dev server e build de produção usam o mesmo bundler (Rolldown)',
  'Plugins funcionam igualmente em dev e prod — sem surpresas',
  'Startup do dev server 3× mais rápido em projetos grandes',
  'Builds 10–30× mais rápidos que Vite 7',
  'Configuração existente é compatível — migração automática na maioria dos casos',
];

console.log('\n=== O que muda na prática ===');
melhorias.forEach(m => console.log(`  • ${m}`));

// Migração Vite 7 → 8 (basicamente automática):
//   npm install vite@8
//   // Na maioria dos projetos: isso é tudo que você precisa
//   // Para projetos com plugins customizados: revisar o Migration Guide oficial

// ─────────────────────────────────────────────────────────────
// Rolldown: o bundler em Rust
// ─────────────────────────────────────────────────────────────

// Por que Rust?
//   • Zero-cost abstractions — sem GC pause
//   • Paralelismo sem data races (sistema de borrow checking)
//   • Compatibilidade com API do Rollup — plugins existentes funcionam
//
// Rolldown é open source: https://rolldown.rs

// ─────────────────────────────────────────────────────────────
// O ecossistema Oxc (Oxidation Compiler)
// ─────────────────────────────────────────────────────────────

const oxcEcossistema = {
  Rolldown: {
    substitui: 'esbuild + Rollup',
    uso:       'Motor do Vite 8, bundler de bibliotecas',
    velocidade: '10–30× mais rápido que Vite 7'
  },
  Oxlint: {
    substitui: 'ESLint',
    uso:       'Linter JavaScript/TypeScript ultra-rápido',
    velocidade: '50–100× mais rápido que ESLint',
    nota:      'Compatibilidade crescente de regras — para projetos novos em 2026'
  },
  Oxfmt: {
    substitui: 'Prettier',
    uso:       'Formatador de código',
    velocidade: 'Muito mais rápido que Prettier',
    nota:      'Ainda em desenvolvimento — acompanhar evolução'
  },
  tsdown: {
    substitui: 'tsup',
    uso:       'Empacotador de bibliotecas TypeScript',
    baseado:   'Rolldown',
    nota:      'Substituto moderno do tsup para publicar libs TS'
  }
};

console.log('\n=== Ecossistema Oxc (Rust no JS) ===');
for (const [ferramenta, info] of Object.entries(oxcEcossistema)) {
  console.log(`\n${ferramenta}:`);
  console.log(`  Substitui: ${info.substitui}`);
  console.log(`  Uso:       ${info.uso}`);
  if (info.velocidade) console.log(`  Velocidade: ${info.velocidade}`);
  if (info.nota)       console.log(`  💡 ${info.nota}`);
}

// ─────────────────────────────────────────────────────────────
// Oxlint em prática (seção 4.3b e Capítulo 6)
// ─────────────────────────────────────────────────────────────

// Instalação:
//   npm install -D oxlint

// Uso básico:
//   npx oxlint src/

// Integração com ESLint (compatibilidade gradual):
//   // eslint.config.js
//   import oxlint from 'eslint-plugin-oxlint';
//   export default [
//     ...oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
//     // Suas outras regras ESLint
//   ];

// .oxlintrc.json:
// {
//   "rules": {
//     "no-unused-vars": "error",
//     "no-console": "warn"
//   }
// }

// 💡 Para projetos novos em 2026, use Vite 8.
//    Para projetos existentes, a migração Vite 7→8 é suave —
//    revise o Migration Guide oficial antes de atualizar.

console.log('\n=== Resumo de decisão ===');
const decisao2026 = [
  { cenario: 'Projeto novo',              recomendacao: 'Vite 8 + Rolldown' },
  { cenario: 'Migrar Vite 7',             recomendacao: 'npm install vite@8 (quase automático)' },
  { cenario: 'Linting rápido',            recomendacao: 'Oxlint (projetos novos) ou ESLint flat config (existentes)' },
  { cenario: 'Publicar biblioteca TS',    recomendacao: 'tsdown (baseado em Rolldown)' },
  { cenario: 'Build de CLI/lib ultra-rápido', recomendacao: 'esbuild (ainda válido para casos específicos)' },
];
decisao2026.forEach(({ cenario, recomendacao }) => {
  console.log(`  ${cenario.padEnd(35)}: ${recomendacao}`);
});
