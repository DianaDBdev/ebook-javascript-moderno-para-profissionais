// redis-pubsub.ts — Seção 10.5: Escalando WebSockets + Redis Pub/Sub + Heartbeat
// Capítulo 10 — Real-Time com WebSockets
//
// Execute: npx tsx exemplos/redis-pubsub.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.5 — O problema das sticky sessions
// ─────────────────────────────────────────────────────────────

console.log('=== Escalando WebSockets em produção ===\n');

// HTTP — stateless, qualquer servidor atende:
// Cliente → Load Balancer → Server 1 (request 1)
// Cliente → Load Balancer → Server 2 (request 2) ← funciona
// Cliente → Load Balancer → Server 3 (request 3) ← funciona

// WebSocket — stateful, o cliente precisa SEMPRE do mesmo servidor:
// Cliente A → Load Balancer → Server 1 (conexão estabelecida)
// Se o LB rotear para Server 2 na próxima mensagem → CONEXÃO QUEBRA

console.log('Escalabilidade WebSocket:\n');
console.log('  HTTP (stateless)  : qualquer server atende qualquer request ✅');
console.log('  WebSocket (stateful): cliente precisa sempre do mesmo server ⚠️');
console.log('  Solução 1: Sticky sessions (simples, mas frágil por IP)');
console.log('  Solução 2: Redis Pub/Sub (correta para escala real)');
console.log('  Solução 3: Socket.IO + Redis adapter (abstração pronta)\n');

// ─────────────────────────────────────────────────────────────
// Solução 1: Sticky sessions — nginx.conf
// ─────────────────────────────────────────────────────────────

const nginxConfig = `
# nginx.conf — sticky sessions por IP
upstream websocket {
  ip_hash;         # Mesmo IP sempre vai para o mesmo server
  server server1:3000;
  server server2:3000;
  server server3:3000;
}
server {
  location /ws {
    proxy_pass             http://websocket;
    proxy_http_version     1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout     3600s;  # Manter conexão por 1h
  }
}
`.trim();

console.log('=== nginx.conf (sticky sessions) ===\n');
console.log(nginxConfig);
console.log('\n⚠️ Sticky sessions por IP falham quando múltiplos usuários estão');
console.log('   atrás do mesmo IP (escritório, proxy corporativo).');
console.log('   Para escala real, use Redis Pub/Sub.\n');

// ─────────────────────────────────────────────────────────────
// Solução 2: Redis Pub/Sub
// ─────────────────────────────────────────────────────────────

console.log('=== Arquitetura Redis Pub/Sub ===\n');
console.log('Cliente A → Server 1 ─┐');
console.log('Cliente B → Server 2 ─┼─→ Redis Pub/Sub → todos os servers');
console.log('Cliente C → Server 1 ─┘');
console.log();
console.log('Fluxo de uma mensagem:');
console.log('  1. Cliente B envia mensagem para sala "geral"');
console.log('  2. Server 2 recebe');
console.log('  3. Server 2 publica no Redis canal "room:geral"');
console.log('  4. Redis distribui para Server 1 e Server 3');
console.log('  5. Server 1 entrega para Clientes A e C');
console.log();

// Implementação Redis Pub/Sub:
// import { WebSocketServer, WebSocket } from 'ws';
// import Redis from 'ioredis';
//
// const redis    = new Redis(process.env.REDIS_URL!);
// const redisSub = redis.duplicate(); // Conexão separada para subscribe
// const wss      = new WebSocketServer({ port: 3000 });
// const clients  = new Map<WebSocket, { roomId: string }>();
//
// redisSub.subscribe('chat');
// redisSub.on('message', (_channel, message) => {
//   const data = JSON.parse(message);
//   // Entregar apenas para clientes locais na sala correta
//   clients.forEach((client, ws) => {
//     if (client.roomId === data.roomId && ws.readyState === WebSocket.OPEN) {
//       ws.send(message);
//     }
//   });
// });
//
// wss.on('connection', (ws) => {
//   ws.on('message', (data) => {
//     const msg = JSON.parse(data.toString());
//     if (msg.type === 'chat') {
//       redis.publish('chat', JSON.stringify(msg)); // Todos os servers recebem
//     }
//     if (msg.type === 'join') clients.set(ws, { roomId: msg.roomId });
//   });
//   ws.on('close', () => clients.delete(ws));
// });

// ─────────────────────────────────────────────────────────────
// Solução 3: Socket.IO com Redis adapter
// ─────────────────────────────────────────────────────────────

// import { Server }         from 'socket.io';
// import { createAdapter } from '@socket.io/redis-adapter';
// import Redis              from 'ioredis';
//
// const io        = new Server(3000, { cors: { origin: '*' } });
// const pubClient = new Redis(process.env.REDIS_URL!);
// const subClient = pubClient.duplicate();
//
// io.adapter(createAdapter(pubClient, subClient));
//
// io.on('connection', (socket) => {
//   socket.on('join', (roomId: string) => {
//     socket.join(roomId);
//     io.to(roomId).emit('user-joined', { id: socket.id });
//   });
//   socket.on('chat', (msg: { roomId: string; text: string }) => {
//     io.to(msg.roomId).emit('chat', { ...msg, timestamp: Date.now() });
//   });
// });

