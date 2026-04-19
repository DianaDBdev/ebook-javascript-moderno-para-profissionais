// evolucao-assincrona.js — Seção 2.1: Callbacks → Promises → Async/Await
// Capítulo 2 — Async/Await: Programação Assíncrona Sem Dor de Cabeça
//
// Execute: node exemplos/evolucao-assincrona.js

import fs from 'fs';
import { promisify } from 'util';

const readFile  = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// ─────────────────────────────────────────────────────────────
// ERA 1: Callbacks (2009–2015) — a famosa pirâmide da perdição
// ─────────────────────────────────────────────────────────────

function processImageCallback(imageUrl, callback) {
  downloadImage(imageUrl, function(err, imageBuffer) {
    if (err) return callback(err);
    validateImage(imageBuffer, function(err, isValid) {
      if (err) return callback(err);
      if (!isValid) return callback(new Error('Invalid image'));
      resizeImage(imageBuffer, 800, 600, function(err, resizedBuffer) {
        if (err) return callback(err);
        optimizeImage(resizedBuffer, function(err, optimizedBuffer) {
          if (err) return callback(err);
          uploadToS3(optimizedBuffer, function(err, s3Url) {
            if (err) return callback(err);
            saveToDatabase(s3Url, imageUrl, function(err, record) {
              if (err) return callback(err);
              callback(null, { originalUrl: imageUrl,
                processedUrl: s3Url, record });
            });
          });
        });
      });
    });
  });
}

// Problemas:
//   • Callback hell — 7 níveis de indentação
//   • Error handling duplicado e verboso a cada nível
//   • Impossível usar try/catch
//   • Fluxo de controle não linear

// ─────────────────────────────────────────────────────────────
// ERA 2: Promises (2015–2017)
// ─────────────────────────────────────────────────────────────

// Exemplo clássico com .then():
//   fs.promises.readFile('input.txt', 'utf8')
//     .then(data => processData(data))
//     .then(processed => fs.promises.writeFile('output.txt', processed))
//     .then(() => console.log('Sucesso!'))
//     .catch(err => console.error('Erro:', err));

// Melhorias: estrutura flat, .catch() centralizado.
// Limitação: variáveis intermediárias se perdem entre .then().

// ─────────────────────────────────────────────────────────────
// ERA 3: Async/Await (2017–presente)
// ─────────────────────────────────────────────────────────────

// O mesmo fluxo, agora com leitura natural:
//   try {
//     const data      = await fs.promises.readFile('input.txt', 'utf8');
//     const processed = await processData(data);
//     await fs.promises.writeFile('output.txt', processed);
//     console.log('Sucesso!');
//   } catch (err) {
//     console.error('Erro:', err);
//   }

// Por que é revolucionário:
//   • Parece código síncrono — mas não é
//   • try/catch funciona naturalmente
//   • Depuração simples: breakpoints funcionam como esperado
//   • Variáveis permanecem no escopo em todas as etapas
//   • Mistura naturalmente com código síncrono

// ─────────────────────────────────────────────────────────────
// CASO REAL — Seção 2.6: Refatoração de sistema de imagens
// ─────────────────────────────────────────────────────────────
// Passo 1: util.promisify converte callbacks para promises
//   import { promisify } from 'util';
//   const downloadImageAsync  = promisify(downloadImage);
//   const validateImageAsync  = promisify(validateImage);
//   const resizeImageAsync    = promisify(resizeImage);
//   const optimizeImageAsync  = promisify(optimizeImage);

// Passo 2: Async/Await — de 156 linhas para 35 (-78%)
async function processImage(imageUrl) {
  // Funções são stubs para fins de demonstração
  const download = async (url) => Buffer.from(`img:${url}`);
  const validate = async (buf) => buf.length > 0;
  const resize   = async (buf, w, h) => Buffer.from(`${buf}@${w}x${h}`);
  const optimize = async (buf) => Buffer.from(`opt:${buf}`);
  const upload   = async (buf) => `https://s3.example.com/${Date.now()}`;
  const save     = async (url, orig) => ({ id: 1, url, orig });

  try {
    const imageBuffer     = await download(imageUrl);
    const isValid         = await validate(imageBuffer);
    if (!isValid) throw new Error('Invalid image format');
    const resizedBuffer   = await resize(imageBuffer, 800, 600);
    const optimizedBuffer = await optimize(resizedBuffer);
    const s3Url           = await upload(optimizedBuffer);
    const record          = await save(s3Url, imageUrl);
    return { originalUrl: imageUrl, processedUrl: s3Url, record };
  } catch (err) {
    console.error('Failed to process image:', err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
console.log('Era 1 (Callbacks): processImageCallback — ver código acima');
console.log('Era 2 (Promises):  .then()/.catch() encadeados');
console.log('Era 3 (Async/Await): código linear, try/catch natural\n');

const result = await processImage('https://example.com/photo.jpg');
console.log('processImage() resultado:', result);
