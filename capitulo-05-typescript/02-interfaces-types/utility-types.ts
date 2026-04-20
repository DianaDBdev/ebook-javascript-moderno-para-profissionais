// utility-types.ts — Seção 5.4: Interfaces vs Types + Caso Real (tipos centrais + Express)
// Capítulo 5 — TypeScript: O Novo Normal
//
// Execute: npx tsx exemplos/utility-types.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 5.4 — Interface vs Type: quando usar cada um
// ─────────────────────────────────────────────────────────────

// Interface — define a forma de um objeto
interface UserInterface {
  id:    number;
  name:  string;
  email: string;
}

// Type alias — nomeia qualquer tipo
type UserType = {
  id:    number;
  name:  string;
  email: string;
};
// Até aqui, são intercambiáveis para objetos.

// ─────────────────────────────────────────────────────────────
// Diferença 1: Declaration merging (só interface)
// ─────────────────────────────────────────────────────────────

// interface pode ser declarada múltiplas vezes — TypeScript une automaticamente:
interface Window {
  myCustomProperty: string;
}
// window.myCustomProperty está disponível
// Essencial para estender tipos de bibliotecas (Express, Jest, Next.js)

// Type alias NÃO permite:
// type Window = { myCustomProperty: string }; // ❌ Duplicate identifier

// ─────────────────────────────────────────────────────────────
// Diferença 2: Type pode nomear qualquer coisa
// ─────────────────────────────────────────────────────────────

type ID       = string | number;         // union
type Point    = [number, number];        // tupla
type Callback = () => void;             // função
type SortOrder = 'asc' | 'desc';        // literal

// interface ID = string | number;      // ❌ Não é possível

// ─────────────────────────────────────────────────────────────
// Diferença 3: extends vs intersection (&)
// ─────────────────────────────────────────────────────────────

// Interface usa extends:
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// Type usa & (intersection):
type AnimalT = { name: string };
type DogT    = AnimalT & { breed: string };
// Ambos resultam em: { name: string; breed: string }

// ─────────────────────────────────────────────────────────────
// A regra prática
// ─────────────────────────────────────────────────────────────

// Use interface quando:
//   • Define a forma de um objeto ou classe
//   • Precisa de declaration merging
//   • Está criando API pública (biblioteca, SDK)
//   • Está modelando entidades de domínio

// Use type quando:
//   • Union types: string | number
//   • Tuplas, primitivos, funções como tipo
//   • Tipos derivados com Partial, Pick, Omit
//   • Mapped types ou conditional types

// ─────────────────────────────────────────────────────────────
// Padrão profissional combinado (seção 5.4 + Caso Real)
// ─────────────────────────────────────────────────────────────

// Entidades de domínio — interface
interface User {
  id:        number;
  name:      string;
  email:     string;
  role:      'admin' | 'user' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id:         number;
  name:       string;
  price:      number;
  stock:      number;
  categoryId: number;
}

interface Order {
  id:        number;
  userId:    number;
  items:     OrderItem[];
  total:     number;
  status:    'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

interface OrderItem {
  productId: number;
  quantity:  number;
  unitPrice: number;
}

// Tipos utilitários e derivados — type
type UserPublic      = Omit<User, 'createdAt' | 'updatedAt'>;
type CreateUserInput = Pick<User, 'name' | 'email'> & { password: string };
type UpdateUserInput = Partial<Pick<User, 'name' | 'email'>>;

// Union types — type
type EntityId  = string | number;

// Resposta padrão da API — interface genérica (seção 5.5)
export interface ApiResponse<T> {
  data:    T | null;
  error:   string | null;
  message: string;
}

// Tipos derivados da ApiResponse
type UserResponse      = ApiResponse<User>;
type UserListResponse  = ApiResponse<User[]>;
type EmptyResponse     = ApiResponse<null>;

// ─────────────────────────────────────────────────────────────
// TypedRequest / TypedResponse Express (Caso Real — Semana 4)
// ─────────────────────────────────────────────────────────────

// import { Request, Response } from 'express';

// Request com body tipado
// export interface TypedRequest<TBody = unknown, TParams = unknown> extends Request {
//   // em projetos com strict: true pode ser necessário usar
//   // Omit<Request, 'body'> & { body: TBody } para evitar conflitos
//   body:   TBody;
//   params: TParams & Record<string, string>;
// }

// Response tipado
// export type TypedResponse<T> = Response<ApiResponse<T>>;

// Usando nas rotas:
// router.post('/',
//   async (
//     req: TypedRequest<CreateUserInput>,
//     res: TypedResponse<User>
//   ) => {
//     const { name, email, password } = req.body;
//     // ↑ Totalmente tipado — TypeScript sabe o que esperar
//     const user = await userService.create({ name, email, password });
//     res.status(201).json({ data: user, error: null, message: 'Created' });
//   }
// );

// ─────────────────────────────────────────────────────────────
// Tipos do Caso Real — src/types/index.ts (Semana 2)
// ─────────────────────────────────────────────────────────────

export type { UserPublic, CreateUserInput, UpdateUserInput };
export type { EntityId, SortOrder };
export { type User, type Product, type Order, type OrderItem };

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== Interface vs Type ===');

const dog: Dog = { name: 'Rex', breed: 'Labrador' };
console.log('Dog (interface):', dog);

const dogT: DogT = { name: 'Max', breed: 'Bulldog' };
console.log('DogT (type)    :', dogT);

console.log('\n=== Tipos derivados ===');
const userPublic: UserPublic = {
  id: 1, name: 'Diana', email: 'd@db.dev',
  role: 'admin'
};
console.log('UserPublic (sem createdAt/updatedAt):', userPublic);

const createInput: CreateUserInput = {
  name: 'Victor', email: 'v@db.dev', password: 'S3nh@Segura'
};
console.log('CreateUserInput:', createInput);

console.log('\n=== ApiResponse<T> ===');
const resp: ApiResponse<UserPublic> = {
  data: userPublic, error: null, message: 'OK'
};
console.log('ApiResponse<UserPublic>:', resp);

console.log('\n=== Union + Literal types ===');
const orderId: EntityId  = 'ord-001';
const sort: SortOrder    = 'asc';
console.log('orderId:', orderId, '| sort:', sort);
