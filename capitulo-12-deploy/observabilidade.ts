// observabilidade.ts — Seção 12.4: Logs + Métricas + Traces + Sentry + Health Check
// Capítulo 12 — Deploy Moderno
//
// Execute: npx tsx exemplos/observabilidade.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 12.4 — Os três pilares da observabilidade
// ─────────────────────────────────────────────────────────────

console.log('=== Três pilares da observabilidade ===\n');
console.log('1. LOGS   — o que aconteceu');
console.log('2. MÉTRICAS — quanto está acontecendo');
console.log('3. TRACES — por que aconteceu (distributed tracing)\n');

// ─────────────────────────────────────────────────────────────
// PILAR 1: Logs estruturados com Pino
// ─────────────────────────────────────────────────────────────

// ❌ O que NÃO fazer:
// console.log('User created');  // Sem contexto
// console.log(error);           // Stack trace sem estrutura

// ✅ Logs estruturados com Pino:
// import pino from 'pino';
// const logger = pino({
//   level: process.env.LOG_LEVEL ?? 'info',
//   transport: process.env.NODE_ENV === 'development'
//     ? { target: 'pino-pretty' }  // Legível em dev
//     : undefined,                  // JSON em produção
// });
//
// logger.info({ userId: '123', action: 'create' }, 'User created');
// logger.error({ err: error, userId: '123' },       'Failed to create user');
//
// Resultado em produção (JSON — pesquisável no Datadog, CloudWatch etc.):
// { "level":30, "userId":"123", "action":"create",
//   "msg":"User created", "time":1704067200000 }

// Caso Real — middleware com correlation ID:
// app.use((req, res, next) => {
//   req.correlationId = req.headers['x-correlation-id'] ?? crypto.randomUUID();
//   res.setHeader('x-correlation-id', req.correlationId);
//   req.log = logger.child({
//     correlationId: req.correlationId,
//     method: req.method, path: req.path, userId: req.user?.id,
//   });
//   next();
// });
// "O correlation ID salvou 2 horas de debugging. Consegui rastrear
//  um bug de produção em 5 minutos pelos logs estruturados." — Tech Lead

// ─────────────────────────────────────────────────────────────
// PILAR 2: Métricas com Prometheus
// ─────────────────────────────────────────────────────────────

// import { Counter, Histogram, register } from 'prom-client';
//
// const httpRequestDuration = new Histogram({
//   name:       'http_request_duration_seconds',
//   help:       'Duration of HTTP requests in seconds',
//   labelNames: ['method', 'route', 'status_code'],
//   buckets:    [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
// });
//
// const httpRequestTotal = new Counter({
//   name:       'http_requests_total',
//   help:       'Total number of HTTP requests',
//   labelNames: ['method', 'route', 'status_code'],
// });
//
// // Middleware Express
// app.use((req, res, next) => {
//   const end = httpRequestDuration.startTimer();
//   res.on('finish', () => {
//     const labels = {
//       method:      req.method,
//       route:       req.route?.path ?? req.path,
//       status_code: res.statusCode.toString(),
//     };
//     end(labels);
//     httpRequestTotal.inc(labels);
//   });
//   next();
// });
//
// // Endpoint para o Prometheus coletar
// app.get('/metrics', async (req, res) => {
//   res.set('Content-Type', register.contentType);
//   res.send(await register.metrics());
// });

// ─────────────────────────────────────────────────────────────
// PILAR 3: Traces com OpenTelemetry
// ─────────────────────────────────────────────────────────────

// import { NodeSDK }           from '@opentelemetry/sdk-node';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
//
// const sdk = new NodeSDK({
//   traceExporter: new OTLPTraceExporter({
//     url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
//   // Instrumenta automaticamente: HTTP, Express, banco, Redis, gRPC
//   // Sem mudar o código de negócio!
// });
// sdk.start();

// ─────────────────────────────────────────────────────────────
// Alertas inteligentes — Prometheus Alertmanager
// ─────────────────────────────────────────────────────────────

