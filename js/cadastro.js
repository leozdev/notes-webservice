$(document).ready(function() {
    $("form").on("submit", function(event) {
        event.preventDefault();

        const login = $("#email").val();
        const senha = $("#password").val();

        const data = {
            login: login,
            senha: senha
        };

        $.ajax({
            url: "https://ifsp.ddns.net/webservices/lembretes/usuario/signup",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(response) {
                localStorage.setItem('authToken', response.token);
                window.location.href = 'lembretes.html';
            },
            error: function() {
                alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
            }
        });
    });
});
