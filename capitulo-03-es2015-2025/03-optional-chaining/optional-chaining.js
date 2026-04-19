// optional-chaining.js — Seções 3.3: Optional chaining (?.) e nullish coalescing (??)
// Capítulo 3 — Novas Features do ES2015–ES2025
//
// Execute: node exemplos/optional-chaining.js

// ─────────────────────────────────────────────────────────────
// 1. Optional chaining (?.)
// ─────────────────────────────────────────────────────────────

const user = { name: 'João' }; // sem address

// ❌ Sem optional chaining — quebra
// console.log(user.address.street);
// 💥 TypeError: Cannot read property 'street' of undefined

// ❌ Código defensivo verboso (3 checks)
// if (user && user.address && user.address.street) {
//   console.log(user.address.street);
// }

// ✅ Com optional chaining — uma linha
console.log(user?.address?.street); // undefined (não quebra!)

// Como funciona:
//   • Se user é null/undefined → retorna undefined e para
//   • Se user.address é null/undefined → retorna undefined e para
//   • Se user.address.street existe → retorna o valor

// Em chamadas de função:
const userWithMethod = { name: 'Ana' }; // sem getAddress
console.log(userWithMethod.getAddress?.()); // undefined (não quebra)

// Em arrays:
const users = [{ name: 'Maria' }, { name: 'João' }];
console.log(users?.[0]?.name);  // 'Maria'
console.log(users?.[10]?.name); // undefined

// ─────────────────────────────────────────────────────────────
// 2. Nullish coalescing (??)
// ─────────────────────────────────────────────────────────────

// O problema com ||:
const userFalsy = { name: '', age: 0, isActive: false };

// ❌ || considera '', 0 e false como falsy
const nameBad     = userFalsy.name     || 'Guest'; // 'Guest' — mas name é '' (válido!)
const ageBad      = userFalsy.age      || 18;      // 18      — mas age é 0 (válido!)
console.log('|| (errado):', nameBad, ageBad);

// ✅ ?? só considera null e undefined como ausência de valor
const name     = userFalsy.name     ?? 'Guest'; // '' (preserva string vazia)
const age      = userFalsy.age      ?? 18;      // 0  (preserva zero)
const isActive = userFalsy.isActive ?? true;    // false (preserva false)
console.log('?? (correto):', name, age, isActive);

// Quando usar cada um:
// Use || quando quiser fallback para QUALQUER valor falsy
const port  = process.env.PORT || 3000; // '' → 3000, 0 → 3000
// Use ?? quando quiser fallback APENAS para null/undefined
const query = { limit: 0 };
const limit = query.limit ?? 10; // 0 → 0 (zero é válido como limite)
console.log('limit:', limit); // 0

// ─────────────────────────────────────────────────────────────
// 3. Nullish coalescing assignment (??=)
// ─────────────────────────────────────────────────────────────

let cfg = { timeout: null };

// ❌ Antes
// if (cfg.timeout === null || cfg.timeout === undefined) { cfg.timeout = 5000; }

// ✅ Depois
cfg.timeout ??= 5000; // Só atribui se for null/undefined
console.log(cfg.timeout); // 5000

cfg.timeout ??= 3000; // Não muda (já é 5000)
console.log(cfg.timeout); // 5000

// Lazy initialization com ??=:
class UserService {
  #cache;
  getCache() {
    this.#cache ??= new Map(); // Cria apenas na primeira chamada
    return this.#cache;
  }
}
const svc = new UserService();
console.log(svc.getCache() === svc.getCache()); // true — mesma instância

// ─────────────────────────────────────────────────────────────
// 4. Combinações poderosas: ?. + ??
// ─────────────────────────────────────────────────────────────

// Resposta de API que pode falhar
const response = { data: { user: { profile: null } } };
const userName = response?.data?.user?.profile?.name ?? 'Guest';
console.log(userName); // 'Guest'

// Configuração aninhada com fallback
const config = { server: { host: 'localhost' } }; // sem timeout
const timeout = config?.server?.timeout ?? 5000;
console.log(timeout); // 5000

// 💡 8 linhas vs 1 linha:
// const userName =
//   response && response.data && response.data.user && response.data.user.name
//     ? response.data.user.name
//     : 'Guest';
const userNameVerboso = response?.data?.user?.name ?? 'Guest';
console.log(userNameVerboso); // 'Guest'

// ─────────────────────────────────────────────────────────────
// 5. Cheat sheet (seção final do capítulo)
// ─────────────────────────────────────────────────────────────

const input = null;
const defaultValue = 'padrão';
const value = input ?? defaultValue;
console.log(value); // 'padrão'

// array?.[0]
const emptyArr = null;
console.log(emptyArr?.[0]); // undefined
