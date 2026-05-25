const express = require('express');
const cors = require('cors');
const questaoRoutes = require('./routes/api'); // Corrigido para carregar api.js

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas principais prefixadas com /api
app.use('/api', questaoRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
});