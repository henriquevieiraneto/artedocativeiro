// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = "https://nuoyysipwgsdjiccleta.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9m31WHs2DToUQ93NIz-7ng_ZrecsVL-";

const lista = document.getElementById('listaArquivos');
const formUpload = document.getElementById('formUpload');
const inputFile = document.getElementById('inputFile');
const nomeArquivoInput = document.getElementById('nomeArquivo');
const nomeEscolhido = document.getElementById('nomeArquivoEscolhido');

// Função para buscar, tocar e baixar as músicas
async function carregarArquivos() {
    lista.innerHTML = '<p style="color: #aaa; text-align: center;">Carregando biblioteca...</p>';
    try {
        const resposta = await fetch(`${SUPABASE_URL}/storage/v1/object/public/biblioteca`);
        const arquivos = await resposta.json();
        lista.innerHTML = '';
        if (!arquivos || arquivos.length === 0) {
            lista.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhum arquivo enviado ainda.</p>';
            return;
        }
        arquivos.reverse(); // Novo primeiro
        
        arquivos.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card-arquivo';
            const urlArquivo = `${SUPABASE_URL}/storage/v1/object/public/biblioteca/${item.name}`;

            // Se for MP3, cria player de áudio
            let player = '';
            if (item.name.toLowerCase().endsWith('.mp3') || item.name.toLowerCase().endsWith('.wav')) {
                player = `
                    <audio class="player-audio" controls>
                        <source src="${urlArquivo}" type="audio/mpeg">
                        Seu navegador não suporta áudio.
                    </audio>
                `;
            }

            card.innerHTML = `
                <h4>🎵 ${item.name}</h4>
                ${player}
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <a href="${urlArquivo}" target="_blank" style="color: #4caf50; text-decoration: underline;">⬇️ Baixar</a>
                    <button onclick="excluirArquivo('${item.name}')" style="background: #f44336; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">🗑️ Excluir</button>
                </div>
            `;
            lista.appendChild(card);
        });
    } catch (erro) {
        lista.innerHTML = '<p style="color: #ffa500; text-align: center;">Erro ao carregar. Verifique o bucket.</p>';
    }
}

// Função de Upload
formUpload.addEventListener('submit', async function(e) {
    e.preventDefault();
    const file = inputFile.files[0];
    if (!file) return alert('Selecione um arquivo!');

    const nomeArquivo = file.name;
    try {
        const resposta = await fetch(`${SUPABASE_URL}/storage/v1/object/biblioteca/${nomeArquivo}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
            body: file
        });
        if (!resposta.ok) throw new Error('Erro no upload');
        alert('✅ Upload feito com sucesso!');
        formUpload.reset();
        nomeEscolhido.textContent = '';
        carregarArquivos();
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
});

// Função de Excluir
async function excluirArquivo(nome) {
    if (!confirm(`Excluir o arquivo "${nome}"?`)) return;
    try {
        const resposta = await fetch(`${SUPABASE_URL}/storage/v1/object/biblioteca/${nome}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!resposta.ok) throw new Error('Erro ao excluir');
        alert('🗑️ Arquivo excluído!');
        carregarArquivos();
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
}

inputFile.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        nomeEscolhido.textContent = `Arquivo selecionado: ${this.files[0].name}`;
    }
});

carregarArquivos();