// alerting-rules.yml:
// groups:
//   - name: api
//     rules:
//       # Taxa de erro acima de 5% por 5 minutos
//       - alert: HighErrorRate
//         expr: >
//           sum(rate(http_requests_total{status_code=~"5.."}[5m]))
//           / sum(rate(http_requests_total[5m])) > 0.05
//         for: 5m
//         labels: { severity: critical }
//
//       # Latência p95 acima de 2s
//       - alert: HighLatency
//         expr: >
//           histogram_quantile(0.95,
//             rate(http_request_duration_seconds_bucket[5m])
//           ) > 2
//         for: 5m
//         labels: { severity: warning }

// ─────────────────────────────────────────────────────────────
// Sentry — error tracking em produção
// ─────────────────────────────────────────────────────────────

// import * as Sentry from '@sentry/node';
// Sentry.init({
//   dsn:              process.env.SENTRY_DSN,
//   environment:      process.env.NODE_ENV,
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//   // 10% em prod, 100% em staging
//   profilesSampleRate: 1.0,
// });
//
// try {
//   await riskyOperation();
// } catch (err) {
//   Sentry.captureException(err, {
//     extra: { userId, operation: 'riskyOperation' },
//   });
//   throw err;
// }

// ─────────────────────────────────────────────────────────────
// Health check — /health endpoint
// ─────────────────────────────────────────────────────────────

// app.get('/health', async (req, res) => {
//   const checks = await Promise.allSettled([
//     db.raw('SELECT 1').then(() => ({ name: 'database', status: 'ok' })),
//     redis.ping().then(()   => ({ name: 'redis',    status: 'ok' })),
//   ]);
//   const results = checks.map((c, i) => ({
//     name:   ['database', 'redis'][i],
//     status: c.status === 'fulfilled' ? 'ok' : 'error',
//     error:  c.status === 'rejected'  ? c.reason.message : undefined,
//   }));
//   const allOk = results.every(r => r.status === 'ok');
//   res.status(allOk ? 200 : 503).json({
//     status:    allOk ? 'healthy' : 'degraded',
//     uptime:    process.uptime(),
//     timestamp: new Date().toISOString(),
//     checks:    results,
//   });
// });
// 💡 Load balancers e Kubernetes usam /health para remover instâncias degradadas.

// ─────────────────────────────────────────────────────────────
// Demo executável — simula os três pilares
// ─────────────────────────────────────────────────────────────

// Simula Pino logger estruturado
class StructuredLogger {
  private context: Record<string, unknown>;
  constructor(context = {}) { this.context = context; }
  child(extra: Record<string, unknown>) { return new StructuredLogger({ ...this.context, ...extra }); }
  info(data: Record<string, unknown> | string, msg?: string) {
    const log = typeof data === 'string'
      ? { ...this.context, msg: data }
      : { ...this.context, ...data, msg };
    console.log(`  [INFO]  ${JSON.stringify(log)}`);
  }
  error(data: Record<string, unknown> | string, msg?: string) {
    const log = typeof data === 'string'
      ? { ...this.context, msg: data }
      : { ...this.context, ...data, msg };
    console.error(`  [ERROR] ${JSON.stringify(log)}`);
  }
}

const logger = new StructuredLogger({ service: 'api', version: '1.0.0' });

console.log('=== Pino logger estruturado ===\n');
logger.info({ userId: '123', action: 'create' }, 'User created');
logger.error({ err: { message: 'duplicate key' }, userId: '123' }, 'Failed to create user');

const requestLogger = logger.child({ correlationId: 'abc-123', method: 'POST', path: '/users' });
requestLogger.info({ statusCode: 201, duration: 45 }, 'Request completed');

// Simula Prometheus métricas
console.log('\n=== Prometheus métricas (simuladas) ===\n');

interface Metric { count: number; sum: number; }
const metrics = new Map<string, Metric>();

