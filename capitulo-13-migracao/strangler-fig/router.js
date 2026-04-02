// router.js — Strangler Fig Pattern
// Capítulo 13 — Migrando Projetos Legados
//
// O padrão redireciona rotas gradualmente do sistema legado para o moderno.
// O legado continua vivo enquanto as novas rotas são migradas uma a uma.

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// ──────────────────────────────────────────────
// Rotas JÁ migradas — servidas pelo sistema moderno
// ──────────────────────────────────────────────
import usuariosRouter   from './moderno/routes/usuarios.js';
import produtosRouter   from './moderno/routes/produtos.js';

app.use('/api/v2/usuarios', usuariosRouter); // ✅ migrado
app.use('/api/v2/produtos',  produtosRouter); // ✅ migrado

// ──────────────────────────────────────────────
// Rotas AINDA no legado — proxy transparente
// ──────────────────────────────────────────────
const proxyLegado = createProxyMiddleware({
  target: 'http://localhost:3001', // servidor legado rodando em paralelo
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[Proxy] Erro ao encaminhar para legado:', err.message);
      res.status(502).json({ erro: 'Serviço temporariamente indisponível' });
    },
  },
});

// Tudo que não foi migrado ainda vai para o legado
app.use('/api', proxyLegado);

// ──────────────────────────────────────────────
// Estratégia de migração
// ──────────────────────────────────────────────
// Semana 1: Migrar /api/v2/usuarios  ← feito ✅
// Semana 2: Migrar /api/v2/produtos  ← feito ✅
// Semana 3: Migrar /api/v2/pedidos   ← próximo
// Semana 4: Migrar /api/v2/relatorios
// Semana 5: Desligar o legado

app.listen(3000, () => {
  console.log('🚀 Strangler Fig rodando na porta 3000');
  console.log('   → /api/v2/usuarios e /api/v2/produtos: sistema moderno');
  console.log('   → /api/*: proxy para legado (porta 3001)');
});
