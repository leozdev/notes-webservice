$(document).ready(function() {
    const token = localStorage.getItem('authToken');

    // Verifica se o usuário está autenticado
    if (token) {
        carregarNotas();
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
        }, 180000); // Verifica a validade a cada 3 minutos
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

    // Funções para trabalhar com as notas
    function carregarNotas() {
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/lembrete',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                response.forEach(function(note) {
                    const notaHtml = criarHtmlNota(note);
                    $("#note-full-container").prepend(notaHtml);
                });
                removerNota();
            },
            error: function() {
                alert('Erro ao carregar as notas. Tente novamente.');
            }
        });
    }

    // Botão de editar é o edit-note
    // Botão de excluir é o remove-note
    function criarHtmlNota(note) {
        return `
            <div class="col-md-4 single-note-item all-category">
                <div class="card card-body">
                    <span class="side-stick"></span>
                    <div class="d-flex align-items-center mb-3"">
                        <i class="fa fa-calendar-o mr-2"></i>
                        <h6 class="note-date font-12 text-muted mb-0">${note.data}</h6>
                    </div>
                    <div class="note-content">
                        <p class="note-inner-content text-muted" data-noteContent="${note.texto}">${note.texto}</p>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="mr-1"><i class="fa fa-trash remove-note"></i></span>
                        <span class="ml-auto mr-1"><i class="fa fa-pencil-square-o edit-note"></i></span> 
                    </div>
                </div>
            </div>
        `;
    }

    function removerNota() {
        $(".remove-note").off('click').on('click', function(event) {
            event.stopPropagation();
            $(this).parents('.single-note-item').remove();
        });
    }

    // Adicionar nova nota
    $('#add-notes').on('click', function() {
        $('#addnotesmodal').modal('show');
    });

    $("#btn-n-add").on('click', function(event) {
        event.preventDefault();

        const descricaoNota = $('#note-has-description').val();

        if (descricaoNota.length === 0 || descricaoNota.length > 255) {
            alert("O conteúdo deve ter entre 1 e 255 caracteres.");
            return;
        }

        const novaNota = {
            texto: descricaoNota,
            data: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        adicionarNovaNota(novaNota);
    });

    function adicionarNovaNota(novaNota) {
        const token = localStorage.getItem('authToken');
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/lembrete',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(novaNota),
            success: function() {
                const novaNotaHtml = criarHtmlNota(novaNota);
                $("#note-full-container").prepend(novaNotaHtml);
                $('#note-has-description').val('');
                $('#addnotesmodal').modal('hide');
                removerNota();
                alert("Nota adicionada com sucesso!");
            },
            error: function() {
                alert("Erro ao adicionar a nota. Tente novamente.");
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
