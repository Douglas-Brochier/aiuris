// Rotas de documentos

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../src/middleware/auth.middleware');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configurar o armazenamento de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Criar diretório de uploads se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome de arquivo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// Upload de documento
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    const { process_id, client_id } = req.body;
    
    // Validar dados obrigatórios
    if (!process_id && !client_id) {
      return res.status(400).json({ message: 'É necessário vincular o documento a um processo ou cliente' });
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
    
    // Inserir metadados do documento no banco
    const result = await db.query(
      'INSERT INTO documents (filename, filepath, original_filename, mime_type, size_bytes, process_id, client_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        req.file.filename,
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        process_id || null,
        client_id || null,
        req.userId
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao fazer upload de documento:', error);
    res.status(500).json({ message: 'Erro ao fazer upload de documento' });
  }
});

// Obter documentos por processo
router.get('/process/:processId', async (req, res) => {
  try {
    const { processId } = req.params;
    const result = await db.query('SELECT * FROM documents WHERE process_id = $1 ORDER BY upload_date DESC', [processId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar documentos do processo:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos do processo' });
  }
});

// Obter documentos por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await db.query('SELECT * FROM documents WHERE client_id = $1 ORDER BY upload_date DESC', [clientId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar documentos do cliente:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos do cliente' });
  }
});

// Obter metadados de um documento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ message: 'Erro ao buscar documento' });
  }
});

// Download de documento
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }
    
    const document = result.rows[0];
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(document.filepath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado no servidor' });
    }
    
    // Enviar o arquivo
    res.download(document.filepath, document.original_filename);
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    res.status(500).json({ message: 'Erro ao baixar documento' });
  }
});

// Excluir um documento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o documento existe
    const documentCheck = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (documentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }
    
    const document = documentCheck.rows[0];
    
    // Excluir o arquivo físico
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }
    
    // Excluir registro do banco
    await db.query('DELETE FROM documents WHERE id = $1', [id]);
    
    res.json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ message: 'Erro ao excluir documento' });
  }
});

module.exports = router;
