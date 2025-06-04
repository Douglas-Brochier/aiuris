// Rotas de licitações

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Obter todas as licitações
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = 'SELECT * FROM licitacoes';
    const params = [];
    
    // Adicionar filtros se fornecidos
    if (status) {
      // Se status contém vírgulas, é uma lista de status
      if (status.includes(',')) {
        const statusList = status.split(',');
        query += ` WHERE status IN (${statusList.map((_, i) => `$${i + 1}`).join(',')})`;
        params.push(...statusList);
      } else {
        query += ' WHERE status = $1';
        params.push(status);
      }
    }
    
    // Ordenação
    query += ' ORDER BY deadline_date ASC';
    
    // Limite se fornecido
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar licitações:', error);
    res.status(500).json({ message: 'Erro ao buscar licitações' });
  }
});

// Obter uma licitação específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM licitacoes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Licitação não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar licitação:', error);
    res.status(500).json({ message: 'Erro ao buscar licitação' });
  }
});

// Criar uma nova licitação
router.post('/', async (req, res) => {
  try {
    const { 
      edital_number, 
      organ, 
      object, 
      publication_date, 
      deadline_date, 
      status, 
      description 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!organ || !object) {
      return res.status(400).json({ message: 'Órgão e objeto são obrigatórios' });
    }
    
    // Inserir nova licitação
    const result = await db.query(
      'INSERT INTO licitacoes (edital_number, organ, object, publication_date, deadline_date, status, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [edital_number, organ, object, publication_date, deadline_date, status || 'Em análise', description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar licitação:', error);
    res.status(500).json({ message: 'Erro ao criar licitação' });
  }
});

// Atualizar uma licitação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      edital_number, 
      organ, 
      object, 
      publication_date, 
      deadline_date, 
      status, 
      description 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!organ || !object) {
      return res.status(400).json({ message: 'Órgão e objeto são obrigatórios' });
    }
    
    // Verificar se a licitação existe
    const licitacaoCheck = await db.query('SELECT * FROM licitacoes WHERE id = $1', [id]);
    
    if (licitacaoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Licitação não encontrada' });
    }
    
    // Atualizar licitação
    const result = await db.query(
      'UPDATE licitacoes SET edital_number = $1, organ = $2, object = $3, publication_date = $4, deadline_date = $5, status = $6, description = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [edital_number, organ, object, publication_date, deadline_date, status, description, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar licitação:', error);
    res.status(500).json({ message: 'Erro ao atualizar licitação' });
  }
});

// Excluir uma licitação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a licitação existe
    const licitacaoCheck = await db.query('SELECT * FROM licitacoes WHERE id = $1', [id]);
    
    if (licitacaoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Licitação não encontrada' });
    }
    
    // Excluir licitação
    await db.query('DELETE FROM licitacoes WHERE id = $1', [id]);
    
    res.json({ message: 'Licitação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir licitação:', error);
    res.status(500).json({ message: 'Erro ao excluir licitação' });
  }
});

module.exports = router;
