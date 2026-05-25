const express = require('express');
const cors = require('cors');
const questaoRoutes = require('./routes/api'); // Corrigido para carregar api.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas principais prefixadas com /api
app.use('/api', questaoRoutes);

const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Tente mudar a variável PORT ou encerrar o processo que usa a porta.`);
        process.exit(1);
    }
    console.error(err);
});