function recordRequest(method: string, route: string, statusCode: number, durationMs: number) {
  const key = `${method}:${route}:${statusCode}`;
  const m   = metrics.get(key) ?? { count: 0, sum: 0 };
  m.count++;
  m.sum += durationMs;
  metrics.set(key, m);
}

// Simular requests
[
  ['GET', '/users', 200, 45],
  ['POST', '/users', 201, 120],
  ['GET', '/users', 200, 38],
  ['GET', '/users/999', 404, 15],
  ['POST', '/users', 500, 3200],
].forEach(([m, r, s, d]) => recordRequest(m as string, r as string, s as number, d as number));

console.log('Métricas coletadas:');
metrics.forEach((m, key) => {
  const [method, route, status] = key.split(':');
  console.log(`  ${method} ${route} ${status}: count=${m.count}, avg=${Math.round(m.sum/m.count)}ms`);
});

// Taxa de erro
const total  = Array.from(metrics.values()).reduce((s, m) => s + m.count, 0);
const errors = Array.from(metrics.entries())
  .filter(([k]) => k.split(':')[2].startsWith('5'))
  .reduce((s, [, m]) => s + m.count, 0);
console.log(`\nTaxa de erro: ${((errors/total)*100).toFixed(1)}% (${errors}/${total} requests)`);

// Health check simulado
console.log('\n=== Health check simulado ===\n');

async function healthCheck(dbOk: boolean, redisOk: boolean) {
  const checks = [
    { name: 'database', status: dbOk ? 'ok' : 'error', error: dbOk ? undefined : 'Connection refused' },
    { name: 'redis',    status: redisOk ? 'ok' : 'error', error: redisOk ? undefined : 'ECONNREFUSED' },
  ];
  const allOk = checks.every(c => c.status === 'ok');
  return {
    status:    allOk ? 'healthy' : 'degraded',
    httpCode:  allOk ? 200 : 503,
    uptime:    process.uptime().toFixed(2) + 's',
    timestamp: new Date().toISOString(),
    checks,
  };
}

const healthy   = await healthCheck(true, true);
const degraded  = await healthCheck(true, false);

console.log(`/health (tudo OK):   HTTP ${healthy.httpCode} — ${healthy.status}`);
console.log(`  checks: ${healthy.checks.map(c => `${c.name}=${c.status}`).join(', ')}`);
console.log(`/health (Redis down): HTTP ${degraded.httpCode} — ${degraded.status}`);
console.log(`  checks: ${degraded.checks.map(c => `${c.name}=${c.status}`).join(', ')}`);
console.log('\n💡 Load balancer remove instâncias com status 503 automaticamente');

// ─────────────────────────────────────────────────────────────
// Caso Real — métricas antes e depois (seção 12.3)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso Real: startup SaaS, 5 devs, 4 semanas ===\n');

const casoReal = {
  antes: {
    deploy:           'Manual via SSH — processo de 30 minutos',
    bugsRegressao:    '3–4 bugs de regressão por semana em produção',
    incidentes:       '3 incidentes em 6 meses',
    staging:          'Nenhum — testava direto em produção',
    onboarding:       '2 dias só para conseguir fazer deploy',
  },
  depois: {
    deployStaging:    'Automático — 4 minutos após merge',
    deployProd:       '8 minutos com aprovação manual',
    bugsRegressao:    '0,3 por semana em produção  (-92%)',
    incidentes:       '0 em 3 meses',
    onboarding:       '30 minutos (ler o README)',
  },
};

console.log('Antes:');
Object.entries(casoReal.antes).forEach(([k, v]) => {
  console.log(`  ${k.padEnd(15)}: ${v}`);
});

console.log('\nDepois:');
Object.entries(casoReal.depois).forEach(([k, v]) => {
  console.log(`  ${k.padEnd(15)}: ${v}`);
});

// "A primeira semana com o CI foi um choque — 23 erros que não sabíamos que existiam."
console.log('\n💬 "A primeira semana com o CI foi um choque — 23 erros que não sabíamos que existiam. Mas valeu a pena descobrir ali, não em produção." — Dev Pleno');
