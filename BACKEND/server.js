require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// =====================================================
// IMPORTAR ROTAS
// =====================================================

const questaoRoutes = require('./routes/api');
const authRoutes = require('./routes/authRoutes');

// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// =====================================================
// ARQUIVOS FRONTEND
// =====================================================

app.use(
    express.static(
        path.join(__dirname, '../FRONTEND/public')
    )
);

// =====================================================
// ROTAS
// =====================================================

app.use('/api', questaoRoutes);

app.use('/auth', authRoutes);

// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get('/', (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            '../FRONTEND/public/index.html'
        )
    );

});

// =====================================================
// SERVIDOR
// =====================================================

const server = app.listen(PORT, () => {

    console.log('=================================');

    console.log(
        `🚀 Servidor rodando na porta ${PORT}`
    );

    console.log(
        `🌐 http://localhost:${PORT}`
    );

    console.log('=================================');

});

// =====================================================
// ERROS
// =====================================================

server.on('error', (err) => {

    if (err.code === 'EADDRINUSE') {

        console.error(
            `Porta ${PORT} já está em uso`
        );

        process.exit(1);

    }

    console.error(err);

});