import { useNavigate } from 'react-router-dom';
// Novo caminho apontando para a pasta assets/imgs
import fotoGrupo from '../assets/imgs/grupo.jpg'; 

function Sobre() {
  const navigate = useNavigate();

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
              onClick={() => navigate('/home')}
            >
              Voltar
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <h1>Sobre o Projeto</h1>
          <p>Conheça os desenvolvedores por trás do English4U.</p>
        </div>
      </header>

      <main>
        <section className="panel about-panel">
          <div className="about-grid">
            
            <div className="about-text">
              <span className="about-badge">Quem Somos</span>
              <h2>Men's Caves</h2>
              <p>
                Somos o grupo <strong>Men's Caves</strong>. Desenvolvemos esta plataforma como um trabalho dedicado a ajudar estudantes a dominarem o inglês para os vestibulares.
              </p>
              <p>
                O <strong>English4U</strong> nasceu da vontade de centralizar questões de exames como ENEM e FUVEST, facilitando o estudo por categorias gramaticais e níveis de dificuldade, tudo em um ambiente moderno e intuitivo.
              </p>
              
              <div className="about-features">
                <div className="feature-item">-Foco em Vestibulares</div>
                <div className="feature-item">-Desenvolvido com React</div>
                <div className="feature-item">-Treinamento Direcionado</div>
              </div>
            </div>

            <div className="about-image-container">
              <img src={fotoGrupo} alt="Grupo Men's Caves" className="about-img" />
              <div className="image-overlay-title">Men's Caves Team</div>
            </div>

          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} English4U. Desenvolvido por Men's Caves.</p>
        </div>
      </footer>
    </div>
  );
}

export default Sobre;