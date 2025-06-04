// Script para a página de login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // Limpar token existente ao carregar a página de login
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Esconder mensagem de erro anterior
        errorMessage.classList.add('d-none');
        
        try {
            // Fazer requisição para a API de login
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Credenciais inválidas');
            }
            
            // Armazenar token e informações do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirecionar para o dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Erro no login:', error);
            errorMessage.textContent = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
            errorMessage.classList.remove('d-none');
        }
    });
});
