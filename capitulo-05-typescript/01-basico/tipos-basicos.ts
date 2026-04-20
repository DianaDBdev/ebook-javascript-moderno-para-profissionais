// tipos-basicos.ts — Seções 5.1 e 5.3: Por que TypeScript + Tipos essenciais
// Capítulo 5 — TypeScript: O Novo Normal
//
// Execute: npx tsx exemplos/tipos-basicos.ts
// (ou: npx ts-node exemplos/tipos-basicos.ts)

// ─────────────────────────────────────────────────────────────
// SEÇÃO 5.1 — O problema que TypeScript resolve
// ─────────────────────────────────────────────────────────────

// JavaScript — válido, mas perigoso:
// function getUser(id) {
//   return fetch(`/api/users/${id}`).then(r => r.json());
// }
// const user = await getUser(42);
// console.log(user.nmae); // Typo! JavaScript não avisa → bug em produção.

// TypeScript — o compilador encontra o bug antes do runtime:
interface User {
  id:    number;
  name:  string;
  email: string;
}

// async function getUser(id: number): Promise<User> {
//   const res = await fetch(`/api/users/${id}`);
//   return res.json();
// }
// const user = await getUser(42);
// console.log(user.nmae);
// ❌ Erro em tempo de desenvolvimento:
// Property 'nmae' does not exist on type 'User'. Did you mean 'name'?

// ─────────────────────────────────────────────────────────────
// SEÇÃO 5.3 — Tipos primitivos
// ─────────────────────────────────────────────────────────────

// Declarados explicitamente
const nameStr:  string  = 'Maria';
const ageNum:   number  = 25;
const activeB:  boolean = true;
const dataN:    null    = null;
const nothingU: undefined = undefined;

// TypeScript infere — não precisa declarar
const name   = 'Maria'; // inferido: string
const age    = 25;      // inferido: number
// 💡 Deixe TypeScript inferir sempre que possível.

// ─────────────────────────────────────────────────────────────
// Arrays e tuplas
// ─────────────────────────────────────────────────────────────

const names:   string[]      = ['Maria', 'João'];
const numbers: Array<number> = [1, 2, 3]; // sintaxe alternativa

// Tuplas — array com tamanho e tipos fixos
const point: [number, number] = [10, 20];
const entry: [string, number] = ['age', 25];

// Array de objetos
const users: { id: number; name: string }[] = [
  { id: 1, name: 'Maria' },
  { id: 2, name: 'João'  }
];

// ─────────────────────────────────────────────────────────────
// Union types — um tipo OU outro
// ─────────────────────────────────────────────────────────────

let id: string | number;
id = 1;      // ✅
id = 'abc';  // ✅
// id = true; // ❌ Erro

// Função que aceita múltiplos formatos
function formatId(id: string | number): string {
  return typeof id === 'number' ? id.toString() : id;
}

// Union com null — muito comum
function findUser(id: number): User | null {
  return users.find(u => u.id === id) ?? null;
}

// ─────────────────────────────────────────────────────────────
// Literal types — valores exatos como tipo
// ─────────────────────────────────────────────────────────────

type Direction  = 'north' | 'south' | 'east' | 'west';
type Status     = 'pending' | 'active' | 'inactive';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}
move('north'); // ✅
// move('up'); // ❌ Erro — 'up' não é Direction

// 💡 Use literal types sempre que um valor só pode ser um de N opções.

// ─────────────────────────────────────────────────────────────
// Optional properties (?)
// ─────────────────────────────────────────────────────────────

interface CreateUserInput {
  name:    string;   // obrigatório
  email:   string;   // obrigatório
  age?:    number;   // opcional — pode ser undefined
  avatar?: string;   // opcional
}

function greet(input: CreateUserInput) {
  console.log(input.name);
  console.log(input.age?.toString()); // optional chaining necessário
}

// ─────────────────────────────────────────────────────────────
// Readonly — imutabilidade garantida pelo compilador
// ─────────────────────────────────────────────────────────────

interface Config {
  readonly apiUrl:  string;
  readonly timeout: number;
}

const config: Config = { apiUrl: 'https://api.example.com', timeout: 5000 };
// config.apiUrl = 'outro'; // ❌ Erro — cannot assign to 'apiUrl'

