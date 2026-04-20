// chat-server.ts — Seções 10.1 e 10.2: ChatServer completo com salas + JWT auth
// Capítulo 10 — Real-Time com WebSockets
//
// Instale e execute:
//   npm install ws @types/ws jsonwebtoken @types/jsonwebtoken
//   npx tsx servidor/chat-server.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.1 — Quando usar WebSocket
// ─────────────────────────────────────────────────────────────

// ✅ Use WebSocket para:
//   • Chat e messaging — latência < 100 ms crítica, comunicação bidirecional
//   • Jogos multiplayer — sincronização de estado, inputs em tempo real, 60+ updates/s
//   • Edição colaborativa — múltiplos usuários editando, propagação instantânea
//   • Trading e dashboards financeiros — preços mudam várias vezes por segundo
//   • Live streaming de dados, IoT e sensores — fluxo contínuo

// ❌ Evite WebSocket quando:
//   • Notificações raras — 1 a cada 10 minutos: SSE é mais do que suficiente
//   • API request/response — CRUD simples: REST é mais simples e tem cache HTTP
//   • Upload/download de arquivos — HTTP é otimizado para isso
//   • Equipe pequena sem experiência — custo de manutenção em produção é real

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.2 — Tipos de mensagens — protocolo interno
// ─────────────────────────────────────────────────────────────

// Mensagens do cliente → servidor
type ClientMessage =
  | { type: 'join';    roomId: string }
  | { type: 'leave';   roomId: string }
  | { type: 'message'; roomId: string; text: string }
  | { type: 'typing';  roomId: string; isTyping: boolean };

// Mensagens do servidor → cliente
type ServerMessage =
  | { type: 'welcome';     message: string }
  | { type: 'joined';      roomId: string; users: RoomUser[] }
  | { type: 'user-joined'; roomId: string; username: string }
  | { type: 'user-left';   roomId: string; username: string }
  | { type: 'message';     roomId: string; username: string; text: string; timestamp: number }
  | { type: 'typing';      roomId: string; username: string; isTyping: boolean }
  | { type: 'error';       message: string };

interface RoomUser   { userId: string; username: string; }
interface ClientData { userId: string; username: string; rooms: Set<string>; }

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.2 — Setup básico com ws
// ─────────────────────────────────────────────────────────────

// import { WebSocketServer, WebSocket } from 'ws';
// import http from 'http';
// const server = http.createServer();
// const wss    = new WebSocketServer({ server });
//
// wss.on('connection', (ws, request) => {
//   console.log('Cliente conectado');
//   ws.on('message', (data) => {
//     const message = JSON.parse(data.toString());
//     ws.send(JSON.stringify({ type: 'echo', data: message }));
//   });
//   ws.on('close', () => console.log('Cliente desconectou'));
//   ws.on('error', (err) => console.error('Erro:', err));
//   ws.send(JSON.stringify({ type: 'welcome', message: 'Conectado!' }));
// });
// server.listen(3000, () => console.log('WS rodando na porta 3000'));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.2 — Chat server completo com salas
// ─────────────────────────────────────────────────────────────

// import { WebSocketServer, WebSocket } from 'ws';
// import http from 'http';

export class ChatServer {
  private clients = new Map<any, ClientData>();
  private rooms   = new Map<string, Set<any>>();

  constructor() {
    // Em produção:
    // const server = http.createServer();
    // const wss    = new WebSocketServer({ server });
    // wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    // server.listen(3000, () => console.log('Chat server na porta 3000'));
  }

  handleConnection(ws: any, request: any) {
    const url      = new URL(request.url ?? '/', 'http://localhost');
    const userId   = url.searchParams.get('userId')   ?? 'anon';
    const username = url.searchParams.get('username') ?? 'Anônimo';
    this.clients.set(ws, { userId, username, rooms: new Set() });
    console.log(`${username} conectou`);

    ws.on('message', (data: any) => this.handleMessage(ws, data));
    ws.on('close',   ()          => this.handleDisconnect(ws));
    ws.on('error',   (err: any)  => {
      console.error('WS error:', err);
      this.handleDisconnect(ws);
    });

    this.send(ws, { type: 'welcome', message: `Bem-vindo, ${username}!` });
  }

  handleMessage(ws: any, data: any) {
    try {
      // Em produção, valide com Zod antes do cast:
      // o TypeScript não protege dados inválidos em runtime
      const msg = JSON.parse(data.toString()) as ClientMessage;
      switch (msg.type) {
        case 'join':    return this.handleJoin(ws, msg.roomId);
        case 'leave':   return this.handleLeave(ws, msg.roomId);
        case 'message': return this.handleChatMessage(ws, msg);
        case 'typing':  return this.handleTyping(ws, msg);
        default:
          console.warn('Tipo desconhecido:', (msg as any).type);
      }
    } catch (err) {
      console.error('Erro ao parsear mensagem:', err);
      this.send(ws, { type: 'error', message: 'Mensagem inválida' });
    }
  }

