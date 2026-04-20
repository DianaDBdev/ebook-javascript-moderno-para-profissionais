# Capítulo 10 — Real-Time com WebSockets

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Quando realmente precisar de WebSocket — e quando SSE ou polling bastam
- ChatServer completo: salas, tipos TypeScript, autenticação JWT
- WebSocketClient robusto: backoff exponencial, fila offline, React hook `useWebSocket`
- SSE e Long Polling: alternativas mais simples para casos unidirecionais
- Escala horizontal: sticky sessions, Redis Pub/Sub, Socket.IO, heartbeat anti-zumbi
- Caso Real: 100k conexões simultâneas, p99 de 87ms, 99,96% uptime em 6 meses

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`servidor/chat-server.ts`](servidor/chat-server.ts) | 10.1 + 10.2 | ChatServer com salas, tipos `ClientMessage`/`ServerMessage`, `handleJoin/Leave/Chat/Typing`, autenticação JWT |
| [`cliente/websocket-client.ts`](cliente/websocket-client.ts) | 10.3 | `WebSocketClient` com backoff exponencial, fila de mensagens offline, `on/off/emit`, React hook `useWebSocket` |
| [`exemplos/sse-server.ts`](exemplos/sse-server.ts) | 10.1 + 10.4 | Tabela comparativa polling/SSE/WS, servidor SSE Express, Long Polling servidor e cliente, simulação de formato |
| [`exemplos/redis-pubsub.ts`](exemplos/redis-pubsub.ts) | 10.5 | Sticky sessions nginx, Redis Pub/Sub (implementação + simulação), Socket.IO adapter, heartbeat, Caso Real |
| [`exemplos/demo-websocket.js`](exemplos/demo-websocket.js) | 10.1–10.5 | **Demo executável** sem deps externas: protocolo, backoff, fila offline, heartbeat, Redis simulado, tabela de decisão |

---

## Como executar

```bash
cd capitulo-10-websockets
npm install  # instala tsx + typescript

# Demo completo (sem deps externas)
node exemplos/demo-websocket.js

# Demos TypeScript
npx tsx servidor/chat-server.ts
npx tsx cliente/websocket-client.ts
npx tsx exemplos/sse-server.ts
npx tsx exemplos/redis-pubsub.ts
```

---

## Mapa por seção

### 10.1 — Quando usar WebSocket

```
Polling simples    → dashboard admin, 10 usuários, 5s é suficiente
Long Polling       → atualizações raras mas rápidas, infra sem WS/SSE
SSE (EventSource)  → notificações, feed, progresso — 60% dos "casos de WS"
WebSocket          → chat, jogos, trading, IoT — latência crítica, bidirecional
```

### 10.2 — ChatServer Node.js

```ts
// Protocolo tipado
type ClientMessage = { type: 'join'; roomId: string } | { type: 'message'; roomId: string; text: string } | ...
type ServerMessage = { type: 'welcome'; message: string } | { type: 'joined'; roomId: string; users: RoomUser[] } | ...

class ChatServer {
  private clients = new Map<WebSocket, ClientData>();
  private rooms   = new Map<string, Set<WebSocket>>();
  // handleJoin, handleLeave, handleChatMessage, handleTyping
  // broadcast(roomId, data, except?) — exclui o sender do typing
}

// JWT auth na conexão (⚠️ nunca confie em dados na mensagem):
const user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
// Tokens em URLs ficam em logs — prefira enviar no primeiro payload
// Headers customizados NÃO funcionam na API nativa do browser
```

### 10.3 — WebSocketClient robusto

```ts
class WebSocketClient {
  private reconnectAttempts = 0;
  private maxAttempts       = 5;
  private baseDelay         = 1000; // ms
  private messageQueue: string[] = [];

  private scheduleReconnect() {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    setTimeout(() => this.connect(), delay);
  }

  send(type, data) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(...);
    else this.messageQueue.push(...); // Enfileira para enviar ao reconectar
  }
}

// React hook
const { isConnected, lastMessage, sendMessage } = useWebSocket(url, { onConnect, onMessage });
```

### 10.4 — SSE (Express)

```ts
// Headers obrigatórios
res.setHeader('Content-Type',      'text/event-stream');
res.setHeader('Cache-Control',     'no-cache');
res.setHeader('Connection',        'keep-alive');
res.setHeader('X-Accel-Buffering', 'no'); // Para Nginx

// Formato de mensagem SSE
res.write(`event: notification\n`);
res.write(`data: ${JSON.stringify(data)}\n\n`);

// Cliente — reconexão automática pelo browser (zero código)
const es = new EventSource('/events?clientId=...');
es.addEventListener('notification', ({ data }) => showNotification(JSON.parse(data)));
```

### 10.5 — Escala

```
Sticky sessions: ip_hash no nginx (simples, falha em IP compartilhado)
Redis Pub/Sub:
  1. Cliente B → Server 2 → redis.publish('chat', msg)
  2. Redis distribui para Server 1 e Server 3
  3. Cada server entrega para seus clientes locais
  → Qualquer server atende qualquer cliente

Heartbeat (ping a cada 30s):
  client.isAlive = false → ws.ping() → ...pong → client.isAlive = true
  Se não respondeu → ws.terminate() → remove zumbi
```

---

## Caso Real — Live streaming, 100k usuários simultâneos

**Requisitos:** 100k conexões por live, 5k msg/s no pico, latência < 200ms, 99,9% uptime.

**V1 quebrou:** Single Node.js → máximo 10k conexões, PostgreSQL 50ms+ inviável para chat.

**V2 stack:**
- AWS ALB (sticky sessions por **cookie**, não IP — usuários em Wi-Fi trocam de IP)
- EC2 Auto Scaling (10–50 instâncias Node.js)
- Redis Cluster (Pub/Sub + cache recente)
- DynamoDB assíncrono (nunca espere o banco para responder ao cliente)

| Métrica | Resultado |
|---------|-----------|
| Conexões por instância | 8k (limite seguro: 10k) |
| Latência p99 | 87ms (meta: <200ms) |
| Throughput máximo | 12k msg/s com 15 instâncias |
| Uptime (6 meses) | 99,96% |

**Lições:**
- Sticky sessions por **cookie** > por IP
- Heartbeat removeu 15% de conexões zumbi em produção
- Auto Scaling baseado em **conexões ativas**, não CPU
- Redis Pub/Sub eficiente — monitore a memória com mensagens grandes

---

## Recursos

- [ws library](https://github.com/websockets/ws)
- [Socket.IO docs](https://socket.io/docs)
- [MDN — WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