// Readonly em arrays
const ids: readonly number[] = [1, 2, 3];
// ids.push(4); // ❌ Erro — 'push' não existe em readonly

// ─────────────────────────────────────────────────────────────
// Record — objetos com chaves dinâmicas
// ─────────────────────────────────────────────────────────────

const userRoles: Record<string, 'admin' | 'user' | 'guest'> = {
  'maria@ex.com': 'admin',
  'joao@ex.com':  'user'
};

const cache: Record<number, User> = {};
cache[1] = { id: 1, name: 'Maria', email: 'maria@ex.com' };

// ─────────────────────────────────────────────────────────────
// Utility types mais usados
// ─────────────────────────────────────────────────────────────

interface UserFull {
  id:       number;
  name:     string;
  email:    string;
  password: string;
}

type UserUpdate   = Partial<UserFull>;
// { id?: number; name?: string; email?: string; password?: string }

type UserRequired = Required<UserFull>;
// todas obrigatórias

type UserPublic   = Pick<UserFull, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }

type UserSafe     = Omit<UserFull, 'password'>;
// { id: number; name: string; email: string }

function getUserData() { return { id: 1, name: 'Maria' }; }
type UserReturn = ReturnType<typeof getUserData>;
// { id: number; name: string }

type ResolvedUser = Awaited<Promise<UserFull>>;
// UserFull

// 💡 Pick e Omit são seus melhores amigos para DTOs e respostas de API.

// ─────────────────────────────────────────────────────────────
// Tipando funções
// ─────────────────────────────────────────────────────────────

function add(a: number, b: number): number {
  return a + b;
}

const multiply = (a: number, b: number): number => a * b;

async function fetchUser(id: number): Promise<UserFull> {
  const res = await fetch(`/api/users/${id}`);
  return res.json() as UserFull;
  // em produção, prefira validar com Zod —
  // `as UserFull` não garante que o dado corresponde ao tipo em runtime
}

function processUsers(
  users:    User[],
  callback: (user: User) => void
): void {
  users.forEach(callback);
}

type EventHandler  = (event: MouseEvent) => void;
type Transformer<T, R> = (input: T) => R;

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== Tipos básicos ===');
console.log('formatId(42)  :', formatId(42));
console.log('formatId("abc"):', formatId('abc'));
console.log('findUser(1)   :', findUser(1));
console.log('findUser(99)  :', findUser(99));
move('south');

console.log('\n=== Utility types ===');
const userPublicExample: UserPublic = { id: 1, name: 'Diana', email: 'd@b.dev' };
console.log('UserPublic:', userPublicExample);
// userPublicExample.password // ❌ não existe em UserPublic

console.log('\n=== Record ===');
console.log('userRoles:', userRoles);
console.log('cache[1]  :', cache[1]);

console.log('\n=== Funções ===');
console.log('add(3, 4)     :', add(3, 4));
console.log('multiply(3, 4):', multiply(3, 4));

// ─────────────────────────────────────────────────────────────
// Quando usar TypeScript vs JavaScript puro (seção 5.1)
// ─────────────────────────────────────────────────────────────

// Use TypeScript quando:
//   • Projeto com mais de 1 desenvolvedor
//   • Projeto que vai durar mais de 6 meses
//   • API pública ou biblioteca que outros vão consumir
//   • Time com desenvolvedores júniors — tipos servem de documentação
//   • Refatorações frequentes — o compilador te avisa o que quebrou

// JavaScript puro ainda faz sentido:
//   • Scripts simples e pontuais (automações, one-shots)
//   • Protótipos rápidos onde você vai jogar fora o código
//   • Configurações de ferramentas (vite.config.js, eslint.config.js)

// ─────────────────────────────────────────────────────────────
// Cheat sheet de utility types (seção 5.3 + 5.4)
// ─────────────────────────────────────────────────────────────

// Partial<T>    // todas as propriedades viram opcionais
// Required<T>   // todas as propriedades viram obrigatórias
// Pick<T, K>    // seleciona propriedades
// Omit<T, K>    // remove propriedades
// Record<K, V>  // objeto com chaves dinâmicas
// ReturnType<T> // tipo do retorno de função
// Awaited<T>    // desembrulha Promise
