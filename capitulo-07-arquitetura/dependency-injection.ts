// dependency-injection.ts — Seção 7.3: Dependency Injection em JavaScript
// Capítulo 7 — Do Monolito ao Modular
//
// Execute: npx tsx exemplos/dependency-injection.ts

// ─────────────────────────────────────────────────────────────
// O problema: dependência hardcoded — impossível de testar
// ─────────────────────────────────────────────────────────────

// ❌ Acoplado ao SendGrid
// import { sendEmail } from './emailProvider';
// export async function registerUser(input: CreateUserInput) {
//   const user = await db.users.create(input);
//   await sendEmail({ to: user.email, subject: 'Bem-vindo!', body: `Olá, ${user.name}` });
//   return user;
// }
// Para testar → precisa mockar o módulo inteiro.
// Para trocar SendGrid por SES → muda o import aqui.

// ─────────────────────────────────────────────────────────────
// Tipos e interfaces comuns
// ─────────────────────────────────────────────────────────────

interface User {
  id:    number;
  name:  string;
  email: string;
  role:  'admin' | 'user' | 'guest';
}

interface CreateUserInput {
  name:     string;
  email:    string;
  password: string;
}

// ─────────────────────────────────────────────────────────────
// DI com interfaces — programe para interfaces, não implementações
// ─────────────────────────────────────────────────────────────

interface EmailSender {
  send(options: { to: string; subject: string; body: string }): Promise<void>;
}

interface UserRepository {
  findById(id: number): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: number, input: Partial<User>): Promise<User>;
}

interface EmailService {
  sendWelcome(user: User): Promise<void>;
  sendPasswordReset(user: User, token: string): Promise<void>;
}

interface Logger {
  info(message: string, meta?: object): void;
  error(message: string, error?: Error): void;
}

// ─────────────────────────────────────────────────────────────
// DI com parâmetros de função — forma mais simples
// ─────────────────────────────────────────────────────────────

// ✅ Dependência injetada — testável e flexível
export async function registerUser(
  input:       CreateUserInput,
  repo:        UserRepository,
  emailSender: EmailSender
): Promise<User> {
  const user = await repo.create(input);
  await emailSender.send({
    to:      user.email,
    subject: 'Bem-vindo!',
    body:    `Olá, ${user.name}`,
  });
  return user;
}

// Em produção: registerUser(input, prismaRepo, sendGridSender)
// Em testes:   registerUser(input, inMemoryRepo, mockEmailSender)

// ─────────────────────────────────────────────────────────────
// DI com classes e constructor injection
// ─────────────────────────────────────────────────────────────

export class UserService {
  constructor(
    private readonly repo:   UserRepository,
    private readonly email:  EmailService,
    private readonly logger: Logger
  ) {}

  async register(input: CreateUserInput): Promise<User> {
    this.logger.info('Registering user', { email: input.email });
    const user = await this.repo.create(input);
    await this.email.sendWelcome(user);
    this.logger.info('User registered', { userId: user.id });
    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findById(id);
  }
}

// Composição em produção — src/config/dependencies.ts:
// import { PrismaUserRepository } from './repositories/PrismaUserRepository';
// import { SendGridEmailService }  from './services/SendGridEmailService';
// import { WinstonLogger }         from './utils/WinstonLogger';
// export const userService = new UserService(
//   new PrismaUserRepository(prismaClient),
//   new SendGridEmailService(process.env.SENDGRID_KEY!),
//   new WinstonLogger()
// );

// ─────────────────────────────────────────────────────────────
// DI com closures — alternativa funcional
// ─────────────────────────────────────────────────────────────

export function createUserService(
  repo:   UserRepository,
  email:  EmailService,
  logger: Logger
) {
  return {
    register: async (input: CreateUserInput): Promise<User> => {
      logger.info('Registering', { email: input.email });
      const user = await repo.create(input);
      await email.sendWelcome(user);
      return user;
    },
    findById: (id: number) => repo.findById(id),
  };
}

