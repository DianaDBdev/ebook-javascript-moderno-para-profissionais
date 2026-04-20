// websocket-client.ts — Seção 10.3: WebSocketClient + backoff + fila + React hook
// Capítulo 10 — Real-Time com WebSockets
//
// Execute: npx tsx cliente/websocket-client.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.3 — Classe WebSocketClient com reconexão
// ─────────────────────────────────────────────────────────────

type EventCallback = (data?: unknown) => void;

export class WebSocketClient {
  private ws:                  any | null = null;
  private reconnectAttempts    = 0;
  private readonly maxAttempts = 5;
  private readonly baseDelay   = 1000; // ms
  private messageQueue:        string[] = [];
  private listeners            = new Map<string, EventCallback[]>();

  constructor(private readonly url: string) {
    this.connect();
  }

  private connect() {
    console.log('Conectando ao WebSocket...');
    // Em browser: this.ws = new WebSocket(this.url);
    // Em Node.js com ws: import { WebSocket } from 'ws'; this.ws = new WebSocket(this.url);
    this.ws = this.createMockWebSocket(); // Mock para demo

    this.ws.onopen = () => {
      console.log('Conectado!');
      this.reconnectAttempts = 0;
      this.flushQueue();
      this.emit('connected');
    };

    this.ws.onmessage = ({ data }: { data: string }) => {
      try {
        const msg = JSON.parse(data);
        this.emit(msg.type, msg);
        this.emit('*', msg); // Listener curinga
      } catch {
        console.error('Mensagem inválida:', data);
      }
    };

    this.ws.onerror = (err: unknown) => this.emit('error', err);

    this.ws.onclose = (event: { code: number; reason: string }) => {
      console.log('Desconectado:', event.code, event.reason);
      this.emit('disconnected', event);
      // Não reconectar em fechamentos intencionais
      if (event.code === 1000 || event.code === 1008) return;
      if (this.reconnectAttempts < this.maxAttempts) {
        this.scheduleReconnect();
      } else {
        console.error('Máximo de tentativas atingido');
        this.emit('reconnect-failed');
      }
    };
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Reconectando em ${delay}ms (tentativa ${this.reconnectAttempts})`);
    this.emit('reconnecting', this.reconnectAttempts);
    setTimeout(() => this.connect(), delay);
  }

  send(type: string, data: Record<string, unknown> = {}) {
    const message = JSON.stringify({ type, ...data });
    const OPEN    = 1; // WebSocket.OPEN
    if (this.ws?.readyState === OPEN) {
      this.ws.send(message);
    } else {
      console.log('Offline — mensagem enfileirada');
      this.messageQueue.push(message);
    }
  }

  private flushQueue() {
    if (this.messageQueue.length === 0) return;
    console.log(`Enviando ${this.messageQueue.length} mensagens da fila`);
    this.messageQueue.forEach(msg => this.ws!.send(msg));
    this.messageQueue = [];
  }

  on(event: string, cb: EventCallback): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
    return () => this.off(event, cb); // Retorna função de cleanup
  }

  off(event: string, cb: EventCallback) {
    const cbs = this.listeners.get(event) ?? [];
    this.listeners.set(event, cbs.filter(c => c !== cb));
  }

  private emit(event: string, data?: unknown) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  disconnect() {
    this.ws?.close(1000, 'Fechamento intencional');
    this.ws = null;
  }

  // Mock para demo sem servidor real
  private createMockWebSocket() {
    const ws = {
      readyState: 0, // CONNECTING
      onopen:     null as any,
      onmessage:  null as any,
      onerror:    null as any,
      onclose:    null as any,
      send: (msg: string) => console.log(`  → enviado: ${JSON.parse(msg).type}`),
      close: (code = 1000, reason = '') => {
        ws.readyState = 3;
        ws.onclose?.({ code, reason });
      },
    };
    setTimeout(() => { ws.readyState = 1; ws.onopen?.(); }, 10);
    return ws;
  }
}

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.3 — React hook: useWebSocket
// ─────────────────────────────────────────────────────────────

// hooks/useWebSocket.ts — use em projetos React
//
// export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastMessage, setLastMessage] = useState<unknown>(null);
//   const wsRef        = useRef<WebSocket | null>(null);
//   const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
//   const attemptsRef  = useRef(0);
//
//   const connect = useCallback(() => {
//     const ws = new WebSocket(url);
//
//     ws.onopen = () => {
//       setIsConnected(true);
//       attemptsRef.current = 0;
//       options.onConnect?.();
//     };
//
//     ws.onmessage = ({ data }) => {
//       const msg = JSON.parse(data);
//       setLastMessage(msg);
//       options.onMessage?.(msg);
//     };
//
//     ws.onclose = () => {
//       setIsConnected(false);
//       options.onDisconnect?.();
//       // Backoff exponencial, máximo 30s
//       const delay = Math.min(1000 * Math.pow(2, attemptsRef.current++), 30_000);
//       reconnectRef.current = setTimeout(connect, delay);
//       // se url mudar em runtime, o cleanup fecha a conexão anterior antes de criar nova
//     };
//
//     wsRef.current = ws;
//   }, [url, options]);
//
//   useEffect(() => {
//     connect();
//     return () => {
//       clearTimeout(reconnectRef.current);
//       wsRef.current?.close(1000, 'Componente desmontado');
//     };
//   }, [connect]);
//
//   const sendMessage = useCallback((data: unknown) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(data));
//     }
//   }, []);
//
//   return { isConnected, lastMessage, sendMessage };
// }

// Uso no componente:
// function ChatRoom({ roomId }: { roomId: string }) {
//   const [messages, setMessages] = useState<ServerMessage[]>([]);
//   const { isConnected, sendMessage } = useWebSocket(
//     `ws://localhost:3000?roomId=${roomId}`,
//     {
//       onConnect: () => sendMessage({ type: 'join', roomId }),
//       onMessage: (msg: any) => {
//         if (msg.type === 'message') setMessages(prev => [...prev, msg]);
//       },
//     }
//   );
//   return (
//     <div>
//       {!isConnected && <Banner>Reconectando...</Banner>}
//       <MessageInput
//         onSend={(text) => sendMessage({ type: 'message', roomId, text })}
//         disabled={!isConnected}
//       />
//     </div>
//   );
// }

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== WebSocketClient — demo com reconexão e fila ===\n');

const client = new WebSocketClient('ws://localhost:3000?token=demo');

// Registrar listeners
const cleanup = client.on('connected', () => {
  console.log('Handler connected: enviando join');
  client.send('join', { roomId: 'geral' });
});

client.on('reconnecting', (n) => console.log(`Toast: Reconectando... tentativa ${n}`));
client.on('reconnect-failed', () => console.log('Erro: Sem conexão'));

// Enfileirar mensagem antes de conectar (será enviada ao conectar)
client.send('message', { roomId: 'geral', text: 'Olá!' }); // Vai para a fila

// Aguardar conexão
await new Promise(r => setTimeout(r, 50));

console.log('\nBackoff exponencial (1s, 2s, 4s, 8s, 16s):');
for (let i = 1; i <= 5; i++) {
  const delay = 1000 * Math.pow(2, i - 1);
  console.log(`  Tentativa ${i}: ${delay}ms`);
}

console.log('\nDisconnect intencional (código 1000 — não reconecta):');
client.disconnect();

// Cleanup do listener
cleanup();
