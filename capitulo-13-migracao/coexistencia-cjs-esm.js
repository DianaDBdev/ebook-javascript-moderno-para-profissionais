// coexistencia-cjs-esm.js — Seção 13.3: Adapter, Facade, dual-write, eventos
// Capítulo 13 — Migrando Projetos Legados
//
// Execute: node exemplos/coexistencia-cjs-esm.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.3 — Padrão Adapter — envolver o legado
// ─────────────────────────────────────────────────────────────

// Serviço legado — NÃO modifique:
// legacy/userService.js
// module.exports = {
//   createUser: function(name, email, callback) {
//     db.query('INSERT...', [name, email], callback);
//   },
//   getUserById: function(id, callback) {
//     db.query('SELECT...', [id], callback);
//   }
// };

// Adapter — expõe interface moderna sem tocar no legado:
// adapters/userServiceAdapter.ts
// import { promisify }     from 'util';
// import legacyUserService from '../legacy/userService';
// // assume callback(err, result) — se o legado usa outra convenção, use new Promise manual
// const createUserAsync  = promisify(legacyUserService.createUser);
// const getUserByIdAsync = promisify(legacyUserService.getUserById);
//
// export const userServiceAdapter = {
//   async create(input: CreateUserInput): Promise<User> {
//     const result = await createUserAsync(input.name, input.email);
//     return { id: result.id, name: input.name, email: input.email };
//   },
//   async findById(id: number): Promise<User | null> {
//     const result = await getUserByIdAsync(id);
//     return result ?? null;
//   },
// };
// Código novo usa o adapter — sem saber que é legado por baixo

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.3 — Padrão Facade — simplificar interfaces complexas
// ─────────────────────────────────────────────────────────────

// Legado: 15 funções espalhadas em 3 módulos com callbacks
// const legacyAuth        = require('./legacy/auth');
// const legacySession     = require('./legacy/session');
// const legacyPermissions = require('./legacy/permissions');

// Facade: uma interface coesa e moderna:
// export class AuthFacade {
//   async login(email: string, password: string): Promise<AuthResult> {
//     const user    = await promisify(legacyAuth.verify)(email, password);
//     const session = await promisify(legacySession.create)(user.id);
//     const perms   = await promisify(legacyPermissions.load)(user.id);
//     return {
//       token:       session.token,
//       user:        { id: user.id, name: user.name, email },
//       permissions: perms.list,
//     };
//   }
// }

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.3 — Estratégias de compartilhamento de dados
// ─────────────────────────────────────────────────────────────

// 1. Banco compartilhado — mais simples, migrações backward-compatible:
// ✅ Adicionar coluna com default (backward-compatible):
//   ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
// ❌ Remover coluna (pode quebrar o legado):
//   ALTER TABLE users DROP COLUMN legacy_field;
//   → Só remova DEPOIS que o legado não usa mais

// 2. Dual-write — para refatorações maiores:
// async function createOrder(input: CreateOrderInput) {
//   // Escreve no schema legado (formato antigo)
//   await db.legacyOrders.insert({
//     user_id: input.userId, total: input.total, created_at: new Date(),
//   });
//   // Escreve no schema novo (formato moderno)
//   await db.orders.insert({
//     userId: input.userId, amount: input.total, status: 'pending', createdAt: new Date(),
//   });
//   // ⚠️ Risco de inconsistência se uma das escritas falhar
//   // Use transações ou reconciliação periódica para detectar divergências
// }

// 3. Eventos para sincronização assíncrona:
// eventEmitter.emit('user:created', { id, name, email });
// eventEmitter.on('user:created', async (userData) => {
//   await newUserService.syncFromLegacy(userData);
// });

// ─────────────────────────────────────────────────────────────
// Demo executável — simula Adapter e Facade
// ─────────────────────────────────────────────────────────────

console.log('=== Adapter Pattern — envolver legado ===\n');

// Simula serviço legado com callbacks
const legacyUserService = {
  createUser: (name, email, callback) => {
    // Simula operação assíncrona com callback
    setTimeout(() => callback(null, { id: Math.floor(Math.random() * 1000) + 1, name, email }), 10);
  },
  getUserById: (id, callback) => {
    setTimeout(() => {
      if (id === 999) callback(new Error('Not found'), null);
      else callback(null, { id, name: `User ${id}`, email: `user${id}@ex.com` });
    }, 10);
  },
};

// Adapter que expõe interface Promise sem tocar no legado
function createAdapter(legacyService) {
  return {
    create: (name, email) => new Promise((resolve, reject) => {
      legacyService.createUser(name, email, (err, result) => {
        if (err) reject(err);
        else resolve({ id: result.id, name, email });
      });
    }),
    findById: (id) => new Promise((resolve, reject) => {
      legacyService.getUserById(id, (err, result) => {
        if (err) resolve(null); // Not found → null
        else resolve(result);
      });
    }),
  };
}

const userAdapter = createAdapter(legacyUserService);

const created = await userAdapter.create('Diana', 'd@db.dev');
console.log('create (adaptado):', created);

const found = await userAdapter.findById(42);
console.log('findById(42):', found);

const notFound = await userAdapter.findById(999);
console.log('findById(999):', notFound);

// Facade
console.log('\n=== Facade Pattern — simplificar interface complexa ===\n');

// Três "serviços" legados separados
const legacyAuth        = { verify: (email, pass, cb) => cb(null, { id: 1, name: 'Diana' }) };
const legacySession     = { create: (userId, cb) => cb(null, { token: `tok_${userId}_${Date.now()}` }) };
const legacyPermissions = { load: (userId, cb) => cb(null, { list: ['read', 'write'] }) };

// Facade: uma interface coesa
class AuthFacade {
  async login(email, password) {
    const user    = await new Promise((res, rej) => legacyAuth.verify(email, password, (e, u) => e ? rej(e) : res(u)));
    const session = await new Promise((res, rej) => legacySession.create(user.id, (e, s) => e ? rej(e) : res(s)));
    const perms   = await new Promise((res, rej) => legacyPermissions.load(user.id, (e, p) => e ? rej(e) : res(p)));
    return {
      token:       session.token,
      user:        { id: user.id, name: user.name, email },
      permissions: perms.list,
    };
  }
}

const auth   = new AuthFacade();
const result = await auth.login('d@db.dev', 'senha');
console.log('AuthFacade.login:');
console.log('  user:', result.user);
console.log('  permissions:', result.permissions);
console.log('  token:', result.token.substring(0, 20) + '...');

// Dual-write simulado
console.log('\n=== Dual-write — duas estruturas durante migração ===\n');

const legacyOrders = [];
const newOrders    = [];

async function createOrderDualWrite(input) {
  // Escreve no schema legado
  legacyOrders.push({ user_id: input.userId, total: input.total, created_at: new Date() });
  // Escreve no schema novo
  newOrders.push({ userId: input.userId, amount: input.total, status: 'pending', createdAt: new Date() });
  console.log('  Escrito em legado E novo simultaneamente');
}

await createOrderDualWrite({ userId: 1, total: 150.00 });
console.log('  Legacy orders:', legacyOrders.length);
console.log('  New orders:   ', newOrders.length);
console.log('\n  ⚠️ Dual-write tem risco de inconsistência se uma escrita falhar.');
console.log('  Use transações ou reconciliação periódica.');
