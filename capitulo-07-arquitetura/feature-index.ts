// feature-index.ts — Seções 7.1 e 7.2: Feature-first + Separação de concerns
// Capítulo 7 — Do Monolito ao Modular
//
// Execute: npx tsx exemplos/feature-index.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 7.1 — A API pública da feature (index.ts)
// ─────────────────────────────────────────────────────────────

// Cada feature exporta APENAS o que outras features precisam —
// internals ficam encapsulados.

// src/features/users/index.ts
// export { UserCard }    from './components/UserCard';
// export { UserList }    from './components/UserList';
// export { useUser }     from './hooks/useUser';
// export { userService } from './services/userService';
// export type { User, CreateUserInput } from './types/user.types';
// UserForm é interno — não exportado
// useUserValidation é interno — não exportado
// userHelpers.ts é interno — não exportado

// Outras features importam pelo barrel:
// import { UserCard, useUser } from '@/features/users';        // ✅
// import { UserCard } from '@/features/users/components/UserCard'; // ❌ acesso interno
// automatize essa regra com eslint-plugin-boundaries ou no-restricted-imports

// ─────────────────────────────────────────────────────────────
// Estrutura feature-first (comentário com a árvore completa)
// ─────────────────────────────────────────────────────────────

// src/
// ├── features/
// │   ├── users/
// │   │   ├── components/   UserCard.tsx, UserList.tsx, UserForm.tsx, UserAvatar.tsx
// │   │   ├── hooks/        useUser.ts, useUserList.ts
// │   │   ├── services/     userService.ts
// │   │   ├── types/        user.types.ts
// │   │   └── index.ts      ← API pública da feature
// │   ├── products/         (mesma estrutura)
// │   └── orders/           (mesma estrutura)
// ├── shared/               ← Código genuinamente compartilhado
// │   ├── components/       Button.tsx, Modal.tsx, Input.tsx
// │   ├── hooks/            useDebounce.ts, useLocalStorage.ts
// │   └── utils/            formatters.ts, validators.ts
// ├── pages/                ← Só composição de features
// │   ├── UsersPage.tsx
// │   ├── ProductsPage.tsx
// │   └── OrdersPage.tsx
// └── app/
//     ├── App.tsx
//     ├── router.tsx
//     └── providers.tsx

// Regras de dependência:
// ✅  features/ → shared/          (feature pode usar shared)
// ✅  features/X → features/X      (dentro da própria feature)
// ✅  features/X → features/Y index (pelo barrel público — OK)
// ❌  features/X → features/Y internals (acesso direto interno — proibido)
// ✅  pages/ → features/           (páginas compõem features)

// ─────────────────────────────────────────────────────────────
// SEÇÃO 7.2 — Separação de concerns: modelo moderno
// ─────────────────────────────────────────────────────────────

// Tipos comuns a todo o exemplo
interface User {
  id:    number;
  name:  string;
  email: string;
}

interface CartItem {
  productId: number;
  quantity:  number;
  unitPrice: number;
}

// ❌ Modelo antigo — componente com 4 responsabilidades:
// function UserComponent({ userId }) {
//   const [user, setUser]       = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError]     = useState(null);
//   useEffect(() => {
//     fetch(`/api/users/${userId}`)
//       .then(r => r.json())
//       .then(data => { setUser(data); setLoading(false); })
//       .catch(err => setError(err));
//   }, [userId]);
//   if (loading) return <Spinner />;
//   if (error)   return <ErrorMessage error={error} />;
//   return <div>{user.name}</div>; // fetch + estado + erro + UI
// }

// ✅ Modelo moderno — cada camada com uma responsabilidade:

// Camada de Serviço — comunicação com API
export const userService = {
  findById: async (id: number): Promise<User> => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  }
};

// Camada de Estado (hook) — gerencia estado e lógica
export function useUser(userId: number) {
  // Em React:
  // const [user, setUser]       = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError]     = useState<Error | null>(null);
  // useEffect(() => {
  //   userService.findById(userId)
  //     .then(setUser)
  //     .catch(setError)
  //     .finally(() => setLoading(false));
  // }, [userId]);
  // return { user, loading, error };

  // Stub para demo:
  return { user: { id: userId, name: 'Diana', email: 'd@db.dev' }, loading: false, error: null };
}