// ─────────────────────────────────────────────────────────────
// Container de DI simples — para projetos grandes
// ─────────────────────────────────────────────────────────────

// Nota: este container simples não detecta dependências circulares.
// Para produção, considere TSyringe, InversifyJS ou Awilix.

class Container {
  private services = new Map<string, unknown>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory());
  }

  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) throw new Error(`Service '${key}' not registered`);
    return service as T;
  }
}

export const container = new Container();

// ─────────────────────────────────────────────────────────────
// Implementações fake/in-memory para testes e demos
// ─────────────────────────────────────────────────────────────

let nextId = 1;
const inMemoryUsers: User[] = [];

const InMemoryUserRepository: UserRepository = {
  findById: async (id) => inMemoryUsers.find(u => u.id === id) ?? null,
  create: async (input) => {
    const user: User = { id: nextId++, ...input, role: 'user' } as User;
    inMemoryUsers.push(user);
    return user;
  },
  update: async (id, input) => {
    const idx  = inMemoryUsers.findIndex(u => u.id === id);
    if (idx < 0) throw new Error('User not found');
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...input };
    return inMemoryUsers[idx];
  },
};

const sentEmails: Array<{ to: string; subject: string }> = [];

const FakeEmailService: EmailService = {
  sendWelcome: async (user) => {
    sentEmails.push({ to: user.email, subject: 'Bem-vindo!' });
  },
  sendPasswordReset: async (user, token) => {
    sentEmails.push({ to: user.email, subject: `Reset: ${token}` });
  },
};

const FakeEmailSender: EmailSender = {
  send: async (opts) => { sentEmails.push({ to: opts.to, subject: opts.subject }); },
};

const SilentLogger: Logger = {
  info:  (msg, meta) => console.log(`[INFO]  ${msg}`, meta ?? ''),
  error: (msg, err)  => console.error(`[ERROR] ${msg}`, err?.message ?? ''),
};

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== DI com parâmetros de função ===');
const user1 = await registerUser(
  { name: 'Diana', email: 'd@db.dev', password: 's3cret' },
  InMemoryUserRepository,
  FakeEmailSender
);
console.log('registerUser criou:', user1);
console.log('email enviado:', sentEmails[sentEmails.length - 1]);

console.log('\n=== DI com classes (constructor injection) ===');
const service = new UserService(InMemoryUserRepository, FakeEmailService, SilentLogger);
const user2   = await service.register({ name: 'Victor', email: 'v@db.dev', password: 's3cret' });
console.log('UserService.register criou:', user2);
console.log('findById(2):', await service.findById(2));
console.log('findById(99):', await service.findById(99));

console.log('\n=== DI com closures ===');
const svc2   = createUserService(InMemoryUserRepository, FakeEmailService, SilentLogger);
const user3  = await svc2.register({ name: 'Ana', email: 'a@db.dev', password: 's3cret' });
console.log('createUserService criou:', user3);

console.log('\n=== Container de DI ===');
container.register<UserRepository>('userRepo',     () => InMemoryUserRepository);
container.register<EmailService>  ('emailService', () => FakeEmailService);
container.register<Logger>        ('logger',        () => SilentLogger);
container.register<UserService>   ('userService',   () => new UserService(
  container.resolve('userRepo'),
  container.resolve('emailService'),
  container.resolve('logger')
));
const resolved = container.resolve<UserService>('userService');
const user4    = await resolved.register({ name: 'Lucas', email: 'l@db.dev', password: 's3cret' });
console.log('container.resolve criou:', user4);

console.log('\n💡 Todos os usuários criados em memória — sem banco de dados, sem rede');
console.log('  Total usuários:', inMemoryUsers.length);
console.log('  Total e-mails enviados:', sentEmails.length);

// Nota: o problema com dependência hardcoded (seção 7.3):
// import { sendEmail } from './emailProvider'; // Acoplado ao SendGrid
// → Para testar, precisa mockar o módulo inteiro.
// → Para trocar SendGrid por SES, muda o import em todo lugar.
