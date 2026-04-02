// formatters.test.ts — Testes unitários com Vitest
// Execute: npx vitest run 01-vitest-basico/

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────
// Funções sendo testadas (normalmente importadas de outro arquivo)
// ──────────────────────────────────────────────
function somar(a: number, b: number): number {
  return a + b;
}

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(valor);
}

async function buscarUsuario(id: number) {
  if (id <= 0) throw new Error('ID inválido');
  return { id, nome: 'Diana' };
}

// ──────────────────────────────────────────────
// Testes
// ──────────────────────────────────────────────
describe('somar', () => {
  it('soma dois números positivos', () => {
    expect(somar(2, 3)).toBe(5);
  });

  it('soma com zero', () => {
    expect(somar(5, 0)).toBe(5);
  });

  it('soma números negativos', () => {
    expect(somar(-1, -2)).toBe(-3);
  });
});

describe('formatarPreco', () => {
  it('formata valor em reais', () => {
    const resultado = formatarPreco(1500);
    expect(resultado).toContain('1.500');
    expect(resultado).toContain('R$');
  });

  it('formata zero corretamente', () => {
    expect(formatarPreco(0)).toContain('0,00');
  });
});

describe('buscarUsuario', () => {
  it('retorna usuário para ID válido', async () => {
    const user = await buscarUsuario(1);
    expect(user).toEqual({ id: 1, nome: 'Diana' });
  });

  it('lança erro para ID inválido', async () => {
    await expect(buscarUsuario(-1)).rejects.toThrow('ID inválido');
  });
});

// ──────────────────────────────────────────────
// Mocks com vi.fn()
// ──────────────────────────────────────────────
describe('mocks', () => {
  it('mock de função', () => {
    const mockFetch = vi.fn().mockResolvedValue({ dados: 'ok' });

    expect(mockFetch).not.toHaveBeenCalled();
    mockFetch('url');
    expect(mockFetch).toHaveBeenCalledWith('url');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
