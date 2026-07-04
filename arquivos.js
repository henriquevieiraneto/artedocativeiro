// --- CONFIGURAÇÕES DO REPOSITÓRIO E TOKEN ---
const REPO_OWNER = "henriquevieiraneto";   
const REPO_NAME = "artedocativeiro";       
const CAMINHO_BIBLIOTECA = "biblioteca";

// 🔑 Token fixo no código (totalmente novo e desbloqueado)
const TOKEN_GIT = "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"; //aaa

// ⚠️ Senha do Admin
const SENHA_ADMIN = "admin";

const lista = document.getElementById('listaArquivos');
const formLogin = document.getElementById('formLogin');
const areaLogin = document.getElementById('areaLogin');
const areaUpload = document.getElementById('areaUpload');
const formUpload = document.getElementById('formUpload');
const inputFile = document.getElementById('inputFile');
const nomeArquivoInput = document.getElementById('nomeArquivo');
const nomeEscolhido = document.getElementById('nomeArquivoEscolhido');

let tokenGit = ""; // Guarda o token durante a sessão

// --- 1. Lógica de Login ---
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('userAdmin').value.trim();
    const senha = document.getElementById('senhaAdmin').value.trim();

    if(user !== "admin") return alert("Usuário inválido!");
    if(senha !== SENHA_ADMIN) return alert("Senha incorreta!");

    // Pega o token fixo e libera o painel
    tokenGit = TOKEN_GIT;
    areaLogin.style.display = 'none';
    areaUpload.style.display = 'block';
    alert("✅ Login Admin efetuado com sucesso!");
    document.getElementById('userAdmin').value = "";
    document.getElementById('senhaAdmin').value = "";
});

// --- 2. Logout ---
function logout() {
    tokenGit = "";
    areaUpload.style.display = 'none';
    areaLogin.style.display = 'block';
    location.reload();
}

// --- 3. Carregar e renderizar a lista pública ---
function renderizarArquivos() {
    lista.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1/-1;">Carregando biblioteca...</p>';

    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CAMINHO_BIBLIOTECA}/lista.json`)
        .then(res => {
            if(!res.ok) throw new Error("Catálogo não encontrado");
            return res.json();
        })
        .then(data => {
            const catalogo = JSON.parse(atob(data.content));
            
            lista.innerHTML = '';
            if (catalogo.length === 0) {
                lista.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1/-1;">Nenhum arquivo no catálogo ainda.</p>';
                return;
            }

            catalogo.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card-arquivo';
                
                let icone = '📄';
                let conteudo = '';
                const urlArquivo = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${CAMINHO_BIBLIOTECA}/${item.arquivo}`;

                if (item.tipo.includes('audio')) {
                    icone = '🎵';
                    conteudo = `<audio class="player-audio" controls>
                                    <source src="${urlArquivo}" type="${item.tipo}">
                                    Seu navegador não suporta áudio.
                                </audio>`;
                } 
                else if (item.tipo.includes('video')) {
                    icone = '🎬';
                    conteudo = `<video class="player-video" controls>
                                    <source src="${urlArquivo}" type="${item.tipo}">
                                    Seu navegador não suporta vídeo.
                                </video>`;
                } 
                else if (item.tipo.includes('pdf')) {
                    icone = '📖';
                    conteudo = `<iframe src="${urlArquivo}" style="width: 100%; height: 200px; border: none; margin-top: 10px; border-radius: 5px;"></iframe>`;
                } 
                else if (item.tipo.includes('text')) {
                    icone = '📝';
                    conteudo = `<div class="visualizador-texto">
                                    <a href="${urlArquivo}" target="_blank" style="color: #4caf50; text-decoration: underline;">Clique aqui para ler o texto</a>
                                </div>`;
                } 
                else if (item.tipo.includes('image')) {
                    icone = '🖼️';
                    conteudo = `<img src="${urlArquivo}" class="visualizador-imagem" alt="Imagem">`;
                } 
                else {
                    conteudo = `<a href="${urlArquivo}" target="_blank" style="color: #4caf50; text-decoration: underline; margin-top:10px; display:block;">📂 Abrir arquivo</a>`;
                }

                card.innerHTML = `
                    <h4>${icone} ${item.nome}</h4>
                    <p>${item.tipo}</p>
                    ${conteudo}
                `;
                lista.appendChild(card);
            });
        })
        .catch(() => {
            lista.innerHTML = `<p style="color: #ffa500; text-align: center; grid-column: 1/-1;">
                ⚠️ Nenhum catálogo encontrado. <br>
                <span style="font-size:13px; color:#aaa;">Faça login como Admin para enviar o primeiro arquivo.</span>
            </p>`;
        });
}

// --- 4. Upload Automático para o GitHub ---
formUpload.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nomePersonalizado = nomeArquivoInput.value.trim() || inputFile.files[0].name;
    const file = inputFile.files[0];

    if (!file) return alert('Por favor, selecione um arquivo!');

    const reader = new FileReader();
    reader.onload = async function(event) {
        const base64Data = event.target.result.split(',')[1];
        const fileName = file.name;

        try {
            const responseFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CAMINHO_BIBLIOTECA}/${fileName}`, {
                method: 'PUT',
                headers: { "Authorization": `token ${tokenGit}` },
                body: JSON.stringify({
                    message: `Adicionando ${nomePersonalizado}`,
                    content: base64Data
                })
            });

            if (!responseFile.ok) {
                const errorData = await responseFile.json();
                throw new Error(errorData.message);
            }

            let catalogoAtual = [];
            try {
                const responseJson = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CAMINHO_BIBLIOTECA}/lista.json`, {
                    headers: { "Authorization": `token ${tokenGit}` }
                });
                if(responseJson.ok) {
                    const dataJson = await responseJson.json();
                    catalogoAtual = JSON.parse(atob(dataJson.content));
                }
            } catch(e) {}

            const jaExiste = catalogoAtual.some(item => item.arquivo === fileName);
            if(!jaExiste) {
                catalogoAtual.push({
                    nome: nomePersonalizado,
                    tipo: file.type,
                    arquivo: fileName
                });
            }

            const novoJsonBase64 = btoa(JSON.stringify(catalogoAtual, null, 2));
            const responseJsonUpdate = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CAMINHO_BIBLIOTECA}/lista.json`, {
                method: 'PUT',
                headers: { "Authorization": `token ${tokenGit}` },
                body: JSON.stringify({
                    message: `Atualizando lista de arquivos`,
                    content: novoJsonBase64
                })
            });

            if(!responseJsonUpdate.ok) {
                const errorData = await responseJsonUpdate.json();
                throw new Error(errorData.message);
            }

            alert('✅ Upload automático feito com sucesso!\nAtualize a página para ver o player.');
            formUpload.reset();
            nomeEscolhido.textContent = '';
            renderizarArquivos();

        } catch (error) {
            console.error(error);
            alert("❌ Erro no upload: " + error.message);
        }
    };
    reader.readAsDataURL(file);
});

inputFile.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        nomeEscolhido.textContent = `Arquivo selecionado: ${this.files[0].name}`;
    }
});

renderizarArquivos();