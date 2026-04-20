// sse-server.ts — Seção 10.4: SSE (Server-Sent Events) + Long Polling
// Capítulo 10 — Real-Time com WebSockets
//
// Execute: npx tsx exemplos/sse-server.ts
// (Demonstração standalone sem servidor HTTP real)

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.1 — Alternativas mais simples ao WebSocket
// ─────────────────────────────────────────────────────────────

console.log('=== Alternativas ao WebSocket ===\n');

// 1. Polling simples — suficiente para muitos casos:
// setInterval(async () => {
//   const updates = await fetch('/api/updates');
//   processUpdates(await updates.json());
// }, 5000);
// Exemplo legítimo: dashboard admin com 10 usuários, atualização a cada 5s

// 2. Long Polling — respostas rápidas sem WebSocket:
// async function longPoll() {
//   try {
//     const response = await fetch('/api/long-poll');
//     const data     = await response.json();
//     processData(data);
//     longPoll(); // Próximo poll imediatamente
//   } catch (err) {
//     setTimeout(longPoll, 5000);
//   }
// }
// Use quando atualizações são raras mas precisam ser rápidas
// e a infraestrutura não suporta WebSocket

// 3. Server-Sent Events — o meio-termo ideal:
// const eventSource = new EventSource('/api/events');
// eventSource.onmessage = (event) => updateUI(JSON.parse(event.data));
// eventSource.onerror   = () => { /* browser tenta reconectar */ };
// 💡 SSE resolve 60% dos casos que parecem precisar de WebSocket.
//    Se o cliente não precisa enviar dados, SSE é a escolha certa —
//    mais simples, reconexão automática, funciona sobre HTTP.

// Tabela comparativa:
const comparacao = {
  Polling: {
    direcao: 'cliente→servidor (periódico)', reconnect: 'manual',   overhead: 'alto',
    usarQuando: 'atualizações não precisam ser instantâneas'
  },
  'Long Polling': {
    direcao: 'cliente→servidor (espera)',    reconnect: 'manual',   overhead: 'médio',
    usarQuando: 'atualizações raras mas rápidas, infra sem WS/SSE'
  },
  SSE: {
    direcao: 'servidor→cliente',             reconnect: 'automático', overhead: 'baixo',
    usarQuando: 'notificações, feed, progresso — 60% dos casos de WS'
  },
  WebSocket: {
    direcao: 'bidirecional',                 reconnect: 'manual',   overhead: 'mínimo',
    usarQuando: 'chat, jogos, trading — latência crítica'
  },
};

for (const [tech, info] of Object.entries(comparacao)) {
  console.log(`${tech}:`);
  console.log(`  Direção:    ${info.direcao}`);
  console.log(`  Reconexão: ${info.reconnect}`);
  console.log(`  Use quando: ${info.usarQuando}`);
  console.log();
}

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.4 — SSE: servidor Express
// ─────────────────────────────────────────────────────────────

// import express from 'express';
// const app     = express();
// const clients = new Map<string, express.Response>();
//
// app.get('/events', (req, res) => {
//   const clientId = req.query.clientId as string;
//
//   // Headers obrigatórios para SSE
//   res.setHeader('Content-Type',       'text/event-stream');
//   res.setHeader('Cache-Control',      'no-cache');
//   res.setHeader('Connection',         'keep-alive');
//   res.setHeader('X-Accel-Buffering',  'no'); // Para Nginx
//
//   clients.set(clientId, res);
//   res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
//
//   req.on('close', () => {
//     clients.delete(clientId);
//     console.log(`Cliente ${clientId} desconectou`);
//   });
// });
//
// function sendEvent(clientId: string, data: object, event = 'message') {
//   const res = clients.get(clientId);
//   if (res) {
//     res.write(`event: ${event}\n`);
//     res.write(`data: ${JSON.stringify(data)}\n\n`);
//   }
// }
//
// function broadcast(data: object) {
//   const payload = `data: ${JSON.stringify(data)}\n\n`;
//   clients.forEach(res => res.write(payload));
// }

// SSE Client (browser):
// const eventSource = new EventSource(`/events?clientId=${myId}`);
// eventSource.onmessage                           = ({ data }) => updateUI(JSON.parse(data));
// eventSource.addEventListener('notification', ...)  = ({ data }) => showNotification(...);
// eventSource.onerror = () => { /* browser reconecta automaticamente */ };
// eventSource.close();

// ─────────────────────────────────────────────────────────────
// SEÇÃO 10.4 — Long Polling: servidor
// ─────────────────────────────────────────────────────────────

// const pending = new Map<string, express.Response>();
//
// app.get('/long-poll', (req, res) => {
//   const clientId = req.query.clientId as string;
//   pending.set(clientId, res);
//   // Timeout de 30s — evita conexões presas
//   req.setTimeout(30_000, () => {
//     // alternativa mais robusta: setTimeout/clearTimeout explícito com cleanup no req.on('close')
//     pending.delete(clientId);
//     res.json({ type: 'timeout' });
//   });
//   req.on('close', () => pending.delete(clientId));
// });
//
// function pushToClient(clientId: string, data: object) {
//   const res = pending.get(clientId);
//   if (res) {
//     res.json(data);
//     pending.delete(clientId); // Remove após responder
//   }
// }

// Long Polling cliente:
// async function longPoll(clientId: string): Promise<void> {
//   try {
//     const res  = await fetch(`/long-poll?clientId=${clientId}`);
//     const data = await res.json();
//     if (data.type !== 'timeout') processData(data);
//     longPoll(clientId);
//   } catch {
//     setTimeout(() => longPoll(clientId), 5000);
//   }
// }

// ─────────────────────────────────────────────────────────────
// Vantagens SSE vs WebSocket
// ─────────────────────────────────────────────────────────────

console.log('=== SSE vs WebSocket ===\n');

const sseVsWS = {
  '✅ SSE': [
    'Reconexão automática gerenciada pelo browser',
    'Event IDs — cliente retoma exatamente de onde parou',
    'Funciona sobre HTTP padrão — sem upgrade de protocolo',
    'Mais fácil de escalar — stateless do ponto de vista do cliente',
  ],
  '❌ SSE limitações': [
    'Unidirecional — cliente não envia dados pelo mesmo canal',
    'Limite de 6 conexões por domínio em HTTP/1.1 (sem limite no HTTP/2)',
  ],
};

for (const [key, items] of Object.entries(sseVsWS)) {
  console.log(`${key}:`);
  items.forEach(i => console.log(`  • ${i}`));
  console.log();
}

// ─────────────────────────────────────────────────────────────
// Simulação de SSE (sem servidor real)
// ─────────────────────────────────────────────────────────────

console.log('=== Simulação SSE ===\n');

// Simula o formato de mensagem SSE
function formatSSE(data: object, event = 'message'): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

const events = [
  formatSSE({ type: 'connected' }),
  formatSSE({ userId: '1', action: 'login', name: 'Diana' }, 'notification'),
  formatSSE({ text: 'Build finalizado com sucesso', level: 'success' }, 'notification'),
  formatSSE({ views: 1500, users: 42 }, 'metrics'),
];

events.forEach((evt, i) => {
  console.log(`Evento ${i + 1}:`);
  console.log(evt);
});

console.log('Long Polling simulação:');
console.log('  Cliente faz GET /long-poll');
console.log('  Servidor aguarda até 30s');
console.log('  Quando há dados → responde imediatamente');
console.log('  Cliente recebe → faz novo GET imediatamente');
console.log('  Resultado: latência quase zero sem WebSocket');
