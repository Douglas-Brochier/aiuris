// Script para a página de processos

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    if (!verificarAutenticacao()) return;
    
    // Carregar lista de processos
    await carregarProcessos();
    
    // Carregar lista de clientes para os selects
    await carregarClientesSelect();
    
    // Configurar eventos dos formulários
    configurarEventos();
});

// Função para carregar a lista de processos
async function carregarProcessos() {
    try {
        const processos = await fetchAPI('/processes');
        const tabela = document.getElementById('processos-table').querySelector('tbody');
        
        if (!processos || processos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum processo cadastrado</td></tr>';
            return;
        }
        
        tabela.innerHTML = '';
        
        // Carregar clientes para exibir nomes
        const clientes = await fetchAPI('/clients');
        const clientesMap = {};
        
        if (clientes) {
            clientes.forEach(cliente => {
                clientesMap[cliente.id] = cliente.name;
            });
        }
        
        processos.forEach(processo => {
            const row = document.createElement('tr');
            
            // Definir classe de status
            let statusClass = '';
            switch(processo.status) {
                case 'ativo':
                    statusClass = 'success';
                    break;
                case 'arquivado':
                    statusClass = 'secondary';
                    break;
                case 'suspenso':
                    statusClass = 'warning';
                    break;
                case 'finalizado':
                    statusClass = 'info';
                    break;
            }
            
            row.innerHTML = `
                <td>${processo.process_number}</td>
                <td>${processo.client_id ? clientesMap[processo.client_id] || 'Cliente não encontrado' : 'N/A'}</td>
                <td>${processo.action_type || '-'}</td>
                <td>${processo.district || '-'}</td>
                <td><span class="badge bg-${statusClass}">${processo.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info editar-processo" data-id="${processo.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger excluir-processo" data-id="${processo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(row);
        });
        
        // Adicionar eventos aos botões de editar e excluir
        document.querySelectorAll('.editar-processo').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                abrirModalEditarProcesso(id);
            });
        });
        
        document.querySelectorAll('.excluir-processo').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                confirmarExclusaoProcesso(id);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar processos:', error);
        mostrarAlerta('Erro ao carregar lista de processos', 'danger');
    }
}

// Função para carregar clientes nos selects
async function carregarClientesSelect() {
    try {
        const clientes = await fetchAPI('/clients');
        
        if (!clientes) return;
        
        const selectNovo = document.getElementById('processo-cliente');
        const selectEditar = document.getElementById('editar-processo-cliente');
        const selectFiltro = document.getElementById('filtro-cliente');
        
        // Limpar opções existentes (exceto a primeira)
        selectNovo.innerHTML = '<option value="">Selecione um cliente</option>';
        selectEditar.innerHTML = '<option value="">Selecione um cliente</option>';
        selectFiltro.innerHTML = '<option value="">Todos</option>';
        
        // Adicionar opções de clientes
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.name} (${cliente.type === 'PF' ? 'CPF' : 'CNPJ'}: ${cliente.cpf_cnpj})`;
            
            selectNovo.appendChild(option.cloneNode(true));
            selectEditar.appendChild(option.cloneNode(true));
            selectFiltro.appendChild(option.cloneNode(true));
        });
    } catch (error) {
        console.error('Erro ao carregar clientes para select:', error);
    }
}

// Configurar eventos dos formulários
function configurarEventos() {
    // Formulário de filtro
    const filtroForm = document.getElementById('filtro-processos-form');
    filtroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Implementar filtro de processos
        // Para o MVP, recarregar todos os processos
        await carregarProcessos();
    });
    
    // Botão de limpar filtro
    filtroForm.querySelector('button[type="reset"]').addEventListener('click', async function() {
        await carregarProcessos();
    });
    
    // Botão de salvar novo processo
    document.getElementById('salvar-processo').addEventListener('click', salvarNovoProcesso);
    
    // Botão de atualizar processo
    document.getElementById('atualizar-processo').addEventListener('click', atualizarProcesso);
}

