// Script para a página de licitações

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    if (!verificarAutenticacao()) return;
    
    // Carregar lista de licitações
    await carregarLicitacoes();
    
    // Configurar eventos dos formulários
    configurarEventos();
});

// Função para carregar a lista de licitações
async function carregarLicitacoes() {
    try {
        const licitacoes = await fetchAPI('/licitacoes');
        const tabela = document.getElementById('licitacoes-table').querySelector('tbody');
        
        if (!licitacoes || licitacoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma licitação cadastrada</td></tr>';
            return;
        }
        
        tabela.innerHTML = '';
        
        licitacoes.forEach(licitacao => {
            const row = document.createElement('tr');
            
            // Definir classe de status
            let statusClass = '';
            switch(licitacao.status) {
                case 'Em análise':
                    statusClass = 'info';
                    break;
                case 'Participando':
                    statusClass = 'primary';
                    break;
                case 'Ganha':
                    statusClass = 'success';
                    break;
                case 'Perdida':
                    statusClass = 'danger';
                    break;
                case 'Não participou':
                    statusClass = 'secondary';
                    break;
                case 'Cancelada':
                    statusClass = 'dark';
                    break;
            }
            
            row.innerHTML = `
                <td>${licitacao.edital_number || '-'}</td>
                <td>${licitacao.organ}</td>
                <td>${formatarData(licitacao.publication_date) || '-'}</td>
                <td>${formatarData(licitacao.deadline_date) || '-'}</td>
                <td><span class="badge bg-${statusClass}">${licitacao.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info editar-licitacao" data-id="${licitacao.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger excluir-licitacao" data-id="${licitacao.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(row);
        });
        
        // Adicionar eventos aos botões de editar e excluir
        document.querySelectorAll('.editar-licitacao').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                abrirModalEditarLicitacao(id);
            });
        });
        
        document.querySelectorAll('.excluir-licitacao').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                confirmarExclusaoLicitacao(id);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar licitações:', error);
        mostrarAlerta('Erro ao carregar lista de licitações', 'danger');
    }
}

// Configurar eventos dos formulários
function configurarEventos() {
    // Formulário de filtro
    const filtroForm = document.getElementById('filtro-licitacoes-form');
    filtroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Implementar filtro de licitações
        // Para o MVP, recarregar todas as licitações
        await carregarLicitacoes();
    });
    
    // Botão de limpar filtro
    filtroForm.querySelector('button[type="reset"]').addEventListener('click', async function() {
        await carregarLicitacoes();
    });
    
    // Botão de salvar nova licitação
    document.getElementById('salvar-licitacao').addEventListener('click', salvarNovaLicitacao);
    
    // Botão de atualizar licitação
    document.getElementById('atualizar-licitacao').addEventListener('click', atualizarLicitacao);
}

// Função para salvar nova licitação
async function salvarNovaLicitacao() {
    try {
        const edital = document.getElementById('licitacao-edital').value;
        const orgao = document.getElementById('licitacao-orgao').value;
        const objeto = document.getElementById('licitacao-objeto').value;
        const publicacao = document.getElementById('licitacao-publicacao').value;
        const prazo = document.getElementById('licitacao-prazo').value;
        const status = document.getElementById('licitacao-status').value;
        const descricao = document.getElementById('licitacao-descricao').value;
        
        // Validar campos obrigatórios
        if (!orgao || !objeto) {
            mostrarAlerta('Órgão e objeto são obrigatórios', 'warning');
            return;
        }
        
        // Enviar dados para a API
        const response = await fetchAPI('/licitacoes', 'POST', {
            edital_number: edital,
            organ: orgao,
            object: objeto,
            publication_date: publicacao || null,
            deadline_date: prazo || null,
            status: status,
            description: descricao
        });
        
        if (response) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novaLicitacaoModal'));
            modal.hide();
            
            // Limpar formulário
            document.getElementById('nova-licitacao-form').reset();
            
            // Recarregar lista de licitações
            await carregarLicitacoes();
            
            mostrarAlerta('Licitação cadastrada com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao salvar licitação:', error);
        mostrarAlerta('Erro ao cadastrar licitação', 'danger');
    }
}

// Função para abrir modal de edição de licitação
async function abrirModalEditarLicitacao(id) {
    try {
        const licitacao = await fetchAPI(`/licitacoes/${id}`);
        
        if (!licitacao) {
            mostrarAlerta('Licitação não encontrada', 'warning');
            return;
        }
        
        // Preencher formulário com dados da licitação
        document.getElementById('editar-licitacao-id').value = licitacao.id;
        document.getElementById('editar-licitacao-edital').value = licitacao.edital_number || '';
        document.getElementById('editar-licitacao-orgao').value = licitacao.organ;
        document.getElementById('editar-licitacao-objeto').value = licitacao.object;
        
        // Formatar datas para o formato esperado pelo input type="date"
        if (licitacao.publication_date) {
            const pubDate = new Date(licitacao.publication_date);
            document.getElementById('editar-licitacao-publicacao').value = pubDate.toISOString().split('T')[0];
        } else {
            document.getElementById('editar-licitacao-publicacao').value = '';
        }
        
        if (licitacao.deadline_date) {
            const deadlineDate = new Date(licitacao.deadline_date);
            document.getElementById('editar-licitacao-prazo').value = deadlineDate.toISOString().split('T')[0];
        } else {
            document.getElementById('editar-licitacao-prazo').value = '';
        }
        
        document.getElementById('editar-licitacao-status').value = licitacao.status;
        document.getElementById('editar-licitacao-descricao').value = licitacao.description || '';
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('editarLicitacaoModal'));
        modal.show();
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        mostrarAlerta('Erro ao carregar dados da licitação', 'danger');
    }
}

// Função para atualizar licitação
async function atualizarLicitacao() {
    try {
        const id = document.getElementById('editar-licitacao-id').value;
        const edital = document.getElementById('editar-licitacao-edital').value;
        const orgao = document.getElementById('editar-licitacao-orgao').value;
        const objeto = document.getElementById('editar-licitacao-objeto').value;
        const publicacao = document.getElementById('editar-licitacao-publicacao').value;
        const prazo = document.getElementById('editar-licitacao-prazo').value;
        const status = document.getElementById('editar-licitacao-status').value;
        const descricao = document.getElementById('editar-licitacao-descricao').value;
        
        // Validar campos obrigatórios
        if (!orgao || !objeto) {
            mostrarAlerta('Órgão e objeto são obrigatórios', 'warning');
            return;
        }
        
        // Enviar dados para a API
        const response = await fetchAPI(`/licitacoes/${id}`, 'PUT', {
            edital_number: edital,
            organ: orgao,
            object: objeto,
            publication_date: publicacao || null,
            deadline_date: prazo || null,
            status: status,
            description: descricao
        });
        
        if (response) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarLicitacaoModal'));
            modal.hide();
            
            // Recarregar lista de licitações
            await carregarLicitacoes();
            
            mostrarAlerta('Licitação atualizada com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao atualizar licitação:', error);
        mostrarAlerta('Erro ao atualizar licitação', 'danger');
    }
}

// Função para confirmar exclusão de licitação
function confirmarExclusaoLicitacao(id) {
    if (confirm('Tem certeza que deseja excluir esta licitação? Esta ação não pode ser desfeita.')) {
        excluirLicitacao(id);
    }
}

// Função para excluir licitação
async function excluirLicitacao(id) {
    try {
        const response = await fetchAPI(`/licitacoes/${id}`, 'DELETE');
        
        if (response) {
            // Recarregar lista de licitações
            await carregarLicitacoes();
            
            mostrarAlerta('Licitação excluída com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao excluir licitação:', error);
        mostrarAlerta('Erro ao excluir licitação', 'danger');
    }
}
