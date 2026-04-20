// streaming-suspense.tsx — Seção 11.4: Streaming SSR + Suspense + React Server Components
// Capítulo 11 — Server-Side Rendering (SSR): Fundamentos
//
// Execute: npx tsx exemplos/streaming-suspense.tsx

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.4 — O problema do SSR tradicional
// ─────────────────────────────────────────────────────────────

// Componente lento:
// async function SlowDashboard() {
//   const data = await fetchAnalytics(); // 2 segundos
//   return <div>{data.metrics}</div>;
// }
// ⚠️ Sem streaming: servidor espera 2s para enviar QUALQUER HTML.
//    Um componente lento atrasa TODO o HTML.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.4 — Streaming com Suspense (React 18+)
// ─────────────────────────────────────────────────────────────

// import { Suspense } from 'react';
//
// function Dashboard() {
//   return (
//     <html><body>
//       <h1>Dashboard</h1>         {/* Enviado imediatamente — 100ms */}
//
//       <Suspense fallback={<Skeleton />}>
//         <UserProfile />           {/* 200ms */}
//       </Suspense>
//
//       <Suspense fallback={<Skeleton />}>
//         <RecentActivity />        {/* 300ms */}
//       </Suspense>
//
//       <Suspense fallback={<Skeleton />}>
//         <Analytics />             {/* 2s */}
//       </Suspense>
//     </body></html>
//   );
// }

// Timeline COM streaming:
//   100ms  — HTML inicial: título + skeletons visíveis
//   300ms  — UserProfile pronto → skeleton substituído
//   400ms  — RecentActivity pronto → streaming
//   2100ms — Analytics pronto → streaming
//   Resultado: usuário vê conteúdo em 100ms, não espera 2s inteiros!

// 💡 Selective hydration (React 18): componentes são hydratados individualmente —
//    o usuário pode interagir com partes prontas enquanto outras ainda carregam.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.4 — React Server Components (RSC)
// ─────────────────────────────────────────────────────────────

// 💡 Nota 2026: RSC atingiu maturidade de produção com o React 19 (dezembro 2024),
//    validado no React 19.2. É o modelo de SSR dominante para vagas e projetos novos em 2026.
//    Next.js (App Router) e Remix já usam RSC nativamente.

// Server Component — roda APENAS no servidor, zero JS enviado ao cliente:
// async function UserProfile({ userId }) {
//   const user = await db.users.findById(userId);
//   // Acesso direto ao banco — use o contexto do usuário autenticado
//   // para não expor dados de outros usuários
//   return <div><h2>{user.name}</h2><p>{user.bio}</p></div>;
// }

// Comparação: SPA (waterfall) vs RSC (direto):
//
// ❌ SPA — 3 round-trips (waterfall):
// function UserProfile({ userId }) {
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//     fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
//   }, [userId]);
//   if (!user) return <Spinner />;
//   return <div>{user.name}</div>;
// }
// Timeline: HTML → JS download → fetch /api/users → render
//
// ✅ RSC — acesso direto, zero waterfall, zero JS no cliente:
// async function UserProfile({ userId }) {
//   const user = await db.users.findById(userId); // Direto!
//   return <div>{user.name}</div>;
// }

// ─────────────────────────────────────────────────────────────
// Demo executável — simula streaming sem framework
// ─────────────────────────────────────────────────────────────

console.log('=== Streaming SSR — simulação de timeline ===\n');

interface Component {
  name:    string;
  delayMs: number;
}

// Simula o envio progressivo de chunks HTML
async function simulateStreamingSSR(components: Component[]) {
  const startTime  = Date.now();
  const delivered: { name: string; ms: number }[] = [];

  // HTML inicial enviado imediatamente
  console.log('→ [0ms]   HTML inicial enviado (título + skeletons)');

  const promises = components.map(async ({ name, delayMs }) => {
    await new Promise(r => setTimeout(r, delayMs));
    const elapsed = Date.now() - startTime;
    delivered.push({ name, ms: elapsed });
    console.log(`→ [${String(elapsed).padStart(4)}ms] ${name} pronto — skeleton substituído`);
  });

  await Promise.all(promises);
  return delivered;
}

// Sem streaming — tudo bloqueado pelo mais lento
async function simulateTraditionalSSR(components: Component[]) {
  const startTime = Date.now();
  const maxDelay  = Math.max(...components.map(c => c.delayMs));
  await new Promise(r => setTimeout(r, maxDelay));
  const elapsed = Date.now() - startTime;
  console.log(`→ [${elapsed}ms] HTML enviado de uma vez (esperou o mais lento)`);
  return elapsed;
}

const components: Component[] = [
  { name: 'UserProfile',   delayMs: 200 },
  { name: 'RecentActivity', delayMs: 300 },
  { name: 'Analytics',     delayMs: 600 }, // Reduzido para demo rápido
];

console.log('Com Streaming (React 18 + Suspense):');
await simulateStreamingSSR(components);

console.log('\nSem Streaming (SSR tradicional):');
const totalMs = await simulateTraditionalSSR(components);

console.log('\n=== Comparação ===');
console.log(`Streaming:         conteúdo em ~0ms  (esqueleto imediato)`);
console.log(`SSR tradicional:   conteúdo em ~${totalMs}ms (esperou o mais lento)`);
console.log('Benefício: usuário vê UI instantaneamente com Streaming');

// ─────────────────────────────────────────────────────────────
// Selective hydration
// ─────────────────────────────────────────────────────────────

console.log('\n=== Selective Hydration (React 18) ===\n');

const hydrationOrder = [
  { component: '<h1>Dashboard</h1>',    ms: 100, interactive: false },
  { component: '<UserProfile />',        ms: 250, interactive: true  },
  { component: '<RecentActivity />',    ms: 380, interactive: true  },
  { component: '<Analytics />',          ms: 2100, interactive: true },
];

console.log('Ordem de hydration:');
hydrationOrder.forEach(({ component, ms, interactive }) => {
  const status = interactive ? '🎮 interativo' : '📄 estático';
  console.log(`  [~${String(ms).padStart(4)}ms] ${component.padEnd(30)} → ${status}`);
});

console.log('\n💡 Com selective hydration:');
console.log('   Usuário pode clicar em UserProfile antes de Analytics carregar');
console.log('   React prioriza hydration do componente com interação do usuário');

// ─────────────────────────────────────────────────────────────
// RSC vs Client Components — regras de uso
// ─────────────────────────────────────────────────────────────

console.log('\n=== RSC vs Client Components ===\n');

const rules = {
  'Server Component (padrão no App Router)': [
    'Busca de dados — acesso direto ao banco/API',
    'Lógica que não precisa de interatividade',
    'Componentes que reduzem JS no cliente',
    'Zero JS enviado ao browser',
  ],
  "Client Component ('use client')": [
    'Estado local (useState, useReducer)',
    'Efeitos (useEffect)',
    'Event listeners (onClick, onChange)',
    'APIs de browser (localStorage, window)',
  ],
};

for (const [tipo, usos] of Object.entries(rules)) {
  console.log(`${tipo}:`);
  usos.forEach(u => console.log(`  • ${u}`));
  console.log();
}
