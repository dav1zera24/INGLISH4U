import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/styles.css'; 

function Questao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questao, setQuestao] = useState(null);
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [erro, setErro] = useState(null); // Estado para capturar erros de conexão

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = localStorage.getItem('jwtToken');
      try {
        const response = await fetch(
          `http://localhost:3000/api/questoes/id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Não foi possível buscar a questão.');
        }

        const dados = await response.json();
        if (mounted) setQuestao(dados);
      } catch (error) {
        console.error(error);
        if (mounted) setErro('Erro ao carregar a questão. Verifique a conexão com o servidor.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Se houver erro de conexão ou ID inexistente, mostra a mensagem de erro
  if (erro) {
    return (
      <main>
        <section className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: 'var(--brand-red)' }}>{erro}</h2>
          <button className="secondary" onClick={() => navigate('/home')} style={{ marginTop: '20px' }}>
            Voltar para a Home
          </button>
        </section>
      </main>
    );
  }

  // Enquanto o fetch não termina, mostra o loading
  if (!questao) {
    return (
      <main>
        <h2>Carregando questão...</h2>
      </main>
    );
  }

  return (
    <main>
      <section className="panel">
        <button
          className="secondary"
          onClick={() => navigate('/home')}
          style={{ marginBottom: '24px' }}
        >
          ← Voltar
        </button>

        <div className="question-header">
          <span className="vestibular-badge">
            {questao.vestibular}
          </span>

          <span className={`difficulty-badge ${
            questao.dificuldade === 'Fácil' ? 'facil' : 
            questao.dificuldade === 'Médio' ? 'medio' : 'dificil'
          }`}>
            {questao.dificuldade}
          </span>
        </div>

        <div className="question-meta" style={{ margin: '16px 0' }}>
          <span>
            {questao.tempo_verbal || questao.topico}
          </span>
          <span style={{ marginLeft: '12px' }}>
            {questao.ano}
          </span>
        </div>

        <h2 style={{ marginBottom: '24px', lineHeight: '1.4' }}>
          {questao.enunciado}
        </h2>

        {/* Alternativas renderizadas condicionalmente para evitar quebras */}
        {questao.alternativa_a && (
          <p style={{ margin: '12px 0' }}><strong>A)</strong> {questao.alternativa_a}</p>
        )}
        {questao.alternativa_b && (
          <p style={{ margin: '12px 0' }}><strong>B)</strong> {questao.alternativa_b}</p>
        )}
        {questao.alternativa_c && (
          <p style={{ margin: '12px 0' }}><strong>C)</strong> {questao.alternativa_c}</p>
        )}
        {questao.alternativa_d && (
          <p style={{ margin: '12px 0' }}><strong>D)</strong> {questao.alternativa_d}</p>
        )}

        {/* Botão Dinâmico: Alterna entre Revelar e Esconder */}
        <div style={{ marginTop: '32px' }}>
          {!mostrarResposta ? (
            <button onClick={() => setMostrarResposta(true)}>
              Revelar Resposta
            </button>
          ) : (
            <button className="secondary" onClick={() => setMostrarResposta(false)}>
              Esconder Resposta
            </button>
          )}
        </div>

        {/* Seção da Resposta Exibida */}
        {mostrarResposta && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <h2 style={{ color: '#4caf50', marginBottom: '16px' }}>
              ✅ Resposta Correta: {questao.resposta_correta}
            </h2>

            <h3>Comentário</h3>
            <p style={{ marginTop: '8px', marginBottom: '20px', color: '#ccc' }}>
              {questao.comentario}
            </p>

            {questao.conteudo_complementar && (
              <>
                <h3>Conteúdo Complementar</h3>
                <p style={{ marginTop: '8px', color: '#ccc' }}>
                  {questao.conteudo_complementar}
                </p>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Questao;