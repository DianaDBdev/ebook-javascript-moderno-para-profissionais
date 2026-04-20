// demo-eslint.js — Seções 6.1–6.4: Demo executável de code quality
// Capítulo 6 — Linting, Formatting e Code Quality
//
// Execute: node exemplos/demo-eslint.js
//
// Este arquivo demonstra os conceitos do capítulo de forma executável:
// exemplos de código que o ESLint encontraria, configurações e o
// fluxo completo do setup de qualidade.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 6.1 — O que o ESLint encontra
// ─────────────────────────────────────────────────────────────

console.log('=== O que o ESLint detecta ===\n');

// ❌ Exemplos que o ESLint pegaria (aqui corrigidos para rodar):

// Atribuição em vez de comparação:
// if (user = null) { }  // ← 'no-constant-condition' + assignment em if
// Versão correta:
function checkUser(user) {
  if (user === null) {   // ✅ === é obrigatório (eqeqeq: 'error')
    return 'sem usuário';
  }
  return user.name;
}

// await esquecido em função async:
// async function fetchData() {
//   const data = apiCall();  // ← ESLint: 'no-floating-promises'
//   return data;
// }
// Versão correta:
async function fetchData(apiCall) {
  const data = await apiCall(); // ✅ await explícito
  return data;
}

// var em vez de const/let:
// var userName = 'Maria';  // ← ESLint: 'no-var: error'
const userName = 'Maria';    // ✅

// Comparação com == em vez de ===:
// if (age == '18') { }     // ← ESLint: 'eqeqeq: error'
const age = 18;
if (age === 18) { console.log('adulto'); }  // ✅

// throw de string em vez de Error:
// throw 'Algo deu errado';       // ← ESLint: 'no-throw-literal: error'
// throw new Error('Algo deu errado'); // ✅

console.log('checkUser(null)   :', checkUser(null));
console.log('checkUser({name}): ', checkUser({ name: 'Diana' }));
console.log('userName          :', userName);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 6.2 — O que o Prettier formata
// ─────────────────────────────────────────────────────────────

console.log('\n=== O que o Prettier formata ===\n');

// Você escreve (bagunçado):
// const user={name:'Maria',age:25,email:'maria@example.com',role:'admin'}

// Prettier formata:
const user = {
  name:  'Maria',
  age:   25,
  email: 'maria@example.com',
  role:  'admin',
};
console.log('user (formatado pelo Prettier):', user);

// Prettier não detecta bugs — é só formatação.
// ESLint detecta bugs. Prettier formata. Juntos são poderosos.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 6.3 — Conventional Commits (exemplos)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Conventional Commits ===\n');

const commitExamples = {
  valid: [
    'feat(auth): add JWT refresh token support',
    'fix(api): handle null response from user endpoint',
    'docs: update README with new env variables',
    'chore(deps): update eslint to v9',
    'refactor(user): extract validation to separate module',
    'test(order): add integration tests for payment flow',
    'perf(query): optimize user search with index',
  ],
  invalid: [
    'Update stuff',       // sem tipo
    'fixed bug',          // sem tipo
    'WIP',                // sem tipo
  ],
  breaking: [
    'feat!: remove deprecated auth endpoint',        // major bump
    'fix(api)!: change response format',             // major bump
  ]
};

