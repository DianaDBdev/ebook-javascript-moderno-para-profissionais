// graphql-client.js — Seção 9.3: GraphQL com Apollo Server + DataLoader
// Capítulo 9 — Além do REST: Quando e Por Quê
//
// Execute: node exemplos/graphql-client.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.3 — O que GraphQL resolve
// ─────────────────────────────────────────────────────────────

console.log('=== GraphQL: o que resolve ===\n');

// 1. Cliente especifica exatamente o que quer (sem overfetching):
// query { user(id: "123") { name email } }
// → REST retornaria 11 KB; GraphQL retorna só os 2 campos pedidos

// 2. Uma query, múltiplos recursos (sem underfetching):
// query {
//   user(id: "123") {
//     name
//     posts { title comments { text author { name } } }
//   }
// }
// → REST equivalente: 3+ requests em série

// ─────────────────────────────────────────────────────────────
// Implementação Apollo Server — schema + resolvers
// ─────────────────────────────────────────────────────────────

// import { ApolloServer } from '@apollo/server';
// apollo-server foi descontinuado na v4 — use @apollo/server em projetos novos
// import { gql } from 'graphql-tag';

// Schema — define o contrato:
// const typeDefs = gql`
//   type User {
//     id:    ID!
//     name:  String!
//     email: String!
//     posts: [Post!]!
//   }
//   type Post {
//     id:     ID!
//     title:  String!
//     author: User!
//   }
//   type Query {
//     user(id: ID!): User
//     users: [User!]!
//   }
//   type Mutation {
//     createUser(name: String!, email: String!): User!
//   }
// `;

// Resolvers — implementam o schema:
const resolvers = {
  Query: {
    user:  async (_, { id }) => db.user.findById(id),
    users: async ()         => db.user.findAll(),
  },
  Mutation: {
    createUser: async (_, { name, email }) => db.user.create({ name, email }),
  },
  User: {
    posts: async (user) => db.post.findByUserId(user.id),
  },
  Post: {
    author: async (post) => db.user.findById(post.authorId),
  },
};

// const server = new ApolloServer({ typeDefs, resolvers });
// server.listen().then(({ url }) => console.log(`GraphQL: ${url}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.3 — O problema N+1 (armadilha obrigatória de conhecer)
// ─────────────────────────────────────────────────────────────

console.log('=== Problema N+1 ===\n');

// query { users { name posts { title } } }
// Com 100 usuários: 1 query para users + 100 queries para posts = 101 queries!

// Solução: DataLoader — batching automático
// import DataLoader from 'dataloader';

// const postLoader = new DataLoader(async (userIds) => {
//   // 1 query para buscar posts de TODOS os userIds de uma vez
//   const posts = await db.post.findByUserIds(userIds);
//   // Agrupar por userId — retornar na ordem correta
//   return userIds.map(id => posts.filter(p => p.authorId === id));
// });

// const resolvers = {
//   User: {
//     posts: (user) => postLoader.load(user.id), // Batching automático
//   },
// };
// → Resultado: 2 queries totais (users + todos os posts)

// 💡 DataLoader deve ser criado POR REQUEST, não compartilhado globalmente —
//    além do risco de vazamento de dados entre usuários, um DataLoader global
//    acumularia cache indefinidamente.

// Simulação do efeito N+1 vs DataLoader:
async function simulateNPlusOne(users, findPostsByUserId, findAllPostsByUserIds) {
  console.log(`Sem DataLoader (${users.length} usuários):`);
  let queries = 0;

  // Sem DataLoader — N+1
  const withoutDL = await Promise.all(users.map(async u => {
    queries++;
    return findPostsByUserId(u.id);
  }));
  queries++; // a query inicial de users
  console.log(`  Total de queries: ${queries} (1 + ${users.length})`);

  // Com DataLoader — batching
  queries = 0;
  queries++; // query de users
  queries++; // 1 query batched para todos os posts
  console.log(`Com DataLoader (${users.length} usuários):`);
  console.log(`  Total de queries: ${queries} (1 + 1) — independente do nº de usuários`);
}

const fakeUsers = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `User ${i+1}` }));
await simulateNPlusOne(
  fakeUsers,
  (id) => Promise.resolve([{ title: `Post of ${id}` }]),
  (ids) => Promise.resolve(ids.flatMap(id => [{ authorId: id, title: `Post of ${id}` }]))
);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.3 — Subscriptions (real-time sem polling)
// ─────────────────────────────────────────────────────────────

console.log('\n=== GraphQL Subscriptions (server push) ===\n');

// Schema — adicionar subscription:
// const typeDefs = gql`
//   type Subscription {
//     metricsUpdated: Metrics!
//   }
// `;

// Resolver — publica via PubSub:
// const resolvers = {
//   Subscription: {
//     metricsUpdated: {
//       subscribe: () => pubsub.asyncIterator(['METRICS_UPDATED']),
//       // versões recentes do graphql-subscriptions usam asyncIterableIterator
//     },
//   },
// };

// Cliente — escuta mudanças em tempo real:
// client.subscribe({
//   query: gql`subscription { metricsUpdated { views users } }`
// }).subscribe({
//   next: ({ data }) => updateDashboard(data.metricsUpdated),
// });
// → Sem polling — servidor faz push APENAS quando há mudança real

// Caso Real — Fase 2 da migração (seção do caso real):
// Substituímos 40% do tráfego que era polling desnecessário.
// dashboard(period: "7d") { metrics activity alerts } — 1 request vs 12 REST

console.log('Polling vs Subscriptions:');
console.log('  setInterval 5s (polling):   request a cada 5s, 90% retorna "nada novo"');
console.log('  GraphQL subscription:        server push APENAS quando há mudança real');
console.log('  Impacto: eliminamos 40% do tráfego total (Caso Real)');

// ─────────────────────────────────────────────────────────────
// Quando usar GraphQL — e quando não usar
// ─────────────────────────────────────────────────────────────

console.log('\n=== Quando usar GraphQL ===\n');

const usar = [
  'Apps mobile com 3G/4G — bandwidth caro, overfetching mata a UX',
  'Múltiplos clients com necessidades diferentes — web A/B/C, mobile A/D/E',
  'Agregação de múltiplos backends — GraphQL como BFF',
  'Real-time com subscriptions — sem polling',
];
const naoUsar = [
  'API pública com rate limiting — query complexa gera 100 queries no banco',
  'CRUD simples sem overfetching real — blog com 3 endpoints é overkill',
  'Time pequeno sem experiência — curva no cliente E no servidor',
  'Cache HTTP é crítico — GraphQL usa POST, cache nativo não funciona',
];

console.log('✅ Use GraphQL quando:');
usar.forEach(u => console.log(`   • ${u}`));
console.log('\n❌ Evite GraphQL quando:');
naoUsar.forEach(n => console.log(`   • ${n}`));

// Análise de custo (Caso Real):
// const server = new ApolloServer({
//   plugins: [costAnalysisPlugin({ maximumCost: 1000 })],
// });

// DataLoader deve ser criado por request (não compartilhado globalmente):
// além do risco de vazamento de dados entre usuários, um DataLoader global
// acumularia cache indefinidamente; instâncias por request são descartadas.

// Depois da migração — 1 request com GraphQL substituiu 12 requests REST:
// query Dashboard($period: String!) {
//   dashboard(period: $period) { metrics activity alerts }
// }
