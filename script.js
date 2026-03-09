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

// 4. EVENTO DE CADASTRO (Com Verificação de Conflito na Nuvem)
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const inicioDesejado = document.getElementById('data-inicio').value;
    const fimDesejado = document.getElementById('data-fim').value;
    const nome = document.getElementById('cliente').value;
    const preco = document.getElementById('preco-dia').value;

    // 1. Validação básica de data
    if (fimDesejado < inicioDesejado) {
        alert("A data de devolução não pode ser menor que a data de início!");
        return;
    }

    // 2. BUSCAR DADOS ATUAIS PARA CHECAR CONFLITO
    database.ref('alugueis').once('value').then((snapshot) => {
        const alugueisExistentes = snapshot.val();
        let conflito = false;

        if (alugueisExistentes) {
            // Transformamos o objeto em lista e verificamos cada um
            Object.values(alugueisExistentes).forEach(aluguel => {
                // Lógica de Interseção de Intervalos
                if (inicioDesejado <= aluguel.dataFim && fimDesejado >= aluguel.dataInicio) {
                    conflito = aluguel;
                }
            });
        }

        if (conflito) {
            alert(`⚠️ CONFLITO DE DATA!\n\nEste período já está reservado para: ${conflito.cliente}\n(De ${formatarData(conflito.dataInicio)} até ${formatarData(conflito.dataFim)})`);
        } else {
            // Se não houver conflito, aí sim salvamos
            const novoAluguel = {
                id: Date.now(),
                cliente: nome,
                precoDia: preco,
                dataInicio: inicioDesejado,
                dataFim: fimDesejado
            };

            database.ref('alugueis/' + novoAluguel.id).set(novoAluguel);
            form.reset();
            alert("✅ Reserva confirmada com sucesso!");
        }
    });
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

