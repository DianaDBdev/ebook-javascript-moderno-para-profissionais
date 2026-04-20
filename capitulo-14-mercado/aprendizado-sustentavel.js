// aprendizado-sustentavel.js — Seção 14.3: Como se manter atualizado sem burnout
// Capítulo 14 — Skills para o Mercado Atual
//
// Execute: node exemplos/aprendizado-sustentavel.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.3 — O problema do FOMO técnico
// ─────────────────────────────────────────────────────────────

console.log('=== Aprendizado sustentável sem burnout ===\n');

console.log('O problema do FOMO técnico:');
console.log('  A maioria das "novas" tecnologias desaparece em 18 meses.');
console.log('  As que sobrevivem têm tempo para você aprender antes do mercado exigir.\n');
console.log('  React: 3 anos de "biblioteca do Facebook" para padrão do mercado');
console.log('  TypeScript: 4 anos para se tornar pré-requisito padrão');
console.log('\n💡 Você tem tempo — mas precisa de um sistema para identificar o que vale.\n');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.3 — Sistema dos três horizontes
// ─────────────────────────────────────────────────────────────

console.log('=== Sistema dos três horizontes ===\n');

const horizontes = {
  'Horizonte 1 — Domínio profundo (70% do tempo de aprendizado)': {
    desc: 'Tecnologias que você usa no trabalho — seu objetivo é DOMÍNIO, não familiaridade',
    exemplos: [
      'Se usa React: entenda profundamente o modelo mental, reconciliation, Server Components',
      'Se usa TypeScript: explore tipos avançados, inferência, decorators',
      'Se usa Node.js: entenda o event loop, streams, cluster mode',
    ],
  },
  'Horizonte 2 — Acompanhamento consciente (20% do tempo)': {
    desc: 'Tecnologias com alta probabilidade de se tornarem relevantes em 1–2 anos',
    exemplos: [
      'Leia a documentação principal — não tutoriais',
      'Construa 1 projeto pequeno para ter experiência própria',
      'Acompanhe o roadmap oficial sem tentar aprender tudo',
    ],
  },
  'Horizonte 3 — Radar (10% do tempo)': {
    desc: 'Tecnologias novas — apenas monitore sem investir tempo agora',
    exemplos: [
      'Leia o anúncio e o problema que resolve',
      'Marque para revisitar em 6 meses',
      'Se ainda estiver crescendo, mova para Horizonte 2',
    ],
  },
};

for (const [nome, { desc, exemplos }] of Object.entries(horizontes)) {
  console.log(`  ${nome}:`);
  console.log(`    ${desc}`);
  exemplos.forEach(e => console.log(`    • ${e}`));
  console.log();
}

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.3 — Fontes filtradas de qualidade
// ─────────────────────────────────────────────────────────────

console.log('=== Fontes de qualidade — filtradas ===\n');

const fontes = {
  'Alta qualidade, baixo ruído': [
    'changelog.md dos projetos que você usa — a fonte primária mais ignorada',
    'RFCs e discussions do GitHub de TypeScript, React, Vite',
    'Tech blogs: engineering.atspotify.com, netflixtechblog.com, shopify.engineering',
    'State of JS / State of CSS anuais — fotografia do ecossistema',
    'JavaScript Weekly (javascriptweekly.com) — newsletter com 200k+ assinantes, curada',
  ],
  'Filtrar com cuidado': [
    'Twitter/X — muito ruído, muito hype, pouco sinal. Use com moderação',
    'YouTube — bom para introdução, ruim para profundidade',
    'Medium/dev.to — qualidade variável. Verifique a fonte antes de confiar',
  ],
};

for (const [cat, itens] of Object.entries(fontes)) {
  console.log(`  ${cat}:`);
  itens.forEach(i => console.log(`    • ${i}`));
  console.log();
}
console.log('⚠️  Cada fonte que você adiciona tem um custo de atenção.');
console.log('   Seja tão seletivo com fontes quanto com dependências de código.\n');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.3 — A regra dos 20 minutos por dia
// ─────────────────────────────────────────────────────────────

