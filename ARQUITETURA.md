# Planejamento da Arquitetura - MVP SaaS Jurídico

Este documento descreve a arquitetura planejada para o Produto Mínimo Viável (MVP) do sistema SaaS para escritórios de advocacia.

## 1. Visão Geral

O sistema seguirá uma arquitetura cliente-servidor padrão:

*   **Backend:** API RESTful construída com Node.js e Express, responsável pela lógica de negócios e interação com o banco de dados.
*   **Frontend:** Interface web single-page (ou multi-page simples) desenvolvida com HTML, CSS, JavaScript e Bootstrap, consumindo a API do backend.
*   **Banco de Dados:** PostgreSQL para persistência dos dados.

## 2. Estrutura de Diretórios (Já Criada)

```
/home/ubuntu/saas_juridico_mvp/
├── backend/
│   ├── src/          # Código fonte principal (entry point, app setup)
│   ├── routes/       # Definições das rotas da API
│   ├── controllers/  # Lógica de controle (request/response handling)
│   ├── models/       # Modelos de dados (interação com DB)
│   ├── config/       # Arquivos de configuração (DB, JWT, etc.)
│   └── db/           # Scripts SQL, migrações (se necessário)
├── frontend/
│   ├── css/          # Arquivos CSS (Bootstrap, custom styles)
│   ├── js/           # Arquivos JavaScript (lógica do frontend, API calls)
│   ├── img/          # Imagens estáticas
│   └── *.html        # Arquivos HTML das telas
└── ARQUITETURA.md    # Este arquivo
```

## 3. Modelos de Dados (Entidades Principais - PostgreSQL)

