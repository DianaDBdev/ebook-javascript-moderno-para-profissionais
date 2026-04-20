// strangler-fig.js — Seção 13.2: Strangler Fig Pattern + Feature Flags + Canary
// Capítulo 13 — Migrando Projetos Legados
//
// Execute: node exemplos/strangler-fig.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.2 — O Strangler Fig Pattern
// ─────────────────────────────────────────────────────────────

console.log('=== Strangler Fig Pattern ===\n');

// O nome vem de uma figueira que cresce ao redor de uma árvore hospedeira,
// gradualmente substituindo-a — sem derrubar a original enquanto a nova não está pronta.

// Fases:
// Fase 1: Legado (100%) | Novo (0%)   ← em desenvolvimento
// Fase 2: Legado (70%)  | Novo (30%)  ← /api/v2/users, novas features
// Fase 3: Legado (10%)  | Novo (90%)  ← só endpoints não migrados
// Fase 4: Legado (0%)   | Novo (100%) ← legado desligado

const fases = [
  { fase: 1, legado: 100, novo: 0,   desc: 'em desenvolvimento' },
  { fase: 2, legado: 70,  novo: 30,  desc: '/api/v2/users, novas features' },
  { fase: 3, legado: 10,  novo: 90,  desc: 'só endpoints não migrados' },
  { fase: 4, legado: 0,   novo: 100, desc: 'legado desligado' },
];

fases.forEach(({ fase, legado, novo, desc }) => {
  const legBar = '█'.repeat(Math.round(legado / 10));
  const newBar = '░'.repeat(Math.round(novo / 10));
  console.log(`  Fase ${fase}: Legado ${String(legado).padStart(3)}% ${legBar}${newBar} Novo ${String(novo).padStart(3)}%  ← ${desc}`);
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.2 — Feature Flags
// ─────────────────────────────────────────────────────────────

console.log('\n=== Feature Flags — controle granular ===\n');

// feature-flags.ts:
// interface FeatureFlags {
//   useNewUserService:    boolean;
//   useNewPaymentFlow:    boolean;
//   useNewDashboard:      boolean;
// }
//
// export async function getFeatureFlags(userId?: string): Promise<FeatureFlags> {
//   const env = process.env.NODE_ENV;
//   return {
//     // Ativo em staging, testando com 10% dos usuários em produção
//     useNewUserService: env === 'staging'
//       || (env === 'production' && isInBucket(userId, 0.1)),
//     // Só para equipe interna
//     useNewPaymentFlow: isInternalUser(userId),
//     // Desativado — em desenvolvimento
//     useNewDashboard:   false,
//   };
// }

// Hash determinístico — mesmo usuário sempre no mesmo bucket:
// function isInBucket(userId, percentage) {
//   if (!userId) return false;
//   const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
//   // distribuição simples — para produção, use crypto.createHash('sha256')
//   return (hash % 100) < (percentage * 100);
// }

// Simula feature flags
function isInBucket(userId, percentage) {
  if (!userId) return false;
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 100) < (percentage * 100);
}

const users = ['user-001', 'user-042', 'user-100', 'user-777', 'user-999'];
console.log('Rollout de 10% para useNewUserService:');
users.forEach(userId => {
  const inBucket = isInBucket(userId, 0.1);
  console.log(`  ${userId}: ${inBucket ? '✅ novo serviço' : '⬜ serviço legado'}`);
});

console.log('\nVantagem das feature flags:');
console.log('  • Rollback instantâneo sem deploy — basta desativar a flag');
console.log('  • Rollout gradual: 1% → 5% → 20% → 50% → 100%');
console.log('  • Cada etapa fica 1 semana em observação');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.2 — Canary releases — rollout gradual no nginx
// ─────────────────────────────────────────────────────────────

console.log('\n=== Canary releases (nginx) ===\n');

const nginxConfig = `
# nginx.conf — rollout gradual
upstream backend {
  server legacy:3000  weight=95;  # 95% tráfego
  server new:3000     weight=5;   #  5% tráfego (canary)
}
# Após 1 semana sem incidentes → weight=80/20
# Após mais 1 semana          → weight=50/50
# Após mais 1 semana          → weight=0/100
# Desligar legado após 2 semanas de 100%
`.trim();

console.log(nginxConfig);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.2 — Ordem de migração por prioridade
// ─────────────────────────────────────────────────────────────

console.log('\n=== Ordem segura de migração ===\n');

const ordemMigracao = [
  { camada: '1. Utilitários e helpers',      motivo: 'sem dependências, mais fáceis de testar' },
  { camada: '2. Validação e formatação',     motivo: 'lógica pura, zero side effects' },
  { camada: '3. Serviços de infraestrutura', motivo: 'logger, cache, config — usados por todos' },
  { camada: '4. Entidades e regras de negócio', motivo: 'coração do sistema' },
  { camada: '5. Serviços de aplicação',      motivo: 'orquestração' },
  { camada: '6. Controllers e rotas',        motivo: 'última camada a migrar' },
];

ordemMigracao.forEach(({ camada, motivo }) => {
  console.log(`  ${camada.padEnd(38)}: ${motivo}`);
});

console.log('\n  Esta ordem garante que cada módulo migrado tem suas dependências já estáveis.');
console.log('  Evita o anti-padrão: "migrei A mas B ainda usa a versão antiga de A".');

// hash determinístico — mesmo usuário sempre no mesmo bucket (produção: use crypto.createHash('sha256'))
// rollback instantâneo sem deploy — basta desativar a flag
