import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [vestibular, setVestibular] = useState('ENEM');
  const [questao, setQuestao] = useState(null);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Buscar questão do backend
  const carregarQuestao = async () => {
    setFeedback(null);
    setAlternativaSelecionada('');
    
    try {
      const response = await fetch(`${API_URL}/questoes/${vestibular}`);
      
      if (!response.ok) {
        alert('Erro ao buscar questões do servidor.');
        return;
      }

      const dados = await response.json();

      if (dados.length === 0) {
        alert('Nenhuma questão encontrada para este vestibular.');
        setQuestao(null);
        return;
      }

      setQuestao(dados[0]); // Guarda a questão no estado
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o backend.');
    }
  };

  // Enviar resposta para validação
  const enviarResposta = async (e) => {
    e.preventDefault();

    if (!alternativaSelecionada) {
      alert('Por favor, selecione uma alternativa!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idq: questao.idq,
          respostaUsuario: alternativaSelecionada
        })
      });

      const resultado = await response.json();
      setFeedback(resultado); // Guarda o resultado (correta true/false e comentário)
    } catch (error) {
      console.error('Erro ao verificar resposta:', error);
    }
  };

  return (
    <div className="container">
      <h1>Simulado de Inglês (React)</h1>

      {/* Filtro de Vestibular */}
      <div className="filtro-box">
        <label htmlFor="vestibular-select">Escolha o Vestibular:</label>
        <select 
          id="vestibular-select" 
          value={vestibular} 
          onChange={(e) => setVestibular(e.target.value)}
        >
          <option value="ENEM">ENEM</option>
          <option value="FUVEST">FUVEST</option>
          <option value="UNESP">UNESP</option>
        </select>
        <button onClick={carregarQuestao}>Buscar Questão</button>
      </div>

      {/* Área da Questão (Só renderiza se houver uma questão carregada) */}
      {questao && (
        <div className="card-questao">
          <span className="tag">{questao.vestibular} ({questao.ano})</span>
          <p className="enunciado">{questao.enunciado}</p>
          
          <form className="alternativas" onSubmit={enviarResposta}>
            {['a', 'b', 'c', 'd', 'e'].map((letra) => (
              <label key={letra} className="alternativa-label">
                <input 
                  type="radio" 
                  name="alt" 
                  value={letra.toUpperCase()} 
                  checked={alternativaSelecionada === letra.toUpperCase()}
                  onChange={(e) => setAlternativaSelecionada(e.target.value)}
                /> 
                <b>{letra.toUpperCase()})</b> {questao[`alternativa_${letra}`]}
              </label>
            ))}

            <button type="submit" className="btn-responder">Enviar Resposta</button>
          </form>

          {/* Feedback Dinâmico */}
          {feedback && (
            <div className={`feedback ${feedback.correta ? 'correto' : 'errado'}`}>
              {feedback.correta ? '🎉 Correto!' : '❌ Incorreto.'}
              <br />
              <small>{feedback.comentario}</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;