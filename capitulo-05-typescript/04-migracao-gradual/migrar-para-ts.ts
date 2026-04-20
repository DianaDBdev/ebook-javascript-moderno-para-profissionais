// migrar-para-ts.ts — Seção 5.6 + Caso Real: Migração JS→TS gradual
// Capítulo 5 — TypeScript: O Novo Normal
//
// Execute: npx tsx exemplos/migrar-para-ts.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 5.6 — Migração em 5 etapas
// ─────────────────────────────────────────────────────────────

// ETAPA 1: Instalar sem quebrar nada
//   npm install -D typescript @types/node
//   # tsconfig.json com strict: false e allowJs: true → ver tsconfig.migration.json
//   # zero mudanças no código — time nem percebe

// ETAPA 2: Renomear arquivos por prioridade
//   mv src/utils/validators.js  src/utils/validators.ts
//   mv src/services/UserService.js src/services/UserService.ts
//   # Deixe pages e componentes complexos para depois
//   ⚠️ Não renomeie tudo de uma vez — migre por módulo, garanta testes passando

// ETAPA 3: Corrigir erros com any temporário

// ❌ any com TODO — aceitável temporariamente
// function processData(data: any): any {
//   return data.items.map((item: any) => item.id);
// }

// ✅ Melhor que any: unknown (força verificação antes de usar)
function processData(data: unknown): number[] {
  if (!isValidData(data)) throw new Error('Invalid data');
  return (data as { items: { id: number }[] }).items.map(i => i.id);
}
function isValidData(d: unknown): d is { items: { id: number }[] } {
  return (
    typeof d === 'object' && d !== null &&
    Array.isArray((d as any).items)
  );
}

// ETAPA 4: Adicionar tipos por prioridade:
//   1. Funções públicas de serviços
//   2. Interfaces das entidades principais
//   3. Handlers de API
//   4. Utilitários compartilhados
//   5. Componentes de UI (geralmente os mais trabalhosos)

// ETAPA 5: Ativar strict gradualmente
// Em vez de strict: true de uma vez, ative opção por opção:
//   "strictNullChecks":          true,  // comece por esta
//   "noImplicitAny":             true,
//   "strictFunctionTypes":       true,
//   "strictPropertyInitialization": true // por último

// ─────────────────────────────────────────────────────────────
// Instalando tipos de bibliotecas (seção 5.6)
// ─────────────────────────────────────────────────────────────

// npm install -D @types/node
// npm install -D @types/react @types/react-dom
// npm install -D @types/express
// npm install -D @types/jest
// npm install -D @types/lodash

// Libs com tipos built-in (não precisam de @types/):
//   axios, zod, prisma, date-fns, zustand

// ─────────────────────────────────────────────────────────────
// CASO REAL — src/types/index.ts (Semana 2 da migração)
// ─────────────────────────────────────────────────────────────

export interface User {
  id:        number;
  name:      string;
  email:     string;
  role:      'admin' | 'user' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id:         number;
  name:       string;
  price:      number;
  stock:      number;
  categoryId: number;
}

export interface Order {
  id:        number;
  userId:    number;
  items:     OrderItem[];
  total:     number;
  status:    'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  productId: number;
  quantity:  number;
  unitPrice: number;
}

export type CreateUserInput = Pick<User, 'name' | 'email'> & { password: string };
export type UpdateUserInput = Partial<Pick<User, 'name' | 'email'>>;
export type UserPublic      = Omit<User, 'createdAt' | 'updatedAt'>;

export interface ApiResponse<T> {
  data:    T | null;
  error:   string | null;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// CASO REAL — src/utils/validators.ts (Semana 3)
// ─────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
}

// ─────────────────────────────────────────────────────────────
// CASO REAL — src/services/UserService.ts (Semana 3)
// ─────────────────────────────────────────────────────────────

// class UserService {
//   async findById(id: number): Promise<User | null> {
//     return UserModel.findByPk(id) as Promise<User | null>;
//   }
//   async create(input: CreateUserInput): Promise<User> {
//     const hashed = await hashPassword(input.password);
//     return UserModel.create({ ...input, password: hashed }) as Promise<User>;
//   }
//   async update(id: number, input: UpdateUserInput): Promise<User | null> {
//     const user = await this.findById(id);
//     if (!user) return null;
//     return user.update(input) as Promise<User>;
//   }
// }

// ─────────────────────────────────────────────────────────────
// Fix de strictNullChecks (Semana 5–6 do Caso Real)
// ─────────────────────────────────────────────────────────────

// ❌ Antes — user pode ser null
// const user = await userService.findById(id);
// console.log(user.name); // Erro: Object is possibly 'null'

// ✅ Depois — guarda de nulidade
// const user = await userService.findById(id);
// if (!user) return res.status(404).json({ data: null, error: 'Not found', message: '' });
// console.log(user.name); // Seguro — TypeScript sabe que não é null

// ─────────────────────────────────────────────────────────────
// Medindo o progresso (seção 5.6)
// ─────────────────────────────────────────────────────────────

// npm install -D typescript-coverage-report
// npx typescript-coverage-report
// → Type coverage: 73.4%
// → Files with 100% coverage: 12/34
// 💡 Meta: 80% antes de ativar strict: true.

// ─────────────────────────────────────────────────────────────
// Scripts úteis no package.json (seção 5.2)
// ─────────────────────────────────────────────────────────────

// "scripts": {
//   "build":     "tsc",
//   "typecheck": "tsc --noEmit",  // só checa tipos, não gera output
//   "watch":     "tsc --watch"
// }
// Em projetos Vite: npm run typecheck no CI — separado do build.

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== Validators (migrados de .js para .ts) ===');
console.log('isValidEmail("d@db.dev"):', isValidEmail('d@db.dev'));
console.log('isValidEmail("invalido"):', isValidEmail('invalido'));
console.log('isValidPassword("12345678"):', isValidPassword('12345678'));
console.log('isValidPassword("curta")   :', isValidPassword('curta'));
console.log('sanitizeInput("  Diana  ") :', sanitizeInput('  Diana  '));

console.log('\n=== processData com unknown ===');
const validData   = { items: [{ id: 1 }, { id: 2 }] };
const invalidData = 'não é um objeto válido';
console.log('processData (válido)  :', processData(validData));
try {
  processData(invalidData);
} catch (e) {
  console.log('processData (inválido):', (e as Error).message);
}

console.log('\n=== Tipos centrais (src/types/index.ts) ===');
const userExample: UserPublic = {
  id: 1, name: 'Diana', email: 'd@db.dev', role: 'admin'
};
const createInput: CreateUserInput = {
  name: 'Victor', email: 'v@db.dev', password: 'S3nh@Segura'
};
const response: ApiResponse<UserPublic> = {
  data: userExample, error: null, message: 'Criado com sucesso'
};
console.log('UserPublic    :', userExample);
console.log('CreateInput   :', createInput);
console.log('ApiResponse   :', response);

console.log('\n=== Resultados do Caso Real (6 semanas) ===');
const resultados = [
  { metrica: 'Cobertura de tipos',       antes: '0%',     depois: '94%'     },
  { metrica: 'Bugs de tipo em produção', antes: 'baseline', depois: '-71%'  },
  { metrica: 'Tempo médio de debug',     antes: '45 min',  depois: '12 min' },
  { metrica: 'Onboarding de devs',       antes: '3 dias',  depois: '1 dia'  },
];
resultados.forEach(({ metrica, antes, depois }) => {
  console.log(`  ${metrica.padEnd(30)}: ${antes.padEnd(10)} → ${depois}`);
});
