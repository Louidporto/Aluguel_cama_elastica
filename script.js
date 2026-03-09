// 1. Configuração do seu Firebase (Mantenha suas chaves aqui)
const firebaseConfig = {
    apiKey: "AIzaSyD-m-zKJEmhi9GJ-52VZ_tMjFUVELQz4VQ",
    authDomain: "camaelasticaapp.firebaseapp.com",
    databaseURL: "https://camaelasticaapp-default-rtdb.firebaseio.com",
    projectId: "camaelasticaapp",
    storageBucket: "camaelasticaapp.firebasestorage.app",
    messagingSenderId: "995476566915",
    appId: "1:995476566915:web:ceb35ea886fedb9a4d7cb6",
    measurementId: "G-9W7RZMHJ6Z"
};

// 2. Inicialização
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const form = document.getElementById('form-aluguel');
const listaCards = document.getElementById('lista-agendamentos');

// 3. ESCUTAR MUDANÇAS NA NUVEM (Tempo Real)
database.ref('alugueis').on('value', (snapshot) => {
    const dados = snapshot.val();
    listaCards.innerHTML = ""; 
    if (dados) {
        // Ordena por data de início antes de exibir
        const listaOrdenada = Object.values(dados).sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
        listaOrdenada.forEach(aluguel => criarCardNaTela(aluguel));
    }
});

// 4. EVENTO DE CADASTRO COM BLOQUEIO DE CONFLITO
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const inicioDesejado = document.getElementById('data-inicio').value;
    const fimDesejado = document.getElementById('data-fim').value;
    const nome = document.getElementById('cliente').value;
    const preco = document.getElementById('preco-dia').value;

    // Validação básica
    if (fimDesejado < inicioDesejado) {
        alert("Erro: A data de devolução é anterior à data de início.");
        return;
    }

    try {
        // BUSCA DADOS PARA CHECAR CONFLITO
        const snapshot = await database.ref('alugueis').once('value');
        const alugueisExistentes = snapshot.val();
        let conflito = null;

        if (alugueisExistentes) {
            for (let id in alugueisExistentes) {
                const a = alugueisExistentes[id];
                // Lógica Matemática de Interseção: (NovoInicio <= FimExistente) && (NovoFim >= InicioExistente)
                if (inicioDesejado <= a.dataFim && fimDesejado >= a.dataInicio) {
                    conflito = a;
                    break; 
                }
            }
        }

        if (conflito) {
            alert(`⚠️ DATA OCUPADA!\n\nCliente: ${conflito.cliente}\nPeríodo: ${formatarData(conflito.dataInicio)} até ${formatarData(conflito.dataFim)}`);
        } else {
            // SALVAR NA NUVEM
            const novoAluguel = {
                id: Date.now(),
                cliente: nome,
                precoDia: preco,
                dataInicio: inicioDesejado,
                dataFim: fimDesejado
            };

            await database.ref('alugueis/' + novoAluguel.id).set(novoAluguel);
            form.reset();
            alert("✅ Reserva confirmada com sucesso!");
        }

    } catch (error) {
        console.error("Erro no Firebase:", error);
        alert("Erro ao conectar com o servidor.");
    }
});

// 5. FUNÇÃO PARA CRIAR O CARD (Com Profundidade e Destaque FDS)
function criarCardNaTela(aluguel) {
    const card = document.createElement('div');
    card.classList.add('card-aluguel');

    const d1 = new Date(aluguel.dataInicio + "T00:00:00");
    const d2 = new Date(aluguel.dataFim + "T00:00:00");
    const dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    const valorTotal = dias * aluguel.precoDia;

    // Checar se abrange Final de Semana
    let temFDS = false;
    let dataCheck = new Date(d1);
    while (dataCheck <= d2) {
        if (dataCheck.getDay() === 0 || dataCheck.getDay() === 6) {
            temFDS = true;
            break;
        }
        dataCheck.setDate(dataCheck.getDate() + 1);
    }

    if (temFDS) card.classList.add('final-de-semana');

    card.innerHTML = `
        <div class="status-barra ${temFDS ? '' : 'ocupado'}"></div>
        <div class="card-info">
            ${temFDS ? '<span class="tag-fds">📅 FINAL DE SEMANA</span>' : ''}
            <h4>${aluguel.cliente}</h4>
            <p><b>Período:</b> ${formatarData(aluguel.dataInicio)} - ${formatarData(aluguel.dataFim)}</p>
            <p><b>Duração:</b> ${dias} dia(s)</p>
            <p><b>Total:</b> <span style="color:#27ae60; font-weight:bold;">R$ ${valorTotal.toFixed(2)}</span></p>
        </div>
        <button class="btn-cancelar" onclick="removerCard(${aluguel.id})">Liberar Equipamento</button>
    `;
    listaCards.appendChild(card);
}

// 6. REMOVER REGISTRO
function removerCard(id) {
    if(confirm("Deseja realmente excluir este agendamento?")) {
        database.ref('alugueis/' + id).remove();
    }
}

// 7. BUSCA DINÂMICA
function filtrarClientes() {
    const termo = document.getElementById('busca-cliente').value.toLowerCase();
    const cards = document.querySelectorAll('.card-aluguel');
    cards.forEach(card => {
        const nome = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = nome.includes(termo) ? "flex" : "none";
    });
}

function limparBusca() {
    document.getElementById('busca-cliente').value = "";
    filtrarClientes();
}

function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}


