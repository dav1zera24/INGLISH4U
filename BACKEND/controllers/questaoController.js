const pool = require('../config/database');

const allowedColumns = [
    'enunciado',
    'alternativa_a',
    'alternativa_b',
    'alternativa_c',
    'alternativa_d',
    'alternativa_e',
    'resposta_correta',
    'comentario',
    'conteudo_complementar',
    'vestibular_id',
    'usuario_id',
    'dificuldade_id',
    'topico_id',
    'imagem_url' // <-- Permitir o mapeamento da imagem
];

function buildQueryParams(data) {
    const columns = Object.keys(data).filter((field) =>
        allowedColumns.includes(field)
    );

    if (columns.length === 0) return null;

    const values = columns.map((field) => data[field]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    return { columns, values, placeholders };
}

// BUSCAR TODAS AS QUESTÕES
exports.getAll = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                q.*,
                v.nome AS vestibular,
                v.ano,
                t.tempo_verbal,
                d.nivel AS dificuldade,
                u.nome AS usuario
            FROM questoes q
            LEFT JOIN vestibulares v ON q.vestibular_id = v.idv
            LEFT JOIN topicos t ON q.topico_id = t.idt
            LEFT JOIN dificuldade d ON q.dificuldade_id = d.idd
            LEFT JOIN usuarios u ON q.usuario_id = u.idu
            ORDER BY q.idq
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// BUSCAR QUESTÃO POR ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                q.*,
                v.nome AS vestibular,
                v.ano,
                t.tempo_verbal,
                d.nivel AS dificuldade,
                u.nome AS usuario
            FROM questoes q
            LEFT JOIN vestibulares v ON q.vestibular_id = v.idv
            LEFT JOIN topicos t ON q.topico_id = t.idt
            LEFT JOIN dificuldade d ON q.dificuldade_id = d.idd
            LEFT JOIN usuarios u ON q.usuario_id = u.idu
            WHERE q.idq = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// CRIAR QUESTÃO
exports.createQuestao = async (req, res) => {
    const body = req.body;
    const queryData = buildQueryParams(body);

    if (!queryData) {
        return res.status(400).json({ error: 'Nenhum campo válido enviado.' });
    }

    const idxResposta = queryData.columns.indexOf('resposta_correta');
    if (idxResposta !== -1 && typeof queryData.values[idxResposta] === 'string') {
        queryData.values[idxResposta] = queryData.values[idxResposta].toUpperCase();
    }

    const query = `
        INSERT INTO questoes (${queryData.columns.join(', ')})
        VALUES (${queryData.placeholders.join(', ')})
        RETURNING *
    `;

    try {
        const result = await pool.query(query, queryData.values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// ATUALIZAR QUESTÃO
exports.updateQuestao = async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const queryData = buildQueryParams(body);

    if (!queryData) {
        return res.status(400).json({ error: 'Nenhum campo válido enviado.' });
    }

    const idxResposta = queryData.columns.indexOf('resposta_correta');
    if (idxResposta !== -1 && typeof queryData.values[idxResposta] === 'string') {
        queryData.values[idxResposta] = queryData.values[idxResposta].toUpperCase();
    }

    const setClause = queryData.columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(', ');

    const query = `
        UPDATE questoes
        SET ${setClause}
        WHERE idq = $${queryData.values.length + 1}
        RETURNING *
    `;

    try {
        const result = await pool.query(query, [...queryData.values, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// DELETAR QUESTÃO
exports.deleteQuestao = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            DELETE FROM questoes
            WHERE idq = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }

        res.json({
            message: 'Questão deletada com sucesso.',
            questao: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// BUSCAR POR VESTIBULAR
exports.buscarPorVestibular = async (req, res) => {
    const { vestibular } = req.params;
    try {
        const query = `
            SELECT * FROM vw_por_vestibular 
            WHERE UPPER(vestibular) = UPPER($1)
        `;
        const result = await pool.query(query, [vestibular]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// BUSCAR POR DIFICULDADE
exports.buscarPorDificuldade = async (req, res) => {
    const { dificuldade } = req.params; // Corrigido aqui
    try {
        const busca = decodeURIComponent(dificuldade)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();

        const query = `
            SELECT * FROM vw_por_dificuldade 
            WHERE unaccent(UPPER(dificuldade)) = $1 
            ORDER BY idq
        `;
        
        const result = await pool.query(query, [busca]);
        res.json(result.rows);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
};

// BUSCAR POR TÓPICO / TEMA
exports.buscarPorTopico = async (req, res) => {
    const { topico } = req.params;
    try {
        const buscaNormalizada = decodeURIComponent(topico)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();

        const query = `
            SELECT * FROM vw_por_tempo_verbal 
            WHERE unaccent(UPPER(tempo_verbal)) = $1
            ORDER BY idq
        `;
        const result = await pool.query(query, [buscaNormalizada]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// VERIFICAR RESPOSTA
exports.verificarResposta = async (req, res) => {
    const { idq, respostaUsuario } = req.body;

    if (!idq || !respostaUsuario) {
        return res.status(400).json({ error: 'idq e respostaUsuario são obrigatórios.' });
    }

    try {
        const result = await pool.query(`
            SELECT resposta_correta, comentario, conteudo_complementar
            FROM questoes
            WHERE idq = $1
        `, [idq]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }

        const questao = result.rows[0];
        const correta = questao.resposta_correta.trim().toUpperCase() === respostaUsuario.trim().toUpperCase();

        res.json({
            correta,
            comentario: questao.comentario,
            conteudo_complementar: questao.conteudo_complementar
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// BUSCAR POR ANO DO VESTIBULAR
exports.buscarPorAno = async (req, res) => {
    const { ano } = req.params;

    if (isNaN(ano)) {
        return res.status(400).json({ error: 'O parâmetro ano deve ser um número válido.' });
    }

    try {
        const query = `
            SELECT 
                q.*,
                v.nome AS vestibular,
                v.ano,
                t.tempo_verbal,
                d.nivel AS dificuldade,
                u.nome AS usuario
            FROM questoes q
            LEFT JOIN vestibulares v ON q.vestibular_id = v.idv
            LEFT JOIN topicos t ON q.topico_id = t.idt
            LEFT JOIN dificuldade d ON q.dificuldade_id = d.idd
            LEFT JOIN usuarios u ON q.usuario_id = u.idu
            WHERE v.ano = $1
            ORDER BY q.idq;
        `;
        const result = await pool.query(query, [ano]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};