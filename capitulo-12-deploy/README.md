# Capítulo 12 — Deploy Moderno

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Edge Functions: middleware de auth, geolocalização, A/B testing e SSR na borda
- VPS vs Serverless vs Containers: trade-offs reais para cada cenário
- CI/CD com GitHub Actions: quality gate, deploy automático e aprovação para produção
- Secrets e variáveis de ambiente: validação com Zod no startup
- Observabilidade: logs (Pino), métricas (Prometheus), traces (OpenTelemetry), Sentry, health check
- Performance budgets: Lighthouse CI, size-limit, Web Vitals em produção
- Caso Real: de deploy manual (30min) a pipeline automatizado — 92% menos bugs

---

## Estrutura

```
capitulo-12-deploy/
├── .github/workflows/
│   ├── ci.yml                ← Quality gate em todo PR
│   ├── deploy-staging.yml    ← Deploy automático no merge em main
│   └── deploy-prod.yml       ← Deploy com aprovação manual
├── config/
│   └── env.ts                ← Validação de env vars com Zod
└── exemplos/
    ├── edge-middleware.ts    ← Edge Functions (auth, geo, A/B, Cloudflare)
    ├── infra-comparison.js   ← VPS/PM2, Lambda, Dockerfile, docker-compose
    ├── observabilidade.ts    ← Pino, Prometheus, OpenTelemetry, Sentry, health
    └── performance-budget.js ← Lighthouse CI, size-limit, Web Vitals
```

---

## Como executar

```bash
cd capitulo-12-deploy
npm install   # instala tsx + typescript + zod

npx tsx exemplos/edge-middleware.ts
node    exemplos/infra-comparison.js
npx tsx config/env.ts
npx tsx exemplos/observabilidade.ts
node    exemplos/performance-budget.js
```

---

## Mapa por seção

### 12.1 — Edge Computing

```
Tradicional: Usuário (SP) → Servidor (us-east-1) → 180ms
Edge:        Usuário (SP) → Edge PoP (SP)         → 8ms  (-95%)

Casos de uso: auth middleware, i18n, A/B testing, Edge SSR
Limitação: sem Node.js APIs, sem filesystem, 50ms CPU
```

```ts
// Next.js Edge Middleware — auth sem ir ao servidor de origem
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  const payload = await verifyToken(token);
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  return response;
}
```

### 12.2 — VPS vs Serverless vs Containers

| | VPS | Serverless | Containers |
|---|---|---|---|
| Custo | Fixo | Por uso | Por uso/instância |
| Escala | Manual | Automática | Semi-automática |
| Cold start | Nenhum | 50ms–5s | Baixo |
| Operação | Alta | Baixa | Média |
| Melhor para | WebSockets, estado | APIs, webhooks | Microserviços, portabilidade |

```dockerfile
# Multi-stage build — 800MB → 150MB (-81%)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm ci --only=production
COPY . . && RUN npm run build

FROM node:20-alpine AS runner
RUN addgroup -S app && adduser -S app -G app
USER app  # não-root por segurança
COPY --from=builder /app/dist ./dist
HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/app.js"]
```

### 12.3 — CI/CD

```yaml
# ci.yml — roda em todo PR
jobs:
  quality:
    services:
      postgres: # banco no CI — testes de integração reais!
        image: postgres:16
    steps:
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:run -- --coverage
      - run: npm run build
      - run: npm run size   # falha se bundle ultrapassar limite
      - run: npx playwright test
```

**Secrets:** Nunca commite — use GitHub Secrets para CI e secret manager para runtime.

```ts
// config/env.ts — validação com Zod no startup
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET:   z.string().min(32),
  NODE_ENV:     z.enum(['development', 'production', 'test']),
  PORT:         z.coerce.number().default(3000),
});
export const env = envSchema.parse(process.env); // ZodError imediato se faltar algo
```

### 12.4 — Observabilidade

```ts
// Pino — logs estruturados (pesquisáveis)
logger.info({ userId: '123', action: 'create' }, 'User created');
// { "level":30, "userId":"123", "msg":"User created", "time":1704067200000 }

// Correlation ID — rastrear request completo
req.log = logger.child({ correlationId: crypto.randomUUID() });

// Health check
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([ db.raw('SELECT 1'), redis.ping() ]);
  res.status(allOk ? 200 : 503).json({ status: 'healthy' | 'degraded', checks });
});

// Sentry — 10% em prod, 100% em staging
Sentry.init({ tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0 });
```

### 12.5 — Performance Budgets

```js
// lighthouserc.js
assertions: {
  'categories:performance':   ['error', { minScore: 0.9 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  'total-byte-weight':        ['error', { maxNumericValue: 500_000 }], // 500KB
}

// size-limit — falha o CI se bundle ultrapassar
{ "path": "dist/assets/index.*.js", "limit": "200 KB" }

// Web Vitals — onFID foi substituído por onINP na web-vitals v3+
import { onCLS, onINP, onLCP } from 'web-vitals';
```

---

## Caso Real — Startup SaaS, 5 devs, 4 semanas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Deploy | Manual SSH (30min) | Automático (4min staging / 8min prod) |
| Bugs/semana | 3–4 | 0,3 (-92%) |
| Incidentes/trimestre | 3 | 0 |
| Onboarding deploy | 2 dias | 30 minutos |

**Lição mais valiosa:** Subir o banco como service container no CI foi a virada — passaram a ter testes de integração reais. 23 erros detectados na primeira semana, zero em produção depois.

---

## Recursos

- [Fly.io docs](https://fly.io/docs)
- [GitHub Actions docs](https://docs.github.com/en/actions)
- [Pino logger](https://getpino.io)
- [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [size-limit](https://github.com/ai/size-limit)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
