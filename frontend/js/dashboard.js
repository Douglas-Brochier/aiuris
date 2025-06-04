// Script para a página de dashboard

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    if (!verificarAutenticacao()) return;
    
    // Carregar contadores para os cards
    await carregarContadores();
    
    // Carregar tabelas de dados recentes
    await carregarCompromissosRecentes();
    await carregarTarefasRecentes();
    await carregarProcessosRecentes();
});

// Função para carregar os contadores dos cards
async function carregarContadores() {
    try {
        // Processos ativos
        const processos = await fetchAPI('/processes?status=ativo');
        if (processos) {
            document.getElementById('processos-count').textContent = processos.length || 0;
        }
        
        // Total de clientes
        const clientes = await fetchAPI('/clients');
        if (clientes) {
            document.getElementById('clientes-count').textContent = clientes.length || 0;
        }
        
        // Tarefas pendentes
        const tarefas = await fetchAPI('/tasks?status=pendente');
        if (tarefas) {
            document.getElementById('tarefas-count').textContent = tarefas.length || 0;
        }
        
        // Licitações ativas
        const licitacoes = await fetchAPI('/licitacoes?status=Em análise,Participando');
        if (licitacoes) {
            document.getElementById('licitacoes-count').textContent = licitacoes.length || 0;
        }
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
        mostrarAlerta('Erro ao carregar dados do dashboard', 'danger');
    }
}

// Função para carregar os próximos compromissos
async function carregarCompromissosRecentes() {
    try {
        const compromissos = await fetchAPI('/appointments?limit=5');
        const tabela = document.getElementById('proximos-compromissos').querySelector('tbody');
        
        if (!compromissos || compromissos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum compromisso agendado</td></tr>';
            return;
        }
        
        tabela.innerHTML = '';
        
        compromissos.forEach(compromisso => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatarData(compromisso.start_time)}</td>
                <td>${compromisso.title}</td>
                <td>${compromisso.process_id ? 'Processo' : (compromisso.client_id ? 'Cliente' : 'Geral')}</td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar compromissos:', error);
    }
}

// Função para carregar as tarefas recentes
async function carregarTarefasRecentes() {
    try {
        const tarefas = await fetchAPI('/tasks?limit=5');
        const tabela = document.getElementById('tarefas-recentes').querySelector('tbody');
        
        if (!tarefas || tarefas.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3" class="text-center">Nenhuma tarefa pendente</td></tr>';
            return;
        }
        
        tabela.innerHTML = '';
        
        tarefas.forEach(tarefa => {
            const row = document.createElement('tr');
            
            // Definir classe de status
            let statusClass = '';
            switch(tarefa.status) {
                case 'pendente':
                    statusClass = 'warning';
                    break;
                case 'concluida':
                    statusClass = 'success';
                    break;
                case 'em_andamento':
                    statusClass = 'info';
                    break;
                case 'cancelada':
                    statusClass = 'secondary';
                    break;
            }
            
            row.innerHTML = `
                <td>${formatarData(tarefa.due_date)}</td>
                <td>${tarefa.title}</td>
                <td><span class="badge bg-${statusClass}">${tarefa.status}</span></td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

// Função para carregar os processos recentes
async function carregarProcessosRecentes() {
    try {
        const processos = await fetchAPI('/processes?limit=5');
        const tabela = document.getElementById('processos-recentes').querySelector('tbody');
        
        if (!processos || processos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum processo cadastrado</td></tr>';
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
                <td>${processo.action_type || 'N/A'}</td>
                <td><span class="badge bg-${statusClass}">${processo.status}</span></td>
                <td>
                    <a href="processo_detalhe.html?id=${processo.id}" class="btn btn-sm btn-info">
                        <i class="fas fa-eye"></i>
                    </a>
                </td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar processos:', error);
    }
}
