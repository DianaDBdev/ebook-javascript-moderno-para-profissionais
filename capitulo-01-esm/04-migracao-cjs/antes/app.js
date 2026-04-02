// app.js — ANTES: CommonJS (require/module.exports)
// Este arquivo NÃO usa "type": "module" no package.json

const express = require('express');
const path    = require('path');

const { formatCurrency } = require('./utils');  // sem extensão .js (CommonJS permite)
const config = require('./config');

const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'API rodando',
    price: formatCurrency(config.defaultPrice),
    dir: __dirname, // __dirname existe naturalmente em CommonJS
  });
});

app.listen(3000, () => console.log('Servidor em http://localhost:3000'));

module.exports = { app };
