const lista = document.getElementById('listaArquivos');

// Para remover o formulário de upload da tela
const formUpload = document.getElementById('formUpload');
if (formUpload) {
    formUpload.style.display = 'none';
}

// LISTA DE MÚSICAS (Adicione novas linhas conforme colocar MP3s na pasta)
const catalogo = [
    { nome: "Capoeira é nossa arte", arquivo: "Capoeira é Nossa Arte.mp3" },
    { nome: "Capoeira", arquivo: "Capoeira.mp3" },
    { nome: "Sereia", arquivo: "Sereia.mp3" }
];

function renderizarArquivos() {
    lista.innerHTML = '';
    if (catalogo.length === 0) {
        lista.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhuma música disponível.</p>';
        return;
    }

    catalogo.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-arquivo';

        // O Netlify vai buscar o arquivo na pasta 'musicas' da raiz do site
        const urlArquivo = `musicas/${item.arquivo}`;

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

renderizarArquivos();