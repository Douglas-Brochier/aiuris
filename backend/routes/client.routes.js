// Rotas de clientes

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Obter todos os clientes
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
});

// Obter um cliente específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro ao buscar cliente' });
  }
});

// Criar um novo cliente
router.post('/', async (req, res) => {
  try {
    const { name, type, cpf_cnpj, email, phone, address } = req.body;
    
    // Validar dados obrigatórios
    if (!name || !type || !cpf_cnpj) {
      return res.status(400).json({ message: 'Nome, tipo e CPF/CNPJ são obrigatórios' });
    }
    
    // Verificar se CPF/CNPJ já existe
    const cpfCnpjCheck = await db.query('SELECT * FROM clients WHERE cpf_cnpj = $1', [cpf_cnpj]);
    
    if (cpfCnpjCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Este CPF/CNPJ já está cadastrado' });
    }
    
    // Inserir novo cliente
    const result = await db.query(
      'INSERT INTO clients (name, type, cpf_cnpj, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, type, cpf_cnpj, email, phone, address]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
});

// Atualizar um cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, cpf_cnpj, email, phone, address } = req.body;
    
    // Validar dados obrigatórios
    if (!name || !type || !cpf_cnpj) {
      return res.status(400).json({ message: 'Nome, tipo e CPF/CNPJ são obrigatórios' });
    }
    
    // Verificar se o cliente existe
    const clienteCheck = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (clienteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Verificar se o CPF/CNPJ já está em uso por outro cliente
    const cpfCnpjCheck = await db.query('SELECT * FROM clients WHERE cpf_cnpj = $1 AND id != $2', [cpf_cnpj, id]);
    
    if (cpfCnpjCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Este CPF/CNPJ já está em uso por outro cliente' });
    }
    
    // Atualizar cliente
    const result = await db.query(
      'UPDATE clients SET name = $1, type = $2, cpf_cnpj = $3, email = $4, phone = $5, address = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, type, cpf_cnpj, email, phone, address, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
});

// Excluir um cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o cliente existe
    const clienteCheck = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (clienteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Verificar se o cliente possui processos vinculados
    const processosCheck = await db.query('SELECT * FROM processes WHERE client_id = $1', [id]);
    
    if (processosCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Este cliente possui processos vinculados e não pode ser excluído',
        processos: processosCheck.rows.length
      });
    }
    
    // Excluir cliente
    await db.query('DELETE FROM clients WHERE id = $1', [id]);
    
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ message: 'Erro ao excluir cliente' });
  }
});

module.exports = router;
