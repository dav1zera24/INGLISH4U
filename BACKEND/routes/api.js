const express = require('express');
const router = express.Router();
const questaoController = require('../controllers/questaoController');

// Buscar todas
router.get('/questoes', questaoController.getAll);


// Buscar por vestibular
router.get('/questoes/vestibular/:vestibular', questaoController.buscarPorVestibular);

// Buscar por dificuldade
router.get('/questoes/dificuldade/:dificuldade', questaoController.buscarPorDificuldade);

// Buscar por tema / tópico
router.get('/questoes/topico/:topico', questaoController.buscarPorTopico);

// Verificar resposta
router.post('/questoes/verificar', questaoController.verificarResposta);

// Rota para buscar questões por um ano específico
router.get('/questoes/ano/:ano', questaoController.buscarPorAno);

module.exports = router;