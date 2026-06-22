const express = require('express');
const router = express.Router();
const questaoController = require('../controllers/questaoController');

// Buscar todas
router.get('/questoes', questaoController.getAll);

// Buscar por ID
router.get('/questoes/id/:id', questaoController.getById);

// Buscar por vestibular
router.get('/questoes/vestibular/:vestibular', questaoController.buscarPorVestibular);

// Buscar por dificuldade
router.get('/questoes/dificuldade/:dificuldade', questaoController.buscarPorDificuldade);

// Buscar por tema / tópico
router.get('/questoes/topico/:topico', questaoController.buscarPorTopico);

// Criar questão
router.post('/questoes', questaoController.createQuestao);

// Atualizar questão
router.put('/questoes/id/:id', questaoController.updateQuestao);

// Deletar questão
router.delete('/questoes/id/:id', questaoController.deleteQuestao);

// Verificar resposta
router.post('/questoes/verificar', questaoController.verificarResposta);

// Rota para buscar questões por um ano específico
router.get('/questoes/ano/:ano', questaoController.buscarPorAno);

module.exports = router;


