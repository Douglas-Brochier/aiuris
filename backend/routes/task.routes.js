// Rotas de tarefas

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Obter todas as tarefas
router.get('/', async (req, res) => {
  try {
    const { status, assigned_user_id, process_id, client_id, limit } = req.query;
    let query = 'SELECT * FROM tasks';
    const params = [];
    
    // Adicionar filtros se fornecidos
    const filters = [];
    
    if (status) {
      filters.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (assigned_user_id) {
      filters.push(`assigned_user_id = $${params.length + 1}`);
      params.push(assigned_user_id);
    }
    
    if (process_id) {
      filters.push(`process_id = $${params.length + 1}`);
      params.push(process_id);
    }
    
    if (client_id) {
      filters.push(`client_id = $${params.length + 1}`);
      params.push(client_id);
    }
    
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Ordenação
    query += ' ORDER BY due_date ASC';
    
    // Limite se fornecido
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefas' });
  }
});

// Obter uma tarefa específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefa' });
  }
});

// Criar uma nova tarefa
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      due_date, 
      status, 
      assigned_user_id, 
      process_id, 
      client_id 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!title) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }
    
    // Verificar se o usuário atribuído existe, se fornecido
    if (assigned_user_id) {
      const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [assigned_user_id]);
      
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Usuário atribuído não encontrado' });
      }
    }
    
    // Verificar se o processo existe, se fornecido
    if (process_id) {
      const processCheck = await db.query('SELECT * FROM processes WHERE id = $1', [process_id]);
      
      if (processCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Processo não encontrado' });
      }
    }
    
    // Verificar se o cliente existe, se fornecido
    if (client_id) {
      const clientCheck = await db.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      
      if (clientCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Cliente não encontrado' });
      }
    }
    
    // Inserir nova tarefa
    const result = await db.query(
      'INSERT INTO tasks (title, description, due_date, status, assigned_user_id, process_id, client_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, due_date, status || 'pendente', assigned_user_id, process_id, client_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro ao criar tarefa' });
  }
});

// Atualizar uma tarefa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      due_date, 
      status, 
      assigned_user_id, 
      process_id, 
      client_id 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!title) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }
    
    // Verificar se a tarefa existe
    const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Verificar se o usuário atribuído existe, se fornecido
    if (assigned_user_id) {
      const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [assigned_user_id]);
      
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Usuário atribuído não encontrado' });
      }
    }
    
    // Verificar se o processo existe, se fornecido
    if (process_id) {
      const processCheck = await db.query('SELECT * FROM processes WHERE id = $1', [process_id]);
      
      if (processCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Processo não encontrado' });
      }
    }
    
    // Verificar se o cliente existe, se fornecido
    if (client_id) {
      const clientCheck = await db.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      
      if (clientCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Cliente não encontrado' });
      }
    }
    
    // Atualizar tarefa
    const result = await db.query(
      'UPDATE tasks SET title = $1, description = $2, due_date = $3, status = $4, assigned_user_id = $5, process_id = $6, client_id = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [title, description, due_date, status, assigned_user_id, process_id, client_id, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
  }
});

// Excluir uma tarefa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a tarefa existe
    const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Excluir tarefa
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ message: 'Erro ao excluir tarefa' });
  }
});

module.exports = router;
