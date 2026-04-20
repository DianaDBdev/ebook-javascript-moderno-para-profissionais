// opensource-guide.js — Seção 14.5: Contribuindo para Open Source estrategicamente
// Capítulo 14 — Skills para o Mercado Atual
//
// Execute: node exemplos/opensource-guide.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.5 — O caminho progressivo de contribuição
// ─────────────────────────────────────────────────────────────

console.log('=== Contribuindo para Open Source ===\n');

console.log('O medo comum:');
console.log('  "Meu código não é bom o suficiente"');
console.log('  → Maintainers recebem mil issues sem solução para cada PR com boa correção.\n');

const verdades = [
  'Corrigir um typo na documentação é uma contribuição real e bem-vinda',
  'Reportar um bug com reprodução mínima ajuda mais do que 90% dos usuários',
  'Responder dúvidas em Discussions do GitHub é contribuição valiosa',
  'Maintainers são pessoas — na maioria das vezes, gentis com quem tenta ajudar',
];
console.log('Verdades sobre contribuição:');
verdades.forEach(v => console.log(`  • ${v}`));

// ─────────────────────────────────────────────────────────────
// O caminho progressivo
// ─────────────────────────────────────────────────────────────

console.log('\n=== O caminho progressivo ===\n');

const niveis = [
  {
    nivel: 'Nível 1 — Documentação (a porta de entrada)',
    passos: [
      'Encontre um projeto que você usa com documentação confusa',
      'Abra um issue descrevendo o que ficou confuso',
      'Proponha melhoria no texto',
      'Abra um PR com a mudança — geralmente muito bem recebido',
    ],
  },
  {
    nivel: 'Nível 2 — Reprodução de bugs',
    passos: [
      'Encontre um issue aberto sem reprodução mínima',
      'Tente reproduzir o bug em um repositório mínimo',
      'Comente no issue com seu repositório de reprodução',
      'Isso já te coloca na lista de "pessoas que ajudaram"',
    ],
  },
  {
    nivel: 'Nível 3 — Bugs pequenos e bem definidos',
    passos: [
      'Filtre issues com labels: good-first-issue, help-wanted, bug+easy',
      'Projetos com boa cultura: microsoft/TypeScript, vitejs/vite, trpc/trpc, colinhacks/zod',
      'Leia as contribuições existentes antes de começar',
      'Comente que está trabalhando no issue para evitar duplicação',
    ],
  },
  {
    nivel: 'Nível 4 — Features e melhorias',
    passos: [
      'Sempre abra um issue ANTES de implementar uma feature',
      'Pergunte se a feature é desejada e está alinhada com a direção do projeto',
      'Aguarde feedback antes de escrever código',
      'Um PR rejeitado por falta de discussão é tempo perdido',
    ],
  },
];

niveis.forEach(({ nivel, passos }) => {
  console.log(`  ${nivel}:`);
  passos.forEach(p => console.log(`    → ${p}`));
  console.log();
});

// Labels para encontrar bons issues:
console.log('Labels para encontrar issues para iniciantes:');
console.log('  label:good-first-issue');
console.log('  label:help-wanted');
console.log('  label:bug + label:easy');
console.log('  (explore a aba "Labels" de cada repo — não há padronização universal)\n');

// Projetos com boa cultura:
console.log('Projetos com boa cultura de contribuição:');
['microsoft/TypeScript', 'vitejs/vite', 'testing-library/react-testing-library',
 'prisma/prisma', 'trpc/trpc', 'colinhacks/zod'].forEach(p => console.log(`  → ${p}`));

// ─────────────────────────────────────────────────────────────
// Como escrever issues e PRs que são aceitos
// ─────────────────────────────────────────────────────────────

console.log('\n=== Issue bem escrito ===\n');

const issueExemplo = `
## Descrição
Ao usar trpc.createUser.mutate() com email inválido,
o erro retornado não inclui o campo específico que falhou.

## Comportamento atual
{ error: 'Validation failed' }  // Sem detalhes

## Comportamento esperado
{ error: 'Validation failed', field: 'email', message: 'Invalid email' }

## Reprodução mínima
https://github.com/user/trpc-repro

## Ambiente
tRPC: 11.0.0 | Node.js: 20.10 | TypeScript: 5.3
`.trim();

issueExemplo.split('\n').forEach(l => console.log(`  ${l}`));

console.log('\n=== PR bem escrito ===\n');

const prExemplo = `
## Problema
Fecha #1234. Erros de validação Zod não incluíam o campo
específico na resposta, dificultando debugging no cliente.

## Mudança
- Extraído o path do ZodError para incluir na resposta
- Adicionado tipo FieldError no pacote client

## Testes
- Adicionado teste unitário para o formatter de erro
- Adicionado teste de integração para o caso de email inválido

## Breaking change?
Não — apenas adiciona campo opcional na resposta
`.trim();

prExemplo.split('\n').forEach(l => console.log(`  ${l}`));

// ─────────────────────────────────────────────────────────────
// Criando seu próprio open source
// ─────────────────────────────────────────────────────────────

console.log('\n=== Criando seu próprio open source ===\n');

const criterios = [
  'Você usa a ferramenta em pelo menos um projeto real',
  'Não encontrou equivalente de qualidade no npm',
  'Tem tempo para responder issues e PRs (mesmo que raramente)',
];
console.log('Critérios para publicar:');
criterios.forEach(c => console.log(`  ✓ ${c}`));

const checklist = [
  'README com problema, solução, instalação e exemplos',
  'TypeScript com tipos exportados',
  'Testes com cobertura razoável',
  'CI configurado — badge de CI passando no README',
  'Semantic versioning e CHANGELOG',
  'Licença (MIT para a maioria dos casos)',
];
console.log('\nChecklist antes de publicar:');
checklist.forEach(c => console.log(`  ☐ ${c}`));

// Comandos de publicação:
console.log('\nPublicando no npm:');
console.log('  npm login');
console.log('  npm publish --access public');
console.log('\n  Para packages com namespace:');
console.log('  # package.json: "name": "@seuusuario/nome-do-pacote"');
console.log('  npm publish --access public');

// Caso Real — biblioteca @br-validators
console.log('\n=== Caso Real: @br-validators (Ano 2 do desenvolvedor) ===\n');
console.log('  # @seu-nome/br-validators — biblioteca de validação de CPF/CNPJ em TypeScript');
console.log('  500 stars em 8 meses');
console.log('  Usado por 3 empresas conhecidas no mercado');
console.log('  Apareceu em 2 newsletters de JavaScript');
console.log('\n  Resultado: proposta de empresa internacional (remoto, US$ 3.500/mês)');
console.log('\n💡 Uma lib com 50 stars e 5 usuários reais demonstra mais competência');
console.log('   do que 10 projetos de Todo List.');
