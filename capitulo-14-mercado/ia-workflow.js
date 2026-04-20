// ia-workflow.js — Seção 14.6: IA no workflow de desenvolvimento
// Capítulo 14 — Skills para o Mercado Atual
//
// Execute: node exemplos/ia-workflow.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.6 — IA no workflow em 2026
// ─────────────────────────────────────────────────────────────

console.log('=== IA no workflow de desenvolvimento (2026) ===\n');

console.log('Pesquisas recentes: ~85% dos desenvolvedores usam IA regularmente no trabalho.');
console.log('Deixou de ser diferencial — virou expectativa básica do mercado.\n');

// As três ferramentas dominantes:
const ferramentas = [
  {
    nome:    'GitHub Copilot',
    tipo:    'Extensão IDE',
    melhorEm: 'Autocomplete inline, sugestões contextuais, abertura de PRs',
    usarQuando: 'Já vive no ecossistema GitHub, quer integração nativa ao VS Code/JetBrains',
  },
  {
    nome:    'Cursor',
    tipo:    'IDE nativo de IA',
    melhorEm: 'Contexto de codebase inteiro, refatorações complexas multi-arquivo',
    usarQuando: 'Quer IA como parceiro de arquitetura, não apenas autocomplete',
  },
  {
    nome:    'Claude Code',
    tipo:    'Agente de linha de comando',
    melhorEm: 'Tarefas multi-arquivo, raciocínio arquitetural, código com explicação profunda',
    usarQuando: 'Quer trabalhar no terminal, precisa de raciocínio passo a passo complexo',
  },
];

console.log('As três ferramentas dominantes:\n');
ferramentas.forEach(({ nome, tipo, melhorEm, usarQuando }) => {
  console.log(`  ${nome} (${tipo}):`);
  console.log(`    Melhor em:    ${melhorEm}`);
  console.log(`    Usar quando:  ${usarQuando}`);
  console.log();
});

// ─────────────────────────────────────────────────────────────
// O que empresas esperam
// ─────────────────────────────────────────────────────────────

console.log('=== O que empresas esperam ===\n');

const esperam = [
  'Usar IA para acelerar tarefas repetitivas (boilerplate, testes, docs)',
  'Revisar e entender o código gerado — não apenas aceitar sugestões',
  'Saber quando IA não é a ferramenta certa (lógica de negócio complexa, segurança crítica)',
  'Manter qualidade: TypeScript + testes + code review continuam essenciais',
];
esperam.forEach(e => console.log(`  ✓ ${e}`));

// ─────────────────────────────────────────────────────────────
// Como desenvolver essa habilidade
// ─────────────────────────────────────────────────────────────

console.log('\n=== Como desenvolver habilidade com IA ===\n');

const como = [
  'Comece com tarefas de baixo risco: gerar testes, escrever documentação, criar boilerplate',
  'Sempre leia e entenda o código gerado antes de commitar',
  'Use IA para aprender: peça explicações, não apenas código',
  'Construa o hábito de prompt engineering — como você descreve o problema importa muito',
];
como.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));

console.log('\n💡 A habilidade de 2026 não é saber usar IA. É saber quando não usar — e por quê.\n');

// ─────────────────────────────────────────────────────────────
// Prompts que funcionam (bônus)
// ─────────────────────────────────────────────────────────────

console.log('=== Prompts que funcionam bem ===\n');

const prompts = [
  {
    tarefa: 'Gerar testes',
    prompt: 'Escreva testes Vitest para esta função. Cubra: caso feliz, entrada inválida, e edge cases de [especifique]. Use TypeScript. Não use mocks desnecessários.',
  },
  {
    tarefa: 'Revisar código',
    prompt: 'Revise este código e aponte: bugs ou comportamentos inesperados, antipadrões JavaScript/TypeScript, oportunidades de otimização, problemas de segurança evidentes.',
  },
  {
    tarefa: 'Refatorar',
    prompt: 'Refatore esta função para ser mais legível e testável. Mantenha a mesma interface pública. Explique cada mudança e o motivo.',
  },
  {
    tarefa: 'Migrar CJS → ESM',
    prompt: 'Converta este código CommonJS para ESM (Node.js 20+). Trate __dirname, __filename e imports de JSON. Adicione extensões .js nos imports relativos.',
  },
  {
    tarefa: 'Explicar código legado',
    prompt: 'Explique o que este código faz, quais são seus side effects, e por que pode ter sido escrito desta forma. Não sugira refatorações ainda.',
  },
];

prompts.forEach(({ tarefa, prompt }) => {
  console.log(`  ${tarefa}:`);
  console.log(`    "${prompt}"`);
  console.log();
});

// ─────────────────────────────────────────────────────────────
// Uso responsável — limitações que importam
// ─────────────────────────────────────────────────────────────

console.log('=== Limitações que importam ===\n');

const limitacoes = [
  { area: 'Lógica de negócio crítica',  cuidado: 'IA pode gerar código plausível mas incorreto para regras específicas do domínio' },
  { area: 'Segurança',                  cuidado: 'Nunca aceite código de autenticação/autorização sem revisão profunda' },
  { area: 'Código com estado global',   cuidado: 'IA não conhece o histórico e contexto completo do seu projeto' },
  { area: 'APIs legadas proprietárias', cuidado: 'IA treinou em código público — pode não conhecer suas APIs internas' },
];

limitacoes.forEach(({ area, cuidado }) => {
  console.log(`  ${area}:`);
  console.log(`    ⚠️  ${cuidado}`);
  console.log();
});

console.log('Regra: quanto maior o risco do código, maior a necessidade de revisão humana.');
