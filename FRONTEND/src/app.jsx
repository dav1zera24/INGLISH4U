import { Routes, Route } from 'react-router-dom';

// Importando todas as páginas do seu sistema
import Login from './pages/Login.jsx'; 
import Home from './pages/Home.jsx';
import Cadastro from './pages/Cadastro.jsx'; 
import Questao from './pages/Questao.jsx';
import Sobre from './pages/Sobre.jsx'; // A página do grupo Men's Caves

function App() {
  return (
    <Routes>
      {/* Raiz do site mostra o Login */}
      <Route path="/" element={<Login />} />
      
      {/* Rota para a Home */}
      <Route path="/home" element={<Home />} />
      
      {/* Rota para o Cadastro */}
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rota para a tela de uma Questão específica */}
      <Route path="/questao/:id" element={<Questao />} />

      {/* Rota para a página Sobre do Men's Caves */}
      <Route path="/sobre" element={<Sobre />} />
    </Routes>
  );
}

export default App;