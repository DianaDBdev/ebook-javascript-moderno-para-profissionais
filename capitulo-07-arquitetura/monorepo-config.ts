// monorepo-config.ts — Seção 7.5: Monorepos com npm Workspaces + Turborepo
// Capítulo 7 — Do Monolito ao Modular
//
// Execute: npx tsx exemplos/monorepo-config.ts

// ─────────────────────────────────────────────────────────────
// Por que monorepos?
// ─────────────────────────────────────────────────────────────

const problemasResolvidos = [
  'Mudanças atômicas — frontend e backend mudam em um único commit',
  'Compartilhamento de código — tipos TS, validações e utils em ambos',
  'CI unificado — uma pipeline para tudo',
  'Versionamento consistente — sem "backend v2, frontend ainda v1"',
  'Refatorações cross-cutting — mudar um tipo propaga automaticamente',
];

console.log('=== Por que monorepos? ===');
problemasResolvidos.forEach(p => console.log(`  • ${p}`));

// ─────────────────────────────────────────────────────────────
// npm Workspaces — package.json da raiz
// ─────────────────────────────────────────────────────────────

// {
//   "name":       "my-monorepo",
//   "workspaces": ["packages/*", "apps/*"]
// }

// Estrutura do monorepo:
// monorepo/
// ├── apps/
// │   ├── web/                 ← React (Vite)
// │   │   ├── src/
// │   │   └── package.json     → depende de @myapp/shared
// │   └── api/                 ← Express + Node.js
// │       ├── src/
// │       └── package.json     → depende de @myapp/shared
// ├── packages/
// │   ├── shared/              ← Código compartilhado
// │   │   ├── src/
// │   │   │   ├── types/       ← Interfaces compartilhadas
// │   │   │   ├── validators/  ← Validações usadas em ambos
// │   │   │   └── utils/       ← Helpers genéricos
// │   │   ├── package.json
// │   │   └── tsconfig.json
// │   ├── ui/                  ← Design system compartilhado
// │   │   └── src/ Button/, Input/, Modal/
// │   └── config/              ← Configs compartilhadas
// │       ├── eslint/
// │       ├── tsconfig/
// │       └── prettier/
// ├── package.json             ← Root workspace
// ├── turbo.json
// └── tsconfig.base.json

// ─────────────────────────────────────────────────────────────
// turbo.json — cache e paralelismo
// ─────────────────────────────────────────────────────────────

const turboConfig = {
  tasks: {
    build: {
      dependsOn: ['^build'],  // Constrói deps antes
      outputs:   ['dist/']
    },
    test: {
      dependsOn: ['build']
    },
    lint: {}
  }
};

console.log('\n=== turbo.json ===');
console.log(JSON.stringify(turboConfig, null, 2));

// Comandos Turborepo:
//   turbo run build                     # Build de tudo em paralelo
//   turbo run test --filter=@myapp/api  # Só o pacote api
//   turbo run lint --filter=...@myapp   # Pacotes que dependem de @myapp

// ─────────────────────────────────────────────────────────────
// package.json do pacote shared
// ─────────────────────────────────────────────────────────────

const sharedPackageJson = {
  name:    '@myapp/shared',
  version: '1.0.0',
  main:    './dist/index.js',
  types:   './dist/index.d.ts',
  exports: {
    '.': {
      import: './dist/index.js',
      types:  './dist/index.d.ts'
    }
  },
  scripts: {
    build: 'tsc',
    dev:   'tsc --watch'
  }
};

console.log('\n=== packages/shared/package.json ===');
console.log(JSON.stringify(sharedPackageJson, null, 2));

// ─────────────────────────────────────────────────────────────
// tsconfig compartilhado
// ─────────────────────────────────────────────────────────────

// packages/config/tsconfig/base.json:
// {
//   "compilerOptions": {
//     "target":           "ES2020",
//     "module":           "ESNext",
//     "moduleResolution": "Bundler",
//     "strict":           true,
//     "esModuleInterop":  true,
//     "skipLibCheck":     true,
//     "declaration":      true,
//     "declarationMap":   true,
//     "sourceMap":        true
//   }
// }

// apps/web/tsconfig.json — herda da base:
// {
//   "extends": "@myapp/config/tsconfig/base.json",
//   "compilerOptions": {
//     "jsx":    "react-jsx",
//     "noEmit": true
//   }
// }

// ─────────────────────────────────────────────────────────────
// Quando NÃO usar monorepo
// ─────────────────────────────────────────────────────────────

