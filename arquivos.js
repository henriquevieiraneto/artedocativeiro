// --- VERSÃO NETLIFY (SEM SUPABASE, SEM ERROS) ---
const lista = document.getElementById('listaArquivos');
const formUpload = document.getElementById('formUpload');
const inputFile = document.getElementById('inputFile');
const nomeArquivoInput = document.getElementById('nomeArquivo');
const nomeEscolhido = document.getElementById('nomeArquivoEscolhido');

// Oculta o formulário de upload, pois agora faremos pelo painel
if (formUpload) {
    formUpload.style.display = 'none';
}

// Lista de músicas (adicione aqui conforme for colocando os MP3s na pasta)
const catalogo = [
    { nome: "Capoeira é nossa arte", arquivo: "Capoeira é Nossa Arte.mp3" }
];

function renderizarArquivos() {
    lista.innerHTML = '';
    if (catalogo.length === 0) {
        lista.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhuma música encontrada.</p>';
        return;
    }

    catalogo.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-arquivo';
        const urlArquivo = `audios/${item.arquivo}`;

        card.innerHTML = `
            <h4>🎵 ${item.nome}</h4>
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
}

// Apenas para mostrar o nome do arquivo escolhido (sem função de envio)
inputFile.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        nomeEscolhido.textContent = `Arquivo selecionado: ${this.files[0].name}`;
    }
});

renderizarArquivos();