console.log('=== A regra dos 20 minutos por dia ===\n');
console.log('Consistência bate intensidade em aprendizado técnico.');
console.log('20 min/dia > maratona de 8h no fim de semana.\n');

const rotina = [
  { dia: 'Segunda–sexta', atividade: '20 min de changelog, RFC ou artigo de engenharia' },
  { dia: 'Sábado',        atividade: '1–2h de projeto pessoal aplicando algo novo' },
  { dia: 'Domingo',       atividade: 'Revisão: o que aprendeu, o que quer explorar mais' },
];
rotina.forEach(({ dia, atividade }) => {
  console.log(`  ${dia.padEnd(15)}: ${atividade}`);
});
console.log('\n  O projeto do sábado é a parte mais importante.');
console.log('  Ler sobre TypeScript avançado ≠ usar TypeScript avançado num problema real.\n');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.3 — Aprendizado em público
// ─────────────────────────────────────────────────────────────

console.log('=== Aprendizado em público — o multiplicador ===\n');
console.log('Compartilhar o processo de aprendizado (não apenas os resultados):');
console.log('  • Thread sobre o que aprendeu sobre Suspense');
console.log('  • Post no LinkedIn sobre uma migração difícil');
console.log('  • Vídeo curto de uma solução elegante\n');

const beneficios = [
  'Força você a articular o que aprendeu — melhor forma de solidificar',
  'Atrai pessoas com os mesmos interesses — networking orgânico',
  'Cria histórico público de aprendizado — melhor portfólio que lista de skills',
  'Gera feedback que acelera seu aprendizado',
];
console.log('Por que funciona:');
beneficios.forEach(b => console.log(`  ✓ ${b}`));
console.log('\n💡 "Aprendi X hoje, aqui está o que entendi" é mais valioso do que silêncio');
console.log('   esperando ter algo perfeito para compartilhar.');

// Simulação: score de tecnologias para priorizar
console.log('\n=== Exercício: como priorizar o que aprender ===\n');

function scoreToLearn(tech) {
  const { demandaMercado, relevanciaProjeto, curvaAprendizado, estadoEcossistema } = tech.scores;
  // Alta demanda, alta relevância, baixa curva, ecossistema maduro = prioridade alta
  return (demandaMercado * 2 + relevanciaProjeto * 2 + (6 - curvaAprendizado) + estadoEcossistema);
}

const tecnologias = [
  { nome: 'tRPC',               scores: { demandaMercado: 3, relevanciaProjeto: 5, curvaAprendizado: 2, estadoEcossistema: 4 } },
  { nome: 'Astro',              scores: { demandaMercado: 3, relevanciaProjeto: 2, curvaAprendizado: 2, estadoEcossistema: 4 } },
  { nome: 'Bun',                scores: { demandaMercado: 2, relevanciaProjeto: 1, curvaAprendizado: 1, estadoEcossistema: 3 } },
  { nome: 'React Server Comp.', scores: { demandaMercado: 5, relevanciaProjeto: 5, curvaAprendizado: 4, estadoEcossistema: 4 } },
];

const sorted = tecnologias
  .map(t => ({ ...t, score: scoreToLearn(t) }))
  .sort((a, b) => b.score - a.score);

console.log('Prioridade de aprendizado (exemplo):');
sorted.forEach(({ nome, score }, i) => {
  console.log(`  ${i + 1}. ${nome.padEnd(25)}: score ${score}`);
});
console.log('\n  (Adapte os pesos para o seu contexto — este é apenas um framework)');

// React demorou 3 anos de "biblioteca do Facebook" para padrão do mercado
// TypeScript demorou 4 anos para virar pré-requisito padrão
// Lição: você tem tempo, mas precisa de um sistema para identificar o que vale
