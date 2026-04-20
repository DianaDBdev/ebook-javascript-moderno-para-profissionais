// generics.ts — Seção 5.5: Generics sem complicação
// Capítulo 5 — TypeScript: O Novo Normal
//
// Execute: npx tsx exemplos/generics.ts

// ─────────────────────────────────────────────────────────────
// O problema que generics resolve
// ─────────────────────────────────────────────────────────────

// Sem generics — duplicação por tipo:
function firstString(arr: string[]): string  { return arr[0]; }
function firstNumber(arr: number[]): number  { return arr[0]; }
// function firstUser(arr: User[]): User     { return arr[0]; }

// Com generics — uma função para todos os tipos:
function first<T>(arr: T[]): T {
  return arr[0];
}
first(['a', 'b', 'c']); // T = string (inferido)
first([1, 2, 3]);        // T = number (inferido)

// ─────────────────────────────────────────────────────────────
// Generics com constraints (restrições)
// ─────────────────────────────────────────────────────────────

interface User    { id: number; name:  string; email: string; }
interface Product { id: number; name:  string; price: number; }

// T deve ter a propriedade id
function findById<T extends { id: number }>(
  items: T[],
  id:    number
): T | undefined {
  return items.find(item => item.id === id);
}

const users:    User[]    = [
  { id: 1, name: 'Maria',  email: 'maria@ex.com' },
  { id: 2, name: 'João',   email: 'joao@ex.com' },
];
const products: Product[] = [
  { id: 1, name: 'Livro JS', price: 49.90 },
  { id: 2, name: 'Caneta',   price: 5.50 },
];

findById(users,    1); // ✅ User tem id
findById(products, 1); // ✅ Product tem id
// findById(['a'],  1); // ❌ string não tem id

// ─────────────────────────────────────────────────────────────
// Generics em interfaces — ApiResponse<T>
// ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data:   T;
  error:  string | null;
  status: number;
}

type UserResponse      = ApiResponse<User>;
type UserListResponse  = ApiResponse<User[]>;
type EmptyResponse     = ApiResponse<null>;

// Função genérica que usa o tipo
async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const res  = await fetch(url);
  const data: T = await res.json();
  return { data, error: null, status: res.status };
}

// Uso com inferência automática:
// const { data: user } = await apiGet<User>('/api/users/1');
//         ↑ user é tipado como User automaticamente

// ─────────────────────────────────────────────────────────────
// Generics com múltiplos parâmetros
// ─────────────────────────────────────────────────────────────

function mapObject<K extends string, V, R>(
  obj:    Record<K, V>,
  mapper: (value: V, key: K) => R
): Record<K, R> {
  const result = {} as Record<K, R>;
  for (const key in obj) {
    result[key] = mapper(obj[key], key);
  }
  return result;
}

const prices     = { apple: 10, banana: 5 } as Record<string, number>;
const discounted = mapObject(prices, price => price * 0.9);
// { apple: 9, banana: 4.5 } — tipado corretamente

// ─────────────────────────────────────────────────────────────
// Caso de uso 1: useLocalStorage<T> (React hook tipado)
// ─────────────────────────────────────────────────────────────

// function useLocalStorage<T>(key: string, initialValue: T) {
//   const [value, setValue] = useState<T>(() => {
//     // em SSR (Next.js): proteja com typeof window !== 'undefined'
//     const stored = localStorage.getItem(key);
//     return stored ? JSON.parse(stored) : initialValue;
//   });
//   const setStored = (newValue: T) => {
//     setValue(newValue);
//     localStorage.setItem(key, JSON.stringify(newValue));
//   };
//   return [value, setStored] as const;
// }
//
// const [user, setUser] = useLocalStorage<User>('user', defaultUser);
// setUser({ id: 1, name: 'Maria', email: 'a@b.com' }); // ✅
// setUser('string'); // ❌ Erro

// ─────────────────────────────────────────────────────────────
// Caso de uso 2: Repository<T> genérico
// ─────────────────────────────────────────────────────────────

class Repository<T extends { id: number }> {
  private items: T[] = [];

  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }

  save(item: T): void {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index >= 0) this.items[index] = item;
    else            this.items.push(item);
  }

  delete(id: number): void {
    // 'delete' é válido como nome de método —
    // mas 'remove' pode ser mais claro para leitores menos experientes
    this.items = this.items.filter(i => i.id !== id);
  }
}

// Um repositório para cada entidade
const userRepo    = new Repository<User>();
const productRepo = new Repository<Product>();

// ─────────────────────────────────────────────────────────────
// Exercício 2 do capítulo — paginate<T>
// ─────────────────────────────────────────────────────────────

interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

function paginate<T>(
  items:       T[],
  page:        number,
  itemsPerPage: number
): PaginatedResult<T> {
  const total      = items.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const start      = (page - 1) * itemsPerPage;
  return {
    data:       items.slice(start, start + itemsPerPage),
    total,
    page,
    totalPages,
    hasNext:    page < totalPages,
    hasPrev:    page > 1,
  };
}

// ─────────────────────────────────────────────────────────────
// 💡 Regra de ouro dos generics
// Use-os quando a lógica é idêntica para múltiplos tipos.
// Se está copiando código mudando apenas o tipo → generic.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== first<T> ===');
console.log(first(['a', 'b', 'c'])); // 'a'
console.log(first([10, 20, 30]));    // 10

console.log('\n=== findById<T extends { id }> ===');
console.log('user 1:   ', findById(users,    1));
console.log('product 2:', findById(products, 2));
console.log('user 99:  ', findById(users,    99));

console.log('\n=== mapObject ===');
console.log('discounted:', discounted);

console.log('\n=== Repository<T> ===');
userRepo.save({ id: 1, name: 'Diana', email: 'd@db.dev' });
userRepo.save({ id: 2, name: 'Victor', email: 'v@db.dev' });
console.log('findAll:', userRepo.findAll().map(u => u.name));
console.log('findById(1):', userRepo.findById(1));
userRepo.delete(1);
console.log('após delete(1):', userRepo.findAll().map(u => u.name));

productRepo.save({ id: 1, name: 'Livro JS', price: 49.90 });
console.log('productRepo:', productRepo.findAll());

console.log('\n=== paginate<T> ===');
const lista  = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, value: `item ${i + 1}` }));
const pagina = paginate(lista, 2, 10);
console.log(`Página ${pagina.page}/${pagina.totalPages}:`, pagina.data.map(i => i.value));
console.log(`hasNext: ${pagina.hasNext} | hasPrev: ${pagina.hasPrev}`);
