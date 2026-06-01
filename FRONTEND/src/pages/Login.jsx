import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/style.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();

  const fazerLogin = async (event) => {
    event.preventDefault();

    console.log('Botão clicado!');

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

      console.log(dados);

      if (response.ok) {
        localStorage.setItem(
          'jwtToken',
          dados.token
        );

        localStorage.setItem(
          'usuario',
          JSON.stringify(dados.usuario)
        );

        setMensagem(
          'Login realizado com sucesso!'
        );

        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setMensagem(
          dados.erro ||
          'Erro ao fazer login'
        );
      }
    } catch (error) {
      console.error(error);

      setMensagem(
        'Erro de conexão com servidor'
      );
    }
  };

  return (
    <>
      <header>
        <h1>Login</h1>
        <p>Faça login para acessar a home.</p>
      </header>

      <main>
        <section className="panel login-panel">
          <h2>Autenticação</h2>

          <div className="message">
            {mensagem}
          </div>

          <form onSubmit={fazerLogin}>
            <div className="form-row">
              <label>E-mail</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="form-row">
              <label>Senha</label>

              <input
                type="password"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                required
              />
            </div>

            <div className="button-row">
              <button type="submit">
                Entrar
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() =>
                  navigate('/Cadastro')
                }
              >
                Criar Conta
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default Login;