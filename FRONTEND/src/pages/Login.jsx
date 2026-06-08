import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css'; // Corrigido: caminho relativo para src/styles

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fazerLogin = async (event) => {
    event.preventDefault();
    setMensagem('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:3000/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            senha,
          }),
        }
      );

      const dados = await response.json();

      if (response.ok) {
        localStorage.setItem('jwtToken', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        setMensagem('Login realizado com sucesso!');

        setTimeout(() => {
          setLoading(false);
          navigate('/home');
        }, 800);
      } else {
        setMensagem(dados.erro || 'Erro ao fazer login');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setMensagem('Erro de conexão com servidor');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <section className="login-panel">
        {/* Títulos movidos para dentro do painel escuro */}
        <h2>Autenticação</h2>
        <p className="subtitle">Faça login para acessar a home.</p>

        {mensagem && (
          <div 
            className="message" 
            style={{ 
              color: 'var(--brand-red)', 
              marginBottom: '16px', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}
          >
            {mensagem}
          </div>
        )}

        <form onSubmit={fazerLogin}>
          <div className="form-row">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-row">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="button-row">
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate('/cadastro')}
              disabled={loading}
            >
              Criar Conta
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Login;