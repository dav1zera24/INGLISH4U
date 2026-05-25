const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {

    // impede recarregar a página
    event.preventDefault();

    const email =
        document.getElementById('email').value;

    const senha =
        document.getElementById('password').value;

    try {

        const response = await fetch(
            'http://localhost:3000/auth/login',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        const dados = await response.json();

        console.log(dados);

        // LOGIN OK
        if (response.ok) {

            // salva token
            localStorage.setItem(
                'jwtToken',
                dados.token
            );

            // salva usuário
            localStorage.setItem(
                'usuario',
                JSON.stringify(dados.usuario)
            );

            message.innerHTML =
                'Login realizado com sucesso!';

            // redireciona
            setTimeout(() => {

                window.location.href =
                    '/home.html';

            }, 1000);

        }

        // ERRO LOGIN
        else {

            message.innerHTML =
                dados.erro || 'Erro ao fazer login';

        }

    } catch (error) {

        console.error(error);

        message.innerHTML =
            'Erro de conexão com servidor';

    }

});