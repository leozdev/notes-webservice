
# Projeto Final - Aplicação de Lembretes

Este é o projeto final desenvolvido para a disciplina de **Programação Web**, sob orientação do professor **Tiago Trojan**. O objetivo do projeto é criar uma aplicação front-end que interaja com um webservice para gestão de lembretes de usuários.

## Objetivo do Projeto

A aplicação permite aos usuários:

- Cadastrar um novo usuário no sistema.
- Realizar login.
- Visualizar lembretes previamente cadastrados após login.
- Adicionar novos lembretes.
- Editar e remover lembretes existentes.

## Funcionalidades Principais

1. **Cadastro de Usuário**: Criação de novas contas no sistema de lembretes.
2. **Login e Autenticação com Token JWT**: Realiza login e utiliza um token com validade de 3 minutos. Durante esse tempo, o usuário pode navegar sem necessidade de refazer o login.
3. **Gerenciamento de Lembretes**: Após o login, o usuário pode visualizar, adicionar, editar e excluir lembretes.
4. **Persistência de Sessão**: Enquanto o token é válido, o usuário mantém o acesso, mesmo ao fechar e reabrir a página.
5. **Expiração de Sessão**: Após 3 minutos, o token expira, e o usuário é redirecionado para a página de login.

## Requisitos Técnicos

- **Back-End**: Conecta-se ao webservice de lembretes em `https://ifsp.ddns.net/webservices/lembretes/`.
- **Tratamento de Exceções**: O sistema possui controle de erros para evitar recarregamentos desnecessários e lidar com falhas de conexão.
- **Tecnologias Permitidas**: HTML, CSS, JavaScript e jQuery. **Não** é permitido o uso de frameworks como Angular, React, Vue, ou Next.js.
- **Estilização**: Opcionalmente, o projeto pode usar bibliotecas de estilo visual para melhorar a interface.

## Estrutura de Pastas

- `index.html`: Página principal do aplicativo.
- `css/`: Estilos utilizados na aplicação.
- `js/`: Código JavaScript para manipulação de dados e comunicação com o webservice.