const naoUsar = [
  'Projetos desenvolvidos por times completamente diferentes',
  'Ciclos de release independentes e não sincronizados',
  'Repositório que cresceria a ponto de comprometer performance do Git',
  'Equipe pequena onde overhead de configuração não se justifica',
];

console.log('\n=== Quando NÃO usar monorepo ===');
naoUsar.forEach(r => console.log(`  ✗ ${r}`));

console.log('\n⚠️  Monorepo não é bala de prata.');
console.log('   Comece com repos separados e migre quando a dor de sincronização for clara.');

// ─────────────────────────────────────────────────────────────
// Scripts de validação de dependências (Caso Real — seção 7.5)
// ─────────────────────────────────────────────────────────────

// scripts/check-deps.js — roda no CI
// import { execSync } from 'child_process';
// const features = ['users', 'products', 'orders', 'auth'];
// for (const feature of features) {
//   for (const other of features.filter(f => f !== feature)) {
//     const result = execSync(
//       `grep -r "features/${other}" src/features/${feature} || true`
//     ).toString();
//     if (result.includes(`features/${other}`)) {
//       console.error(`❌ ${feature} imports from ${other} directly!`);
//       process.exit(1);
//     }
//   }
// }
// console.log('✅ No cross-feature imports found');

// ─────────────────────────────────────────────────────────────
// Strangler Fig Pattern — estratégia de migração (Caso Real)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Strangler Fig Pattern ===');
const strangler = [
  '1. Criar a nova estrutura de pastas vazia (features/, shared/)',
  '2. Definir as regras de dependência e documentar (ADR)',
  '3. Migrar uma feature por sprint, começando pela menor',
  '4. Proibir novos arquivos na estrutura antiga após migração de cada feature',
  '5. Remover a estrutura antiga quando vazia',
];
strangler.forEach(s => console.log(`  ${s}`));

// ─────────────────────────────────────────────────────────────
// formatCurrency — exemplo de código compartilhado (Caso Real)
// ─────────────────────────────────────────────────────────────

// Antes: 3 implementações diferentes em 3 componentes
// Em UserCard.jsx:    const formatted = `R$ ${value.toFixed(2).replace('.', ',')}`;
// Em ProductCard.jsx: const price = 'R$ ' + parseFloat(value).toFixed(2);
// Em OrderSummary.jsx: new Intl.NumberFormat('pt-BR', {...}).format(value);

// Depois — uma função em shared/utils/formatters.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL'
  }).format(value);
}

console.log('\n=== Caso Real — código compartilhado ===');
console.log('formatCurrency(49.90):', formatCurrency(49.90));
console.log('formatCurrency(1500)  :', formatCurrency(1500));

// ─────────────────────────────────────────────────────────────
// Resultados do Caso Real (seção 7.5)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Resultados (3 meses, 180 componentes → feature-first) ===');
const resultados = [
  { metrica: 'Merge conflicts',             antes: '8/semana',   depois: '1/mês'   },
  { metrica: 'Tamanho médio dos arquivos',  antes: '280 linhas', depois: '85 linhas' },
  { metrica: 'Código duplicado removido',   antes: '-',          depois: '1.200 linhas' },
  { metrica: 'Cobertura de testes',         antes: '12%',        depois: '67%'     },
  { metrica: 'Tempo de build',              antes: '45s',        depois: '28s'     },
  { metrica: 'Onboarding de novo dev',      antes: '1 semana',   depois: '2 dias'  },
  { metrica: 'Localizar onde fazer mudança',antes: '15 min',     depois: '2 min'   },
  { metrica: 'Satisfação do time (0–10)',   antes: '5,2',        depois: '8,4'     },
];
resultados.forEach(({ metrica, antes, depois }) => {
  console.log(`  ${metrica.padEnd(33)}: ${antes.padEnd(12)} → ${depois}`);
});

// turbo.json completo — dependências entre tasks (seção 7.5):
// {
//   "tasks": {
//     "build": {
//       "dependsOn": ["^build"],  // Constrói deps antes
//       "outputs":   ["dist/"]
//     },
//     "test": { "dependsOn": ["build"] },
//     "lint": {}
//   }
// }

// O strangler fig pattern é a estratégia de migração recomendada (Caso Real):
// construir a nova estrutura em paralelo com a antiga, migrando
// feature por feature, sem um big bang que paralise o desenvolvimento.