// Função para salvar novo processo
async function salvarNovoProcesso() {
    try {
        const numero = document.getElementById('processo-numero').value;
        const clienteId = document.getElementById('processo-cliente').value;
        const tipo = document.getElementById('processo-tipo').value;
        const comarca = document.getElementById('processo-comarca').value;
        const vara = document.getElementById('processo-vara').value;
        const descricao = document.getElementById('processo-descricao').value;
        const status = document.getElementById('processo-status').value;
        
        // Validar campos obrigatórios
        if (!numero) {
            mostrarAlerta('Número do processo é obrigatório', 'warning');
            return;
        }
        
        // Enviar dados para a API
        const response = await fetchAPI('/processes', 'POST', {
            process_number: numero,
            client_id: clienteId || null,
            action_type: tipo,
            district: comarca,
            court: vara,
            description: descricao,
            status: status
        });
        
        if (response) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novoProcessoModal'));
            modal.hide();
            
            // Limpar formulário
            document.getElementById('novo-processo-form').reset();
            
            // Recarregar lista de processos
            await carregarProcessos();
            
            mostrarAlerta('Processo cadastrado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao salvar processo:', error);
        mostrarAlerta('Erro ao cadastrar processo', 'danger');
    }
}

// Função para abrir modal de edição de processo
async function abrirModalEditarProcesso(id) {
    try {
        const processo = await fetchAPI(`/processes/${id}`);
        
        if (!processo) {
            mostrarAlerta('Processo não encontrado', 'warning');
            return;
        }
        
        // Preencher formulário com dados do processo
        document.getElementById('editar-processo-id').value = processo.id;
        document.getElementById('editar-processo-numero').value = processo.process_number;
        document.getElementById('editar-processo-cliente').value = processo.client_id || '';
        document.getElementById('editar-processo-tipo').value = processo.action_type || '';
        document.getElementById('editar-processo-comarca').value = processo.district || '';
        document.getElementById('editar-processo-vara').value = processo.court || '';
        document.getElementById('editar-processo-descricao').value = processo.description || '';
        document.getElementById('editar-processo-status').value = processo.status;
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('editarProcessoModal'));
        modal.show();
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        mostrarAlerta('Erro ao carregar dados do processo', 'danger');
    }
}

// Função para atualizar processo
async function atualizarProcesso() {
    try {
        const id = document.getElementById('editar-processo-id').value;
        const numero = document.getElementById('editar-processo-numero').value;
        const clienteId = document.getElementById('editar-processo-cliente').value;
        const tipo = document.getElementById('editar-processo-tipo').value;
        const comarca = document.getElementById('editar-processo-comarca').value;
        const vara = document.getElementById('editar-processo-vara').value;
        const descricao = document.getElementById('editar-processo-descricao').value;
        const status = document.getElementById('editar-processo-status').value;
        
        // Validar campos obrigatórios
        if (!numero) {
            mostrarAlerta('Número do processo é obrigatório', 'warning');
            return;
        }
        
        // Enviar dados para a API
        const response = await fetchAPI(`/processes/${id}`, 'PUT', {
            process_number: numero,
            client_id: clienteId || null,
            action_type: tipo,
            district: comarca,
            court: vara,
            description: descricao,
            status: status
        });
        
        if (response) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarProcessoModal'));
            modal.hide();
            
            // Recarregar lista de processos
            await carregarProcessos();
            
            mostrarAlerta('Processo atualizado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao atualizar processo:', error);
        mostrarAlerta('Erro ao atualizar processo', 'danger');
    }
}

// Função para confirmar exclusão de processo
function confirmarExclusaoProcesso(id) {
    if (confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
        excluirProcesso(id);
    }
}

// Função para excluir processo
async function excluirProcesso(id) {
    try {
        const response = await fetchAPI(`/processes/${id}`, 'DELETE');
        
        if (response) {
            // Recarregar lista de processos
            await carregarProcessos();
            
            mostrarAlerta('Processo excluído com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao excluir processo:', error);
        mostrarAlerta('Erro ao excluir processo', 'danger');
    }
}
