// servidor/ws-server.js — WebSocket server com Node.js
// Instale: npm install ws
// Execute: node servidor/ws-server.js

import { WebSocketServer } from 'ws';

const PORT = 8080;
const wss  = new WebSocketServer({ port: PORT });

// Mapa de clientes conectados (id → socket)
const clientes = new Map();
let proximoId  = 1;

wss.on('connection', (ws, req) => {
  const id = proximoId++;
  clientes.set(id, ws);
  console.log(`[+] Cliente ${id} conectado. Total: ${clientes.size}`);

  // ── Envia mensagem de boas-vindas
  ws.send(JSON.stringify({ tipo: 'boas-vindas', payload: { id, mensagem: 'Conectado!' } }));

  // ── Recebe mensagens
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log(`[MSG] Cliente ${id}:`, msg);

      // Broadcast para todos os outros clientes
      if (msg.tipo === 'broadcast') {
        broadcast({ tipo: 'mensagem', de: id, payload: msg.payload }, id);
      }
    } catch {
      ws.send(JSON.stringify({ tipo: 'erro', payload: 'Mensagem inválida' }));
    }
  });

  // ── Heartbeat — detecta clientes desconectados silenciosamente
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  // ── Desconexão
  ws.on('close', () => {
    clientes.delete(id);
    console.log(`[-] Cliente ${id} desconectado. Total: ${clientes.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[ERRO] Cliente ${id}:`, err.message);
    clientes.delete(id);
  });
});

// ── Heartbeat interval — pinga todos a cada 30s
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);

wss.on('close', () => clearInterval(heartbeat));

// ── Broadcast helper
function broadcast(mensagem, excluirId = null) {
  const json = JSON.stringify(mensagem);
  clientes.forEach((ws, id) => {
    if (id !== excluirId && ws.readyState === ws.OPEN) {
      ws.send(json);
    }
  });
}

console.log(`🚀 WebSocket server rodando em ws://localhost:${PORT}`);
