// demo-websocket.js — Demo executável: conceitos do capítulo 10 sem dependências externas
// Capítulo 10 — Real-Time com WebSockets
//
// Execute: node exemplos/demo-websocket.js

// ─────────────────────────────────────────────────────────────
// Demo 1: Protocolo interno de mensagens (seção 10.2)
// ─────────────────────────────────────────────────────────────

console.log('=== Protocolo de mensagens ===\n');

// Simula o protocolo cliente → servidor / servidor → cliente
const clientMessages = [
  { type: 'join',    roomId: 'geral' },
  { type: 'message', roomId: 'geral', text: 'Olá a todos!' },
  { type: 'typing',  roomId: 'geral', isTyping: true },
  { type: 'leave',   roomId: 'geral' },
];

const serverMessages = [
  { type: 'welcome',     message: 'Bem-vindo, Diana!' },
  { type: 'joined',      roomId: 'geral', users: [{ userId: '1', username: 'Diana' }] },
  { type: 'user-joined', roomId: 'geral', username: 'Victor' },
  { type: 'message',     roomId: 'geral', username: 'Victor', text: 'Oi!', timestamp: Date.now() },
  { type: 'user-left',   roomId: 'geral', username: 'Diana' },
];

console.log('Mensagens cliente → servidor:');
clientMessages.forEach(m => console.log(`  ${JSON.stringify(m)}`));

console.log('\nMensagens servidor → cliente:');
serverMessages.forEach(m => console.log(`  ${m.type.padEnd(15)}: ${JSON.stringify(Object.keys(m).slice(1))}`));

// ─────────────────────────────────────────────────────────────
// Demo 2: Backoff exponencial (seção 10.3)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Reconexão: backoff exponencial ===\n');

function calcBackoff(attempt, baseDelay = 1000) {
  return baseDelay * Math.pow(2, attempt - 1);
}

for (let i = 1; i <= 5; i++) {
  const delay = calcBackoff(i);
  const bar   = '█'.repeat(Math.round(delay / 500));
  console.log(`  Tentativa ${i}: ${String(delay).padStart(5)}ms  ${bar}`);
}

// Fechamentos que NÃO reconectam:
console.log('\nCódigos de fechamento:');
console.log('  1000 — Normal closure (intencional) → NÃO reconecta');
console.log('  1001 — Going away (ex: navegação)  → NÃO reconecta');
console.log('  1006 — Conexão abnormal              → reconecta');
console.log('  1008 — Policy violation (auth fail) → NÃO reconecta');

// ─────────────────────────────────────────────────────────────
// Demo 3: Fila de mensagens offline (seção 10.3)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Fila de mensagens offline ===\n');

class MessageQueue {
  #queue = [];
  #connected = false;
  #sent = [];

  connect() {
    this.#connected = true;
    this.#flush();
  }

