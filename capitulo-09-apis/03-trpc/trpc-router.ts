// trpc-router.ts — Seção 9.4: tRPC — type-safety end-to-end
// Capítulo 9 — Além do REST: Quando e Por Quê
//
// Execute: npx tsx exemplos/trpc-router.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.4 — O problema com REST tradicional
// ─────────────────────────────────────────────────────────────

// ❌ Backend sem tipos:
// app.post('/users', (req, res) => {
//   const { name, email } = req.body; // any!
// });

// ❌ Frontend sem garantias:
// const user = await fetch('/users', {
//   method: 'POST',
//   body: JSON.stringify({ name: 'Maria', emal: '...' }), // Typo! Só falha em runtime
// }).then(r => r.json()); // any!

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.4 — tRPC: tipos compartilhados automaticamente
// ─────────────────────────────────────────────────────────────

// Backend — server/router.ts:
// import { initTRPC } from '@trpc/server';
// import { z }        from 'zod';
//
// const t = initTRPC.create();
//
// export const appRouter = t.router({
//   getUser: t.procedure
//     .input(z.object({ id: z.string() }))
//     .query(async ({ input }) => {
//       return db.user.findById(input.id);
//       // Retorno inferido automaticamente pelo TypeScript
//     }),
//   createUser: t.procedure
//     .input(z.object({
//       name:  z.string().min(2),
//       email: z.string().email(),
//     }))
//     .mutation(async ({ input }) => {
//       return db.user.create(input);
//     }),
// });
//
// export type AppRouter = typeof appRouter;

// Frontend — client/trpc.ts:
// import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
// import type { AppRouter } from '../server/router'; // Só o tipo!
//
// const trpc = createTRPCProxyClient<AppRouter>({
//   links: [httpBatchLink({ url: 'http://localhost:3000/trpc' })],
// });
//
// ✅ Autocomplete completo:
// const user = await trpc.getUser.query({ id: '123' });
//              ↑ Tipado: { id: string; name: string; email: string }
//
// ✅ Erro em compile-time:
// await trpc.createUser.mutate({
//   name:  'Maria',
//   email: 'nao-e-email', // ❌ TypeScript error imediato — não chega em runtime
// });
//
// ✅ Refatoração segura:
// Renomear 'getUser' no backend → TypeScript avisa no frontend imediatamente

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.4 — tRPC com React Query
// ─────────────────────────────────────────────────────────────

// // App.tsx — setup dos providers
// import { createTRPCReact } from '@trpc/react-query';
// import type { AppRouter }  from './server/router';
// export const trpc = createTRPCReact<AppRouter>();
//
// function App() {
//   return (
//     <trpc.Provider client={trpcClient} queryClient={queryClient}>
//       <QueryClientProvider client={queryClient}>
//         <UserProfile />
//       </QueryClientProvider>
//     </trpc.Provider>
//   );
// }
//
// // UserProfile.tsx — uso nos componentes
// function UserProfile() {
//   const { data, isLoading } = trpc.getUser.useQuery({ id: '123' });
//                               ↑ Tipado automaticamente — sem any, sem cast
//   const createUser = trpc.createUser.useMutation({
//     onSuccess: () => utils.getUser.invalidate(),
//     // utils = trpc.useUtils() — declare antes: const utils = trpc.useUtils()
//   });
// }

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.4 — Setup do servidor com Express
// ─────────────────────────────────────────────────────────────

// import express from 'express';
// import { createExpressMiddleware } from '@trpc/server/adapters/express';
// import { appRouter } from './router';
//
// const app = express();
// app.use('/trpc', createExpressMiddleware({
//   router: appRouter,
//   createContext: ({ req }) => ({
//     user: req.user, // Passa contexto (autenticação, etc.)
//   }),
// }));
// app.listen(3000);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.4 — Quando usar tRPC
// ─────────────────────────────────────────────────────────────

const usarTRPC = [
  'Monorepo TypeScript — frontend e backend no mesmo repositório',
  'Time full TypeScript — todo mundo domina TS',
  'API interna — você controla cliente e servidor',
  'Rapidez de desenvolvimento — zero boilerplate, mudanças refletem instantaneamente',
];

const naoUsarTRPC = [
  'API pública — clientes em Python, Go, mobile nativo não conseguem usar',
  'Times separados — backend em Java ou Go, tipos não compartilham',
  'Documentação OpenAPI é requisito — Swagger não funciona com tRPC',
];

console.log('=== tRPC: quando usar ===\n');
console.log('✅ Use tRPC quando:');
usarTRPC.forEach(u => console.log(`   • ${u}`));
console.log('\n❌ Evite tRPC quando:');
naoUsarTRPC.forEach(n => console.log(`   • ${n}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 9.5 — Comparação: mesma feature nas 3 abordagens
// ─────────────────────────────────────────────────────────────

console.log('\n=== Mesma feature: usuário + 5 posts recentes ===\n');

// REST — 2 requests, overfetching:
console.log('REST:');
console.log('  const user  = await fetch(\'/users/123\').then(r => r.json());');
console.log('  const posts = await fetch(`/users/123/posts?limit=5`).then(r => r.json());');
console.log('  + Simples  − 2 round-trips, overfetching de campos\n');

// GraphQL — 1 request, só os campos necessários:
console.log('GraphQL:');
console.log('  query { user(id: "123") { name email posts(limit: 5) { title createdAt } } }');
console.log('  + 1 request, campos exatos  − Precisa Apollo, schema, resolvers, DataLoader\n');

// tRPC — 1 request, types automáticos:
console.log('tRPC:');
console.log('  const data = await trpc.getUserWithPosts.query({ id: "123", limit: 5 });');
console.log('  ↑ Totalmente tipado — autocomplete no IDE');
console.log('  + Types automáticos, 1 request  − Ainda pode ter overfetching de campos\n');

// Fluxograma de decisão:
console.log('Fluxograma simplificado:');
console.log('  Monorepo TS + API interna?     → tRPC');
console.log('  Mobile + overfetching real?    → GraphQL');
console.log('  API pública ou CRUD simples?   → REST');
console.log('  Qualquer coisa?                → Fetch moderno (AbortController etc.)');
