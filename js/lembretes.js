$(document).ready(function() {
    const token = localStorage.getItem('authToken');

    // Verifica se o usuário está autenticado
    if (token) {
        carregarLembretes();
        verificarValidadeToken(token);
    } else {
        window.location.href = 'login.html';
    }

    // Função para verificar a validade do token
    function verificarValidadeToken(token) {
        setInterval(function() {
            $.ajax({
                url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/check',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function() {
                    mostrarPopupContinuar();
                },
                error: function() {
                    tratarTokenInvalido();
                }
            });
        }, 180000);
    }

    function tratarTokenInvalido() {
        alert('Sua sessão expirou ou está inválida. Você será redirecionado para o login.');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }

    // Função para mostrar o popup de renovação de token
    function mostrarPopupContinuar() {
        $('#renewTokenModal').modal('show');
    }

    // Ações do popup
    $('#continueConnectedYes').on('click', function() {
        renovarToken();
        $('#renewTokenModal').modal('hide');
    });

    $('#continueConnectedNo').on('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    // Função para renovar o token
    function renovarToken() {
        const token = localStorage.getItem('authToken');
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/renew',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    alert("Sessão renovada com sucesso!");
                }
            },
            error: function() {
                alert('Erro ao tentar manter sua sessão ativa. Você será redirecionado para o login.');
                window.location.href = 'login.html';
            }
        });
    }

    // Funções para trabalhar com os lembretes
    function carregarLembretes() {  
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/lembrete',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                response.forEach(function(lembrete) {  
                    const lembreteHtml = criarHtmlLembrete(lembrete);  
                    $("#note-full-container").prepend(lembreteHtml);  
                });
                removerLembrete();  
            },
            error: function() {
                alert('Erro ao carregar os lembretes. Tente novamente.');  
            }
        });
    }

    // Botão de editar é o edit-lembrete
    // Botão de excluir é o remove-lembrete
    function criarHtmlLembrete(lembrete) {  
        return `
            <div class="col-md-4 single-note-item all-category">
                <div class="card card-body">
                    <span class="side-stick"></span>
                    <div class="d-flex align-items-center mb-3">
                        <i class="fa fa-calendar-o mr-2"></i>
                        <h6 class="note-date font-12 text-muted mb-0">${lembrete.data}</h6>  <!-- Alterado para "lembrete" -->
                    </div>
                    <div class="note-content">
                        <p class="note-inner-content text-muted" data-noteContent="${lembrete.texto}">${lembrete.texto}</p>  <!-- Alterado para "lembrete" -->
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="mr-1"><i class="fa fa-trash remove-note"></i></span> <!-- Alterado para "lembrete" -->
                        <span class="ml-auto mr-1"><i class="fa fa-pencil-square-o edit-note"></i></span> 
                    </div>
                </div>
            </div>
        `;
    }

    function removerLembrete() {  
        $(".remove-note").off('click').on('click', function(event) {  
            event.stopPropagation();
            $(this).parents('.single-note-item').remove();
        });
    }

    // Adicionar novo lembrete
    $('#add-notes').on('click', function() {
        $('#addnotesmodal').modal('show');
    });

    $("#btn-n-add").on('click', function(event) {
        event.preventDefault();

        const descricaoLembrete = $('#note-has-description').val();  

        if (descricaoLembrete.length === 0 || descricaoLembrete.length > 255) {  
            alert("O conteúdo deve ter entre 1 e 255 caracteres.");
            return;
        }

        const novoLembrete = {  
            texto: descricaoLembrete,  
            data: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        adicionarNovoLembrete(novoLembrete);  
    });

    function adicionarNovoLembrete(novoLembrete) {  
        const token = localStorage.getItem('authToken');
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/lembrete',  
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(novoLembrete),  
            success: function() {
                const novoLembreteHtml = criarHtmlLembrete(novoLembrete);  
                $("#note-full-container").prepend(novoLembreteHtml);  
                $('#note-has-description').val('');  
                $('#addnotesmodal').modal('hide');
                removerLembrete();  
                alert("Lembrete adicionado com sucesso!");  
            },
            error: function() {
                alert("Erro ao adicionar o lembrete. Tente novamente.");  
            }
        });
    }

    // Logout
    $('#logoutButton').on('click', function() {
        const token = localStorage.getItem('authToken');
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/logout',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function() {
                localStorage.removeItem('authToken');
            },
            complete: function() {
                window.location.href = 'login.html';
            }
        });
    });
});