console.log('✅ Válidos:');
commitExamples.valid.forEach(c => console.log(`  ${c}`));
console.log('\n❌ Bloqueados pelo commitlint:');
commitExamples.invalid.forEach(c => console.log(`  ${c}`));
console.log('\n⚠️  BREAKING CHANGE (→ versão major):');
commitExamples.breaking.forEach(c => console.log(`  ${c}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 6.3 — O fluxo do Husky + lint-staged
// ─────────────────────────────────────────────────────────────

console.log('\n=== Fluxo Husky + lint-staged ===\n');

const huskyFlow = [
  '1. Desenvolvedor faz git commit',
  '2. Husky intercepta com Git hook (.husky/pre-commit)',
  '3. lint-staged roda apenas nos arquivos staged (não no projeto inteiro)',
  '4. ESLint --fix + Prettier --write nos arquivos .ts/.tsx/.js/.jsx',
  '5. Prettier --write nos arquivos .css/.md/.json',
  '6. Se houver erro: commit bloqueado com mensagem clara',
  '7. .husky/commit-msg valida formato Conventional Commits',
  '8. Commit aprovado → push',
];
huskyFlow.forEach(step => console.log(`  ${step}`));

console.log('\n💡 Apenas arquivos staged são verificados');
console.log('   ESLint projeto inteiro (200 arqs): ~15s');
console.log('   ESLint lint-staged (5 arqs)      : ~1s');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 6.4 — O setup completo (checklist)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Setup completo de qualidade ===\n');

const setupChecklist = {
  'Semana 1 — Prettier': [
    'npm install -D prettier eslint-config-prettier',
    'Criar .prettierrc com semi, singleQuote, trailingComma, printWidth: 100',
    'npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md,json}"',
    'git add -A && git commit -m "chore: apply prettier formatting"',
    'Instalar extensão esbenp.prettier-vscode',
    'Ativar formatOnSave no VS Code',
  ],
  'Semana 2 — ESLint': [
    'npm install -D eslint @eslint/js typescript-eslint',
    'Criar eslint.config.js com flat config',
    'Começar com warn, não error (menos resistência)',
    'Adicionar eslint-config-prettier no final',
    'npm run lint → analisar os avisos',
    'Corrigir erros críticos (eqeqeq, no-var)',
  ],
  'Semana 3 — Husky': [
    'npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional',
    'npx husky init',
    'Criar .husky/pre-commit com npx lint-staged',
    'Criar .husky/commit-msg com commitlint',
    'Configurar lint-staged no package.json',
    'Criar commitlint.config.js',
  ],
  'Semana 4 — CI + VS Code': [
    'Criar .github/workflows/quality.yml',
    'Versionar .vscode/settings.json e extensions.json',
    'Criar .editorconfig',
    'Adicionar script quality: typecheck && lint && format:check && test',
  ],
};

for (const [fase, steps] of Object.entries(setupChecklist)) {
  console.log(`${fase}:`);
  steps.forEach(s => console.log(`  ☐ ${s}`));
  console.log();
}

// ─────────────────────────────────────────────────────────────
// CASO REAL — Resultados (seção 6.4)
// ─────────────────────────────────────────────────────────────

console.log('=== Resultados do Caso Real (startup fintech, 8 devs) ===\n');

const resultados = [
  { metrica: 'Tempo em style review',     antes: '40%',     depois: '3%'      },
  { metrica: 'Avisos ESLint',             antes: '847',     depois: '12'      },
  { metrica: 'Erros == em produção',      antes: '3/6m',    depois: '0/6m'    },
  { metrica: 'Onboarding novo dev',       antes: '3 dias',  depois: '4 horas' },
  { metrica: 'Commits no novo padrão',    antes: '0%',      depois: '100%'    },
];

resultados.forEach(({ metrica, antes, depois }) => {
  console.log(`  ${metrica.padEnd(30)}: ${antes.padEnd(10)} → ${depois}`);
});

// ─────────────────────────────────────────────────────────────
// Notas adicionais do capítulo
// ─────────────────────────────────────────────────────────────

// SEÇÃO 6.1 — Nota 2026: Oxlint
// O Oxlint (parte do ecossistema Oxc/Rolldown) está emergindo como
// alternativa ultra-rápida ao ESLint. Para projetos novos, vale
// acompanhar sua evolução. Para existentes, ESLint flat config é a
// escolha segura.

// O que o ESLint detecta (exemplos do capítulo):
//   if (user = null) { }    // ← Atribuição em vez de comparação
//   const data = apiCall();  // ← Await esquecido em função async
//   import { useState } from 'react';
//   import { useState } from 'react'; // ← Import duplicado

// SEÇÃO 6.2 — Suporte a múltiplos tipos de arquivo (Prettier):
//   JavaScript/TypeScript, CSS/SCSS/Less, HTML,
//   JSON/JSONC, Markdown/MDX, GraphQL, YAML
// → Um único formatador para todo o projeto.

// SEÇÃO 6.4 — Regras que geram debate (consenso 2026):
// trailingComma: 'all' — Reduz diff no git ao adicionar itens.
//   Só o item adicionado aparece no diff, não a linha anterior.
//
// printWidth: 100 — 80 caracteres é muito restritivo para código
//   moderno com nomes descritivos e TypeScript. 100 ou 120 funcionam
//   melhor na prática.
//
// 💡 A melhor configuração é a que o time decide juntos e registra
//    em um ADR (Architecture Decision Record).

// CASO REAL — Lições aprendidas:
// "Comece pelo Prettier primeiro — impacto imediato, resistência baixa."
// "O pre-commit hook me salvou três vezes de dar push com console.log."
