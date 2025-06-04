// Arquivo principal do servidor Node.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o app Express
const app = express();

// Middleware para parsing de JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de CORS
app.use(cors());

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Importar rotas
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/user.routes');
const clientRoutes = require('../routes/client.routes');
const processRoutes = require('../routes/process.routes');
const appointmentRoutes = require('../routes/appointment.routes');
const taskRoutes = require('../routes/task.routes');
const documentRoutes = require('../routes/document.routes');
const licitacaoRoutes = require('../routes/licitacao.routes');

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/licitacoes', licitacaoRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/api/status', (req, res) => {
  res.json({ status: 'API está funcionando', timestamp: new Date() });
});

// Servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  });
}

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Definir porta
const PORT = process.env.PORT || 3000;

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
