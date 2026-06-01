import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Home from './pages/Home';
import Questao from './pages/Questao';

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/questao/:id"
          element={<Questao />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;