// Camada de UI — só renderiza (sem lógica de fetch ou estado)
// export function UserCard({ userId }: { userId: number }) {
//   const { user, loading, error } = useUser(userId);
//   if (loading) return <Spinner />;
//   if (error)   return <ErrorMessage error={error} />;
//   if (!user)   return null;
//   return <div>{user.name}</div>;
// }

// ─────────────────────────────────────────────────────────────
// useCart — Camada de Estado (hook)
// ─────────────────────────────────────────────────────────────

export function createCart() {
  // Implementação vanilla (sem React) para demonstração
  let items: CartItem[] = [];

  const addItem = (productId: number, quantity = 1, unitPrice = 0) => {
    const existing = items.find(i => i.productId === productId);
    if (existing) {
      items = items.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      items = [...items, { productId, quantity, unitPrice }];
    }
  };

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const getItems = () => [...items];

  return { addItem, getTotal, getItems };
}

// ─────────────────────────────────────────────────────────────
// productService — Camada de Serviço
// ─────────────────────────────────────────────────────────────

interface ProductFilters { category?: string; minPrice?: number; }
interface Product { id: number; name: string; price: number; }
interface CreateProductInput { name: string; price: number; }
class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const productService = {
  findAll: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const res    = await fetch(`/api/products?${params}`);
    if (!res.ok) throw new ApiError('Failed to fetch products', res.status);
    return res.json();
  },
  create: async (input: CreateProductInput): Promise<Product> => {
    const res = await fetch('/api/products', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(input),
    });
    if (!res.ok) throw new ApiError('Failed to create product', res.status);
    return res.json();
  },
};

// ─────────────────────────────────────────────────────────────
// SRP — Single Responsibility Principle na prática
// ─────────────────────────────────────────────────────────────

// ❌ userUtils.ts — faz autenticação E formatação E validação
// export function login(email, password) { ... }
// export function formatUserName(user) { ... }
// export function validateEmail(email) { ... }
// export function hashPassword(password) { ... }

// ✅ Separado por responsabilidade:
// auth/authService.ts
export function hashPassword(password: string): string {
  return `hashed_${password}`; // stub
}
export function login(email: string, _password: string): Promise<User> {
  return Promise.resolve({ id: 1, name: 'Diana', email });
}

// shared/utils/formatters.ts
export function formatUserName(user: User): string {
  return user.name.trim();
}

// shared/utils/validators.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== Feature-first + SoC ===\n');

console.log('userService.findById (interface):');
console.log('  async (id: number): Promise<User>');

const cart = createCart();
cart.addItem(1, 2, 49.90);
cart.addItem(2, 1, 5.50);
cart.addItem(1, 1, 49.90); // aumenta quantidade do item 1
console.log('\ncreateCart() demo:');
console.log('  items:', cart.getItems());
console.log('  total: R$', cart.getTotal().toFixed(2));

console.log('\nSRP — funções separadas por responsabilidade:');
console.log('  validateEmail("d@db.dev"):', validateEmail('d@db.dev'));
console.log('  validateEmail("invalido") :', validateEmail('invalido'));
console.log('  formatUserName({ name: " Diana " }):', formatUserName({ id: 1, name: ' Diana ', email: '' }));

console.log('\nRegras de dependência entre features:');
console.log('  ✅ features/X → shared/   (OK)');
console.log('  ✅ features/X → features/Y index.ts (OK — pelo barrel)');
console.log('  ❌ features/X → features/Y internals (PROIBIDO)');

// ─────────────────────────────────────────────────────────────
// Notas adicionais do capítulo
// ─────────────────────────────────────────────────────────────

// Por que a estrutura por tipo não escala (seção 7.1):
// src/
// ├── components/   ← Todos os componentes  (70+ arquivos misturados)
// ├── hooks/        ← Todos os hooks
// ├── services/     ← Todos os serviços
// Para mudar algo em 'usuário', você mexe em 5 pastas diferentes.

// Estrutura Node.js/API — equivalente a features no backend (seção 7.1):
//   src/modules/users/
//   ├── user.controller.ts
//   ├── user.service.ts
//   ├── user.repository.ts
//   ├── user.schema.ts
//   ├── user.types.ts
//   └── user.routes.ts

// SRP — cada módulo tem uma única razão para mudar (seção 7.2):
// Se você consegue descrever o que um arquivo faz usando "e",
// ele provavelmente está fazendo coisas demais.