*   **users:**
    *   `id` SERIAL PRIMARY KEY
    *   `name` VARCHAR(255) NOT NULL
    *   `email` VARCHAR(255) UNIQUE NOT NULL
    *   `password_hash` VARCHAR(255) NOT NULL
    *   `role` VARCHAR(50) DEFAULT 'user' NOT NULL -- ('admin', 'user')
    *   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*   **clients:**
    *   `id` SERIAL PRIMARY KEY
    *   `name` VARCHAR(255) NOT NULL
    *   `type` VARCHAR(2) NOT NULL -- ('PF', 'PJ')
    *   `cpf_cnpj` VARCHAR(18) UNIQUE NOT NULL
    *   `email` VARCHAR(255)
    *   `phone` VARCHAR(20)
    *   `address` TEXT
    *   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    *   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*   **processes:**
    *   `id` SERIAL PRIMARY KEY
    *   `process_number` VARCHAR(100) UNIQUE NOT NULL
    *   `court` VARCHAR(100)
    *   `district` VARCHAR(100) -- Comarca
    *   `action_type` VARCHAR(100)
    *   `status` VARCHAR(50) DEFAULT 'ativo'
    *   `client_id` INTEGER REFERENCES clients(id) ON DELETE SET NULL
    *   `description` TEXT
    *   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    *   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*   **appointments:**
    *   `id` SERIAL PRIMARY KEY
    *   `title` VARCHAR(255) NOT NULL
    *   `description` TEXT
    *   `start_time` TIMESTAMP NOT NULL
    *   `end_time` TIMESTAMP
    *   `process_id` INTEGER REFERENCES processes(id) ON DELETE SET NULL
    *   `client_id` INTEGER REFERENCES clients(id) ON DELETE SET NULL
    *   `user_id` INTEGER REFERENCES users(id) ON DELETE CASCADE -- Vinculado ao usuário que criou
    *   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    *   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*   **tasks:**
    *   `id` SERIAL PRIMARY KEY
    *   `title` VARCHAR(255) NOT NULL
    *   `description` TEXT
    *   `due_date` DATE
    *   `status` VARCHAR(50) DEFAULT 'pendente' -- ('pendente', 'concluida')
    *   `assigned_user_id` INTEGER REFERENCES users(id) ON DELETE SET NULL
    *   `process_id` INTEGER REFERENCES processes(id) ON DELETE SET NULL
    *   `client_id` INTEGER REFERENCES clients(id) ON DELETE SET NULL
    *   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    *   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*   **documents:** (Simplificado para MVP - apenas metadados)
    *   `id` SERIAL PRIMARY KEY
    *   `filename` VARCHAR(255) NOT NULL
    *   `filepath` VARCHAR(512) NOT NULL -- Caminho no servidor onde o arquivo foi salvo
    *   `upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    *   `process_id` INTEGER REFERENCES processes(id) ON DELETE CASCADE
    *   `client_id` INTEGER REFERENCES clients(id) ON DELETE CASCADE
    *   `user_id` INTEGER REFERENCES users(id) ON DELETE SET NULL -- Quem fez upload
*   **licitacoes:**
    *   `id` SERIAL PRIMARY KEY
    *   `edital_number` VARCHAR(100)
    *   `organ` VARCHAR(255) -- Órgão Licitante
    *   `object` TEXT -- Objeto da Licitação
    *   `publication_date` DATE
    *   `deadline_date` DATE
    *   `status` VARCHAR(100) -- Ex: 'Em análise', 'Participando', 'Ganha', 'Perdida'
    *   `description` TEXT
    *   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    *   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

## 4. API Endpoints (Rotas Principais - MVP)

O prefixo base será `/api`.

*   **Autenticação:**
    *   `POST /auth/register` - Registrar novo usuário (inicialmente pode ser restrito)
    *   `POST /auth/login` - Login de usuário, retorna token JWT
*   **Usuários (Admin):**
    *   `GET /users`
    *   `GET /users/:id`
    *   `PUT /users/:id`
    *   `DELETE /users/:id`
*   **Clientes:**
    *   `GET /clients`
    *   `POST /clients`
    *   `GET /clients/:id`
    *   `PUT /clients/:id`
    *   `DELETE /clients/:id`
*   **Processos:**
    *   `GET /processes`
    *   `POST /processes`
    *   `GET /processes/:id`
    *   `PUT /processes/:id`
    *   `DELETE /processes/:id`
*   **Compromissos (Agenda):**
    *   `GET /appointments`
    *   `POST /appointments`
    *   `GET /appointments/:id`
    *   `PUT /appointments/:id`
    *   `DELETE /appointments/:id`
*   **Tarefas:**
    *   `GET /tasks`
    *   `POST /tasks`
    *   `GET /tasks/:id`
    *   `PUT /tasks/:id` (para atualizar status, etc.)
    *   `DELETE /tasks/:id`
*   **Licitações:**
    *   `GET /licitacoes`
    *   `POST /licitacoes`
    *   `GET /licitacoes/:id`
    *   `PUT /licitacoes/:id`
    *   `DELETE /licitacoes/:id`
*   **Documentos:**
    *   `POST /documents/upload` (Recebe arquivo e metadados como `process_id` ou `client_id`)
    *   `GET /documents/process/:processId`
    *   `GET /documents/client/:clientId`
    *   `GET /documents/:id` (Obter metadados)
    *   `GET /documents/download/:id` (Endpoint para baixar o arquivo)
    *   `DELETE /documents/:id`

*Autenticação via JWT será necessária para a maioria das rotas.*

## 5. Estrutura do Frontend (Telas HTML - MVP)

*   `login.html`: Formulário de login.
*   `dashboard.html`: Tela principal após login, com visão geral e navegação.
*   `clientes.html`: Listagem, cadastro e edição de clientes.
*   `processos.html`: Listagem, cadastro e edição de processos.
*   `processo_detalhe.html`: Visualização detalhada de um processo (incluindo documentos, tarefas, etc.).
*   `agenda.html`: Visualização do calendário e gestão de compromissos.
*   `tarefas.html`: Listagem e gestão de tarefas.
*   `licitacoes.html`: Listagem, cadastro e edição de licitações.

Cada tela HTML terá um arquivo JS associado (`clientes.js`, `processos.js`, etc.) para interagir com a API e manipular o DOM. Um `main.js` conterá funções comuns (chamadas API, manipulação de token, etc.). O `style.css` conterá estilos personalizados além do Bootstrap.

## 6. Próximos Passos

1.  Configurar o ambiente Node.js no backend.
2.  Instalar dependências (Express, pg, bcrypt, jsonwebtoken, cors, dotenv, etc.).
3.  Configurar a conexão com o banco de dados PostgreSQL.
4.  Criar os scripts SQL para gerar as tabelas no banco.
5.  Começar a implementação das rotas e controllers da API, começando pela autenticação e usuários.

