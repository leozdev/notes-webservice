$(document).ready(function() {
    $('#login-form').submit(function(event) {
        event.preventDefault();

        const login = $('#email').val();
        const senha = $('#password').val();

        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                login: login,
                senha: senha
            }),
            success: function(response) {
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    window.location.href = 'lembretes.html';
                } else {
                    alert('Erro no login.');
                }
            },
            error: function() {
                alert('Erro ao realizar o login. Verifique suas credenciais.');
            }
        });
    });
});
