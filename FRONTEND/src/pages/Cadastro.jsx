import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css'; 

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function criarConta(event) {
    event.preventDefault();

    try {
      const resposta = await fetch(
        'http://localhost:3000/auth/home',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome,
            email,
            senha
          })
        }
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem('Conta criada com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMensagem(dados.erro || 'Erro ao cadastrar');
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao cadastrar');
    }
  }

  return (
    <div className="login-container">
      <section className="login-panel">
        {/* Títulos movidos para dentro do painel escuro */}
        <h2>Criar Conta</h2>
        <p className="subtitle">Cadastre um novo usuário para acessar o sistema.</p>

        {mensagem && <div className="message" style={{ color: 'var(--brand-red)', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>{mensagem}</div>}

        <form onSubmit={criarConta}>
          <div className="form-row">
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Seu nome completo"
            />
          </div>

          <div className="form-row">
            <label>Email</label>
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
            <button type="submit">
              Criar Conta
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate('/')}
            >
              Voltar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Cadastro;