// Script para testar a autenticação e conexão com o backend

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Iniciando testes de autenticação e conexão...');
    
    // Testar conexão com o backend
    try {
        const response = await fetch('http://localhost:3000/api/status');
        const data = await response.json();
        console.log('Status da API:', data);
        document.getElementById('api-status').textContent = 'Conectado';
        document.getElementById('api-status').classList.add('text-success');
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        document.getElementById('api-status').textContent = 'Desconectado';
        document.getElementById('api-status').classList.add('text-danger');
    }
    
    // Testar autenticação
    const testAuth = document.getElementById('test-auth');
    testAuth.addEventListener('click', async function() {
        const email = document.getElementById('test-email').value;
        const password = document.getElementById('test-password').value;
        
        if (!email || !password) {
            alert('Preencha email e senha para testar');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('auth-result').textContent = 'Autenticação bem-sucedida';
                document.getElementById('auth-result').classList.remove('text-danger');
                document.getElementById('auth-result').classList.add('text-success');
                document.getElementById('token-display').textContent = data.token;
            } else {
                document.getElementById('auth-result').textContent = 'Falha na autenticação: ' + data.message;
                document.getElementById('auth-result').classList.remove('text-success');
                document.getElementById('auth-result').classList.add('text-danger');
                document.getElementById('token-display').textContent = '';
            }
        } catch (error) {
            console.error('Erro ao testar autenticação:', error);
            document.getElementById('auth-result').textContent = 'Erro ao conectar: ' + error.message;
            document.getElementById('auth-result').classList.remove('text-success');
            document.getElementById('auth-result').classList.add('text-danger');
            document.getElementById('token-display').textContent = '';
        }
    });
    
    // Testar CRUD de clientes
    const testClientes = document.getElementById('test-clientes');
    testClientes.addEventListener('click', async function() {
        const token = document.getElementById('token-display').textContent;
        
        if (!token) {
            alert('Faça login primeiro para obter um token');
            return;
        }
        
        try {
            // Testar listagem de clientes
            const response = await fetch('http://localhost:3000/api/clients', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('clientes-result').textContent = 'CRUD de clientes funcionando';
                document.getElementById('clientes-result').classList.remove('text-danger');
                document.getElementById('clientes-result').classList.add('text-success');
                document.getElementById('clientes-count').textContent = data.length || 0;
            } else {
                document.getElementById('clientes-result').textContent = 'Falha no CRUD de clientes: ' + data.message;
                document.getElementById('clientes-result').classList.remove('text-success');
                document.getElementById('clientes-result').classList.add('text-danger');
                document.getElementById('clientes-count').textContent = '0';
            }
        } catch (error) {
            console.error('Erro ao testar CRUD de clientes:', error);
            document.getElementById('clientes-result').textContent = 'Erro ao conectar: ' + error.message;
            document.getElementById('clientes-result').classList.remove('text-success');
            document.getElementById('clientes-result').classList.add('text-danger');
            document.getElementById('clientes-count').textContent = '0';
        }
    });
    
    // Testar CRUD de processos
    const testProcessos = document.getElementById('test-processos');
    testProcessos.addEventListener('click', async function() {
        const token = document.getElementById('token-display').textContent;
        
        if (!token) {
            alert('Faça login primeiro para obter um token');
            return;
        }
        
        try {
            // Testar listagem de processos
            const response = await fetch('http://localhost:3000/api/processes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('processos-result').textContent = 'CRUD de processos funcionando';
                document.getElementById('processos-result').classList.remove('text-danger');
                document.getElementById('processos-result').classList.add('text-success');
                document.getElementById('processos-count').textContent = data.length || 0;
            } else {
                document.getElementById('processos-result').textContent = 'Falha no CRUD de processos: ' + data.message;
                document.getElementById('processos-result').classList.remove('text-success');
                document.getElementById('processos-result').classList.add('text-danger');
                document.getElementById('processos-count').textContent = '0';
            }
        } catch (error) {
            console.error('Erro ao testar CRUD de processos:', error);
            document.getElementById('processos-result').textContent = 'Erro ao conectar: ' + error.message;
            document.getElementById('processos-result').classList.remove('text-success');
            document.getElementById('processos-result').classList.add('text-danger');
            document.getElementById('processos-count').textContent = '0';
        }
    });
    
    // Testar CRUD de licitações
    const testLicitacoes = document.getElementById('test-licitacoes');
    testLicitacoes.addEventListener('click', async function() {
        const token = document.getElementById('token-display').textContent;
        
        if (!token) {
            alert('Faça login primeiro para obter um token');
            return;
        }
        
        try {
            // Testar listagem de licitações
            const response = await fetch('http://localhost:3000/api/licitacoes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('licitacoes-result').textContent = 'CRUD de licitações funcionando';
                document.getElementById('licitacoes-result').classList.remove('text-danger');
                document.getElementById('licitacoes-result').classList.add('text-success');
                document.getElementById('licitacoes-count').textContent = data.length || 0;
            } else {
                document.getElementById('licitacoes-result').textContent = 'Falha no CRUD de licitações: ' + data.message;
                document.getElementById('licitacoes-result').classList.remove('text-success');
                document.getElementById('licitacoes-result').classList.add('text-danger');
                document.getElementById('licitacoes-count').textContent = '0';
            }
        } catch (error) {
            console.error('Erro ao testar CRUD de licitações:', error);
            document.getElementById('licitacoes-result').textContent = 'Erro ao conectar: ' + error.message;
            document.getElementById('licitacoes-result').classList.remove('text-success');
            document.getElementById('licitacoes-result').classList.add('text-danger');
            document.getElementById('licitacoes-count').textContent = '0';
        }
    });
});
