// middleware.ts — Edge Function para autenticação (Next.js / Vercel Edge)
// Capítulo 12 — Deploy Moderno

import { NextRequest, NextResponse } from 'next/server';

// Rotas que exigem autenticação
export const config = {
  matcher: ['/dashboard/:path*', '/api/privado/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // ── Sem token → redireciona para login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // ── Valida o token (implementação real usaria jose ou similar)
    const payload = await verificarToken(token);

    // ── Passa informações do usuário via header para as rotas
    const response = NextResponse.next();
    response.headers.set('x-user-id',   payload.userId);
    response.headers.set('x-user-role',  payload.role);
    return response;

  } catch {
    // ── Token inválido → limpa cookie e redireciona
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

// ── Verificação de token (substitua por implementação real com jose)
async function verificarToken(token: string) {
  if (token === 'token-invalido') throw new Error('Token inválido');
  return { userId: '123', role: 'admin' };
}
