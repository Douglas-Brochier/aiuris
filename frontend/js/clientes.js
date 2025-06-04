// Script para a página de clientes

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    if (!verificarAutenticacao()) return;
    
    // Carregar lista de clientes
    await carregarClientes();
    
    // Configurar eventos dos formulários
    configurarEventos();
});

// Função para carregar a lista de clientes
async function carregarClientes() {
    try {
        const clientes = await fetchAPI('/clients');
        const tabela = document.getElementById('clientes-table').querySelector('tbody');
        
        if (!clientes || clientes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum cliente cadastrado</td></tr>';
            return;
        }
        
        tabela.innerHTML = '';
        
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.name}</td>
                <td>${cliente.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
                <td>${cliente.cpf_cnpj}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.phone || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info editar-cliente" data-id="${cliente.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger excluir-cliente" data-id="${cliente.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(row);
        });
        
        // Adicionar eventos aos botões de editar e excluir
        document.querySelectorAll('.editar-cliente').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                abrirModalEditarCliente(id);
            });
        });
        
        document.querySelectorAll('.excluir-cliente').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                confirmarExclusaoCliente(id);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        mostrarAlerta('Erro ao carregar lista de clientes', 'danger');
    }
}

// Configurar eventos dos formulários
function configurarEventos() {
    // Formulário de filtro
    const filtroForm = document.getElementById('filtro-clientes-form');
    filtroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Implementar filtro de clientes
        // Para o MVP, recarregar todos os clientes
        await carregarClientes();
    });
    
    // Botão de limpar filtro
    filtroForm.querySelector('button[type="reset"]').addEventListener('click', async function() {
        await carregarClientes();
    });
    
    // Botão de salvar novo cliente
    document.getElementById('salvar-cliente').addEventListener('click', salvarNovoCliente);
    
    // Botão de atualizar cliente
    document.getElementById('atualizar-cliente').addEventListener('click', atualizarCliente);
}

// Função para salvar novo cliente
async function salvarNovoCliente() {
    try {
        const nome = document.getElementById('cliente-nome').value;
        const tipo = document.getElementById('cliente-tipo').value;
        const cpfCnpj = document.getElementById('cliente-cpf-cnpj').value;
        const email = document.getElementById('cliente-email').value;
        const telefone = document.getElementById('cliente-telefone').value;
        const endereco = document.getElementById('cliente-endereco').value;
        
        // Validar campos obrigatórios
        if (!nome || !tipo || !cpfCnpj) {
            mostrarAlerta('Nome, tipo e CPF/CNPJ são obrigatórios', 'warning');
            return;
        }
        
        // Enviar dados para a API
        const response = await fetchAPI('/clients', 'POST', {
            name: nome,
            type: tipo,
            cpf_cnpj: cpfCnpj,
            email: email,
            phone: telefone,
            address: endereco
        });
        
        if (response) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novoClienteModal'));
            modal.hide();
            
            // Limpar formulário
            document.getElementById('novo-cliente-form').reset();
            
            // Recarregar lista de clientes
            await carregarClientes();
            
            mostrarAlerta('Cliente cadastrado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        mostrarAlerta('Erro ao cadastrar cliente', 'danger');
    }
}

// Função para abrir modal de edição de cliente
async function abrirModalEditarCliente(id) {
    try {
        const cliente = await fetchAPI(`/clients/${id}`);
        
        if (!cliente) {
            mostrarAlerta('Cliente não encontrado', 'warning');
            return;
        }
        
        // Preencher formulário com dados do cliente
        document.getElementById('editar-cliente-id').value = cliente.id;
        document.getElementById('editar-cliente-nome').value = cliente.name;
        document.getElementById('editar-cliente-tipo').value = cliente.type;
        document.getElementById('editar-cliente-cpf-cnpj').value = cliente.cpf_cnpj;
        document.getElementById('editar-cliente-email').value = cliente.email || '';
        document.getElementById('editar-cliente-telefone').value = cliente.phone || '';
        document.getElementById('editar-cliente-endereco').value = cliente.address || '';
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('editarClienteModal'));
        modal.show();
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        mostrarAlerta('Erro ao carregar dados do cliente', 'danger');
    }
}

// Função para atualizar cliente
async function atualizarCliente() {
    try {
        const id = document.getElementById('editar-cliente-id').value;
        const nome = document.getElementById('editar-cliente-nome').value;
        const tipo = document.getElementById('editar-cliente-tipo').value;
        const cpfCnpj = document.getElementById('editar-cliente-cpf-cnpj').value;
        const email = document.getElementById('editar-cliente-email').value;
        const telefone = document.getElementById('editar-cliente-telefone').value;
        const endereco = document.getElementById('editar-cliente-endereco').value;
        
        // Validar campos obrigatórios
        if (!nome || !tipo || !cpfCnpj) {
            mostrarAlerta('Nome, tipo e CPF/CNPJ são obrigatórios', 'warning');
            return;
        }
        
        // Enviar dados para a API
        const response = await fetchAPI(`/clients/${id}`, 'PUT', {
            name: nome,
            type: tipo,
            cpf_cnpj: cpfCnpj,
            email: email,
            phone: telefone,
            address: endereco
        });
        
        if (response) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarClienteModal'));
            modal.hide();
            
            // Recarregar lista de clientes
            await carregarClientes();
            
            mostrarAlerta('Cliente atualizado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        mostrarAlerta('Erro ao atualizar cliente', 'danger');
    }
}

// Função para confirmar exclusão de cliente
function confirmarExclusaoCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        excluirCliente(id);
    }
}

// Função para excluir cliente
async function excluirCliente(id) {
    try {
        const response = await fetchAPI(`/clients/${id}`, 'DELETE');
        
        if (response) {
            // Recarregar lista de clientes
            await carregarClientes();
            
            mostrarAlerta('Cliente excluído com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        mostrarAlerta('Erro ao excluir cliente. Verifique se não há processos vinculados.', 'danger');
    }
}
