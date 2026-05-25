require('dotenv').config();


console.log(process.env.DB_PASSWORD);
console.log(typeof process.env.DB_PASSWORD);

const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.json());

const authRoutes = require('../backend/src/routes/authRoutes');
const { verificarToken } = require('../backend/src/middleware/authMiddleware');

const produtosRoutes = require('../backend/src/routes/produtosRoutes');
app.use('/produtos', verificarToken, produtosRoutes);
app.use('/auth', authRoutes);

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API de Produtos com PostgreSQL',
    versao: '3.0',
    ambiente: process.env.NODE_ENV || 'development',
    banco: 'PostgreSQL'
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Servidor rodando!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💾 Banco: PostgreSQL (${process.env.DB_NAME})`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});
