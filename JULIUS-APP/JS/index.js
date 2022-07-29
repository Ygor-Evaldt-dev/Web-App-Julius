/*  
Observações: 
.trim() - Limpa a tabulação do "data" do botão;

event.preventDefault(); - Previne o comportamento padrão de redirecionamento de página ao enviar o formulario

.toLocaleDateString(); converte o valor da data para o valor da região do usuário que está utilizando programa

LOCAL STORAGE = Armazenamento local do browser, Não grava array, precisa ser gravado em Json(o ideal seria banco de dados)

*/

/* Seletor de elementos da página */
let $ = document.querySelector.bind(document);

/* Formulário */
function alternaFormulario() {
  let formulario = document.getElementById("formularioLancamento");
  let display = formulario.style.display;
  if (display === "block") {
    formulario.style.display = "none";
  } else {
    formulario.style.display = "block";
  }

  let botaoNovoLancamento = document.getElementById("novoLancamento");
  let texto = botaoNovoLancamento.firstChild;
  texto.data = texto.data.trim();
  if (texto.data === "Esconder") {
    texto.data = "Novo lançamento";
  } else {
    texto.data = "Esconder";
  }
}

/* Configuração de  opções do gráfido*/
const opcoesGrafico = {
  responsive: true,
  title: {
    display: true,
    text: "Dinheiro em caixa",
  },
  tooltips: {
    mode: "index",
    intersect: false,
  },
  hover: {
    mode: "nearest",
    intersect: true,
  },
  scales: {
    xAxes: [
      {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Dias",
        },
      },
    ],
    yAxes: [
      {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Renda",
        },
      },
    ],
  },
};

/* Tratativa de lançamentos */
let lancamentosArmazenados = localStorage.getItem("lancamentos");
let lancamentos = lancamentosArmazenados
  ? JSON.parse(lancamentosArmazenados)
  : [];
renderizaLancamentos();
renderizaGrafico();

function lancar(event) {
  event.preventDefault();

  // deixando o valor negativo quando necessário
  const multiplicadorDoValor = $("#gasto").checked ? -1 : 1;

  let lancamento = {
    valor: parseFloat($("#valor").value) * multiplicadorDoValor,
    descricao: $("#descricao").value,
    dataLancamento: $("#dataLancamento").value,
  };

  // chamando funções
  lancamentos.push(lancamento);
  armazenarLancamentos();
  limpaFormulario();
  renderizaLancamentos();
  renderizaGrafico();
  $("#valor").focus();
}

function renderizaGrafico() {
  if (lancamentos) {
    const lancamentosOrdenados = lancamentos.sort(
      (a, b) => new Date(a.dataLancamento) - new Date(b.dataLancamento)
    );
    let datas = [];
    let valores = [];
    let valorAtual = 0;
    lancamentosOrdenados.forEach((lancamento) => {
      const data = new Date(lancamento.dataLancamento).toLocaleDateString(
        "pt-BR",
        { timeZone: "UTC" }
      );
      datas.push(data);

      valorAtual += lancamento.valor;
      valores.push(valorAtual);
    });

    const corCurva = valorAtual < 0 ? "red" : "blue";
    const config = {
      type: "line",
      data: {
        labels: datas,
        datasets: [
          {
            label: "Comportamento do seu dinheiro",
            backgroundColor: corCurva,
            borderColor: corCurva,
            data: valores,
            fill: false,
          },
        ],
      },
      options: opcoesGrafico,
    };

    const contexto = $("#graficoDinheiro").getContext("2d");
    new Chart(contexto, config);
  }
}

function armazenarLancamentos() {
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
}

function limpaFormulario() {
  $("#valor").value = "";
  $("#descricao").value = "";
  $("#dataLancamento").value = "";
}

// Renderizando os lançamentos
function renderizaLancamentos() {
  if (lancamentos) {
    let htmlLancamentos = "";
    let dinheiroEmCaixa = 0;

    for (let i = lancamentos.length - 1; i > -1; i--) {
      let lancamento = lancamentos[i];

      let valor = lancamento.valor;
      dinheiroEmCaixa += valor;
      let classeLancamento = valor > 0 ? "entrada" : "gasto";
      let imagemLancamento = valor > 0 ? "mais.png" : "menos.png";

      valor = valor.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });

      let dataLancamento = new Date(
        lancamento.dataLancamento
      ).toLocaleDateString();

      let html = `
      <div class="blocoLancamento">
        <div class="botoes">
            <img class="imagemLancamento" src="img/${imagemLancamento}" alt="${classeLancamento}">
            <button class="botaoRemover" onclick="removerLancamento(${i})">
                <img id="excluiLancamento" src="img/lixeira.png" alt="Remover lançamento" />
            </button>
        </div>
        <div class="descricaoLancamento">
            <span class="valor ${classeLancamento}">R$ ${valor}</span>
            <span>${dataLancamento}</span>
            <span>${lancamento.descricao}</span>
        </div>              
    </div>
    `;
      htmlLancamentos += html;
    }

    $("#areaLancamento").innerHTML = htmlLancamentos;
    renderizaDinheiroEmCaixa(dinheiroEmCaixa);
  }
}

// renderizando dinheiro em caixa
function renderizaDinheiroEmCaixa(dinheiroEmCaixa) {
  let renda = dinheiroEmCaixa.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });
  $("#renda").innerText = `R$ ${renda}`;
  let cor = "black";
  if (dinheiroEmCaixa > 0) {
    cor = "blue";
  } else if (dinheiroEmCaixa < 0) {
    cor = "red";
  }
  $("#renda").style.color = cor;
}
