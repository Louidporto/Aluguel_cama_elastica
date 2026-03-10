# 🎡 Sistema de Gestão de Aluguel - Cama Elástica

Este é um sistema web interativo e responsivo desenvolvido para gerenciar o aluguel de equipamentos (como camas elásticas). O projeto foca em **User Experience (UX)**, persistência de dados em tempo real e prevenção de conflitos de agenda.



## 🚀 Funcionalidades

* **Cadastro de Reservas:** Registro de clientes, preço por dia e período de locação.
* **Sincronização em Nuvem:** Integração com **Firebase Realtime Database**, permitindo que os dados cadastrados no PC apareçam instantaneamente no Celular.
* **Bloqueio de Conflitos:** O sistema valida matematicamente se uma data já está ocupada antes de confirmar um novo agendamento.
* **Cálculo Automático:** Calcula o valor total do aluguel com base na quantidade de dias.
* **Destaque de Final de Semana:** Identifica automaticamente se a reserva abrange sábado ou domingo, aplicando um estilo visual diferenciado.
* **Busca Dinâmica:** Filtro em tempo real para localizar clientes rapidamente.
* **Interface Moderna:** Cards com efeitos de profundidade (`box-shadow`), estados de *hover* e transições suaves.

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estruturação semântica.
* **CSS3:** Estilização avançada, animações e responsividade.
* **JavaScript (ES6+):** Lógica de negócio, manipulação de DOM e funções assíncronas (`async/await`).
* **Firebase:** Banco de dados NoSQL em tempo real para persistência e sincronização.



## 📋 Como usar

1.  **Acesse o site:** (Insira aqui o seu link do GitHub Pages se já tiver).
2.  **Realize uma reserva:** Preencha o nome do cliente, o valor da diária e as datas de início e fim.
3.  **Confira o conflito:** Tente realizar um agendamento para uma data que já possui um card ativo; o sistema emitirá um alerta de impedimento.
4.  **Gerencie:** Use o campo de busca para filtrar clientes ou o botão "Liberar Equipamento" para excluir registros concluídos.

## 📂 Estrutura do Projeto

```text
├── index.html      # Estrutura da página e importação do Firebase
├── style.css       # Estilização, efeitos de profundidade e cores
└── script.js      # Lógica de conexão com Firebase, validações e filtros