// Arquivo JavaScript principal para funcionalidades comuns

// Verificar se o usuário está autenticado
function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Configuração padrão para requisições AJAX
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Função para fazer requisições à API
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const baseURL = 'http://localhost:3000/api';
    const url = `${baseURL}${endpoint}`;
    
    const options = {
        method: method,
        headers: getHeaders()
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        
        // Se a resposta for 401 (não autorizado), redirecionar para login
        if (response.status === 401) {
            logout();
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarAlerta(error.message || 'Erro ao comunicar com o servidor', 'danger');
        return null;
    }
}

// Função para mostrar alertas na página
function mostrarAlerta(mensagem, tipo = 'success', timeout = 5000) {
    // Remover alertas existentes
    const alertasAntigos = document.querySelectorAll('.alert-flutuante');
    alertasAntigos.forEach(alerta => alerta.remove());
    
    // Criar novo alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-flutuante`;
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(alerta);
    
    // Remover após o timeout
    if (timeout > 0) {
        setTimeout(() => {
            alerta.remove();
        }, timeout);
    }
}

// Formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Inicializar eventos comuns quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação em todas as páginas exceto login
    if (!window.location.href.includes('login.html')) {
        verificarAutenticacao();
        
        // Configurar eventos de logout
        const logoutLinks = document.querySelectorAll('#logout-link, #logout-dropdown');
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        });
        
        // Exibir nome do usuário logado
        const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && usuarioInfo.name) {
            userDropdown.innerHTML = `<i class="fas fa-user-circle"></i> ${usuarioInfo.name}`;
        }
    }
    
    // Adicionar estilos para alertas flutuantes
    const style = document.createElement('style');
    style.textContent = `
        .alert-flutuante {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
});
