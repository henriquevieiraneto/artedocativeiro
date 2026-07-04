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

// Função de Upload com URL Assinada (Sem bloqueio de CORS)
formUpload.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const file = inputFile.files[0];
    if (!file) return alert('Por favor, selecione um arquivo!');

    const nomeArquivo = file.name; 

    try {
        // 1. Pede ao Supabase uma URL temporária para fazer o upload
        const respostaToken = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/musicas/${nomeArquivo}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });

        if (!respostaToken.ok) {
            throw new Error('Não foi possível obter a URL de upload');
        }

        const dados = await respostaToken.json();
        const urlUpload = dados.signedUrl; // O link temporário que aceita o arquivo

        // 2. Envia o arquivo diretamente para essa URL (Isso ignora o CORS)
        const respostaUpload = await fetch(urlUpload, {
            method: 'PUT',
            body: file
        });

        if (!respostaUpload.ok) {
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