  disconnect() { this.#connected = false; }

  send(msg) {
    if (this.#connected) {
      this.#sent.push(msg);
      console.log(`  → enviado imediatamente: ${msg.type}`);
    } else {
      this.#queue.push(msg);
      console.log(`  ⏳ enfileirado (offline): ${msg.type}`);
    }
  }

  #flush() {
    if (this.#queue.length === 0) return;
    console.log(`  📤 reconectado — enviando ${this.#queue.length} mensagem(ns) da fila`);
    this.#queue.forEach(m => { this.#sent.push(m); console.log(`     → ${m.type}`); });
    this.#queue = [];
  }

  stats() { return { queued: this.#queue.length, sent: this.#sent.length }; }
}

const q = new MessageQueue();
q.send({ type: 'join',    roomId: 'geral' }); // enfileirada
q.send({ type: 'message', text: 'Olá!' });    // enfileirada
console.log('  [conectando...]');
q.connect();
q.send({ type: 'message', text: 'Depois' });  // imediato
console.log(`  Stats: ${JSON.stringify(q.stats())}`);

// ─────────────────────────────────────────────────────────────
// Demo 4: Heartbeat simulado (seção 10.5)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Heartbeat (ping/pong) ===\n');

class FakeServer {
  #clients = new Map(); // id → { alive, pings }

  connect(id) {
    this.#clients.set(id, { alive: true, pings: 0 });
    console.log(`  + ${id} conectou`);
  }

  pong(id) {
    const c = this.#clients.get(id);
    if (c) c.alive = true;
  }

  heartbeat() {
    const zombies = [];
    this.#clients.forEach((c, id) => {
      if (!c.alive) { zombies.push(id); this.#clients.delete(id); return; }
      c.alive = false;
      c.pings++;
    });
    return zombies;
  }

  active() { return [...this.#clients.keys()]; }
}

const srv = new FakeServer();
srv.connect('alice');
srv.connect('bob');
srv.connect('zombie');

console.log(`  Clientes: ${srv.active().join(', ')}`);
srv.heartbeat();       // Ping enviado — todos marcados como !alive
srv.pong('alice');     // Respondeu
srv.pong('bob');       // Respondeu
// zombie NÃO responde

const removed = srv.heartbeat(); // Zombie removido
console.log(`  Zumbi removido: ${removed.join(', ')}`);
console.log(`  Ativos após heartbeat: ${srv.active().join(', ')}`);
console.log(`  💡 O heartbeat removeu 15% das conexões "ativas" no Caso Real`);

// ─────────────────────────────────────────────────────────────
// Demo 5: Redis Pub/Sub (simulado) (seção 10.5)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Redis Pub/Sub simulado ===\n');

class FakeRedisPubSub {
  #channels = new Map();
  publish(channel, message) {
    const subs = this.#channels.get(channel) ?? [];
    subs.forEach(cb => cb(channel, message));
    return subs.length;
  }
  subscribe(channel, cb) {
    if (!this.#channels.has(channel)) this.#channels.set(channel, []);
    this.#channels.get(channel).push(cb);
  }
}

const redis = new FakeRedisPubSub();
const delivered = [];

// Server 1 subscribed
redis.subscribe('chat', (ch, raw) => {
  const msg = JSON.parse(raw);
  if (msg.liveId === 'live-1') {
    delivered.push({ server: 'S1', user: msg.username });
  }
});

// Server 2 subscribed
redis.subscribe('chat', (ch, raw) => {
  const msg = JSON.parse(raw);
  if (msg.liveId === 'live-1') {
    delivered.push({ server: 'S2', user: msg.username });
  }
});

// Cliente B (em Server 2) envia mensagem
const count = redis.publish('chat', JSON.stringify({
  type: 'chat', liveId: 'live-1', username: 'Victor', text: 'Olá!', ts: Date.now()
}));

console.log(`  Mensagem publicada para ${count} servers`);
console.log(`  Entregue por: ${delivered.map(d => d.server).join(', ')}`);
console.log(`  Clientes que receberam: ${delivered.length} (em 2 servers diferentes)`);

// ─────────────────────────────────────────────────────────────
// Resumo de decisão
// ─────────────────────────────────────────────────────────────

console.log('\n=== Quando usar cada abordagem ===\n');

const decisao = [
  { cenario: 'Notificações ocasionais',     solucao: 'SSE (mais simples, reconexão automática)' },
  { cenario: 'Progresso de tarefas',         solucao: 'SSE (unidirecional suficiente)' },
  { cenario: 'Chat em tempo real',           solucao: 'WebSocket (bidirecional obrigatório)' },
  { cenario: 'Dashboard financeiro',         solucao: 'WebSocket (latência crítica)' },
  { cenario: 'Jogo multiplayer',             solucao: 'WebSocket (60+ updates/s)' },
  { cenario: 'Infra sem WS (proxy corp.)',   solucao: 'Long Polling (fallback)' },
  { cenario: '1 server → múltiplos servers', solucao: 'Redis Pub/Sub (escala horizontal)' },
  { cenario: 'Equipe quer abstração',        solucao: 'Socket.IO + Redis adapter' },
];

decisao.forEach(({ cenario, solucao }) => {
  console.log(`  ${cenario.padEnd(35)}: ${solucao}`);
});
