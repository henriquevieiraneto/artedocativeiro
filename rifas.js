// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = "https://nuoyysipwgsdjiccleta.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9m31WHs2DToUQ93NIz-7ng_ZrecsVL-";

// Configurações do bloco
const inicioBloco = 301;
const fimBloco = 350;
const valorUnitario = 5.00;

// Tabela onde as vendas serão salvas no Supabase
const TABELA_VENDAS = "rifas";

const grid = document.getElementById('gridNumeros');
const totalizadorQtd = document.getElementById('qtdSelecionada');
const totalizadorValor = document.getElementById('valorTotal');
const nomeLote = document.getElementById('nomeLote');
const telefoneLote = document.getElementById('telefoneLote');
const enderecoLote = document.getElementById('enderecoLote');
const modal = document.getElementById('modalVenda');
const numeroDisplay = document.getElementById('numeroSelecionadoDisplay');
let numeroEditando = null;

// Carrega as vendas do Supabase (nuvem) ao abrir a página
let vendas = {};

async function carregarVendas() {
    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA_VENDAS}?select=*`);
        if (!resposta.ok) throw new Error("Erro ao carregar vendas");
        
        const dados = await resposta.json();
        
        // Converte a lista do banco para o formato usado pelo site
        vendas = {};
        dados.forEach(item => {
            vendas[item.numero] = {
                nome: item.nome,
                telefone: item.telefone,
                endereco: item.endereco
            };
        });

        renderizarNumeros();
    } catch (erro) {
        console.error("Erro ao carregar vendas:", erro);
        vendas = {};
        renderizarNumeros();
    }
}

// Função para salvar uma nova venda no Supabase
async function salvarVendaNoBanco(numero, nome, telefone, endereco) {
    const novaVenda = {
        numero: numero,
        nome: nome,
        telefone: telefone,
        endereco: endereco
    };

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA_VENDAS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(novaVenda)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao salvar venda no banco");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao salvar a venda. Tente novamente.");
    }
}

// Função para deletar uma venda do Supabase
async function deletarVendaDoBanco(numero) {
    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA_VENDAS}?numero=eq.${numero}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!resposta.ok) {
            throw new Error("Erro ao deletar venda do banco");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao excluir a venda.");
    }
}

// Função de renderização (mesma de antes, mas puxando do banco)
function renderizarNumeros() {
    grid.innerHTML = '';
    for (let i = inicioBloco; i <= fimBloco; i++) {
        const div = document.createElement('div');
        div.className = 'numero-item';
        const isVendido = !!vendas[i];
        if (isVendido) div.classList.add('vendido');

        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = i;
        checkbox.disabled = isVendido;
        checkbox.addEventListener('change', atualizarTotalizador);

        const span = document.createElement('span');
        span.className = 'numero-span';
        span.textContent = isVendido ? 'VENDIDO' : i;
        if (isVendido) {
            span.style.cursor = 'pointer';
            span.style.textDecoration = 'underline';
            span.onclick = function(e) {
                e.stopPropagation();
                abrirModalEditar(i);
            };
        }

        label.appendChild(checkbox);
        label.appendChild(span);
        div.appendChild(label);
        grid.appendChild(div);
    }
}

function atualizarTotalizador() {
    const checkboxes = document.querySelectorAll('.numero-item input[type="checkbox"]');
    let qtd = 0;
    checkboxes.forEach(cb => { if (cb.checked) qtd++; });
    totalizadorQtd.textContent = qtd;
    totalizadorValor.textContent = (qtd * valorUnitario).toFixed(2).replace('.', ',');
}

async function finalizarLote() {
    const checkboxes = document.querySelectorAll('.numero-item input[type="checkbox"]:checked');
    if (checkboxes.length === 0) return alert('Selecione pelo menos 1 número.');

    const nome = nomeLote.value.trim();
    const telefone = telefoneLote.value.trim();
    const endereco = enderecoLote.value.trim();
    if (!nome || !telefone || !endereco) return alert('Preencha todos os campos.');

    const totalPagar = checkboxes.length * valorUnitario;
    if (!confirm(`Confirma a venda de ${checkboxes.length} rifa(s) para ${nome}?\nTotal: R$ ${totalPagar.toFixed(2).replace('.', ',')}`)) return;

    // Salva cada número no Supabase
    for (const cb of checkboxes) {
        const numero = parseInt(cb.value);
        await salvarVendaNoBanco(numero, nome, telefone, endereco);
        vendas[numero] = { nome, telefone, endereco };
    }

    nomeLote.value = '';
    telefoneLote.value = '';
    enderecoLote.value = '';
    renderizarNumeros();
    atualizarTotalizador();
    alert('✅ Cadastro em lote finalizado!');
}

function abrirModalEditar(numero) {
    numeroEditando = numero;
    const dados = vendas[numero];
    numeroDisplay.textContent = numero;
    document.getElementById('nome').value = dados.nome;
    document.getElementById('telefone').value = dados.telefone;
    document.getElementById('endereco').value = dados.endereco;
    modal.style.display = 'flex';
}

function fecharModal() {
    modal.style.display = 'none';
    numeroEditando = null;
}

async function salvarVenda() {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    if (!nome || !telefone || !endereco) return alert('Preencha todos os campos!');

    // Atualiza no Supabase (deleta e recria)
    await deletarVendaDoBanco(numeroEditando);
    await salvarVendaNoBanco(numeroEditando, nome, telefone, endereco);

    vendas[numeroEditando] = { nome, telefone, endereco };
    renderizarNumeros();
    fecharModal();
    alert('✅ Atualizado!');
}

async function excluirVenda() {
    if (confirm(`Excluir venda do número ${numeroEditando}?`)) {
        await deletarVendaDoBanco(numeroEditando);
        delete vendas[numeroEditando];
        renderizarNumeros();
        fecharModal();
        alert('🗑️ Venda cancelada.');
    }
}

window.onclick = function(event) {
    if (event.target == modal) fecharModal();
};

// Carrega as vendas assim que a página abrir
carregarVendas();