// refatoracao-segura.js — Seções 13.1 e 13.4: Avaliação + Characterization Tests + ADR
// Capítulo 13 — Migrando Projetos Legados
//
// Execute: node exemplos/refatoracao-segura.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.1 — Framework de avaliação do que migrar
// ─────────────────────────────────────────────────────────────

console.log('=== Framework de avaliação de migração ===\n');

function scoreMigration(modulo) {
  const {
    dividaTecnicaAtiva,   // 1-5: bugs frequentes, lentidão, impossível de manter
    custoOnboarding,      // 1-5: tempo para novo dev entender o módulo
    velocidadeEntrega,    // 1-5: quanto está travando novas features
    coberturaTestes,      // 1-5: 5 = 0% de coverage (maior risco)
    tamanhoArquivos,      // 1-5: complexidade do esforço
    disponibilidadeTime,  // 1-5: capacidade disponível agora
  } = modulo.scores;

  const total = dividaTecnicaAtiva + custoOnboarding + velocidadeEntrega
    + coberturaTestes + tamanhoArquivos + disponibilidadeTime;

  let prioridade;
  if      (total >= 26) prioridade = '🔴 Crítica — dívida comprometendo gravemente o negócio';
  else if (total >= 20) prioridade = '🟠 Urgente — dívida comprometendo o negócio';
  else if (total >= 12) prioridade = '🟡 Planejada — vale incluir no roadmap';
  else                  prioridade = '🟢 Opcional — custo provavelmente não compensa';

  return { total, maxTotal: 30, prioridade };
}

const modulos = [
  {
    nome: 'Módulo de Pagamento (legado)',
    scores: { dividaTecnicaAtiva: 5, custoOnboarding: 5, velocidadeEntrega: 4, coberturaTestes: 5, tamanhoArquivos: 3, disponibilidadeTime: 3 },
  },
  {
    nome: 'Módulo de Relatórios',
    scores: { dividaTecnicaAtiva: 2, custoOnboarding: 3, velocidadeEntrega: 2, coberturaTestes: 3, tamanhoArquivos: 4, disponibilidadeTime: 2 },
  },
  {
    nome: 'Script de exportação (legado)',
    scores: { dividaTecnicaAtiva: 1, custoOnboarding: 1, velocidadeEntrega: 1, coberturaTestes: 2, tamanhoArquivos: 1, disponibilidadeTime: 2 },
  },
];

modulos.forEach(({ nome, scores }) => {
  const { total, maxTotal, prioridade } = scoreMigration({ scores });
  console.log(`${nome}:`);
  console.log(`  Score: ${total}/${maxTotal}`);
  console.log(`  Prioridade: ${prioridade}\n`);
});

