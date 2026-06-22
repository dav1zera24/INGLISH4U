// Importa o pool de conexões do banco de dados configurado previamente
const pool = require('../config/database');

// Lista de colunas permitidas (Whitelist) para blindar o banco de dados contra campos inválidos (usado em INSERT e UPDATE)
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

// Função utilitária para montar os parâmetros das queries SQL (INSERT e UPDATE) dinamicamente
function buildQueryParams(data) {

    // Filtra as chaves do objeto recebido (req.body), mantendo apenas as que estão na lista allowedColumns
    const columns = Object.keys(data).filter((field) =>
        allowedColumns.includes(field)
    );

    // Se o objeto não contiver nenhuma coluna válida, retorna null
    if (columns.length === 0) return null;

    // Mapeia e extrai os valores correspondentes às colunas filtradas
    const values = columns.map((field) => data[field]);

    // Cria os placeholders numéricos do PostgreSQL ($1, $2, $3...) com base na quantidade de colunas
    const placeholders = columns.map(
        (_, index) => `$${index + 1}`
    );

    // Retorna as colunas estruturadas, seus valores e os placeholders correspondentes
    return {
        columns,
        values,
        placeholders
    };
}

// ======================================================
// GET ALL (Buscar todas as questões com filtros opcionais usando a VIEW)
// ======================================================
exports.getAll = async (req, res) => {

    // Desestrutura os filtros opcionais enviados via Query Params (?vestibular=...&ano=...)
    const {
        vestibular,
        dificuldade,
        ano,
        topico
    } = req.query;

    const filters = []; // Armazena as strings das cláusulas WHERE (ex: "vestibular = $1")
    const values = [];  // Armazena os valores reais que substituirão os placeholders

    // Usamos diretamente os nomes das colunas mapeadas e tratadas pela VIEW
    if (vestibular) {
        values.push(vestibular);
        filters.push(`vestibular = $${values.length}`);
    }

    if (dificuldade) {
        values.push(dificuldade);
        filters.push(`dificuldade = $${values.length}`);
    }

    if (ano) {
        values.push(ano);
        filters.push(`ano = $${values.length}`);
    }

    if (topico) {
        values.push(topico);
        filters.push(`topico = $${values.length}`);
    }

    try {
        // Query base apontando diretamente para a nossa View limpa, sem repetição de JOINs
        let query = `SELECT * FROM vw_questoes`;

        // Se houver algum filtro preenchido, concatena a cláusula WHERE juntando-os com "AND"
        if (filters.length > 0) {
            query += ` WHERE ${filters.join(' AND ')}`;
        }

        // Ordena o resultado pelo ID da questão de forma crescente
        query += ` ORDER BY idq`;

        // Executa a query montada passando o array de valores correspondente
        const result = await pool.query(query, values);

        // Retorna a lista de questões encontrada em formato JSON
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};

// ======================================================
// GET BY ID (Buscar uma única questão pelo ID usando a VIEW)
// ======================================================
exports.getById = async (req, res) => {

    // Captura o ID diretamente dos parâmetros da URL (Path Params)
    const { id } = req.params;

    try {
        // Consulta simplificada direto na View, eliminando o bloco massivo de JOINs repetidos
        const result = await pool.query(`
            SELECT * FROM vw_questoes 
            WHERE idq = $1
        `, [id]);

        // Se o banco de dados não retornar nenhuma linha, significa que o ID não existe
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Questão não encontrada.'
            });
        }

        // Retorna apenas o objeto da primeira linha encontrada
        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};

// ======================================================
// CREATE (Criar uma nova questão - Modificações sempre na tabela física)
// ======================================================
exports.createQuestao = async (req, res) => {

    const body = req.body; // Captura os dados enviados no corpo da requisição

    // Gera as colunas, placeholders e valores válidos a partir do body
    const queryData = buildQueryParams(body);

    if (!queryData) {
        return res.status(400).json({
            error: 'Nenhum campo válido enviado.'
        });
    }

    const idxResposta = queryData.columns.indexOf('resposta_correta');

    if (
        idxResposta !== -1 &&
        typeof queryData.values[idxResposta] === 'string'
    ) {
        queryData.values[idxResposta] =
            queryData.values[idxResposta].toUpperCase();
    }

    const query = `
        INSERT INTO questoes (
            ${queryData.columns.join(', ')}
        )
        VALUES (
            ${queryData.placeholders.join(', ')}
        )
        RETURNING *
    `;

    try {
        const result = await pool.query(query, queryData.values);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};

// ======================================================
// UPDATE (Atualizar os dados de uma questão existente na tabela física)
// ======================================================
exports.updateQuestao = async (req, res) => {

    const { id } = req.params; 
    const body = req.body;     

    const queryData = buildQueryParams(body);

    if (!queryData) {
        return res.status(400).json({
            error: 'Nenhum campo válido enviado.'
        });
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
        const result = await pool.query(
            query,
            [...queryData.values, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Questão não encontrada.'
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};

// ======================================================
// DELETE (Excluir uma questão por ID na tabela física)
// ======================================================
exports.deleteQuestao = async (req, res) => {

    const { id } = req.params; 

    try {
        const result = await pool.query(`
            DELETE FROM questoes
            WHERE idq = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Questão não encontrada.'
            });
        }

        res.json({
            message: 'Questão deletada com sucesso.',
            questao: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};

// ======================================================
// BUSCAR POR VESTIBULAR (Consulta filtrando por nome do vestibular na VIEW)
// ======================================================
exports.buscarPorVestibular = async (req, res) => {

    const { vestibular } = req.params; 

    try {
        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE unaccent(UPPER(vestibular)) = unaccent(UPPER($1))
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
// BUSCAR POR DIFICULDADE (Consulta filtrando pelo nível de dificuldade na VIEW)
// ======================================================
exports.buscarPorDificuldade = async (req, res) => {

    const { dificuldade } = req.params;

    try {
        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE unaccent(UPPER(dificuldade)) = unaccent(UPPER($1))
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
// BUSCAR POR TÓPICO (Consulta filtrando por tema/tópico na VIEW)
// ======================================================
exports.buscarPorTopico = async (req, res) => {

    const { topico } = req.params;

    try {
        const result = await pool.query(`
            SELECT *
            FROM vw_questoes
            WHERE unaccent(UPPER(topico)) = unaccent(UPPER($1))
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
// BUSCAR POR ANO (Consulta filtrando por um ano específico na VIEW)
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
// VERIFICAR RESPOSTA (Valida se o gabarito bate com o input do usuário)
// ======================================================
exports.verificarResposta = async (req, res) => {

    const { idq, respostaUsuario } = req.body;

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

        const questao = result.rows[0];

        const correta = questao.resposta_correta.trim().toUpperCase() ===
                        respostaUsuario.trim().toUpperCase();

        res.json({
            correta,
            comentario: questao.comentario,
            conteudo_complementar: questao.conteudo_complementar
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};