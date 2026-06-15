
const pool = require('../config/database');

const allowedColumns = [
    'enunciado',
    'alternativa_a',
    'alternativa_b',
    'alternativa_c',
    'alternativa_d',
    'resposta_correta',
    'comentario',
    'conteudo_complementar',
    'vestibular_id',
    'usuario_id',
    'dificuldade_id',
    'topico_id',
    'imagem_url'
];

function buildQueryParams(data) {

    const columns = Object.keys(data).filter((field) =>
        allowedColumns.includes(field)
    );

    if (columns.length === 0) return null;

    const values = columns.map((field) => data[field]);

    const placeholders = columns.map(
        (_, index) => `$${index + 1}`
    );

    return {
        columns,
        values,
        placeholders
    };
}

// ======================================================
// GET ALL
// ======================================================

exports.getAll = async (req, res) => {

    const {
        vestibular,
        dificuldade,
        ano,
        topico
    } = req.query;

    const filters = [];
    const values = [];

    if (vestibular) {
        values.push(vestibular);
        filters.push(`v.nome = $${values.length}`);
    }

    if (dificuldade) {
        values.push(dificuldade);
        filters.push(`d.nivel = $${values.length}`);
    }

    if (ano) {
        values.push(ano);
        filters.push(`v.ano = $${values.length}`);
    }

    if (topico) {
        values.push(topico);
        filters.push(`t.t_nome = $${values.length}`);
    }

    try {

        let query = `
            SELECT
                q.*,
                v.nome AS vestibular,
                v.ano,
                t.t_nome AS topico,
                d.nivel AS dificuldade,
                u.nome AS usuario
            FROM questoes q
            LEFT JOIN vestibulares v
                ON q.vestibular_id = v.idv
            LEFT JOIN topicos t
                ON q.topico_id = t.idt
            LEFT JOIN dificuldade d
                ON q.dificuldade_id = d.idd
            LEFT JOIN usuarios u
                ON q.usuario_id = u.idu
        `;

        if (filters.length > 0) {
            query += ` WHERE ${filters.join(' AND ')}`;
        }

        query += ` ORDER BY q.idq`;

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};


// ======================================================
// BUSCAR POR VESTIBULAR
// ======================================================

exports.buscarPorVestibular = async (req, res) => {

    const { vestibular } = req.params;

    try {

        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE unaccent(UPPER(vestibular))
                = unaccent(UPPER($1))
            ORDER BY idq
        `, [vestibular]);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

// ======================================================
// BUSCAR POR DIFICULDADE
// ======================================================

exports.buscarPorDificuldade = async (req, res) => {

    const { dificuldade } = req.params;

    try {

        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE unaccent(UPPER(dificuldade))
                = unaccent(UPPER($1))
            ORDER BY idq
        `, [dificuldade]);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

// ======================================================
// BUSCAR POR TÓPICO
// ======================================================

exports.buscarPorTopico = async (req, res) => {

    const { topico } = req.params;

    try {

        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE unaccent(UPPER(topico))
                = unaccent(UPPER($1))
            ORDER BY idq
        `, [topico]);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

// ======================================================
// BUSCAR POR ANO
// ======================================================

exports.buscarPorAno = async (req, res) => {

    const { ano } = req.params;

    try {

        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE ano = $1
            ORDER BY idq
        `, [ano]);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

// ======================================================
// VERIFICAR RESPOSTA
// ======================================================

exports.verificarResposta = async (req, res) => {

    const {
        idq,
        respostaUsuario
    } = req.body;

    try {

        const result = await pool.query(`
            SELECT
                resposta_correta,
                comentario,
                conteudo_complementar
            FROM questoes
            WHERE idq = $1
        `, [idq]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: 'Questão não encontrada.'
            });

        }

        const questao =
            result.rows[0];

        const correta =
            questao.resposta_correta
                .trim()
                .toUpperCase() ===
            respostaUsuario
                .trim()
                .toUpperCase();

        res.json({
            correta,
            comentario:
                questao.comentario,
            conteudo_complementar:
                questao.conteudo_complementar
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

