// 1. Configuração do Firebase (Ajustada com o banco de dados)
const firebaseConfig = {
    apiKey: "AIzaSyD-m-zKJEmhi9GJ-52VZ_tMjFUVELQz4VQ",
    authDomain: "camaelasticaapp.firebaseapp.com",
    // Esta linha abaixo é essencial para o Realtime Database funcionar!
    databaseURL: "https://camaelasticaapp-default-rtdb.firebaseio.com", 
    projectId: "camaelasticaapp",
    storageBucket: "camaelasticaapp.firebasestorage.app",
    messagingSenderId: "995476566915",
    appId: "1:995476566915:web:ceb35ea886fedb9a4d7cb6",
    measurementId: "G-9W7RZMHJ6Z"
};

// 2. Inicializa o Firebase (Formato compatível com o script do HTML)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const form = document.getElementById('form-aluguel');
const listaCards = document.getElementById('lista-agendamentos');

// 3. CARREGAR DADOS DA NUVEM EM TEMPO REAL
database.ref('alugueis').on('value', (snapshot) => {
    const dados = snapshot.val();
    listaCards.innerHTML = ""; 
    if (dados) {
        Object.values(dados).forEach(aluguel => criarCardNaTela(aluguel));
    }
});

// 4. EVENTO DE CADASTRO (Revisado com Bloqueio Real)
form.addEventListener('submit', async function(event) { // Adicionamos 'async' aqui
    event.preventDefault();

    const inicioDesejado = document.getElementById('data-inicio').value;
    const fimDesejado = document.getElementById('data-fim').value;
    const nome = document.getElementById('cliente').value;
    const preco = document.getElementById('preco-dia').value;

    // 1. Validação básica de ordem das datas
    if (fimDesejado < inicioDesejado) {
        alert("A data de devolução não pode ser anterior à data de início!");
        return;
    }

    try {
        // 2. BUSCAR DADOS DA NUVEM (Esperando a resposta com 'await')
        const snapshot = await database.ref('alugueis').once('value');
        const alugueisExistentes = snapshot.val();
        let conflitoEncontrado = null;

        if (alugueisExistentes) {
            // Convertemos o objeto do Firebase em uma lista para comparar
            const listaAlugueis = Object.values(alugueisExistentes);

            for (let aluguel de listaAlugueis) {
                // LÓGICA DE CONFLITO:
                // O conflito acontece se (NovoInicio <= FimExistente) E (NovoFim >= InicioExistente)
                if (inicioDesejado <= aluguel.dataFim && fimDesejado >= aluguel.dataInicio) {
                    conflitoEncontrado = aluguel;
                    break; // Para o loop assim que achar o primeiro conflito
                }
            }
        }

        // 3. DECISÃO FINAL
        if (conflitoEncontrado) {
            alert(`⚠️ DATA INDISPONÍVEL!\n\nJá existe uma reserva para: ${conflitoEncontrado.cliente}\nPeríodo: ${formatarData(conflitoEncontrado.dataInicio)} até ${formatarData(conflitoEncontrado.dataFim)}`);
        } else {
            // Se chegou aqui, a data está livre!
            const novoAluguel = {
                id: Date.now(),
                cliente: nome,
                precoDia: preco,
                dataInicio: inicioDesejado,
                dataFim: fimDesejado
            };

            await database.ref('alugueis/' + novoAluguel.id).set(novoAluguel);
            form.reset();
            alert("✅ Reserva confirmada na nuvem!");
        }

    } catch (error) {
        console.error("Erro ao acessar o Firebase:", error);
        alert("Erro de conexão. Tente novamente.");
    }
});
// 5. FUNÇÃO PARA DESENHAR O CARD
function criarCardNaTela(aluguel) {
    const card = document.createElement('div');
    card.classList.add('card-aluguel');

    const d1 = new Date(aluguel.dataInicio + "T00:00:00");
    const d2 = new Date(aluguel.dataFim + "T00:00:00");
    const dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    const valorTotal = dias * aluguel.precoDia;

    card.innerHTML = `
        <div class="status-barra ocupado"></div>
        <div class="card-info">
            <h4>${aluguel.cliente}</h4>
            <p><b>Início:</b> ${formatarData(aluguel.dataInicio)}</p>
            <p><b>Fim:</b> ${formatarData(aluguel.dataFim)}</p>
            <p><b>Total:</b> <span style="color:#27ae60; font-weight:bold;">R$ ${valorTotal.toFixed(2)}</span></p>
        </div>
        <button class="btn-cancelar" onclick="removerCard(${aluguel.id})">Liberar Equipamento</button>
    `;
    listaCards.appendChild(card);
}

// 6. REMOVER DA NUVEM
function removerCard(id) {
    if(confirm("Deseja realmente liberar este equipamento?")) {
        database.ref('alugueis/' + id).remove();
    }
}

function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// 7. FILTRO DE BUSCA
function filtrarClientes() {
    const termo = document.getElementById('busca-cliente').value.toLowerCase();
    const cards = document.querySelectorAll('.card-aluguel');
    cards.forEach(card => {
        const nome = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = nome.includes(termo) ? "flex" : "none";
    });
}


