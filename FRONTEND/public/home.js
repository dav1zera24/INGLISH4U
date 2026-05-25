const apiBase = '/api/questoes';

const logoutButton =
  document.getElementById('logoutButton');

const questionsContainer =
  document.getElementById('questionsContainer');

const buscarQuestoes =
  document.getElementById('buscarQuestoes');

const vestibularSelect =
  document.getElementById('vestibularSelect');

const dificuldadeSelect =
  document.getElementById('dificuldadeSelect');

const anoSelect =
  document.getElementById('anoSelect');

const categoriaSelect =
  document.getElementById('categoriaSelect');

// ======================================================
// TOKEN
// ======================================================

function getToken() {
  return localStorage.getItem('jwtToken');
}

// ======================================================
// REDIRECT LOGIN
// ======================================================

function redirectToLogin() {

  localStorage.removeItem('jwtToken');

  window.location.href = '/';

}

if (!getToken()) {
  redirectToLogin();
}

// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener(
  'click',
  redirectToLogin
);

// ======================================================
// FETCH
// ======================================================

async function fetchJson(url) {

  const response = await fetch(url, {

    headers: {
      Authorization:
        `Bearer ${getToken()}`
    }

  });

  return response.json();

}

// ======================================================
// RENDER QUESTÕES
// ======================================================

function renderQuestions(questions) {

  questionsContainer.innerHTML = '';

  if (!questions.length) {

    questionsContainer.innerHTML = `
      <div class="empty">
        Nenhuma questão encontrada.
      </div>
    `;

    return;

  }

  questions.forEach(question => {

    const card =
      document.createElement('div');

    card.className =
      'question-card';

    card.innerHTML = `

      <div class="question-top">

        <span class="badge">
          ${question.vestibular}
        </span>

        <span class="difficulty">
          ${question.dificuldade}
        </span>

      </div>

      <h3>
        ${question.pergunta}
      </h3>

      <div class="question-info">

        <span>
          ${question.topico}
        </span>

        <span>
          ${question.ano}
        </span>

      </div>

      <button class="resolver-btn">
        Resolver Questão
      </button>

    `;

    questionsContainer.appendChild(card);

  });

}

// ======================================================
// CARREGAR QUESTÕES
// ======================================================

async function loadQuestions() {

  try {

    const data =
      await fetchJson(
        `${apiBase}`
      );

    renderQuestions(data);

  } catch (error) {

    console.error(error);

  }

}

// ======================================================
// FILTROS
// ======================================================

buscarQuestoes.addEventListener(
  'click',
  async () => {

    try {

      let url =
        apiBase;

      if (vestibularSelect.value) {

        url =
          `${apiBase}/vestibular/${vestibularSelect.value}`;

      }

      else if (dificuldadeSelect.value) {

        url =
          `${apiBase}/dificuldade/${dificuldadeSelect.value}`;

      }

      else if (anoSelect.value) {

        url =
          `${apiBase}/ano/${anoSelect.value}`;

      }

      else if (categoriaSelect.value) {

        url =
          `${apiBase}/topico/${categoriaSelect.value}`;

      }

      const data =
        await fetchJson(url);

      renderQuestions(data);

    } catch (error) {

      console.error(error);

    }

  }
);

// ======================================================
// INIT
// ======================================================

loadQuestions();