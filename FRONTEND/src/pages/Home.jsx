import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {

  const navigate = useNavigate();

  const [questoes, setQuestoes] = useState([]);

  const [vestibular, setVestibular] = useState('');
  const [dificuldade, setDificuldade] = useState('');
  const [ano, setAno] = useState('');
  const [topico, setTopico] = useState('');

  const token = localStorage.getItem('jwtToken');

  useEffect(() => {

    if (!token) {
      navigate('/');
      return;
    }

    carregarQuestoes();

  }, []);

  async function carregarQuestoes() {

    try {

      const response = await fetch(
        'http://localhost:3000/api/questoes',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const dados = await response.json();

      setQuestoes(
        Array.isArray(dados)
          ? dados
          : []
      );

    } catch (error) {

      console.error(error);

    }

  }

  async function buscarQuestoes() {

    try {

      let url =
        'http://localhost:3000/api/questoes';

      if (topico) {

        url =
          `http://localhost:3000/api/questoes/topico/${encodeURIComponent(topico)}`;

      } else if (vestibular) {

        url =
          `http://localhost:3000/api/questoes/vestibular/${encodeURIComponent(vestibular)}`;

      } else if (dificuldade) {

        url =
          `http://localhost:3000/api/questoes/dificuldade/${encodeURIComponent(dificuldade)}`;

      } else if (ano) {

        url =
          `http://localhost:3000/api/questoes/ano/${ano}`;

      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await response.json();

      setQuestoes(
        Array.isArray(dados)
          ? dados
          : []
      );

    } catch (error) {

      console.error(error);

    }

  }

  function logout() {

    localStorage.removeItem('jwtToken');
    navigate('/');

  }

  return (
    <>

      <header className="hero">

        <nav className="navbar">

          <div className="logo">
            English Journey
          </div>

          <button
            className="secondary"
            onClick={logout}
          >
            Sair
          </button>

        </nav>

        <div className="hero-content">

          <h1>
            Prepare-se para os Vestibulares
          </h1>

          <p>
            Estude por dificuldade, vestibular, ano e categorias.
          </p>

        </div>

      </header>

      <main>

        <section className="panel">

          <h2>
            Filtrar Questões
          </h2>

          <div className="filters-grid">

            <select
              value={vestibular}
              onChange={(e) =>
                setVestibular(e.target.value)
              }
            >
              <option value="">
                Todos Vestibulares
              </option>

              <option value="ENEM">
                ENEM
              </option>

              <option value="FUVEST">
                FUVEST
              </option>

              <option value="UNICAMP">
                UNICAMP
              </option>

              <option value="UNESP">
                UNESP
              </option>

              <option value="ALBERT EINSTEIN">
                ALBERT EINSTEIN
              </option>

            </select>

            <select
              value={dificuldade}
              onChange={(e) =>
                setDificuldade(e.target.value)
              }
            >
              <option value="">
                Todas Dificuldades
              </option>

              <option value="Fácil">
                Fácil
              </option>

              <option value="Médio">
                Médio
              </option>

              <option value="Difícil">
                Difícil
              </option>

            </select>

            <select
              value={ano}
              onChange={(e) =>
                setAno(e.target.value)
              }
            >
              <option value="">
                Todos Anos
              </option>

              <option value="2025">
                2025
              </option>

              <option value="2024">
                2024
              </option>

              <option value="2023">
                2023
              </option>

              <option value="2021">
                2021
              </option>

              <option value="2020">
                2020
              </option>

              <option value="2018">
                2018
              </option>

              <option value="2017">
                2017
              </option>

            </select>

            <select
              value={topico}
              onChange={(e) =>
                setTopico(e.target.value)
              }
            >
              <option value="">
                Todas Categorias
              </option>

              <option value="Simple Present">
                Simple Present
              </option>

              <option value="Simple Past">
                Simple Past
              </option>

              <option value="Present Continuous">
                Present Continuous
              </option>

              <option value="Present Perfect">
                Present Perfect
              </option>

              <option value="Modal Verbs / Imperative">
                Modal Verbs / Imperative
              </option>

            </select>

          </div>

          <button
            onClick={buscarQuestoes}
          >
            Buscar Questões
          </button>

        </section>

        <section className="questions-section">

          <h2>
            Questões ({questoes.length})
          </h2>

          <div className="questions-grid">

            {Array.isArray(questoes) &&
              questoes.map((questao) => (

                <div
                  key={questao.idq}
                  className="question-card"
                >

                  <div className="question-header">

                    <span className="vestibular-badge">
                      {questao.vestibular}
                    </span>

                    <span className="difficulty-badge">
                      {questao.dificuldade}
                    </span>

                  </div>

                  <h3>

                    {questao.enunciado.length > 80
                      ? questao.enunciado.substring(0, 80) + '...'
                      : questao.enunciado}

                  </h3>

                  <div className="question-meta">

                    <span>
                      {questao.topico}
                    </span>

                    <span>
                      {questao.ano}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/questao/${questao.idq}`
                      )
                    }
                  >
                    Resolver
                  </button>

                </div>

              ))}

          </div>

        </section>

      </main>

    </>
  );

}

export default Home;