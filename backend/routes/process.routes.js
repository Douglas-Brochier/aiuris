// Rotas de processos

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Obter todos os processos
router.get('/', async (req, res) => {
  try {
    const { status, client_id, limit } = req.query;
    let query = 'SELECT * FROM processes';
    const params = [];
    
    // Adicionar filtros se fornecidos
    if (status || client_id) {
      query += ' WHERE';
      
      if (status) {
        // Se status contém vírgulas, é uma lista de status
        if (status.includes(',')) {
          const statusList = status.split(',');
          query += ` status IN (${statusList.map((_, i) => `$${i + 1}`).join(',')})`;
          params.push(...statusList);
        } else {
          query += ' status = $1';
          params.push(status);
        }
      }
      
      if (client_id) {
        if (params.length > 0) query += ' AND';
        query += ` client_id = $${params.length + 1}`;
        params.push(client_id);
      }
    }
    
    // Ordenação
    query += ' ORDER BY created_at DESC';
    
    // Limite se fornecido
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    res.status(500).json({ message: 'Erro ao buscar processos' });
  }
});

// Obter um processo específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM processes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    res.status(500).json({ message: 'Erro ao buscar processo' });
  }
});

// Criar um novo processo
router.post('/', async (req, res) => {
  try {
    const { 
      process_number, 
      court, 
      district, 
      action_type, 
      status, 
      client_id, 
      description 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!process_number) {
      return res.status(400).json({ message: 'Número do processo é obrigatório' });
    }
    
    // Verificar se o número do processo já existe
    const processCheck = await db.query('SELECT * FROM processes WHERE process_number = $1', [process_number]);
    
    if (processCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Este número de processo já está cadastrado' });
    }
    
    // Verificar se o cliente existe, se fornecido
    if (client_id) {
      const clientCheck = await db.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      
      if (clientCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Cliente não encontrado' });
      }
    }
    
    // Inserir novo processo
    const result = await db.query(
      'INSERT INTO processes (process_number, court, district, action_type, status, client_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [process_number, court, district, action_type, status || 'ativo', client_id, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({ message: 'Erro ao criar processo' });
  }
});

// Atualizar um processo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      process_number, 
      court, 
      district, 
      action_type, 
      status, 
      client_id, 
      description 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!process_number) {
      return res.status(400).json({ message: 'Número do processo é obrigatório' });
    }
    
    // Verificar se o processo existe
    const processoCheck = await db.query('SELECT * FROM processes WHERE id = $1', [id]);
    
    if (processoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }
    
    // Verificar se o número do processo já está em uso por outro processo
    const processNumberCheck = await db.query('SELECT * FROM processes WHERE process_number = $1 AND id != $2', [process_number, id]);
    
    if (processNumberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Este número de processo já está em uso por outro processo' });
    }
    
    // Verificar se o cliente existe, se fornecido
    if (client_id) {
      const clientCheck = await db.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      
      if (clientCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Cliente não encontrado' });
      }
    }
    
    // Atualizar processo
    const result = await db.query(
      'UPDATE processes SET process_number = $1, court = $2, district = $3, action_type = $4, status = $5, client_id = $6, description = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [process_number, court, district, action_type, status, client_id, description, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ message: 'Erro ao atualizar processo' });
  }
});

// Excluir um processo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o processo existe
    const processoCheck = await db.query('SELECT * FROM processes WHERE id = $1', [id]);
    
    if (processoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }
    
    // Excluir processo
    await db.query('DELETE FROM processes WHERE id = $1', [id]);
    
    res.json({ message: 'Processo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir processo:', error);
    res.status(500).json({ message: 'Erro ao excluir processo' });
  }
});

module.exports = router;
