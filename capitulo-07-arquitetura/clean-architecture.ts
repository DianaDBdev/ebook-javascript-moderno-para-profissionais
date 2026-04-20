// clean-architecture.ts — Seção 7.4: Clean Architecture adaptada para JavaScript
// Capítulo 7 — Do Monolito ao Modular
//
// Execute: npx tsx exemplos/clean-architecture.ts

// ─────────────────────────────────────────────────────────────
// A Regra da Dependência: as setas apontam para dentro
// ─────────────────────────────────────────────────────────────

// ┌─────────────────────────────────────────┐
// │       Frameworks & Drivers               │  ← Express, React, Prisma
// │  ┌───────────────────────────────────┐  │
// │  │     Interface Adapters             │  │  ← Controllers, Presenters
// │  │  ┌─────────────────────────────┐  │  │
// │  │  │    Application (Use Cases)   │  │  │  ← Regras de aplicação
// │  │  │  ┌───────────────────────┐  │  │  │
// │  │  │  │   Domain (Entities)   │  │  │  │  ← Regras de negócio
// │  │  │  └───────────────────────┘  │  │  │
// │  │  └─────────────────────────────┘  │  │
// │  └───────────────────────────────────┘  │
// └─────────────────────────────────────────┘
//
// Express depende do Controller. Controller depende do Use Case.
// Use Case depende do Domain. O Domain NÃO sabe que Express existe.

// ─────────────────────────────────────────────────────────────
// Estrutura pragmática para APIs Node.js (sem over-engineering)
// ─────────────────────────────────────────────────────────────

// src/modules/orders/
// ├── order.entity.ts          ← Regras de negócio puras
// ├── order.use-cases.ts       ← Orquestração dos casos de uso
// ├── order.repository.ts      ← Interface (contrato)
// ├── order.controller.ts      ← Adaptador HTTP (Express)
// └── order.repository.impl.ts ← Implementação (Prisma)

// ─────────────────────────────────────────────────────────────
// 1. A ENTIDADE — regras de negócio puras (sem imports de framework)
// ─────────────────────────────────────────────────────────────

interface OrderItem {
  productId: number;
  quantity:  number;
  unitPrice: number;
}

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export class Order {
  constructor(
    public readonly id:     number,
    public readonly userId: number,
    public readonly items:  OrderItem[],
    public          status: OrderStatus,
  ) {}

  // Regras de negócio vivem aqui
  get total(): number {
    return this.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice, 0
    );
  }

  canBeCancelled(): boolean {
    return this.status === 'pending' || this.status === 'paid';
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error(`Order ${this.id} cannot be cancelled: ${this.status}`);
    }
    this.status = 'cancelled';
  }
}

// ─────────────────────────────────────────────────────────────
// 2. O REPOSITÓRIO — interface sem implementação
// ─────────────────────────────────────────────────────────────

export interface OrderRepository {
  findById(id: number): Promise<Order | null>;
  findByUser(userId: number): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  delete(id: number): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// 3. O CASO DE USO — orquestra sem saber de HTTP ou banco
// ─────────────────────────────────────────────────────────────

class NotFoundError extends Error  { constructor(m: string) { super(m); this.name = 'NotFoundError';  } }
class ForbiddenError extends Error { constructor(m: string) { super(m); this.name = 'ForbiddenError'; } }

interface NotificationService {
  sendCancellationEmail(order: Order): Promise<void>;
}

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly notifier:  NotificationService
  ) {}

  async execute(orderId: number, userId: number): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order)             throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Not your order');

    order.cancel(); // regra de negócio na entidade
    await this.orderRepo.save(order);
    await this.notifier.sendCancellationEmail(order);
    return order;
  }
}

// ─────────────────────────────────────────────────────────────
// 4. O CONTROLLER — adaptador HTTP, sem lógica de negócio
// ─────────────────────────────────────────────────────────────

