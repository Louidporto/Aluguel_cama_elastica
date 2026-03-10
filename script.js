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

// 4. EVENTO DE CADASTRO CORRIGIDO
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const inicioDesejado = document.getElementById('data-inicio').value;
    const fimDesejado = document.getElementById('data-fim').value;
    const nome = document.getElementById('cliente').value;
    const desc = document.getElementById('descriçao').value; // Pegando o ID do seu HTML
    const tel = document.getElementById('telefone').value; 
    const preco = document.getElementById('preco-dia').value;

    if (fimDesejado < inicioDesejado) {
        alert("Erro: A data de devolução é anterior à data de início.");
        return;
    }

    try {
        const snapshot = await database.ref('alugueis').once('value');
        const alugueisExistentes = snapshot.val();
        let conflito = null;

        if (alugueisExistentes) {
            for (let id in alugueisExistentes) {
                const a = alugueisExistentes[id];
                if (inicioDesejado <= a.dataFim && fimDesejado >= a.dataInicio) {
                    conflito = a;
                    break; 
                }
            }
        }

        if (conflito) {
            alert(`⚠️ DATA OCUPADA!\n\nCliente: ${conflito.cliente}`);
        } else {
            const novoAluguel = {
                id: Date.now(),
                cliente: nome,
                descricao: desc, // Removi o 'ç' aqui para segurança
                telefone: tel,
                precoDia: preco,
                dataInicio: inicioDesejado,
                dataFim: fimDesejado
            };

            await database.ref('alugueis/' + novoAluguel.id).set(novoAluguel);
            form.reset();
            alert("✅ Reserva confirmada com sucesso!");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});

// 5. FUNÇÃO DESENHAR CARD CORRIGIDA
function criarCardNaTela(aluguel) {
    const card = document.createElement('div');
    card.classList.add('card-aluguel');

    // Cálculo de valores
    const d1 = new Date(aluguel.dataInicio + "T00:00:00");
    const d2 = new Date(aluguel.dataFim + "T00:00:00");
    const dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    const valorTotal = dias * (aluguel.precoDia || 0);

    // Limpeza do número do zap (remove tudo que não for número)
    const telLimpo = aluguel.telefone ? aluguel.telefone.replace(/\D/g, '') : '';

    card.innerHTML = `
        <div class="status-barra ocupado"></div>
        <div class="card-info">
            <h4>${aluguel.cliente}</h4>
            <p style="color: #666; font-size: 13px; margin-bottom: 8px;">${aluguel.descricao || ''}</p>
            
            <a href="https://wa.me/55${telLimpo}" target="_blank" class="btn-whatsapp">
                📱 Chamar no Zap
            </a>

            <p><b>Início:</b> ${formatarData(aluguel.dataInicio)}</p>
            <p><b>Fim:</b> ${formatarData(aluguel.dataFim)}</p>
            <p><b>Total:</b> <span style="color:#27ae60; font-weight:bold;">R$ ${valorTotal.toFixed(2)}</span></p>
        </div>
        <button class="btn-cancelar" onclick="removerCard(${aluguel.id})">Apagar reserva</button>
    `;
    listaCards.appendChild(card);
}

async function removerCard(id) {
    if(confirm("Deseja finalizar este aluguel e enviar para o histórico?")) {
        try {
            // 1. Pega os dados do aluguel atual
            const snapshot = await database.ref('alugueis/' + id).once('value');
            const dadosAluguel = snapshot.val();

            // 2. Salva na pasta 'historico' com a data de finalização
            await database.ref('historico/' + id).set({
                ...dadosAluguel,
                finalizadoEm: new Date().toISOString()
            });

            // 3. Remove da lista ativa
            await database.ref('alugueis/' + id).remove();
            
            alert("Aluguel finalizado e salvo no histórico!");
        } catch (error) {
            console.error(error);
        }
    }
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

// ESCUTAR HISTÓRICO (Versão com valor total)
database.ref('historico').on('value', (snapshot) => {
    const listaH = document.getElementById('lista-historico');
    const dados = snapshot.val();
    listaH.innerHTML = "";
    if (dados) {
        Object.values(dados).reverse().forEach(h => { // .reverse() para mostrar os mais recentes primeiro
            const item = document.createElement('div');
            item.className = 'card-aluguel historico-item';
            
            // Cálculo do total para o histórico também
            const d1 = new Date(h.dataInicio + "T00:00:00");
            const d2 = new Date(h.dataFim + "T00:00:00");
            const dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
            const total = dias * h.precoDia;

            item.innerHTML = `
                <div class="card-info">
                    <span class="tag-finalizado">Finalizado</span>
                    <h4>${h.cliente}</h4>
                    <p><b>Período:</b> ${formatarData(h.dataInicio)} - ${formatarData(h.dataFim)}</p>
                    <p><b>Recebido:</b> R$ ${total.toFixed(2)}</p>
                    <p style="font-size: 10px; margin-top: 5px;">Arquivado em: ${formatarData(h.finalizadoEm.split('T')[0])}</p>
                </div>
            `;
            listaH.appendChild(item);
        });
    }
});













