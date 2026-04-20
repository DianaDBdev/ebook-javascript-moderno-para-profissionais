// vitest-basico.test.ts — Seção 8.1: Anatomia de testes Vitest + Mocks
// Capítulo 8 — Testing no Mundo Moderno
//
// Execute: npx vitest run exemplos/vitest-basico.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─────────────────────────────────────────────────────────────
// Funções sendo testadas — exemplos do capítulo
// ─────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value < 0) throw new Error('Valor não pode ser negativo');
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

// Serviço simulando chamadas ao banco (para demonstrar mocks)
interface User { id: number; name: string; email: string; }
interface CreateUserInput { name: string; email: string; password: string; }

class UserService {
  constructor(
    private readonly db:    { users: { findById: (id: number) => Promise<User | null>; create: (input: CreateUserInput) => Promise<User> } },
    private readonly email: { sendWelcome: (user: User) => Promise<void> }
  ) {}

  async findById(id: number) { return this.db.users.findById(id); }

  async create(input: CreateUserInput): Promise<Omit<User, never>> {
    const existing = await this.db.users.findById(-1); // stub
    if (input.email === 'existente@ex.com') throw new Error('Email already registered');
    const user = await this.db.users.create(input);
    await this.email.sendWelcome(user);
    const { ...safeUser } = user as any;
    delete safeUser.password;
    return safeUser;
  }
}

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.1 — Anatomia de um teste Vitest
// ─────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formata valor positivo em reais', () => {
    expect(formatCurrency(1500)).toBe('R$\u00a01.500,00');
    // \u00a0 = espaço não-quebrável inserido pelo Intl.NumberFormat em pt-BR
  });

  it('formata zero corretamente', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('formata valores decimais', () => {
    expect(formatCurrency(19.9)).toBe('R$\u00a019,90');
  });

  it('lança erro para valor negativo', () => {
    expect(() => formatCurrency(-1)).toThrow('Valor não pode ser negativo');
  });
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.1 — Mocks e spies
// ─────────────────────────────────────────────────────────────

describe('vi.fn() — função mock', () => {
  it('registra chamadas e argumentos', async () => {
    const mockSave = vi.fn().mockResolvedValue({ id: 1, name: 'Maria' });

    await mockSave({ name: 'Maria' });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith({ name: 'Maria' });
  });
});

describe('vi.spyOn() — espionar função existente', () => {
  it('espiona e substitui implementação', async () => {
    const emailModule = { sendWelcome: async (_user: User) => {} };
    const sendSpy = vi.spyOn(emailModule, 'sendWelcome').mockResolvedValue(undefined);

    const mockDb = {
      users: {
        findById: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1, name: 'Maria', email: 'maria@ex.com' }),
      }
    };
    const service = new UserService(mockDb, emailModule);
    await service.create({ name: 'Maria', email: 'maria@ex.com', password: '12345678' });

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'maria@ex.com' })
    );
  });
});

