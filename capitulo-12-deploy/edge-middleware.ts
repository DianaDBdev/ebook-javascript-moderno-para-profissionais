// edge-middleware.ts — Seção 12.1: Edge Functions e Edge Computing
// Capítulo 12 — Deploy Moderno
//
// Execute: npx tsx exemplos/edge-middleware.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 12.1 — O que é edge computing
// ─────────────────────────────────────────────────────────────

// Arquitetura tradicional vs Edge:
// Usuário (São Paulo) → Servidor (us-east-1)    → 180ms de latência
// Usuário (São Paulo) → Edge PoP (São Paulo)    → 8ms de latência
// → 95% menos latência para o usuário final

// Limitações das Edge Functions:
//   • Sem acesso a APIs Node.js completas — apenas Web APIs padrão
//   • Sem sistema de arquivos
//   • Tempo de execução limitado (tipicamente 50ms de CPU)
//   • Sem conexão direta com banco de dados (use HTTP ou edge-compatible DBs)

// ─────────────────────────────────────────────────────────────
// 1. Middleware de autenticação — sem ir ao servidor de origem
// ─────────────────────────────────────────────────────────────

// middleware.ts — Next.js Edge Middleware
// import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken } from './lib/auth'; // Edge-compatible
//
// export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] };
//
// export async function middleware(request: NextRequest) {
//   const token = request.cookies.get('auth-token')?.value;
//   if (!token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
//   try {
//     const payload = await verifyToken(token);
//     // Passar info do usuário para as rotas via header
//     const response = NextResponse.next();
//     response.headers.set('x-user-id',   payload.userId);
//     response.headers.set('x-user-role',  payload.role);
//     return response;
//   } catch {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
// }

// ─────────────────────────────────────────────────────────────
// 2. Geolocalização e personalização
// ─────────────────────────────────────────────────────────────

// export async function middleware(request: NextRequest) {
//   const country = request.geo?.country ?? 'US';
//   const locale  = countryToLocale[country] ?? 'en';
//   if (!request.nextUrl.pathname.startsWith(`/${locale}`)) {
//     return NextResponse.redirect(
//       new URL(`/${locale}${request.nextUrl.pathname}`, request.url)
//     );
//   }
//   return NextResponse.next();
// }

// ─────────────────────────────────────────────────────────────
// 3. A/B Testing sem latência de servidor
// ─────────────────────────────────────────────────────────────

// export async function middleware(request: NextRequest) {
//   let bucket = request.cookies.get('ab-bucket')?.value;
//   if (!bucket) {
//     bucket = Math.random() < 0.5 ? 'control' : 'variant';
//   }
//   const response = NextResponse.next();
//   response.cookies.set('ab-bucket', bucket, { maxAge: 86400 });
//   // maxAge: 86400 = 1 dia. Para testes mais longos, aumente ou use ID de usuário persistente
//   response.headers.set('x-ab-bucket', bucket);
//   return response;
// }

// ─────────────────────────────────────────────────────────────
// 4. Edge SSR com Cloudflare Workers
// ─────────────────────────────────────────────────────────────

// worker.ts — Cloudflare Worker
// import { renderToReadableStream } from 'react-dom/server';
// import App from './App';
//
// export default {
//   async fetch(request: Request): Promise<Response> {
//     const stream = await renderToReadableStream(<App />);
//     return new Response(stream, {
//       headers: {
//         'Content-Type':  'text/html',
//         'Cache-Control': 'public, max-age=60',
//       },
//     });
//   },
// };

// ─────────────────────────────────────────────────────────────
// Demo executável — simula lógica de edge middleware
// ─────────────────────────────────────────────────────────────

console.log('=== Edge Functions — casos de uso ===\n');

// Simular middleware de autenticação
function simulateAuthMiddleware(token: string | null): { action: string; headers?: Record<string, string> } {
  if (!token) return { action: 'redirect /login' };
  try {
    // Simula verifyToken (JWT decode sem biblioteca)
    const payload = token === 'valid-token'
      ? { userId: 'u123', role: 'admin' }
      : null;
    if (!payload) throw new Error('Invalid');
    return {
      action:  'next()',
      headers: { 'x-user-id': payload.userId, 'x-user-role': payload.role },
    };
  } catch {
    return { action: 'redirect /login' };
  }
}

console.log('Auth middleware:');
console.log('  sem token:', simulateAuthMiddleware(null));
console.log('  token inválido:', simulateAuthMiddleware('invalid'));
console.log('  token válido:', simulateAuthMiddleware('valid-token'));

// Simular A/B testing determinístico
function simulateABTest(existingBucket?: string): { bucket: string; isNew: boolean } {
  if (existingBucket === 'control' || existingBucket === 'variant') {
    return { bucket: existingBucket, isNew: false };
  }
  const bucket = Math.random() < 0.5 ? 'control' : 'variant';
  return { bucket, isNew: true };
}

console.log('\nA/B Testing:');
console.log('  novo usuário:', simulateABTest());
console.log('  usuário com bucket:', simulateABTest('control'));

// Latência: edge vs origem
console.log('\n=== Latência: edge vs origem ===\n');
const latencias = [
  { usuario: 'São Paulo (BR)',  origem: '180ms', edge: '8ms',  reducao: '-95%' },
  { usuario: 'Londres (UK)',    origem: '210ms', edge: '12ms', reducao: '-94%' },
  { usuario: 'Tóquio (JP)',     origem: '320ms', edge: '6ms',  reducao: '-98%' },
  { usuario: 'Nova York (US)',  origem: '95ms',  edge: '4ms',  reducao: '-96%' },
];
latencias.forEach(({ usuario, origem, edge, reducao }) => {
  console.log(`  ${usuario.padEnd(20)}: origem=${origem.padEnd(7)} edge=${edge.padEnd(6)} (${reducao})`);
});

console.log('\n💡 Edge Functions brilham em:');
['Middleware de auth sem ir ao servidor de origem',
 'i18n e redirecionamento por país/idioma',
 'A/B testing sem latência adicional',
 'Cache inteligente e personalização na borda',
].forEach(u => console.log(`  • ${u}`));

console.log('\n⚠️  Para lógica de negócio pesada com banco → prefira serverless tradicional');
