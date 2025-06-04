// Rotas de usuários

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');
const bcrypt = require('bcrypt');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Obter todos os usuários (apenas para admin)
router.get('/', async (req, res) => {
  try {
    // Verificar se o usuário é admin
    const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem listar usuários.' });
    }
    
    const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Obter um usuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário é admin ou está buscando seu próprio perfil
    if (req.userId !== parseInt(id)) {
      const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
      
      if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você só pode visualizar seu próprio perfil.' });
      }
    }
    
    const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

// Atualizar um usuário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    
    // Verificar se o usuário é admin ou está atualizando seu próprio perfil
    if (req.userId !== parseInt(id)) {
      const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
      
      if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar seu próprio perfil.' });
      }
    }
    
    // Verificar se o usuário existe
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se o email já está em uso por outro usuário
    if (email && email !== userCheck.rows[0].email) {
      const emailCheck = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, id]);
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Este email já está em uso por outro usuário' });
      }
    }
    
    // Preparar os campos para atualização
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (name) {
      fields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    
    if (email) {
      fields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      fields.push(`password_hash = $${paramCount}`);
      values.push(passwordHash);
      paramCount++;
    }
    
    // Apenas admin pode alterar o papel do usuário
    if (role) {
      const adminCheck = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
      
      if (adminCheck.rows.length > 0 && adminCheck.rows[0].role === 'admin') {
        fields.push(`role = $${paramCount}`);
        values.push(role);
        paramCount++;
      }
    }
    
    // Se não há campos para atualizar
    if (fields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }
    
    // Adicionar o ID do usuário aos valores
    values.push(id);
    
    // Construir a query
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, created_at`;
    
    // Executar a query
    const result = await db.query(query, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Excluir um usuário (apenas admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário é admin
    const adminCheck = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem excluir usuários.' });
    }
    
    // Verificar se o usuário existe
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Impedir a exclusão do próprio usuário admin
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ message: 'Você não pode excluir seu próprio usuário' });
    }
    
    // Excluir usuário
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
});

module.exports = router;