// Em produção (Express):
// export class OrderController {
//   constructor(private readonly cancelOrder: CancelOrderUseCase) {}
//
//   async cancel(req: TypedRequest, res: TypedResponse<Order>) {
//     try {
//       const order = await this.cancelOrder.execute(
//         Number(req.params.id),
//         req.user.id
//       );
//       res.json({ data: order, error: null, message: 'Order cancelled' });
//     } catch (err) {
//       if (err instanceof NotFoundError)  return res.status(404).json(...);
//       if (err instanceof ForbiddenError) return res.status(403).json(...);
//       throw err;
//     }
//   }
// }

// ─────────────────────────────────────────────────────────────
// Implementações fake para demonstração e testes
// ─────────────────────────────────────────────────────────────

// Repositório em memória — sem banco de dados
class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  async findById(id: number)       { return this.orders.find(o => o.id === id) ?? null; }
  async findByUser(userId: number) { return this.orders.filter(o => o.userId === userId); }
  async save(order: Order)         { 
    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) this.orders[idx] = order; else this.orders.push(order);
    return order;
  }
  async delete(id: number)         { this.orders = this.orders.filter(o => o.id !== id); }
}

const cancelledOrders: number[] = [];
const FakeNotifier: NotificationService = {
  sendCancellationEmail: async (order) => {
    cancelledOrders.push(order.id);
    console.log(`  📧 E-mail de cancelamento enviado para pedido #${order.id}`);
  }
};

// ─────────────────────────────────────────────────────────────
// Quando aplicar — e quando não aplicar
// ─────────────────────────────────────────────────────────────

// ✅ Aplique quando:
//   • Lógica de negócio complexa que precisa ser testada isoladamente
//   • Múltiplos pontos de entrada (HTTP, CLI, workers, eventos)
//   • Previsão de troca de banco de dados ou framework
//   • Time grande trabalhando em paralelo

// ❌ Não aplique quando:
//   • CRUD simples sem regras de negócio relevantes
//   • Protótipos ou MVPs com prazo curto
//   • Projetos pequenos com 1–2 devs
//   • Scripts e automações pontuais

// ─────────────────────────────────────────────────────────────
// Demo executável — o use case testado SEM banco, SEM HTTP
// ─────────────────────────────────────────────────────────────
console.log('=== Clean Architecture — CancelOrderUseCase ===\n');

const repo     = new InMemoryOrderRepository();
const useCase  = new CancelOrderUseCase(repo, FakeNotifier);

// Criar um pedido de teste
const order = new Order(1, 42, [
  { productId: 1, quantity: 2, unitPrice: 49.90 },
  { productId: 2, quantity: 1, unitPrice: 5.50  },
], 'paid');

await repo.save(order);
console.log('Pedido criado:');
console.log(`  id: ${order.id} | userId: ${order.userId} | status: ${order.status}`);
console.log(`  total: R$ ${order.total.toFixed(2)}`);
console.log(`  canBeCancelled(): ${order.canBeCancelled()}`);

console.log('\nExecutando CancelOrderUseCase...');
const cancelled = await useCase.execute(1, 42); // orderId=1, userId=42
console.log(`  Pedido #${cancelled.id} → status: ${cancelled.status}`);

console.log('\nTentando cancelar novamente (já cancelado):');
try {
  await useCase.execute(1, 42);
} catch (e) {
  console.log(`  Erro esperado: ${(e as Error).message}`);
}

console.log('\nTentando cancelar pedido de outro usuário:');
try {
  await useCase.execute(1, 99); // userId errado
} catch (e) {
  console.log(`  Erro esperado: ${(e as Error).message}`);
}

console.log('\nTentando cancelar pedido inexistente:');
try {
  await useCase.execute(999, 42);
} catch (e) {
  console.log(`  Erro esperado: ${(e as Error).message}`);
}

console.log('\n💡 Tudo testado sem banco de dados, sem servidor HTTP.');
console.log('   Esse é o valor real da Clean Architecture.');
