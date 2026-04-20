// env.ts — Seção 12.3: Validação de variáveis de ambiente com Zod
// Capítulo 12 — Deploy Moderno
//
// Execute: npx tsx config/env.ts
//
// Instale: npm install zod

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// SEÇÃO 12.3 — Gerenciamento de secrets e env vars
// ─────────────────────────────────────────────────────────────

// .env.example — versionar no repo (sem valores reais)
// DATABASE_URL=postgres://user:pass@host:5432/db
// JWT_SECRET=change-me-in-production
// STRIPE_KEY=sk_test_...
//
// .env — NÃO versionar (.gitignore)
// DATABASE_URL=postgres://real:realpass@prod-host:5432/prod
// JWT_SECRET=super-secret-prod-key
// STRIPE_KEY=sk_live_...

// Validar no startup da aplicação — falha rápido:
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET:   z.string().min(32),
  PORT:         z.coerce.number().default(3000),
  NODE_ENV:     z.enum(['development', 'production', 'test']),
  // Opcionais
  SENTRY_DSN:   z.string().url().optional(),
  LOG_LEVEL:    z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
});

// Em produção: export const env = envSchema.parse(process.env);
// Se qualquer variável faltou → ZodError imediato no startup
// Muito melhor que descobrir em runtime

// ─────────────────────────────────────────────────────────────
// Demo executável — simula validação de env vars
// ─────────────────────────────────────────────────────────────

console.log('=== Validação de variáveis de ambiente ===\n');

function validateEnv(rawEnv: Record<string, string | undefined>) {
  try {
    return { success: true, data: envSchema.parse(rawEnv), error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, data: null, error: err.issues ?? err.errors ?? [] };
    }
    throw err;
  }
}

// Cenário 1: env válido
const validEnv = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  JWT_SECRET:   'super-secret-key-de-producao-32chars!',
  PORT:         '3000',
  NODE_ENV:     'production',
};
const result1 = validateEnv(validEnv);
console.log('Env válido:', result1.success ? '✅ OK' : '❌ Erro');
if (result1.data) {
  console.log('  PORT (coercido para number):', typeof result1.data.PORT, result1.data.PORT);
  console.log('  LOG_LEVEL (default):', result1.data.LOG_LEVEL);
}

// Cenário 2: env inválido — startup falha imediatamente
const invalidEnv = {
  DATABASE_URL: 'nao-e-uma-url',   // não é URL
  JWT_SECRET:   'curto',            // menos de 32 chars
  PORT:         '3000',
  NODE_ENV:     'invalid-env',      // não é enum válido
};
const result2 = validateEnv(invalidEnv);
console.log('\nEnv inválido:', result2.success ? '✅ OK' : '❌ Erro');
if (result2.error) {
  result2.error.forEach(e => {
    console.log(`  ${e.path.join('.')}: ${e.message}`);
  });
}
console.log('\n💡 Falha no startup é melhor que descobrir em runtime');
console.log('   Sem essa validação: app sobe, funciona parcialmente,');
console.log('   e falha de forma inesperada no primeiro request que usa JWT');

// ⚠️ Nunca commite secrets no repositório.
// Use GitHub Secrets para CI/CD e um secret manager para runtime.
// (AWS Secrets Manager, Doppler, 1Password Secrets)
