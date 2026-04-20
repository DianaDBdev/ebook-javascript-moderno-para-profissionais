// infra-comparison.js — Seção 12.2: VPS vs Serverless vs Containers
// Capítulo 12 — Deploy Moderno
//
// Execute: node exemplos/infra-comparison.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 12.2 — Tabela comparativa
// ─────────────────────────────────────────────────────────────

console.log('=== VPS vs Serverless vs Containers ===\n');

const comparacao = {
  VPS: {
    custo:       'Fixo ($5–200/mês)',
    escala:      'Manual (provisionar mais)',
    coldStart:   'Nenhum',
    operacao:    'Alta (você gerencia tudo)',
    melhorPara:  'WebSockets, estado em memória, CPU contínua',
    exemplo:     'DigitalOcean, Linode, Hetzner',
  },
  Serverless: {
    custo:       'Por uso ($0 sem tráfego)',
    escala:      'Automática (0 → milhões)',
    coldStart:   'Sim (50ms–5s)',
    operacao:    'Baixa (provedor gerencia)',
    melhorPara:  'APIs, webhooks, jobs assíncronos, tráfego imprevisível',
    exemplo:     'AWS Lambda, Vercel Functions, Cloudflare Workers',
  },
  Containers: {
    custo:       'Por uso/instância',
    escala:      'Semi-automática (HPA)',
    coldStart:   'Baixo (segundos)',
    operacao:    'Média (Kubernetes abstrai o hardware)',
    melhorPara:  'Portabilidade, microserviços, consistência dev/prod',
    exemplo:     'Docker + K8s, Fly.io, Railway, Render',
  },
};

for (const [tipo, info] of Object.entries(comparacao)) {
  console.log(`── ${tipo} ──`);
  for (const [k, v] of Object.entries(info)) {
    console.log(`  ${k.padEnd(12)}: ${v}`);
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────
// VPS — PM2 para Node.js em produção
// ─────────────────────────────────────────────────────────────

// npm install -g pm2
// pm2 start dist/app.js --name 'api' --instances max
// pm2 save && pm2 startup

// ecosystem.config.js:
// module.exports = {
//   apps: [{
//     name:       'api',
//     script:     'dist/app.js',
//     instances:  'max',          // Um processo por CPU
//     exec_mode:  'cluster',      // Cluster mode para Node.js
//     env_production: {
//       NODE_ENV: 'production',
//       PORT:     3000,
//     },
//     max_restarts:       10,
//     restart_delay:      5000,
//     max_memory_restart: '500M', // Reinicia se passar de 500MB
//   }]
// };

console.log('=== VPS + PM2 — quando usar ===\n');
const vpsQuando = [
  'WebSockets e estado persistente em memória',
  'Bancos de dados que precisam de acesso rápido ao filesystem',
  'CPU intensa e contínua (ML, processamento de vídeo)',
  'Equipe com expertise em DevOps que quer controle total',
];
vpsQuando.forEach(v => console.log(`  ✅ ${v}`));

// ─────────────────────────────────────────────────────────────
// Serverless — AWS Lambda
// ─────────────────────────────────────────────────────────────

// handler.ts — AWS Lambda com TypeScript + Zod:
// export const handler: APIGatewayProxyHandler = async (event) => {
//   try {
//     const body  = JSON.parse(event.body ?? '{}');
//     const input = createUserSchema.parse(body); // Zod validação
//     const user  = await createUser(input);
//     return {
//       statusCode: 201,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ data: user, error: null }),
//     };
//   } catch (err) {
//     if (err instanceof z.ZodError)
//       return { statusCode: 400, body: JSON.stringify({ error: err.errors }) };
//     return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
//   }
// };

// ⚠️ Cold start é o calcanhar de aquiles do serverless.
//    Use provisioned concurrency para funções críticas,
//    ou Edge Functions que têm cold start próximo de zero.

console.log('\n=== Serverless — quando usar ===\n');
const serverlessQuando = [
  'Tráfego imprevisível ou com picos (escala de 0 a 1M requests)',
  'APIs, webhooks e jobs assíncronos',
  'Time pequeno sem DevOps dedicado',
  'Budget limitado — $0 sem tráfego',
];
serverlessQuando.forEach(v => console.log(`  ✅ ${v}`));

// ─────────────────────────────────────────────────────────────
// Containers — Dockerfile otimizado
// ─────────────────────────────────────────────────────────────

const dockerfile = `
# Multi-stage build — imagem final mínima
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Imagem final — apenas o necessário
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app   # usuário não-root por segurança
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \\
  CMD wget -qO- http://localhost:3000/health || exit 1
  # sem wget: node -e "require('http').get('http://localhost:3000/health',(r)=>process.exit(r.statusCode===200?0:1))"
CMD ["node", "dist/app.js"]
`.trim();

console.log('\n=== Dockerfile multi-stage ===\n');
dockerfile.split('\n').forEach(l => console.log(`  ${l}`));
console.log('\n💡 Multi-stage builds: imagem de 800MB → 150MB (-81%)');
console.log('   Deploy mais rápido, menos custo de storage, pull time menor');

// docker-compose.yml para desenvolvimento local:
// services:
//   api:
//     build: .
//     ports: ['3000:3000']
//     environment:
//       DATABASE_URL: postgres://user:pass@db:5432/myapp
//     depends_on:
//       db: { condition: service_healthy }
//   db:
//     image: postgres:16-alpine
//     healthcheck:
//       test: ['CMD-SHELL', 'pg_isready -U user']
//       interval: 5s
//       retries: 5
// Note: 'version' no docker-compose.yml é obsoleto no Compose v2 — pode ser omitido

console.log('\n=== Containers — quando usar ===\n');
const containerQuando = [
  'Consistência entre dev, staging e produção',
  'Dependências de sistema específicas',
  'Portabilidade entre provedores de cloud',
  'Microserviços com workloads diferentes',
];
containerQuando.forEach(v => console.log(`  ✅ ${v}`));

// Nota: 'version' no docker-compose.yml é obsoleto no Docker Compose v2 — pode ser omitido sem problema.
