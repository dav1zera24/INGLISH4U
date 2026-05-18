const pool = require('../config/database');

const allowedColumns = [
    'vestibular',
    'ano',
    'enunciado',
    'alternativa_a',
    'alternativa_b',
    'alternativa_c',
    'alternativa_d',
    'alternativa_e',
    'resposta_correta',
    'comentario'
];

function buildQueryParams(data) {
    const columns = Object.keys(data).filter((field) => allowedColumns.includes(field));
    if (columns.length === 0) return null;

    const values = columns.map((field) => data[field]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    return { columns, values, placeholders };
}

exports.getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM questoes ORDER BY idq');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar todas as questões.' });
    }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM questoes WHERE idq = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar a questão por ID.' });
    }
};

exports.createQuestao = async (req, res) => {
    const body = req.body;
    const queryData = buildQueryParams(body);

    if (!queryData) {
        return res.status(400).json({ error: 'Corpo da requisição inválido ou campos não permitidos.' });
    }

    const query = `INSERT INTO questoes (${queryData.columns.join(', ')}) VALUES (${queryData.placeholders.join(', ')}) RETURNING *`;
    try {
        const result = await pool.query(query, queryData.values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao criar nova questão.' });
    }
};

exports.updateQuestao = async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const queryData = buildQueryParams(body);

    if (!queryData) {
        return res.status(400).json({ error: 'Corpo da requisição inválido ou campos não permitidos.' });
    }

    const setClause = queryData.columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
    const query = `UPDATE questoes SET ${setClause} WHERE idq = $${queryData.values.length + 1} RETURNING *`;

    try {
        const result = await pool.query(query, [...queryData.values, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada para atualização.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao atualizar a questão.' });
    }
};

exports.deleteQuestao = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM questoes WHERE idq = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada para exclusão.' });
        }

        res.json({ message: 'Questão excluída com sucesso.', questao: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao excluir a questão.' });
    }
};

// Buscar questões por vestibular utilizando a View vw_por_vestibular
exports.buscarPorVestibular = async (req, res) => {
    const { vestibular } = req.params;
    try {
        const query = `
            SELECT v.*, q.alternativa_a, q.alternativa_b, q.alternativa_c, q.alternativa_d, q.alternativa_e 
            FROM vw_por_vestibular v
            JOIN questoes q ON v.idq = q.idq
            WHERE v.vestibular = $1
        `;
        const result = await pool.query(query, [vestibular.toUpperCase()]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor ao buscar questões.' });
    }
};

// Verificar se a alternativa enviada pelo usuário está correta
exports.verificarResposta = async (req, res) => {
    const { idq, respostaUsuario } = req.body;
    try {
        const result = await pool.query(
            'SELECT resposta_correta, comentario FROM questoes WHERE idq = $1', 
            [idq]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }

        const questao = result.rows[0];
        const correta = questao.resposta_correta.trim().toUpperCase() === respostaUsuario.toUpperCase();

        res.json({
            correta,
            comentario: questao.comentario
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao verificar a resposta.' });
    }
};