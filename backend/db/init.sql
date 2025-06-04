-- Script de Inicialização do Banco de Dados - MVP SaaS Jurídico

-- Criação da Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(2) NOT NULL CHECK (type IN ('PF', 'PJ')), -- Pessoa Física ou Jurídica
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da Tabela de Processos
CREATE TABLE IF NOT EXISTS processes (
    id SERIAL PRIMARY KEY,
    process_number VARCHAR(100) UNIQUE NOT NULL,
    court VARCHAR(100),
    district VARCHAR(100), -- Comarca
    action_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'suspenso', 'finalizado')),
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da Tabela de Compromissos (Agenda)
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    process_id INTEGER REFERENCES processes(id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Vinculado ao usuário que criou
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    process_id INTEGER REFERENCES processes(id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da Tabela de Documentos (Metadados)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(512) NOT NULL, -- Caminho no servidor onde o arquivo foi salvo
    original_filename VARCHAR(255), -- Nome original do arquivo
    mime_type VARCHAR(100), -- Tipo do arquivo (e.g., application/pdf)
    size_bytes BIGINT, -- Tamanho do arquivo em bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    process_id INTEGER REFERENCES processes(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL -- Quem fez upload
);

-- Criação da Tabela de Licitações
CREATE TABLE IF NOT EXISTS licitacoes (
    id SERIAL PRIMARY KEY,
    edital_number VARCHAR(100),
    organ VARCHAR(255), -- Órgão Licitante
    object TEXT, -- Objeto da Licitação
    publication_date DATE,
    deadline_date DATE,
    status VARCHAR(100) DEFAULT 'Em análise' CHECK (status IN ('Em análise', 'Participando', 'Ganha', 'Perdida', 'Não participou', 'Cancelada')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona triggers para atualizar 'updated_at' automaticamente (Opcional, mas boa prática)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger às tabelas que possuem 'updated_at'
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processes_updated_at BEFORE UPDATE ON processes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_licitacoes_updated_at BEFORE UPDATE ON licitacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir um usuário administrador inicial (ajuste o email e senha conforme necessário)
-- A senha 'admin123' será hasheada pela aplicação antes de salvar
-- INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@example.com', 'hash_da_senha_admin123', 'admin') ON CONFLICT (email) DO NOTHING;

-- Mensagem final

SELECT 'Script de inicialização concluído com sucesso.' as message;