// 💡 Socket.IO cuida de reconexão, heartbeat, fallback para polling e
//    sincronização via Redis. Recomendado para equipes que querem foco
//    no produto, não na infraestrutura WebSocket.

// ─────────────────────────────────────────────────────────────
// Heartbeat — detectar conexões zumbis
// ─────────────────────────────────────────────────────────────

console.log('=== Heartbeat — conexões zumbis ===\n');
console.log('Sem heartbeat: cliente sumiu, servidor não sabe → zumbi consome recursos');
console.log('Com heartbeat: ping a cada 30s → sem pong → terminate()\n');

// Implementação heartbeat:
// class WebSocketServerWithHeartbeat {
//   private clients = new Map<WebSocket, { isAlive: boolean; lastSeen: number }>();
//
//   constructor(private wss: WebSocketServer) {
//     this.startHeartbeat();
//     wss.on('connection', (ws) => this.handleConnection(ws));
//   }
//
//   private startHeartbeat() {
//     setInterval(() => {
//       this.clients.forEach((client, ws) => {
//         if (!client.isAlive) {
//           console.log('Terminando conexão inativa');
//           ws.terminate();
//           this.clients.delete(ws);
//           return;
//         }
//         client.isAlive = false;
//         ws.ping(); // Ping a cada 30s
//       });
//     }, 30_000);
//   }
//
//   private handleConnection(ws: WebSocket) {
//     this.clients.set(ws, { isAlive: true, lastSeen: Date.now() });
//     ws.on('pong', () => {
//       const client = this.clients.get(ws);
//       if (client) { client.isAlive = true; client.lastSeen = Date.now(); }
//     });
//     ws.on('close', () => this.clients.delete(ws));
//   }
// }

// Simulação do heartbeat:
class HeartbeatSimulator {
  private clients = new Map<string, { isAlive: boolean; pings: number }>();

  addClient(id: string) {
    this.clients.set(id, { isAlive: true, pings: 0 });
  }

  tick() {
    const removed: string[] = [];
    this.clients.forEach((client, id) => {
      if (!client.isAlive) {
        removed.push(id);
        this.clients.delete(id);
        return;
      }
      client.isAlive = false; // Aguarda pong
      client.pings++;
    });
    return removed;
  }

  pong(id: string) {
    const c = this.clients.get(id);
    if (c) c.isAlive = true;
  }

  active() { return this.clients.size; }
}

const hb = new HeartbeatSimulator();
hb.addClient('alice');
hb.addClient('bob');
hb.addClient('zombie'); // Não vai responder ao pong

console.log(`Clientes conectados: ${hb.active()}`);

// Tick 1: ping enviado
hb.tick();
hb.pong('alice'); // Alice responde
hb.pong('bob');   // Bob responde
// zombie NÃO responde

// Tick 2: zombie é removido
const removed = hb.tick();
console.log(`Zumbis removidos: ${removed.join(', ')}`);
console.log(`Clientes ativos após heartbeat: ${hb.active()}`);

// ─────────────────────────────────────────────────────────────
// Caso Real — Arquitetura completa (seção 10.5)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso Real: 100k conexões simultâneas ===\n');

const arquitetura = [
  'AWS Application Load Balancer (sticky sessions por cookie)',
  'EC2 Auto Scaling Group (10–50 instâncias Node.js)',
  'Redis Cluster (Pub/Sub + cache de mensagens recentes)',
  'DynamoDB (mensagens persistidas — acesso eventual, assíncrono)',
];

console.log('Stack final:');
arquitetura.forEach(a => console.log(`  • ${a}`));

const metricas = [
  { metrica: 'Conexões por instância',   valor: '8 mil (limite seguro: 10k)' },
  { metrica: 'Latência p99',             valor: '87ms (meta: <200ms)' },
  { metrica: 'Throughput máximo',        valor: '12k msg/s com 15 instâncias' },
  { metrica: 'Uptime (6 meses)',         valor: '99,96%' },
  { metrica: 'Custo vs V1',             valor: '+40% infra, 10× mais usuários' },
];

console.log('\nMétricas em produção:');
metricas.forEach(({ metrica, valor }) => {
  console.log(`  ${metrica.padEnd(30)}: ${valor}`);
});

const licoes = [
  'Sticky sessions por cookie > por IP (usuários em redes móveis trocam de IP)',
  'Heartbeat obrigatório — sem ele, zumbis consomem recursos silenciosamente',
  'DynamoDB assíncrono mantém latência baixa — nunca espere o banco para responder',
  'Auto Scaling por conexões ativas, não CPU — bottleneck de WS ≠ HTTP',
  'Redis Pub/Sub é eficiente, mas monitore a memória — mensagens grandes causam problemas',
];

console.log('\nLições que só aprendemos em produção:');
licoes.forEach(l => console.log(`  ✓ ${l}`));

// Caso Real — detalhes adicionais (seção 10.5):
//
// Requisitos: 100k conexões simultâneas por live, 5 mil mensagens/segundo nos picos.
//
// V1 — Single Node.js + PostgreSQL:
//   Clientes → Single Node.js (porta 3000) → PostgreSQL
//   Problemas: máximo 10k conexões, PostgreSQL 50ms+ por query, sem redundância.
//
// jwt.verify tipagem correta (evite as any):
//   const user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id: string; name: string };
