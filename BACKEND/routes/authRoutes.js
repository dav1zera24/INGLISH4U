const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../config/database');

// ======================================================
// home
// ======================================================

router.post('/home', async (req, res) => {

    try {

        const {
            nome,
            email,
            senha
        } = req.body;

        // validação
        if (!nome || !email || !senha) {

            return res.status(400).json({
                erro: 'Preencha todos os campos'
            });

        }

        // verifica usuário existente
        const usuarioExiste = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (usuarioExiste.rows.length > 0) {

            return res.status(400).json({
                erro: 'E-mail já cadastrado'
            });

        }

        // criptografar senha
        const senhaHash = await bcrypt.hash(
            senha,
            10
        );

        // salvar usuário
        await pool.query(
            `
            INSERT INTO usuarios
            (nome, email, senha)

            VALUES($1, $2, $3)
            `,
            [
                nome,
                email,
                senhaHash
            ]
        );

        res.status(201).json({
            mensagem: 'Usuário criado com sucesso'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário'
        });

    }

});

// ======================================================
// LOGIN
// ======================================================

router.post('/login', async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;

        // procurar usuário
        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        // usuário não encontrado
        if (resultado.rows.length === 0) {

            return res.status(400).json({
                erro: 'Usuário não encontrado'
            });

        }

        const usuario = resultado.rows[0];

        // comparar senha
        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        // senha incorreta
        if (!senhaValida) {

            return res.status(401).json({
                erro: 'Senha inválida'
            });

        }

        // gerar token
        const token = jwt.sign(

            {
                id: usuario.idu,
                email: usuario.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '1h'
            }

        );

        // sucesso
        res.json({

            mensagem: 'Login realizado',

            token,

            usuario: {
                id: usuario.idu,
                nome: usuario.nome,
                email: usuario.email
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: 'Erro no servidor'
        });

    }

});

module.exports = router;