describe('vi.mock() — mockar módulo inteiro', () => {
  it('usa implementação mockada', async () => {
    const mockDb = {
      users: {
        findById: vi.fn(),
        create:   vi.fn(),
        update:   vi.fn(),
      }
    };
    const mockEmail = { sendWelcome: vi.fn().mockResolvedValue(undefined) };
    const service   = new UserService(mockDb, mockEmail);

    // Configura retorno do mock para este teste
    vi.mocked(mockDb.users.findById).mockResolvedValue({
      id: 1, name: 'Maria', email: 'maria@ex.com'
    });

    const user = await service.findById(1);
    expect(user?.name).toBe('Maria');
  });
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.1 — Testes assíncronos
// ─────────────────────────────────────────────────────────────

describe('userService', () => {
  let service: UserService;

  beforeEach(() => {
    let nextId = 1;
    const users: any[] = [];
    const mockDb = {
      users: {
        findById: vi.fn((id: number) => Promise.resolve(users.find(u => u.id === id) ?? null)),
        create:   vi.fn((input: CreateUserInput) => {
          const user = { id: nextId++, ...input };
          users.push(user);
          return Promise.resolve(user);
        }),
      }
    };
    const mockEmail = { sendWelcome: vi.fn().mockResolvedValue(undefined) };
    service = new UserService(mockDb, mockEmail);
  });

  it('cria usuário com sucesso', async () => {
    const input = { name: 'Maria', email: 'maria@ex.com', password: '12345678' };
    const user  = await service.create(input);

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Maria');
    expect(user.email).toBe('maria@ex.com');
    expect(user).not.toHaveProperty('password'); // Nunca expor senha
  });

  it('rejeita email duplicado', async () => {
    const input = { name: 'João', email: 'existente@ex.com', password: '12345678' };
    await expect(service.create(input)).rejects.toThrow('Email already registered');
  });
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.1 — Matchers mais úteis (demonstração)
// ─────────────────────────────────────────────────────────────

describe('matchers úteis', () => {
  it('igualdade e propriedades', () => {
    const obj = { id: 1, name: 'Maria', email: 'maria@ex.com' };

    expect(obj.id).toBe(1);                          // Identidade (===)
    expect(obj).toEqual({ id: 1, name: 'Maria', email: 'maria@ex.com' }); // Profunda
    expect(obj).toMatchObject({ id: 1 });            // Subconjunto
    expect(obj.id).toBeDefined();
    expect(obj).toHaveProperty('name', 'Maria');

    const arr = ['a', 'b', 'c'];
    expect(arr).toHaveLength(3);
    expect(arr).toContain('b');
  });

  it('matcher parcial — objectContaining', () => {
    const user = { id: 1, name: 'Maria', email: 'maria@ex.com', role: 'admin' };
    expect(user).toEqual(expect.objectContaining({
      name:  'Maria',
      email: expect.stringContaining('@'),
    }));
  });

  it('funções e erros', () => {
    const fn = vi.fn().mockReturnValue(42);
    fn('arg1', 'arg2');
    fn('arg1', 'arg2');

    expect(fn).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(() => formatCurrency(-5)).toThrow('Valor não pode ser negativo');
  });
});

// ─────────────────────────────────────────────────────────────
// CASO REAL — Seção 8.5: Testes de lógica financeira
// ─────────────────────────────────────────────────────────────

function calculateTax(income: number): number {
  if (income <= 2112)  return 0;
  if (income <= 5000)  return income * 0.15;
  return income * 0.225;
}

describe('calculateTax — Caso Real (plataforma financeira)', () => {
  it('calcula 15% para renda até R$ 5.000', () => {
    expect(calculateTax(5000)).toBe(750);
  });

  it('calcula 22,5% para renda acima de R$ 5.000', () => {
    expect(calculateTax(10000)).toBe(2250);
  });

  it('retorna 0 para renda isenta (até R$ 2.112)', () => {
    expect(calculateTax(2112)).toBe(0);
    expect(calculateTax(0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// EXERCÍCIO 1 do capítulo — calculateBulkDiscount
// ─────────────────────────────────────────────────────────────

function calculateBulkDiscount(quantity: number, unitPrice: number): number {
  if (quantity < 0) throw new Error('Quantidade não pode ser negativa');
  if (quantity < 100)  return unitPrice * quantity;
  if (quantity < 500)  return unitPrice * quantity * 0.95;  // 5% desconto
  return unitPrice * quantity * 0.88; // 12% desconto
}

describe('calculateBulkDiscount — Exercício 1', () => {
  it('sem desconto para 0–99 itens', () => {
    expect(calculateBulkDiscount(50,  10)).toBe(500);
    expect(calculateBulkDiscount(99,  10)).toBe(990);
  });

  it('5% de desconto para 100–499 itens', () => {
    expect(calculateBulkDiscount(100, 10)).toBe(950);
    expect(calculateBulkDiscount(499, 10)).toBeCloseTo(4740.5);
  });

  it('12% de desconto para 500+ itens', () => {
    expect(calculateBulkDiscount(500, 10)).toBe(4400);
    expect(calculateBulkDiscount(1000, 10)).toBe(8800);
  });

  it('casos de borda — limites exatos', () => {
    expect(calculateBulkDiscount(0,   10)).toBe(0);
    expect(calculateBulkDiscount(100, 10)).toBe(950);  // Primeiro item com desconto
    expect(calculateBulkDiscount(500, 10)).toBe(4400); // Segundo tier
  });

  it('lança erro para quantidade negativa', () => {
    expect(() => calculateBulkDiscount(-1, 10)).toThrow('Quantidade não pode ser negativa');
  });
});
