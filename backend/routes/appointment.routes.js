// Rotas de compromissos (agenda)

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Obter todos os compromissos
router.get('/', async (req, res) => {
  try {
    const { process_id, client_id, limit } = req.query;
    let query = 'SELECT * FROM appointments';
    const params = [];
    
    // Adicionar filtros se fornecidos
    if (process_id || client_id) {
      query += ' WHERE';
      
      if (process_id) {
        query += ' process_id = $1';
        params.push(process_id);
      }
      
      if (client_id) {
        if (params.length > 0) query += ' AND';
        query += ` client_id = $${params.length + 1}`;
        params.push(client_id);
      }
    }
    
    // Ordenação
    query += ' ORDER BY start_time ASC';
    
    // Limite se fornecido
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar compromissos:', error);
    res.status(500).json({ message: 'Erro ao buscar compromissos' });
  }
});

// Obter um compromisso específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar compromisso:', error);
    res.status(500).json({ message: 'Erro ao buscar compromisso' });
  }
});

// Criar um novo compromisso
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start_time, 
      end_time, 
      process_id, 
      client_id 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!title || !start_time) {
      return res.status(400).json({ message: 'Título e data/hora de início são obrigatórios' });
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
    
    // Inserir novo compromisso
    const result = await db.query(
      'INSERT INTO appointments (title, description, start_time, end_time, process_id, client_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, start_time, end_time, process_id, client_id, req.userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar compromisso:', error);
    res.status(500).json({ message: 'Erro ao criar compromisso' });
  }
});

// Atualizar um compromisso
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      start_time, 
      end_time, 
      process_id, 
      client_id 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!title || !start_time) {
      return res.status(400).json({ message: 'Título e data/hora de início são obrigatórios' });
    }
    
    // Verificar se o compromisso existe
    const appointmentCheck = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado' });
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
    
    // Atualizar compromisso
    const result = await db.query(
      'UPDATE appointments SET title = $1, description = $2, start_time = $3, end_time = $4, process_id = $5, client_id = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [title, description, start_time, end_time, process_id, client_id, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar compromisso:', error);
    res.status(500).json({ message: 'Erro ao atualizar compromisso' });
  }
});

// Excluir um compromisso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o compromisso existe
    const appointmentCheck = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado' });
    }
    
    // Excluir compromisso
    await db.query('DELETE FROM appointments WHERE id = $1', [id]);
    
    res.json({ message: 'Compromisso excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir compromisso:', error);
    res.status(500).json({ message: 'Erro ao excluir compromisso' });
  }
});

module.exports = router;
