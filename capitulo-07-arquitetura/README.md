# Capítulo 7 — Do Monolito ao Modular

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Estrutura feature-first: cada domínio em sua própria pasta com `index.ts` como API pública
- Separação de concerns: UI, estado (hooks), serviço e infraestrutura com responsabilidades claras
- Dependency Injection sem frameworks: parâmetros de função, classes, closures e container simples
- Clean Architecture adaptada: entidade, repositório, use case e controller desacoplados
- Monorepos com npm Workspaces e Turborepo: quando usar e como estruturar
- Caso Real: 180 componentes → feature-first em 3 meses, 8× menos merge conflicts

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/feature-index.ts`](exemplos/feature-index.ts) | 7.1 + 7.2 | Estrutura feature-first, `index.ts` como barrel, regras de dependência, SRP, `useCart`, `productService`, `userService` |
| [`exemplos/dependency-injection.ts`](exemplos/dependency-injection.ts) | 7.3 | DI com parâmetros, classes (constructor), closures (factory), container simples — todos executáveis com implementações in-memory |
| [`exemplos/clean-architecture.ts`](exemplos/clean-architecture.ts) | 7.4 | Entidade `Order` com regras de negócio, `OrderRepository` interface, `CancelOrderUseCase`, controller — testados sem banco e sem HTTP |
| [`exemplos/monorepo-config.ts`](exemplos/monorepo-config.ts) | 7.5 + Caso Real | npm Workspaces, `turbo.json`, `@myapp/shared`, strangler fig pattern, `formatCurrency` compartilhada, métricas |

---

## Pré-requisitos

```bash
cd capitulo-07-arquitetura
npm install  # instala tsx + typescript
```

---

## Como executar

```bash
npx tsx exemplos/feature-index.ts
npx tsx exemplos/dependency-injection.ts
npx tsx exemplos/clean-architecture.ts
npx tsx exemplos/monorepo-config.ts
```

---

## Mapa de exemplos por seção

### 7.1 — Estrutura feature-first
```
src/features/users/
├── components/   UserCard.tsx, UserList.tsx
├── hooks/        useUser.ts, useUserList.ts
├── services/     userService.ts
├── types/        user.types.ts
└── index.ts      ← API pública — só isso é visível de fora

src/shared/       ← Código genuinamente compartilhado
src/pages/        ← Só composição de features
```

```ts
// ✅ Pelo barrel público
import { UserCard, useUser } from '@/features/users';

// ❌ Acesso interno direto (proibido — automatize com eslint-plugin-boundaries)
import { UserCard } from '@/features/users/components/UserCard';
```

### 7.2 — Separação de concerns
```ts
// Camada de Serviço — só comunicação com API
const userService = { findById: async (id) => fetch(`/api/users/${id}`) };

// Camada de Estado — gerencia estado e lógica
function useUser(userId) { /* busca + estado + erro */ return { user, loading, error }; }

// Camada de UI — só renderiza
function UserCard({ userId }) {
  const { user, loading, error } = useUser(userId);
  return <div>{user.name}</div>; // zero lógica de fetch
}
```

### 7.3 — Dependency Injection
```ts
// DI com parâmetros — forma mais simples
async function registerUser(input, repo: UserRepository, email: EmailSender) {
  const user = await repo.create(input);
  await email.send({ to: user.email, ... });
}

// Em produção:  registerUser(input, prismaRepo, sendGridSender)
// Em testes:    registerUser(input, inMemoryRepo, fakeEmailSender)

// DI com classes — constructor injection
class UserService {
  constructor(
    private repo:   UserRepository,
    private email:  EmailService,
    private logger: Logger
  ) {}
}

// DI com closures — estilo funcional
const userService = createUserService(prismaRepo, sendGridService, winstonLogger);
```

### 7.4 — Clean Architecture (pragmática)
```ts
// 1. Entidade — regras de negócio puras (sem Express, sem Prisma)
class Order {
  get total() { return this.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0); }
  cancel() { if (!this.canBeCancelled()) throw new Error(...); this.status = 'cancelled'; }
}

// 2. Repositório — interface sem implementação
interface OrderRepository { findById(id): Promise<Order|null>; save(order): Promise<Order>; }

// 3. Use Case — orquestra sem saber de HTTP ou banco
class CancelOrderUseCase {
  async execute(orderId, userId) {
    const order = await this.orderRepo.findById(orderId);
    order.cancel(); // regra na entidade
    await this.orderRepo.save(order);
    await this.notifier.sendCancellationEmail(order);
  }
}
// Testável com OrderRepository em memória — sem banco, sem servidor!
```

### 7.5 — Monorepos
```json
// package.json da raiz
{ "workspaces": ["packages/*", "apps/*"] }
```
```json
// turbo.json
{ "tasks": { "build": { "dependsOn": ["^build"], "outputs": ["dist/"] } } }
```
```bash
turbo run build           # build em paralelo com cache
turbo run test --filter=@myapp/api
```

---

## Caso Real — React 3 anos, 180 componentes, 3 meses de refatoração

| Métrica | Antes | Depois |
|---------|-------|--------|
| Merge conflicts | 8/semana | 1/mês |
| Tamanho médio dos arquivos | 280 linhas | 85 linhas |
| Código duplicado | baseline | -1.200 linhas |
| Cobertura de testes | 12% | 67% |
| Tempo de build | 45s | 28s |
| Onboarding de novo dev | 1 semana | 2 dias |
| Satisfação do time | 5,2/10 | 8,4/10 |

**Estratégia: Strangler Fig Pattern** — migrar uma feature por sprint, sem big bang.

**Lições:**
- `index.ts` de cada feature é o item mais valioso — cuide bem dele
- Valide dependências automaticamente no CI (`check-deps.js`)
- `shared/` deve ser pequeno — se crescer demais, provavelmente é uma feature
- Documente as regras de arquitetura em um ADR

---

## Exercícios (do livro)

**Exercício 1** → Reorganizar um projeto por tipo → feature-first, definir `index.ts` de cada feature.

**Exercício 2** → Refatorar um serviço com dependências hardcoded: criar interfaces, injetar via constructor, escrever testes sem banco.

**Exercício 3** → Implementar um use case completo (ex: fazer pedido): entidade → repositório → use case → testar com repositório in-memory.

---

## Recursos

- [Clean Architecture — Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Feature-Sliced Design](https://feature-sliced.design)
- [Turborepo docs](https://turbo.build/repo/docs)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
