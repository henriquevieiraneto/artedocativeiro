const inicioBloco = 301, fimBloco = 350, valorUnitario = 5.00;
let vendas = JSON.parse(localStorage.getItem('rifaVendas')) || {};

const grid = document.getElementById('gridNumeros');
const totalizadorQtd = document.getElementById('qtdSelecionada');
const totalizadorValor = document.getElementById('valorTotal');
const nomeLote = document.getElementById('nomeLote');
const telefoneLote = document.getElementById('telefoneLote');
const enderecoLote = document.getElementById('enderecoLote');
const modal = document.getElementById('modalVenda');
const numeroDisplay = document.getElementById('numeroSelecionadoDisplay');
let numeroEditando = null;

function renderizarNumeros() {
    grid.innerHTML = '';
    for (let i = inicioBloco; i <= fimBloco; i++) {
        const div = document.createElement('div');
        div.className = 'numero-item';
        const isVendido = !!vendas[i];
        if (isVendido) div.classList.add('vendido');

        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.value = i;
        checkbox.disabled = isVendido;
        checkbox.addEventListener('change', atualizarTotalizador);

        const span = document.createElement('span');
        span.className = 'numero-span';
        span.textContent = isVendido ? 'VENDIDO' : i;
        if (isVendido) {
            span.style.cursor = 'pointer'; span.style.textDecoration = 'underline';
            span.onclick = function(e) { e.stopPropagation(); abrirModalEditar(i); };
        }

        label.appendChild(checkbox); label.appendChild(span);
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

function finalizarLote() {
    const checkboxes = document.querySelectorAll('.numero-item input[type="checkbox"]:checked');
    if (checkboxes.length === 0) return alert('Selecione pelo menos 1 número.');
    const nome = nomeLote.value.trim(), telefone = telefoneLote.value.trim(), endereco = enderecoLote.value.trim();
    if (!nome || !telefone || !endereco) return alert('Preencha todos os campos.');
    const totalPagar = checkboxes.length * valorUnitario;
    if (!confirm(`Confirma a venda de ${checkboxes.length} rifa(s) para ${nome}?\nTotal: R$ ${totalPagar.toFixed(2).replace('.', ',')}`)) return;

    checkboxes.forEach(cb => { vendas[parseInt(cb.value)] = { nome, telefone, endereco }; });
    localStorage.setItem('rifaVendas', JSON.stringify(vendas));
    nomeLote.value = ''; telefoneLote.value = ''; enderecoLote.value = '';
    renderizarNumeros(); atualizarTotalizador();
    alert('✅ Cadastro em lote finalizado!');
}

function abrirModalEditar(numero) {
    numeroEditando = numero; const dados = vendas[numero];
    numeroDisplay.textContent = numero;
    document.getElementById('nome').value = dados.nome;
    document.getElementById('telefone').value = dados.telefone;
    document.getElementById('endereco').value = dados.endereco;
    modal.style.display = 'flex';
}

function fecharModal() { modal.style.display = 'none'; numeroEditando = null; }

function salvarVenda() {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    if (!nome || !telefone || !endereco) return alert('Preencha todos os campos!');
    vendas[numeroEditando] = { nome, telefone, endereco };
    localStorage.setItem('rifaVendas', JSON.stringify(vendas));
    renderizarNumeros(); fecharModal(); alert('✅ Atualizado!');
}

function excluirVenda() {
    if (confirm(`Excluir venda do número ${numeroEditando}?`)) {
        delete vendas[numeroEditando];
        localStorage.setItem('rifaVendas', JSON.stringify(vendas));
        renderizarNumeros(); fecharModal(); alert('🗑️ Venda cancelada.');
    }
}

window.onclick = function(event) { if (event.target == modal) fecharModal(); };
renderizarNumeros();