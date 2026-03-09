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

// 4. EVENTO DE CADASTRO
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const novoAluguel = {
        id: Date.now(),
        cliente: document.getElementById('cliente').value,
        precoDia: document.getElementById('preco-dia').value,
        dataInicio: document.getElementById('data-inicio').value,
        dataFim: document.getElementById('data-fim').value
    };

    if (novoAluguel.dataFim < novoAluguel.dataInicio) {
        alert("Data de devolução inválida!");
        return;
    }

    // Salva no Firebase
    database.ref('alugueis/' + novoAluguel.id).set(novoAluguel);
    form.reset();
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
    const buscaInput = document.getElementById('busca-cliente');
    if (!buscaInput) return; // Segurança caso o elemento não exista

    const termo = buscaInput.value.toLowerCase();
    const cards = document.querySelectorAll('.card-aluguel');

    cards.forEach(card => {
        const nome = card.querySelector('h4').innerText.toLowerCase();
        // Se o nome inclui o termo, exibe; se não, esconde
        card.style.display = nome.includes(termo) ? "flex" : "none";
    });
}

function limparBusca() {
    const buscaInput = document.getElementById('busca-cliente');
    
    if (buscaInput) {
        buscaInput.value = ""; // Limpa o texto
        filtrarClientes();     // Chama o filtro para mostrar todos os cards novamente
        buscaInput.focus();    // Coloca o cursor de volta no campo (opcional, mas bom pra UX)
    }
}




