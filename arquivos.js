// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = "https://nuoyysipwgsdjiccleta.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9m31WHs2DToUQ93NIz-7ng_ZrecsVL-";

const lista = document.getElementById('listaArquivos');
const formUpload = document.getElementById('formUpload');
const inputFile = document.getElementById('inputFile');
const nomeArquivoInput = document.getElementById('nomeArquivo');
const nomeEscolhido = document.getElementById('nomeArquivoEscolhido');

// Função para buscar e mostrar as músicas já enviadas
async function carregarMusicas() {
    lista.innerHTML = '<p style="color: #aaa; text-align: center;">Carregando músicas...</p>';
    
    try {
        const resposta = await fetch(`${SUPABASE_URL}/storage/v1/object/public/musicas`);
        const arquivos = await resposta.json();
        
        lista.innerHTML = '';
        if (!arquivos || arquivos.length === 0) {
            lista.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhuma música enviada ainda.</p>';
            return;
        }

        // Ordena do mais novo para o mais antigo
        arquivos.reverse();

        arquivos.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card-arquivo';
            
            const urlArquivo = `${SUPABASE_URL}/storage/v1/object/public/musicas/${item.name}`;

            card.innerHTML = `
                <h4>🎵 ${item.name}</h4>
                <audio class="player-audio" controls>
                    <source src="${urlArquivo}" type="audio/mpeg">
                    Seu navegador não suporta áudio.
                </audio>
                <div style="margin-top: 10px;">
                    <a href="${urlArquivo}" target="_blank" style="color: #4caf50; text-decoration: underline;">⬇️ Baixar Música</a>
                </div>
            `;
            lista.appendChild(card);
        });
    } catch (erro) {
        lista.innerHTML = '<p style="color: #ffa500; text-align: center;">Nenhuma música encontrada. Envie a primeira!</p>';
    }
}

// TRUQUE DO PROXY: Isso ignora o bloqueio do Supabase
const PROXY_URL = "https://corsproxy.io/?";

// Função de Upload Direto pelo site
formUpload.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const file = inputFile.files[0];
    if (!file) return alert('Por favor, selecione um arquivo!');

    const nomeArquivo = file.name; 

    try {
        // Envia o arquivo usando o proxy para furar o bloqueio
        const resposta = await fetch(`${PROXY_URL}${SUPABASE_URL}/storage/v1/object/musicas/${nomeArquivo}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type 
            },
            body: file
        });

        if (!resposta.ok) {
            throw new Error('Erro ao enviar o arquivo');
        }

        alert('✅ Upload feito com sucesso!');
        formUpload.reset();
        nomeEscolhido.textContent = '';
        carregarMusicas(); // Recarrega a lista

    } catch (erro) {
        alert("❌ Erro no upload: " + erro.message);
    }
});

inputFile.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        nomeEscolhido.textContent = `Arquivo selecionado: ${this.files[0].name}`;
    }
});

// Carrega as músicas ao abrir a página
carregarMusicas();