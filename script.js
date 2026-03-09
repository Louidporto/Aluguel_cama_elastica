const form = document.getElementById('form-aluguel');
const listaCards = document.getElementById('lista-agendamentos');

// 1. CARREGAR DADOS AO INICIAR
document.addEventListener('DOMContentLoaded', carregarAlugueis);

// 2. EVENTO DE CADASTRO
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('cliente').value;
    const preco = document.getElementById('preco-dia').value;
    const inicio = document.getElementById('data-inicio').value;
    const fim = document.getElementById('data-fim').value;

    // Validação básica de data
    if (fim < inicio) {
        alert("A data de devolução não pode ser menor que a data de início!");
        return;
    }

    // Validação de Conflito de Datas
    let existentes = JSON.parse(localStorage.getItem('meusAlugueis')) || [];
    const conflito = existentes.find(a => inicio <= a.dataFim && fim >= a.dataInicio);

    if (conflito) {
        alert(`Ops! Já existe um aluguel para ${conflito.cliente} entre ${formatarData(conflito.dataInicio)} e ${formatarData(conflito.dataFim)}`);
        return;
    }

    const novoAluguel = {
        id: Date.now(),
        cliente: nome,
        precoDia: preco,
        dataInicio: inicio,
        dataFim: fim
    };

    criarCardNaTela(novoAluguel);
    salvarNoLocalStorage(novoAluguel);
    form.reset();
});

// 3. FUNÇÃO PARA DESENHAR O CARD
function criarCardNaTela(aluguel) {
    const card = document.createElement('div');
    card.classList.add('card-aluguel');
    card.setAttribute('data-id', aluguel.id);

    // Cálculo de Dias e Valor Total
    const d1 = new Date(aluguel.dataInicio + "T00:00:00");
    const d2 = new Date(aluguel.dataFim + "T00:00:00");
    const dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    const valorTotal = dias * aluguel.precoDia;

    // Verificar se inclui Final de Semana
    let temFDS = false;
    let tempDate = new Date(d1);
    while (tempDate <= d2) {
        if (tempDate.getDay() === 0 || tempDate.getDay() === 6) {
            temFDS = true;
            break;
        }
        tempDate.setDate(tempDate.getDate() + 1);
    }

    if (temFDS) card.classList.add('final-de-semana');

    card.innerHTML = `
        <div class="status-barra ${temFDS ? '' : 'ocupado'}"></div>
        <div class="card-info">
            ${temFDS ? '<span class="tag-fds">📅 FINAL DE SEMANA</span>' : ''}
            <h4>${aluguel.cliente}</h4>
            <p><b>Início:</b> ${formatarData(aluguel.dataInicio)}</p>
            <p><b>Fim:</b> ${formatarData(aluguel.dataFim)}</p>
            <p><b>Duração:</b> ${dias} dia(s)</p>
            <p><b>Total:</b> <span style="color:#27ae60; font-weight:bold;">R$ ${valorTotal.toFixed(2)}</span></p>
        </div>
        <button class="btn-cancelar" onclick="removerCard(${aluguel.id})">Liberar Equipamento</button>
    `;

    listaCards.appendChild(card);
}

// 4. PERSISTÊNCIA E BUSCA
function salvarNoLocalStorage(aluguel) {
    let alugueis = JSON.parse(localStorage.getItem('meusAlugueis')) || [];
    alugueis.push(aluguel);
    localStorage.setItem('meusAlugueis', JSON.stringify(alugueis));
}

function carregarAlugueis() {
    listaCards.innerHTML = "";
    let alugueis = JSON.parse(localStorage.getItem('meusAlugueis')) || [];
    alugueis.forEach(a => criarCardNaTela(a));
}

function removerCard(id) {
    let alugueis = JSON.parse(localStorage.getItem('meusAlugueis')) || [];
    alugueis = alugueis.filter(a => a.id !== id);
    localStorage.setItem('meusAlugueis', JSON.stringify(alugueis));
    carregarAlugueis();
}

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