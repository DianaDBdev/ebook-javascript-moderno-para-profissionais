// cliente/ws-client.js — Cliente WebSocket com reconexão automática
// Execute no browser ou: node --experimental-websocket cliente/ws-client.js

class WebSocketClient {
  #url;
  #ws         = null;
  #tentativas  = 0;
  #maxTentativas = 5;
  #handlers   = { mensagem: [], erro: [], conexao: [], desconexao: [] };

  constructor(url) {
    this.#url = url;
  }

  conectar() {
    console.log(`[WS] Conectando a ${this.#url}...`);
    this.#ws = new WebSocket(this.#url);

    this.#ws.onopen = () => {
      console.log('[WS] ✅ Conectado');
      this.#tentativas = 0; // reseta contador ao conectar com sucesso
      this.#emit('conexao');
    };

    this.#ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.#emit('mensagem', msg);
      } catch {
        console.warn('[WS] Mensagem não-JSON recebida:', event.data);
      }
    };

    this.#ws.onclose = (event) => {
      console.log(`[WS] Desconectado (código: ${event.code})`);
      this.#emit('desconexao', event);
      this.#reconectar();
    };

    this.#ws.onerror = (error) => {
      console.error('[WS] Erro:', error);
      this.#emit('erro', error);
    };
  }

  // ── Reconexão com backoff exponencial
  #reconectar() {
    if (this.#tentativas >= this.#maxTentativas) {
      console.error('[WS] Número máximo de tentativas atingido.');
      return;
    }
    const delay = Math.min(1000 * 2 ** this.#tentativas, 30_000); // máx 30s
    this.#tentativas++;
    console.log(`[WS] Reconectando em ${delay / 1000}s (tentativa ${this.#tentativas}/${this.#maxTentativas})...`);
    setTimeout(() => this.conectar(), delay);
  }

  // ── Envia mensagem (com verificação de estado)
  enviar(tipo, payload) {
    if (this.#ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Não conectado — mensagem descartada');
      return false;
    }
    this.#ws.send(JSON.stringify({ tipo, payload }));
    return true;
  }

  // ── Event handlers
  on(evento, handler) {
    this.#handlers[evento]?.push(handler);
    return this; // chainable
  }

  #emit(evento, dados) {
    this.#handlers[evento]?.forEach(h => h(dados));
  }

  desconectar() {
    this.#maxTentativas = 0; // impede reconexão
    this.#ws?.close();
  }
}

// ── Uso
const client = new WebSocketClient('ws://localhost:8080');

client
  .on('conexao',     ()    => console.log('🟢 Conectado ao servidor'))
  .on('mensagem',    (msg) => console.log('📨 Recebido:', msg))
  .on('desconexao',  ()    => console.log('🔴 Desconectado'))
  .on('erro',        (err) => console.error('⚠️  Erro:', err));

client.conectar();

// Envia uma mensagem após 1 segundo
setTimeout(() => {
  client.enviar('broadcast', { texto: 'Olá, mundo!' });
}, 1000);