  handleJoin(ws: any, roomId: string) {
    const client = this.clients.get(ws)!;
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
    this.rooms.get(roomId)!.add(ws);
    client.rooms.add(roomId);

    // Notificar outros na sala (exclui o próprio cliente)
    this.broadcast(roomId, { type: 'user-joined', roomId, username: client.username }, ws);

    // Confirmar para o cliente
    this.send(ws, { type: 'joined', roomId, users: this.getRoomUsers(roomId) });
    console.log(`${client.username} entrou na sala ${roomId}`);
  }

  handleLeave(ws: any, roomId: string) {
    const client = this.clients.get(ws)!;
    const room   = this.rooms.get(roomId);
    if (!room) return;
    room.delete(ws);
    client.rooms.delete(roomId);
    this.broadcast(roomId, { type: 'user-left', roomId, username: client.username });
    if (room.size === 0) this.rooms.delete(roomId); // Limpar sala vazia
  }

  handleChatMessage(ws: any, msg: Extract<ClientMessage, { type: 'message' }>) {
    const client = this.clients.get(ws)!;
    if (!client.rooms.has(msg.roomId)) return; // Segurança
    this.broadcast(msg.roomId, {
      type:      'message',
      roomId:    msg.roomId,
      username:  client.username,
      text:      msg.text,
      timestamp: Date.now(),
    });
  }

  handleTyping(ws: any, msg: Extract<ClientMessage, { type: 'typing' }>) {
    const client = this.clients.get(ws)!;
    // Exclui o sender
    this.broadcast(msg.roomId, {
      type: 'typing', roomId: msg.roomId,
      username: client.username, isTyping: msg.isTyping,
    }, ws);
  }

  handleDisconnect(ws: any) {
    const client = this.clients.get(ws);
    if (!client) return;
    console.log(`${client.username} desconectou`);
    client.rooms.forEach(roomId => this.handleLeave(ws, roomId));
    this.clients.delete(ws);
  }

  // Helpers
  private send(ws: any, data: ServerMessage) {
    const OPEN = 1; // WebSocket.OPEN
    if (ws.readyState === OPEN) ws.send(JSON.stringify(data));
  }

  private broadcast(roomId: string, data: ServerMessage, except?: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const msg  = JSON.stringify(data);
    const OPEN = 1;
    room.forEach(client => {
      if (client !== except && client.readyState === OPEN) client.send(msg);
    });
  }

  private getRoomUsers(roomId: string): RoomUser[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room).map(ws => {
      const c = this.clients.get(ws)!;
      return { userId: c.userId, username: c.username };
    });
  }

  // Stats para demo
  getStats() {
    return {
      clients:    this.clients.size,
      rooms:      this.rooms.size,
      roomsDetail: Array.from(this.rooms.entries()).map(([id, ws]) => ({
        id, users: ws.size
      })),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.2 — Autenticação WebSocket com JWT
// ─────────────────────────────────────────────────────────────

// import jwt from 'jsonwebtoken';
//
// wss.on('connection', (ws, request) => {
//   const url   = new URL(request.url!, 'http://localhost');
//   const token = url.searchParams.get('token');
//
//   if (!token) {
//     ws.close(1008, 'Token não fornecido');
//     return;
//   }
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
//     clients.set(ws, { ...user, rooms: new Set() });
//     ws.on('message', (data) => handleMessage(ws, data));
//   } catch {
//     ws.close(1008, 'Token inválido ou expirado');
//   }
// });

// 💡 Passe o JWT como query param: ws://host?token=...
//    Para maior segurança, envie no primeiro payload após conectar —
//    tokens em URLs ficam expostos em logs de servidor e histórico do browser.
//    Headers customizados NÃO funcionam na API nativa do browser WebSocket.

// ─────────────────────────────────────────────────────────────
// Demo executável — sem WebSocket real, usando a classe diretamente
// ─────────────────────────────────────────────────────────────
console.log('=== ChatServer — demo (sem conexão real) ===\n');

const server = new ChatServer();

// Simular conexões
const mockWs = (name: string) => {
  const listeners: Record<string, Function> = {};
  const sent: string[] = [];
  return {
    name,
    readyState: 1,
    send: (data: string) => { sent.push(JSON.parse(data).type); },
    on: (event: string, cb: Function) => { listeners[event] = cb; },
    emit: (event: string, data?: any) => listeners[event]?.(data),
    getSent: () => sent,
  };
};

const diana  = mockWs('diana');
const victor = mockWs('victor');

// Simular conexões
server.handleConnection(diana,  { url: '/?userId=1&username=Diana' });
server.handleConnection(victor, { url: '/?userId=2&username=Victor' });

// Simular join
server.handleMessage(diana,  Buffer.from(JSON.stringify({ type: 'join',    roomId: 'geral' })));
server.handleMessage(victor, Buffer.from(JSON.stringify({ type: 'join',    roomId: 'geral' })));
server.handleMessage(diana,  Buffer.from(JSON.stringify({ type: 'message', roomId: 'geral', text: 'Olá!' })));
server.handleMessage(diana,  Buffer.from(JSON.stringify({ type: 'typing',  roomId: 'geral', isTyping: true })));

console.log('Stats:', server.getStats());
console.log('Diana enviou:', diana.getSent());
console.log('Victor recebeu:', victor.getSent());
