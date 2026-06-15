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

  // Função para buscar questões (chamada no clique do botão com os filtros)
  async function buscarQuestoes() {
    if (!token) return;

    try {
      const params = new URLSearchParams();

      if (vestibular) params.append('vestibular', vestibular);
      if (dificuldade) params.append('dificuldade', dificuldade); // Corrigido de difficulty para dificuldade
      if (ano) params.append('ano', ano);
      if (topico) params.append('topico', topico);

      const queryString = params.toString();
      const url = queryString
        ? `http://localhost:3000/api/questoes?${queryString}`
        : 'http://localhost:3000/api/questoes';

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await response.json();
      setQuestoes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
    }
  }

  // Executa uma vez ao carregar o componente para trazer a lista inicial
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    async function carregarInicial() {
      try {
        const response = await fetch('http://localhost:3000/api/questoes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const dados = await response.json();
        setQuestoes(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error(error);
      }
    }

    carregarInicial();
  }, [navigate, token]);

  function logout() {
    localStorage.removeItem('jwtToken');
    navigate('/');
  }

  return (
    <div className="app-container">
      <header className="hero">
        <nav className="navbar">
          <div className="logo">
            English4U
          </div>
          
          <div className="nav-actions">
            <button
              className="secondary btn-nav"
              onClick={() => navigate('/sobre')}
            >
              Sobre
            </button>
            <button
              className="secondary btn-nav btn-sair"
              onClick={logout}
            >
              Sair
            </button>
          </div>
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
        <section className="panel filtrar-questoes">
          <h2>
            Filtrar Questões
          </h2>

          <div className="filters-grid filtros-container">
            <select
              value={vestibular}
              onChange={(e) => setVestibular(e.target.value)}
            >
              <option value="">Todos Vestibulares</option>
              <option value="ENEM">ENEM</option>
              <option value="FUVEST">FUVEST</option>
              <option value="UNICAMP">UNICAMP</option>
              <option value="UNESP">UNESP</option>
              <option value="ALBERT EINSTEIN">ALBERT EINSTEIN</option>
            </select>

            <select
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
            >
              <option value="">Todas Dificuldades</option>
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
            </select>

            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            >
              <option value="">Todos Anos</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
          
            </select>

            <select
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
            >
              <option value="">Todas Categorias</option>
              <option value="Interpretação de Texto / Compreensão Geral">Interpretação de Texto / Compreensão Geral</option>
              <option value="Vocabulário e Semântica (Sinônimos/Contexto)">Vocabulário e Semântica (Sinônimos/Contexto)</option>
              <option value="Elementos de Coesão (Conjunções/Preposições)">Elementos de Coesão (Conjunções/Preposições)</option>
              <option value="Gramática: Tempos Verbais (Present/Past/Perfect)">Gramática: Tempos Verbais</option>
              <option value="Gramática: Modal Verbs & Imperative">Verbos Modais e Imperativo</option>
            </select>
          </div>

          <button
            className="btn-buscar"
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
            {Array.isArray(questoes) && questoes.length > 0 ? (
              questoes.map((questao) => (
                <div
                  key={questao.idq}
                  className="question-card"
                >
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
                    onClick={() => navigate(`/questao/${questao.idq}`)}
                  >
                    Resolver
                  </button>
                </div>
              ))
            ) : (
              <p className="no-questions">Nenhuma questão encontrada para os filtros selecionados.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} English4U. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;