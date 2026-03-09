// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-m-zKJEmhi9GJ-52VZ_tMjFUVELQz4VQ",
  authDomain: "camaelasticaapp.firebaseapp.com",
  projectId: "camaelasticaapp",
  storageBucket: "camaelasticaapp.firebasestorage.app",
  messagingSenderId: "995476566915",
  appId: "1:995476566915:web:ceb35ea886fedb9a4d7cb6",
  measurementId: "G-9W7RZMHJ6Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 1. Cole aqui o código que você copiou do Firebase (firebaseConfig)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "000000000",
    appId: "1:000000000:web:000000000"
};

// 2. Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const form = document.getElementById('form-aluguel');
const listaCards = document.getElementById('lista-agendamentos');

// 3. CARREGAR DADOS DA NUVEM EM TEMPO REAL
// O '.on' faz o site atualizar sozinho no celular quando você cadastra no PC!
database.ref('alugueis').on('value', (snapshot) => {
    const dados = snapshot.val();
    listaCards.innerHTML = ""; // Limpa a tela para recarregar
    if (dados) {
        // Converte o objeto do Firebase em lista e desenha os cards
        Object.values(dados).forEach(aluguel => criarCardNaTela(aluguel));
    }
});

// 4. EVENTO DE CADASTRO (Agora enviando para a Nuvem)
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const novoAluguel = {
        id: Date.now(),
        cliente: document.getElementById('cliente').value,
        precoDia: document.getElementById('preco-dia').value,
        dataInicio: document.getElementById('data-inicio').value,
        dataFim: document.getElementById('data-fim').value
    };

    // Validação de data básica
    if (novoAluguel.dataFim < novoAluguel.dataInicio) {
        alert("Data de devolução inválida!");
        return;
    }

    // Salva no Firebase (a nuvem cuida de avisar todos os aparelhos)
    database.ref('alugueis/' + novoAluguel.id).set(novoAluguel);
    form.reset();
});

// 5. FUNÇÃO PARA DESENHAR O CARD (Mantemos sua estilização incrível)
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
            <p><b>Total:</b> <span style="color:#27ae60">R$ ${valorTotal.toFixed(2)}</span></p>
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

// 7. FILTRO DE BUSCA (Continua funcionando localmente na tela)
function filtrarClientes() {
    const termo = document.getElementById('busca-cliente').value.toLowerCase();
    const cards = document.querySelectorAll('.card-aluguel');
    cards.forEach(card => {
        const nome = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = nome.includes(termo) ? "flex" : "none";
    });
}
