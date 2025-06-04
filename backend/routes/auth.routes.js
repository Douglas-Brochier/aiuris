// Rotas de autenticação

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar dados de entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    // Verificar se o usuário existe
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar a senha
    const senhaCorreta = await bcrypt.compare(password, user.password_hash);
    
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    // Remover a senha do objeto de usuário antes de enviar
    delete user.password_hash;
    
    // Retornar token e dados do usuário
    return res.json({
      token,
      usuario: user
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de registro (apenas para desenvolvimento/testes)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validar dados de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se o email já está em uso
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Inserir novo usuário
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, passwordHash, role || 'user']
    );
    
    const newUser = result.rows[0];
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    // Retornar token e dados do usuário
    return res.status(201).json({
      token,
      usuario: newUser
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
