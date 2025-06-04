const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'saas_juridico_mvp',
  password: process.env.DB_PASSWORD || 'strong_password_123',
  port: process.env.DB_PORT || 5432,
});

async function createAdmin() {
  try {
    // Verificar se o usuário já existe
    const checkResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    if (checkResult.rows.length > 0) {
      console.log('Usuário admin já existe!');
      pool.end();
      return;
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    // Inserir usuário admin
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      ['Administrador', 'admin@example.com', passwordHash, 'admin']
    );
    
    console.log('Usuário admin criado com sucesso:', result.rows[0]);
    pool.end();
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
    pool.end();
  }
}

createAdmin();
