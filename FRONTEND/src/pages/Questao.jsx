import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Questao() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [questao, setQuestao] = useState(null);

  const [mostrarResposta, setMostrarResposta] =
    useState(false);

  useEffect(() => {

    carregarQuestao();

  }, []);

  async function carregarQuestao() {

    const token =
      localStorage.getItem('jwtToken');

    try {

      const response = await fetch(
        `http://localhost:3000/api/questoes/id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const dados = await response.json();

      console.log(dados);

      setQuestao(dados);

    } catch (error) {

      console.error(error);

    }

  }

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
        >
          ← Voltar
        </button>

        <br /><br />

        <div className="question-top">

          <span className="badge">
            {questao.vestibular}
          </span>

          <span className="difficulty">
            {questao.dificuldade}
          </span>

        </div>

        <br />

        <div className="question-info">

          <span>
            {questao.tempo_verbal}
          </span>

          <span>
            {questao.ano}
          </span>

        </div>

        <br />

        <h2>
          {questao.enunciado}
        </h2>

        <br />

        <p>
          <strong>A)</strong> {questao.alternativa_a}
        </p>

        <br />

        <p>
          <strong>B)</strong> {questao.alternativa_b}
        </p>

        <br />

        <p>
          <strong>C)</strong> {questao.alternativa_c}
        </p>

        <br />

        <p>
          <strong>D)</strong> {questao.alternativa_d}
        </p>

        <br /><br />

        <button
          onClick={() =>
            setMostrarResposta(true)
          }
        >
          Revelar Resposta
        </button>

        {mostrarResposta && (

          <div
            style={{
              marginTop: '30px'
            }}
          >

            <h2>
              ✅ Resposta Correta:
              {' '}
              {questao.resposta_correta}
            </h2>

            <br />

            <h3>
              Comentário
            </h3>

            <p>
              {questao.comentario}
            </p>

            <br />

            <h3>
              Conteúdo Complementar
            </h3>

            <p>
              {questao.conteudo_complementar}
            </p>

          </div>

        )}

      </section>

    </main>

  );

}

export default Questao;