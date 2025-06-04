# Documentação do Sistema SaaS Jurídico MVP

## Visão Geral

Este documento descreve o MVP (Produto Mínimo Viável) do sistema SaaS para escritórios de advocacia. O sistema foi desenvolvido para gerenciar clientes, processos, licitações e outras atividades essenciais de um escritório jurídico.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Autenticação**: JWT (JSON Web Token)

## Estrutura do Projeto

```
/saas_juridico_mvp/
├── backend/
│   ├── src/          # Código fonte principal
│   ├── routes/       # Definições das rotas da API
│   ├── controllers/  # Lógica de controle
│   ├── models/       # Modelos de dados
│   ├── config/       # Arquivos de configuração
│   └── db/           # Scripts SQL
├── frontend/
│   ├── css/          # Arquivos CSS
│   ├── js/           # Arquivos JavaScript
│   ├── img/          # Imagens estáticas
│   └── *.html        # Arquivos HTML das telas
└── ARQUITETURA.md    # Documentação da arquitetura
```

## Funcionalidades Implementadas

### Autenticação
- Login de usuários
- Proteção de rotas com JWT

### Clientes
- Listagem de clientes
- Cadastro de novos clientes
- Edição de clientes existentes
- Exclusão de clientes

### Processos
- Listagem de processos
- Cadastro de novos processos
- Edição de processos existentes
- Exclusão de processos
- Vinculação de processos a clientes

### Licitações
- Listagem de licitações
- Cadastro de novas licitações
- Edição de licitações existentes
- Exclusão de licitações

## Instruções de Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)

### Passos para Instalação

1. **Clone o repositório**
   ```
   git clone [URL_DO_REPOSITORIO]
   cd saas_juridico_mvp
   ```

2. **Configure o banco de dados PostgreSQL**
   - Crie um banco de dados chamado `saas_juridico_mvp`
   - Crie um usuário `postgres_user` com senha `strong_password_123`
   - Execute o script SQL em `backend/db/init.sql` para criar as tabelas

3. **Configure as variáveis de ambiente**
   - Renomeie o arquivo `.env.example` para `.env` no diretório `backend`
   - Ajuste as variáveis conforme necessário

4. **Instale as dependências do backend**
   ```
   cd backend
   npm install
   ```

5. **Inicie o servidor backend**
   ```
   npm start
   ```

6. **Acesse o frontend**
   - Abra o arquivo `frontend/login.html` em um navegador
   - Ou configure um servidor web para servir os arquivos do frontend

## Usuário Padrão para Testes

- **Email**: admin@example.com
- **Senha**: admin123

## Próximos Passos (Fora do Escopo do MVP)

- Integração com tribunais
- Módulo financeiro completo
- Dashboard analítico avançado
- Repositório de modelos jurídicos
- Portal do cliente
- Integrações com outros sistemas

## Suporte

Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento.
