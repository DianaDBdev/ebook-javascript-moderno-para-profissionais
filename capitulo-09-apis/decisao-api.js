// decisao-api.js — Seção 9.5 + Caso Real: comparação e migração REST→GraphQL
// Capítulo 9 — Além do REST: Quando e Por Quê
//
// Execute: node exemplos/decisao-api.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.5 — Tabela de decisão
// ─────────────────────────────────────────────────────────────

console.log('=== Tabela de decisão: REST vs GraphQL vs tRPC ===\n');

const tabela = [
  { criterio: 'Complexidade de setup',   REST: 'Baixa',  GraphQL: 'Alta',   tRPC: 'Média' },
  { criterio: 'API pública',             REST: '✅',     GraphQL: '⚠️',    tRPC: '❌'    },
  { criterio: 'Cache HTTP nativo',       REST: '✅',     GraphQL: '❌',     tRPC: '✅'   },
  { criterio: 'Overfetching',            REST: 'Sim',    GraphQL: 'Resolve', tRPC: 'Parcial' },
  { criterio: 'Underfetching',           REST: 'Sim',    GraphQL: 'Resolve', tRPC: 'Resolve' },
  { criterio: 'Real-time',              REST: 'Polling', GraphQL: 'Subscriptions', tRPC: 'Via WS' },
  { criterio: 'Type-safety automático', REST: '❌',      GraphQL: 'Geração', tRPC: '✅ nativo' },
  { criterio: 'Documentação',           REST: 'OpenAPI', GraphQL: 'Playground', tRPC: 'TypeScript' },
  { criterio: 'Clientes non-TS',        REST: '✅',      GraphQL: '✅',     tRPC: '❌' },
  { criterio: 'Curva de aprendizado',   REST: 'Baixa',   GraphQL: 'Alta',   tRPC: 'Média' },
];

const w = { criterio: 28, REST: 12, GraphQL: 14, tRPC: 12 };
console.log(`${'Critério'.padEnd(w.criterio)} ${'REST'.padEnd(w.REST)} ${'GraphQL'.padEnd(w.GraphQL)} ${'tRPC'.padEnd(w.tRPC)}`);
console.log('-'.repeat(w.criterio + w.REST + w.GraphQL + w.tRPC + 3));
tabela.forEach(({ criterio, REST, GraphQL, tRPC }) => {
  console.log(`${criterio.padEnd(w.criterio)} ${REST.padEnd(w.REST)} ${GraphQL.padEnd(w.GraphQL)} ${tRPC}`);
});

// ─────────────────────────────────────────────────────────────
// CASO REAL — Migração REST → GraphQL (seção 9.5)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso Real: dashboard analytics, 200k usuários/dia, 6 meses ===\n');

// Diagnóstico antes da migração:
const diagnostico = {
  loadTime3G:        '4,5 s',
  bandwidthSessao:   '2,1 MB',
  requestsPorView:   '12–15',
  percentPolling:    '40% do tráfego (retornava "nada novo")',
  custoMensal:       'US$ 15 mil/mês',
};

console.log('Antes:');
Object.entries(diagnostico).forEach(([k, v]) => {
  console.log(`  ${k.padEnd(20)}: ${v}`);
});

// Por que GraphQL (e não tRPC):
// • Overfetching claro e mensurável — mobile baixava JSON gigante
// • Underfetching óbvio — 12 requests para uma tela
// • Real-time necessário — dashboard atualiza em tempo real
// • Time com experiência prévia em Apollo

// Estratégia: migração incremental (manter REST + adicionar GraphQL em paralelo)
console.log('\nEstratégia: migração incremental (sem downtime)');
const fases = [
  'Fase 1: Setup + query principal (12 requests → 1)',
  'Fase 2: Real-time com subscriptions (40% polling → 0%)',
  'Fase 3: Corrigir N+1 em produção com DataLoader',
];
fases.forEach(f => console.log(`  ${f}`));

// Query de migração — antes vs depois:
console.log('\nAntes (12 requests):');
console.log('  const [metrics, activity, alerts, users, revenue, ...] = await Promise.all([');
console.log('    fetch(\'/api/metrics\'), fetch(\'/api/activity\'), fetch(\'/api/alerts\'), ...9 outros');
console.log('  ]);');

console.log('\nDepois (1 request GraphQL):');
console.log('  query Dashboard($period: String!) {');
console.log('    dashboard(period: $period) {');
console.log('      metrics   { views users revenue }');
console.log('      activity  { id type timestamp }');
console.log('      alerts    { id severity message }');
console.log('    }');
console.log('  }');

// Schema/resolver do dashboard (Caso Real):
// const resolvers = {
//   Query: {
//     dashboard: async (_, { period }, { userId }) => {
//       const [metrics, activity, alerts] = await Promise.all([
//         metricsService.get(userId, period),
//         activityService.getRecent(userId),
//         alertsService.getActive(userId),
//       ]);
//       return { metrics, activity, alerts };
//     },
//   },
// };

// DataLoader no resolver User.team (corrigiu N+1 em produção):
// const teamLoader = new DataLoader(async (teamIds) => {
//   const teams = await db.team.findByIds(teamIds);
//   return teamIds.map(id => teams.find(t => t.id === id));
// });
// User: { team: (user, _, { loaders }) => loaders.team.load(user.teamId) }

// Subscriptions — substituiu polling:
// subscribe: () => pubsub.asyncIterator(['METRICS_UPDATED'])
// versões recentes do graphql-subscriptions usam asyncIterableIterator

// Cost analysis para queries complexas:
// const server = new ApolloServer({
//   plugins: [costAnalysisPlugin({ maximumCost: 1000 })],
// });

// Resultados após 6 meses:
console.log('\n=== Resultados após 6 meses ===\n');

const resultados = [
  { metrica: 'Load time (3G)',           antes: '4,5 s',   depois: '1,8 s',  ganho: '-60%' },
  { metrica: 'Bandwidth por sessão',     antes: '2,1 MB',  depois: '450 KB', ganho: '-78%' },
  { metrica: 'Requests por pageview',    antes: '12–15',   depois: '1–2',    ganho: '-90%' },
  { metrica: 'Polling desnecessário',    antes: '40%',     depois: '0%',     ganho: 'subscriptions' },
  { metrica: 'Custo infraestrutura',    antes: '$15k/mês', depois: '$8k/mês', ganho: '-47%' },
];

resultados.forEach(({ metrica, antes, depois, ganho }) => {
  console.log(`  ${metrica.padEnd(28)}: ${antes.padEnd(10)} → ${depois.padEnd(10)} (${ganho})`);
});

console.log('\nDesafios que não estávamos esperando:');
const desafios = [
  'N+1 queries em produção → DataLoader obrigatório em todos os resolvers',
  'Query complexa travando o banco → análise de custo + limite máximo',
  'Cache invalidation difícil → Apollo Client refetchQueries',
  'Curva de aprendizado → 3 devs levaram 4 semanas para se sentir confortáveis',
];
desafios.forEach(d => console.log(`  • ${d}`));

console.log('\nLições aprendidas:');
const licoes = [
  'Meça antes de migrar — overfetching e underfetching precisam ser quantificados',
  'DataLoader é obrigatório — não é otimização, é requisito de segurança',
  'Migre incrementalmente — REST e GraphQL podem conviver no mesmo servidor',
  'Monitore query costs desde o início — não espere travar o banco em produção',
  'Reserve tempo para aprendizado — a curva do GraphQL é real, especialmente no servidor',
];
licoes.forEach(l => console.log(`  ✓ ${l}`));
