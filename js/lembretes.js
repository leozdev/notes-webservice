$(document).ready(function() {
    let token = localStorage.getItem('authToken');
    let idLembreteEmEdicao = null;
    let intervalo;

    if (token) {
        carregarLembretes();
        iniciarTimerSessao();
    } else {
        window.location.href = 'login.html';
    }

    function iniciarTimerSessao() {
        let tempoRestante = localStorage.getItem('tempoRestante') ? parseInt(localStorage.getItem('tempoRestante')) : 3 * 60;
        atualizarTimer(tempoRestante);

        intervalo = setInterval(function() {
            tempoRestante--;
            atualizarTimer(tempoRestante);
            localStorage.setItem('tempoRestante', tempoRestante);

            if (tempoRestante === 60) {
                mostrarPopupContinuar();
            }

            if (tempoRestante < 0) {
                clearInterval(intervalo);
                $('#timer').text('Sessão encerrada');
                alert('O tempo da sessão acabou!');
                logout();
            }
        }, 1000);
    }

    function atualizarTimer(tempoRestante) {
        const minutos = Math.floor(tempoRestante / 60);
        const segundos = tempoRestante % 60;
        $('#timer').text(`${minutos}:${segundos < 10 ? '0' + segundos : segundos}`);
    }

    function mostrarPopupContinuar() {
        $('#renovarTokenModal').modal('show');
    }

    $('#continuarConectadoSim').on('click', function() {
        validarTokenErenovar();
        $('#renovarTokenModal').modal('hide');
    });

    $('#continuarConectadoNao').on('click', function() {
        logout();
    });

    function validarTokenErenovar() {
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/check',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            success: function() {
                renovarToken();
            },
            error: function() {
                alert('Sua sessão expirou ou está inválida. Você será redirecionado para o login.');
                logout();
            },
        });
    }

    function renovarToken() {
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/renew',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            success: function(response) {
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    token = response.token;
                    localStorage.setItem('tempoRestante', 3 * 60);

                    clearInterval(intervalo);
                    iniciarTimerSessao();
                }
            },
            error: function() {
                alert('Erro ao tentar manter sua sessão ativa. Você será redirecionado para o login.');
                logout();
            },
        });
    }

    function logout() {
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/usuario/logout',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            complete: function() {
                localStorage.removeItem('authToken');
                localStorage.removeItem('tempoRestante');
                window.location.href = 'login.html';
            }
        });
    }

    function carregarLembretes() {
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/lembrete',
            type: 'GET',
            headers: {
                Authorization: 'Bearer ' + token,
            },
            success: function(response) {
                response.forEach(function(lembrete) {
                    const lembreteHtml = criarHtmlLembrete(lembrete);
                    $('#note-full-container').prepend(lembreteHtml);
                });
            }
        });
    }

    function criarHtmlLembrete(lembrete) {
        return `
        <div class="col-md-4 single-note-item all-category" data-id="${lembrete.id}">
            <div class="card card-body">
                <span class="side-stick"></span>
                <div class="d-flex align-items-center mb-3">
                    <i class="fa fa-calendar-o mr-2"></i>
                    <h6 class="note-date font-12 text-muted mb-0">${lembrete.data}</h6>
                </div>
                <div class="note-content">
                    <p class="note-inner-content text-muted" data-noteContent="${lembrete.texto}">${lembrete.texto}</p>
                </div>
                <div class="d-flex align-items-center">
                    <span class="mr-1"><i class="fa fa-trash remove-note"></i></span>
                    <span class="ml-auto mr-1"><i class="fa fa-pencil-square-o edit-note"></i></span> 
                </div>
            </div>
        </div>
        `;
    }

    $('#add-notes').on('click', function() {
        idLembreteEmEdicao = null;
        $('#note-has-description').val('');
        $('#btn-n-add').text('Adicionar');
        $('#addnotesmodal').modal('show');
    });

    $('#btn-n-add').on('click', function(event) {
        event.preventDefault();

        const descricaoLembrete = $('#note-has-description').val();

        if (descricaoLembrete.length === 0 || descricaoLembrete.length > 255) {
            alert('O conteúdo deve ter entre 1 e 255 caracteres.');
            return;
        }

        if (idLembreteEmEdicao) {
            editarLembrete(idLembreteEmEdicao, descricaoLembrete);
        } else {
            const novoLembrete = {
                texto: descricaoLembrete,
            };

            adicionarNovoLembrete(novoLembrete);
        }
    });

    function adicionarNovoLembrete(novoLembrete) {
        $.ajax({
            url: 'https://ifsp.ddns.net/webservices/lembretes/lembrete',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(novoLembrete),
            success: function(response) {
                const novoLembreteHtml = criarHtmlLembrete(response);
                $('#note-full-container').prepend(novoLembreteHtml);
                $('#note-has-description').val('');
                $('#addnotesmodal').modal('hide');
            },
            error: function() {
                alert('Erro ao adicionar o lembrete. Tente novamente.');
            },
        });
    }

    $('#note-full-container').on('click', '.edit-note', function(event) {
        event.stopPropagation();

        const $elemento = $(this).closest('.single-note-item');
        idLembreteEmEdicao = $elemento.data('id');
        const conteudoAtual = $elemento.find('.note-inner-content').data('notecontent');

        $('#note-has-description').val(conteudoAtual);
        $('#btn-n-add').text('Salvar');
        $('#addnotesmodal').modal('show');
    });

    function editarLembrete(idLembrete, novoTexto) {
        if ($(`#note-full-container .single-note-item[data-id="${idLembrete}"] .note-inner-content`).data('notecontent') === novoTexto) {
            $('#addnotesmodal').modal('hide');
            return;
        }

        $.ajax({
            url: `https://ifsp.ddns.net/webservices/lembretes/lembrete/${idLembrete}`,
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ texto: novoTexto }),
            success: function() {
                const $elemento = $(`#note-full-container .single-note-item[data-id="${idLembrete}"]`);
                $elemento.find('.note-inner-content').text(novoTexto);
                $elemento.find('.note-inner-content').data('notecontent', novoTexto);

                idLembreteEmEdicao = null;
                $('#note-has-description').val('');
                $('#btn-n-add').text('Adicionar');
                $('#addnotesmodal').modal('hide');
            },
            error: function() {
                alert('Erro ao editar o lembrete. Tente novamente.');
            },
        });
    }

    $('#note-full-container').on('click', '.remove-note', function(event) {
        event.stopPropagation();
        const $elemento = $(this).closest('.single-note-item');
        const idLembrete = $elemento.data('id');
        $.ajax({
            url: `https://ifsp.ddns.net/webservices/lembretes/lembrete/${idLembrete}`,
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function() {
                $elemento.remove();
            },
            error: function() {
                alert('Erro ao excluir lembrete. Tente novamente.');
            }
        });
    });

    $('#logoutButton').on('click', function() {
        logout();
    });
});