// O que definitivamente NÃO migrar:
console.log('O que NÃO migrar:');
['Código que funciona perfeitamente e raramente muda ("não mexa no que funciona")',
 'Código prestes a ser descomissionado — não vale investir',
 'Código tão crítico que qualquer mudança exige meses de QA',
 'Módulo com equipe proprietária e processos próprios de qualidade',
].forEach(n => console.log(`  ✗ ${n}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.1 — Mapeando dívida técnica (ferramentas)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Ferramentas de diagnóstico ===\n');

// # Complexidade ciclomática
// npm install -g complexity-report  # desatualizado
// # Prefira ESLint com: complexity: ['warn', 20]
// # ou o pacote 'plato'
//
// # Código duplicado
// npm install -g jscpd
// jscpd src/ --min-lines 10 --reporters html
//
// # Coverage atual
// npm run test:coverage
// # Arquivos com 0% = maior risco para refatorar
//
// # Dependências desatualizadas
// npm outdated
// npx npm-check-updates

const tools = [
  { tool: 'ESLint complexity rule', uso: 'Identifica arquivos com complexidade > 20' },
  { tool: 'jscpd',                  uso: 'Mapeia duplicações — candidatos a refatoração' },
  { tool: 'test:coverage',          uso: 'Arquivos com 0% = área de maior risco' },
  { tool: 'npm outdated',           uso: 'Dependências desatualizadas' },
  { tool: 'npm-check-updates',      uso: 'Mostra o que pode ser atualizado' },
];
tools.forEach(({ tool, uso }) => console.log(`  ${tool.padEnd(25)}: ${uso}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.1 — O mito da grande reescrita
// ─────────────────────────────────────────────────────────────

console.log('\n=== O mito da grande reescrita ===\n');
console.log('Joel Spolsky: "a coisa mais errada que uma empresa de software pode fazer"');
console.log('"Things You Should Never Do" (joelonsoftware.com, 2000)\n');

const problemasReescrita = [
  'Código antigo acumula anos de edge cases críticos que parecem bobagem',
  'Time original evolui o produto durante a reescrita — você persegue um alvo móvel',
  'A versão nova raramente fica pronta no prazo — quando fica, o mercado mudou',
  'Custo de oportunidade enorme — meses de engenharia sem nova funcionalidade',
];
problemasReescrita.forEach(p => console.log(`  • ${p}`));
console.log('\n💡 Regra dos 6 meses: se vai levar mais de 6 meses, prefira migração incremental.');
console.log('   (regra empírica baseada em padrões observados na indústria)');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.4 — Characterization tests
// ─────────────────────────────────────────────────────────────

console.log('\n=== Characterization Tests ===\n');

// Código legado — não modifique
function legacyCalculateTax(income) {
  if (income <= 0) return income * 0.15; // Bug: retorna negativo para negativos
  if (income <= 2000) return 0;
  return income * 0.15;
}

function applyDiscounts(price, discounts) {
  // Comportamento atual: (1 - d1) * (1 - d2) — não (d1 + d2)
  return discounts.reduce((acc, d) => acc * (1 - d), price);
}

// Characterization tests — documentam O QUE É, não o que deveria ser
console.log('legacyCalculateTax:');
[
  [1000, 150, 'normal'],
  [0, 0, 'zero'],
  [-100, -15, 'negativo (bug conhecido)'],
  [1500, 0, 'isento'],
].forEach(([input, expected, desc]) => {
  const result  = legacyCalculateTax(input);
  const matches = result === expected;
  console.log(`  input=${String(input).padStart(5)}: ${String(result).padStart(6)} ${matches ? '✅' : '❌'} (${desc})`);
});

console.log('\napplyDiscounts — comportamento composto (1-d1)×(1-d2):');
const discountResult = applyDiscounts(100, [0.1, 0.2]);
console.log(`  applyDiscounts(100, [0.1, 0.2]) = ${discountResult}`);
console.log(`  ⚠️ Resultado é 72, não 70 — isso é INTENCIONAL`);
console.log(`  200 clientes configuraram regras em cima desse comportamento`);
console.log(`  Sem characterization test, "corrigiríamos" e quebraríamos tudo`);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.4 — Migração CJS → ESM com testes
// ─────────────────────────────────────────────────────────────

console.log('\n=== Migração CJS → ESM com characterization tests ===\n');

// LEGADO (CJS):
function formatCurrencyLegacy(value) {
  return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
}

// NOVO (ESM + Intl.NumberFormat):
function formatCurrencyNew(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const testInputs = [1500, 0, 19.9, 1000000];
console.log('Comparação de comportamento:');
console.log(`  ${'Input'.padEnd(12)} ${'Legado'.padEnd(20)} ${'Novo (ESM)'.padEnd(25)} ${'Igual?'}`);
testInputs.forEach(v => {
  const leg = formatCurrencyLegacy(v);
  const neo = formatCurrencyNew(v);
  const eq  = leg.replace('\u00a0', ' ') === neo.replace('\u00a0', ' ') ? '✅' : '⚠️ mudou';
  console.log(`  ${String(v).padEnd(12)} ${leg.padEnd(20)} ${neo.padEnd(25)} ${eq}`);
});
console.log('\n⚠️ O formato mudou (separador de milhar, espaço não-quebrável)');
console.log('   Characterization tests alertam sobre isso — código dependente precisa ser atualizado');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.4 — Boy Scout Rule
// ─────────────────────────────────────────────────────────────

console.log('\n=== Boy Scout Rule ===\n');
console.log('"Deixe o código um pouco melhor do que você encontrou"');
console.log('\nAo tocar um arquivo para corrigir um bug ou adicionar feature:');
['1. Adicione um teste para o comportamento que vai mudar',
 '2. Faça a mudança necessária',
 '3. Melhore uma coisa pequena: nome, tipo TS, remove código morto',
 '4. Verifique que os testes ainda passam',
 '5. Commite a mudança e a melhoria SEPARADAMENTE',
].forEach(s => console.log(`  ${s}`));
console.log('\nEm 6 meses de Boy Scout Rule consistente:');
console.log('  os módulos mais tocados ficam modernos naturalmente');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.5 — ADR: Architecture Decision Record
// ─────────────────────────────────────────────────────────────

console.log('\n=== ADR — Architecture Decision Record ===\n');

const adrExample = `
# ADR 0001: Migrar de CommonJS para ESM

## Status
Aceito

## Contexto
O projeto usa CommonJS desde 2019. Bibliotecas modernas (nanoid, got, chalk v5)
migraram para ESM-only. Manter CJS exige workarounds que complicam o código.

## Decisão
Migrar para ESM incrementalmente, módulo por módulo, ao longo de 3 meses.
Usar allowJs: true no tsconfig para coexistência durante a transição.

## Consequências
✅ Compatibilidade com bibliotecas modernas
✅ Tree-shaking mais eficiente
✅ Consistência com o frontend
⚠️  Arquivos .js precisarão de extensão explícita nos imports
⚠️  __dirname/__filename precisam de wrapper

## Alternativas consideradas
- Manter CJS e usar dynamic import(): descartado — muito verboso
- Reescrita completa: descartado — risco alto, custo alto

## Data
2024-03-15
`.trim();

console.log(adrExample);
console.log('\n💡 ADRs eliminam "por que fizemos isso assim?" — que aparece 6 meses depois.');
console.log('   Documente decisões no momento em que são tomadas.');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.5 — Script de métricas de progresso
// ─────────────────────────────────────────────────────────────

console.log('\n=== Métricas de progresso ===\n');

// Em projetos reais, use migration-progress.ts:
// import glob from 'glob';
// const files = glob.sync('src/**/*.{js,ts}');
// // glob v8+: use await glob('src/**/*.{js,ts}') em vez de glob.sync
// const stats = { total: files.length, commonjs: 0, esm: 0, typescript: 0, hasTests: 0 };
// for (const file of files) {
//   const content = fs.readFileSync(file, 'utf8');
//   if (content.includes('require('))  stats.commonjs++;
//   if (content.includes('import '))   stats.esm++;
//   if (file.endsWith('.ts'))           stats.typescript++;
//   if (fs.existsSync(file.replace(/\.ts$/, '.test.ts'))) stats.hasTests++;
// }

// Simulação de dashboard de progresso:
const progressData = [
  { semana: 'Início',    esm: 5,   ts: 0,  tests: 11 },
  { semana: 'Semana 4',  esm: 22,  ts: 15, tests: 28 },
  { semana: 'Semana 8',  esm: 45,  ts: 38, tests: 42 },
  { semana: 'Semana 12', esm: 68,  ts: 61, tests: 55 },
  { semana: 'Semana 16', esm: 85,  ts: 80, tests: 67 },
  { semana: 'Fim',       esm: 100, ts: 100, tests: 78 },
];

console.log('Dashboard de migração (% dos arquivos):');
console.log(`  ${'Semana'.padEnd(12)} ${'ESM'.padEnd(8)} ${'TypeScript'.padEnd(12)} ${'Com Testes'}`);
progressData.forEach(({ semana, esm, ts, tests }) => {
  const esmBar  = '█'.repeat(Math.round(esm  / 10));
  console.log(`  ${semana.padEnd(12)} ${String(esm  + '%').padEnd(8)} ${String(ts   + '%').padEnd(12)} ${tests}%  ${esmBar}`);
});

// Critérios de conclusão:
console.log('\nCritérios de conclusão (definir ANTES de começar):');
['100% dos novos arquivos usam o padrão novo',
 'X% dos existentes migrados (definir X com base no esforço)',
 'Código legado isolado em legacy/ ou removido',
 'CI bloqueia o padrão antigo em novos arquivos',
 'Guia de estilo atualizado com o padrão novo',
].forEach(c => console.log(`  ☐ ${c}`));

// ─────────────────────────────────────────────────────────────
// Interpretação do framework de avaliação (seção 13.1)
// ─────────────────────────────────────────────────────────────

// 26–30 pontos: migração crítica — dívida comprometendo gravemente o negócio
// 20–25 pontos: migração urgente
// 12–19 pontos: migração planejada — incluir no roadmap
// < 12 pontos: migração opcional — custo não compensa

// O que definitivamente NÃO migrar (seção 13.1):
//   • Funciona perfeitamente e raramente muda — "não mexa no que está funcionando"
//   • Está prestes a ser descomissionado
//   • É tão crítico que qualquer mudança exige meses de QA
//   • Tem equipe proprietária com processos próprios

// ─────────────────────────────────────────────────────────────
// Sequência segura de refatoração (seção 13.4)
// ─────────────────────────────────────────────────────────────

// 1. Escreva characterization tests cobrindo o comportamento atual
// 2. Refatore em passos pequenos — uma mudança por commit
// 3. Execute os testes após cada mudança
// 4. Se algum teste quebrar, reverta imediatamente
// 5. Quando todos passam, o comportamento foi preservado
// 6. Adicione testes de comportamento correto para bugs conhecidos
// 7. Corrija os bugs — agora os novos testes devem passar

// Characterization tests são temporários — após migração, substituir por testes
// de comportamento correto (documentando o que DEVERIA acontecer).

// mesmo que seja 'errado': characterization tests documentam o comportamento atual
// Não importa se o comportamento é correto — importa que não mude enquanto refatora.

// CJS → ESM: legacyFormat vs newFormat (Intl.NumberFormat)
// Os formatos são diferentes — legacyFormat usa replace('.', ','),
// newFormat usa Intl com separador de milhar e espaço não-quebrável.

// Passo 1: log temporário para capturar inputs/outputs reais de produção
// Passo 2: colete inputs/outputs por 1 semana
// Passo 3: transforme em testes — use toMatchSnapshot() para output complexo
