// Arquivo de Configuração do Banco de Dados

const { Pool } = require('pg');
require('dotenv').config(); // Carrega variáveis do .env

const pool = new Pool({
  user: process.env.DB_USER || 'postgres', // Usuário padrão ou do .env
  host: process.env.DB_HOST || 'localhost', // Host padrão ou do .env
  database: process.env.DB_DATABASE || 'saas_juridico_mvp', // Nome do banco ou do .env
  password: process.env.DB_PASSWORD || 'password', // Senha padrão ou do .env
  port: process.env.DB_PORT || 5432, // Porta padrão ou do .env
});

// Testa a conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err.stack);
  }
  console.log('Conexão com o PostgreSQL estabelecida com sucesso!');
  client.release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool // Exporta o pool se precisar de transações
};

