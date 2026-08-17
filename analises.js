// ================= PERMISSÕES =================
const permissoes = {
    usuarios: {
        "v.santos": {
            telas: ["rastreio", "retorno"]
        },
        "kcipriano": {
            telas: ["rastreio", "analytics", "retornos", "relatorio"]
        },
        "admin": {
            telas: ["*"]
        }
    }
};


const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7og0_9fNfXHoINFiE-s75rCPc-RIqAFLwcl8dQqMvEKXimWrMfgQz30QxPKul8_1Cf8RB4YSoizJy/pub?gid=0&single=true&output=csv";

const tabela = document.getElementById("listaAnalises");

let dadosGlobais = [];
let scrollPosition = 0;
let ordemCrescente = false;

// 🔥 DEFINA AQUI A COLUNA REAL DO R$ ENVIOS
const COL_ENVIO = 6; // 👈 ALTERE PARA A COLUNA CORRETA
// 🔥 Define automaticamente a data fim como hoje
document.addEventListener("DOMContentLoaded", () => {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    const hojeFormatado = `${ano}-${mes}-${dia}`;

    document.getElementById("dataFim").value = hojeFormatado;

});

Papa.parse(url, {
    download: true,
    skipEmptyLines: true,
    complete: res => {
        dadosGlobais = res.data.slice(1);
        renderizarTabela(dadosGlobais);
    }
});

function renderizarTabela(dados) {

    tabela.innerHTML = "";

    let totalRastreios = 0;
    let totalValorGeral = 0;

    const grupos = {};

    dados.forEach(l => {
        const rastreio = l[1];
        if (!rastreio) return;

        if (!grupos[rastreio]) grupos[rastreio] = [];
        grupos[rastreio].push(l);
    });

    Object.values(grupos).forEach(grupo => {

        totalRastreios++;

        const l = grupo[0];

        const rastreio = l[1];
        const cliente = `${l[18]} - ${l[19]}`;
        const representante = `${l[20]} - ${l[21]}`;
        const vendedor = `${l[22]} - ${l[23]}`;

        // 🔵 LOCALIZAÇÃO FORMATADA CIDADE - UF
        const cidade = (l[11] || "").toUpperCase();
        const uf = (l[12] || "").toUpperCase();
        const localizacao = cidade && uf ? `${cidade} - ${uf}` : "";

const valorUnitario = converterValorBR(l[COL_ENVIO]);
      const dataFormatada = l[5] || ""; 

totalValorGeral += valorUnitario;


        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><input type="checkbox" class="check-item" data-rastreio="${rastreio}"></td>
            <td>${rastreio}</td>
            <td>${dataFormatada}</td>
            <td>${cliente}</td>
            <td>${representante}</td>
            <td>${vendedor}</td>
            <td>R$ ${valorUnitario.toFixed(2)}</td>
            <td class="btn-detalhes">🔎</td>
        `;
       
        const LIMITE_VALOR = document.getElementById("filtro100").checked ? 100 : Infinity; // altere aqui quando quiser

            if (valorUnitario > LIMITE_VALOR) {
                tr.classList.add("valor-destaque");
            }

        // 🔵 OBJETO COMPLETO DE DADOS
        const dadosDetalhes = {
            nota: l[0],
            pedido: l[14],
            cliente: cliente,
            representante: representante,
            vendedor: vendedor,
            localizacao: localizacao,
            
            postagem: l[27] || "",
            prazo: l[13] || "",
            valor: valorUnitario.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
}),

           amostras: grupo.map(g => {

    const codigo = g[17] || "";
    const descricao = g[15] || "";
    const quantidade = parseInt(g[16]) || 1;

    return `${quantidade} ${codigo} - ${descricao}`;

})
        };

        // 🔵 EVENT LISTENER PROFISSIONAL
        tr.querySelector(".btn-detalhes").addEventListener("click", () => {
            abrirDetalhes(dadosDetalhes);
        });

        tabela.appendChild(tr);
    });

    document.getElementById("totalRastreios").innerText = totalRastreios;

    document.getElementById("totalValor").innerText =
        totalValorGeral.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    // 🔵 Ordena automaticamente ao renderizar
    const thValor = document.querySelector(".th-sort");
    ordenarPorValor(thValor);
}



function converterDataBR(dataBR) {
    if (!dataBR) return null;

    const [dia, mes, ano] = dataBR.split("/");
    return new Date(ano, mes - 1, dia);
}

function converterValorBR(valor) {
    if (!valor) return 0;

    return parseFloat(
        valor
            .toString()
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ) || 0;
}

function abrirDetalhes(dados) {

    document.getElementById("detNota").innerText = dados.nota || "";
    document.getElementById("detPedido").innerText = dados.pedido || "";
    document.getElementById("detCliente").innerText = dados.cliente || "";
    document.getElementById("detRepresentante").innerText = dados.representante || "";
    document.getElementById("detLocalizacao").innerText = dados.localizacao || "";
    document.getElementById("detPostagem").innerText = dados.postagem || "";
    document.getElementById("detPrazo").innerText = dados.prazo || "";
    document.getElementById("detVendedor").innerText = dados.vendedor || "";

    const lista = document.getElementById("detAmostras");
    lista.innerHTML = "";

    if (dados.amostras && dados.amostras.length > 0) {
        dados.amostras.forEach(item => {
            const li = document.createElement("li");
            li.innerText = item;
            lista.appendChild(li);
        });
    }

    const modal = document.getElementById("modalDetalhes");

    // 🔒 Salva posição do scroll
    scrollPosition = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";

    modal.classList.add("ativo");
}

function fecharModal() {

    const modal = document.getElementById("modalDetalhes");

    modal.classList.remove("ativo");

    // 🔓 Restaura scroll original
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollPosition);
}
const modal = document.getElementById("modalDetalhes");

modal.addEventListener("click", function(e) {

    // Se clicar no fundo (overlay) fecha
    if (e.target === modal) {
        fecharModal();
    }

});

document.addEventListener("keydown", function(e) {

    if (e.key === "Escape") {

        const modalDetalhes = document.getElementById("modalDetalhes");
        const submenuCentro = document.getElementById("submenuCentroCusto");

        // 🔹 Fecha modal de detalhes
        if (modalDetalhes.classList.contains("ativo")) {
            fecharModal();
            return;
        }

        // 🔹 Fecha submenu centro de custo
        if (submenuCentro.classList.contains("ativo")) {
            submenuCentro.classList.remove("ativo");
            return;
        }
    }

});

let logoBase64 = null;

function carregarLogo() {
    return new Promise((resolve, reject) => {

        if (logoBase64) {
            resolve();
            return;
        }

        const img = new Image();
        img.src = "/Imagens/4k BRANCO.png"; // 🔥 coloque aqui o caminho real da sua logo

        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            logoBase64 = canvas.toDataURL("image/png");
            resolve();
        };

        img.onerror = reject;
    });
}

async function gerarPDFSelecionados() {

    await carregarLogo(); // 🔥 garante que a logo carregou

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("l", "mm", "a4");

    const checkboxes = document.querySelectorAll(".check-item:checked");

    if (checkboxes.length === 0) {
        alert("Selecione pelo menos um item.");
        return;
    }

    let totalGeral = 0;
    const corpoTabela = [];

    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const dataInicioFormatada = formatarDataBR(dataInicio);
    const dataFimFormatada = formatarDataBR(dataFim);
    let baseDados = dadosGlobais;

    if (dataInicio && dataFim) {

        const inicio = converterDataISOparaLocal(dataInicio);
        const fim = converterDataISOparaLocal(dataFim);

        inicio.setHours(0,0,0,0);
        fim.setHours(23,59,59,999);

        baseDados = dadosGlobais.filter(l => {
            const dataPedido = converterDataBR(l[5]);
            if (!dataPedido) return false;
            return dataPedido >= inicio && dataPedido <= fim;
        });
    }

    checkboxes.forEach((checkbox) => {

        const rastreioSelecionado = checkbox.dataset.rastreio;

        const grupo = baseDados.filter(l => l[1] === rastreioSelecionado);
        if (grupo.length === 0) return;

        const l = grupo[0];

        const rastreio = l[1] || "";
        const tipoEnvio = l[2] || "";
        const nota = l[0] || "";
        const pedido = l[14] || "";

        const cliente = `${l[18] || ""} - ${l[19] || ""}`;
        const representante = `${l[20] || ""} - ${l[21] || ""}`;
        const vendedor = `${l[22] || ""} - ${l[23] || ""}`;

let descricaoCompleta = "";
let resumoItens = {};
let totalRastreio = converterValorBR(l[COL_ENVIO]);

grupo.forEach(g => {

    const descricaoOriginal = (g[17] || "").toUpperCase();
    const quantidade = parseInt(g[16]) || 1;

    // 🔎 Extrai apenas o tipo principal (primeira palavra)
    let tipo = descricaoOriginal.split(" ")[0];

    // 🔥 Padroniza manualmente casos importantes
    if (descricaoOriginal.includes("BANDEIRA")) tipo = "BANDEIRA";
    if (descricaoOriginal.includes("PILOTAGEM")) tipo = "PILOTAGEM";
    if (descricaoOriginal.includes("CARTELA")) tipo = "CARTELA";

    if (!resumoItens[tipo]) {
        resumoItens[tipo] = 0;
    }

    resumoItens[tipo] += quantidade;
});

// 🔥 Monta descrição final consolidada
descricaoCompleta = Object.entries(resumoItens)
    .map(([tipo, qtd]) => `${qtd} ${tipo}`)
    .join("\n");

// 🔥 Monta descrição final agrupada

        totalGeral += totalRastreio;

        corpoTabela.push([
            rastreio,
            tipoEnvio,
            nota,
            pedido,
            cliente,
            representante,
            vendedor,
            descricaoCompleta.trim(),
            totalRastreio.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
        ]);
    });

    // 🔥 AGORA SIM GERA A TABELA

    // ===== HEADER AZUL PADRÃO EMPRESA =====

// Faixa azul
doc.setFillColor(19, 51, 102); // Azul corporativo (ajuste se necessário)
doc.rect(0, 0, 297, 25, "F"); // largura A4 paisagem = 297mm

// Logo 4K (texto estilizado)
doc.addImage(logoBase64, "PNG", 10, 4, 20, 15);
doc.setTextColor(255, 255, 255);

// Título
doc.setFontSize(14);
doc.setFont(undefined, "normal");
doc.text("RELATÓRIO DE ENVIO DE AMOSTRAS", 35, 15);

// Subtítulo período
doc.setFontSize(8);
doc.text(
    `Período: ${
        dataInicioFormatada || "Todos os registros"
    } ${
        dataFimFormatada ? "até " + dataFimFormatada : ""
    }`,
    35,
    20
);

// Reset cor do texto
doc.setTextColor(0, 0, 0);

    doc.autoTable({
    startY: 35,

    head: [[
        "Rastreio",
        "Tipo Envio",
        "NF",
        "Pedido",
        "Cliente",
        "Representante",
        "Vendedor",
        "Descrição",
        "Valor"
    ]],

    body: corpoTabela,


    styles: {
        fontSize: 7,
        halign: "center",
        valign: "middle"
    },
    
    headStyles: {
        fillColor: [220, 226, 238],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
        overflow: "visible"
    },

columnStyles: {
    0: { cellWidth: 25, overflow: "hidden" },
    1: { cellWidth: 15, overflow: "hidden" },
    2: { cellWidth: 15, overflow: "hidden" },
    3: { cellWidth: 15, overflow: "hidden" },
    4: { cellWidth: 55, overflow: "hidden" },
    5: { cellWidth: 55, overflow: "hidden" },
    6: { cellWidth: 40, overflow: "hidden" },

    // 🔥 SOMENTE DESCRIÇÃO quebra linha
    7: { cellWidth: 35, overflow: "linebreak", valign: "top" },

    8: { cellWidth: 20, overflow: "hidden" }
},

    theme: "grid",
    margin: { left: 10, right: 10 }
});

const totalPages = doc.internal.getNumberOfPages();

for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
        `Página ${i} de ${totalPages}`,
        270,
        200,
        { align: "right" }
    );
}

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(
        `TOTAL GERAL: ${totalGeral.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`,
        14,
        finalY
    );

    doc.save("Relatorio_Envio_Amostras_4K.pdf");
}



function selecionarTodosFiltrados(masterCheckbox) {

    const linhas = document.querySelectorAll("#listaAnalises tr");

    linhas.forEach(linha => {
        if (linha.style.display !== "none") {
            const checkbox = linha.querySelector("input[type='checkbox']");
            if (checkbox) {
                checkbox.checked = masterCheckbox.checked;
            }
        }
    });


}



function ordenarPorValor(th) {

    const tbody = document.getElementById("listaAnalises");
    const linhas = Array.from(tbody.querySelectorAll("tr"));

    linhas.sort((a, b) => {
        const valorA = extrairValor(a);
        const valorB = extrairValor(b);
        return ordemCrescente ? valorA - valorB : valorB - valorA;
    });

    ordemCrescente = !ordemCrescente;

    linhas.forEach(linha => tbody.appendChild(linha));

    // 🔵 Atualiza visual do ícone
    th.classList.remove("asc", "desc");

    if (ordemCrescente) {
        th.classList.add("desc"); // porque já alternou
    } else {
        th.classList.add("asc");
    }
}
function extrairValor(linha) {

    const colunaValor = linha.children[6];

    if (!colunaValor) return 0;

    return parseFloat(
        colunaValor.innerText
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ) || 0;
}

function aplicarFiltroValor() {

    const somenteAcima100 = document.getElementById("filtro100").checked;

    let base = dadosGlobais;

    // 🔵 Primeiro aplica filtro de data se existir
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    if (dataInicio && dataFim) {
        const inicio = converterDataISOparaLocal(dataInicio);
        const fim = converterDataISOparaLocal(dataFim);

        inicio.setHours(0,0,0,0);
        fim.setHours(23,59,59,999);

        base = base.filter(l => {
            const dataPedido = converterDataBR(l[5]);
            if (!dataPedido) return false;
            return dataPedido >= inicio && dataPedido <= fim;
        });
    }

    // 🔵 Depois aplica filtro de valor
    if (somenteAcima100) {
        base = base.filter(l => converterValorBR(l[COL_ENVIO]) > 100);
    }
    document.getElementById("checkTodos").checked = false;

    renderizarTabela(base);

    if (document.getElementById("submenuCentroCusto").classList.contains("ativo")) {
    gerarResumoCentroCusto();

}
}

function formatarDataBR(dataISO) {
    if (!dataISO) return "";

    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

const tabelaScroll = document.querySelector(".tabela-scroll");
const thead = document.querySelector(".tabela-analises thead");

tabelaScroll.addEventListener("scroll", () => {
    if (tabelaScroll.scrollTop > 0) {
        thead.classList.add("sombra-ativa");
    } else {
        thead.classList.remove("sombra-ativa");
    }
});

function filtrarPorData() {

    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    // 🔥 RESET DO FILTRO DE VALOR
    document.getElementById("filtro100").checked = false;

    if (!dataInicio || !dataFim) {
        renderizarTabela(dadosGlobais);
        document.getElementById("checkTodos").checked = false;
        return;
    }

    const inicio = converterDataISOparaLocal(dataInicio);
    const fim = converterDataISOparaLocal(dataFim);

    inicio.setHours(0,0,0,0);
    fim.setHours(23,59,59,999);

    const filtrados = dadosGlobais.filter(l => {
        const dataPedido = converterDataBR(l[5]);
        if (!dataPedido) return false;

        return dataPedido >= inicio && dataPedido <= fim;
    });

    renderizarTabela(filtrados);

    // 🔄 Reset do checkbox master
    document.getElementById("checkTodos").checked = false;
}

function converterDataISOparaLocal(dataISO) {
    if (!dataISO) return null;

    const [ano, mes, dia] = dataISO.split("-");
    return new Date(ano, mes - 1, dia);
}

function toggleResumoCentroCusto() {

    const submenu = document.getElementById("submenuCentroCusto");

    if (submenu.classList.contains("ativo")) {
        submenu.classList.remove("ativo");
        return;
    }

    gerarResumoCentroCusto();
    submenu.classList.add("ativo");
}
function obterBaseAtualFiltrada() {

    let base = dadosGlobais;

    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const somenteAcima100 = document.getElementById("filtro100").checked;

    // 🔵 Filtro por data
    if (dataInicio && dataFim) {

        const inicio = converterDataISOparaLocal(dataInicio);
        const fim = converterDataISOparaLocal(dataFim);

        inicio.setHours(0,0,0,0);
        fim.setHours(23,59,59,999);

        base = base.filter(l => {
            const dataPedido = converterDataBR(l[5]);
            if (!dataPedido) return false;
            return dataPedido >= inicio && dataPedido <= fim;
        });
    }

    // 🔵 Filtro por valor
    if (somenteAcima100) {
        base = base.filter(l => converterValorBR(l[COL_ENVIO]) > 100);
    }

    return base;
}

function gerarResumoCentroCusto() {

    const tbody = document.getElementById("tabelaCentroCusto");
    tbody.innerHTML = "";

    const resumo = {};
    let totalGeral = 0;

    const baseAtual = obterBaseAtualFiltrada();

    // 🔥 AGRUPAR POR RASTREIO PRIMEIRO
    const grupos = {};

    baseAtual.forEach(l => {
        const rastreio = l[1];
        if (!rastreio) return;

        if (!grupos[rastreio]) {
            grupos[rastreio] = l; // guarda só a primeira linha do rastreio
        }
    });

    // 🔥 AGORA SOMA UMA VEZ POR RASTREIO
    Object.values(grupos).forEach(l => {

        const centroCusto = l[10] || "Não informado";
        const valor = converterValorBR(l[COL_ENVIO]);

        if (!resumo[centroCusto]) {
            resumo[centroCusto] = 0;
        }

        resumo[centroCusto] += valor;
        totalGeral += valor;
    });

    // 🔥 MONTA TABELA
    Object.entries(resumo)
    .sort((a, b) => b[1] - a[1]) // 🔥 ORDENA PELO VALOR (crescente)
    .forEach(([centro, total]) => {

        const tr = document.createElement("tr");

        const percentual = totalGeral > 0
    ? ((total / totalGeral) * 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : "0,00";

        tr.innerHTML = `
            <td>${centro}</td>
            <td>${total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })}</td>
            <td class="col-percentual">${percentual}%</td>
        `;

        tbody.appendChild(tr);
    });

    // 🔥 TOTAL GERAL
    const trTotal = document.createElement("tr");
    trTotal.style.fontWeight = "bold";
    trTotal.style.background = "#f2f2f2";

    trTotal.innerHTML = `
    <td>TOTAL GERAL</td>
    <td>${totalGeral.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })}</td>
    <td>100,00%</td>
`;

    tbody.appendChild(trTotal);
}

function fecharModalCentro() {
    document.getElementById("modalCentroCusto").classList.remove("ativo");
}
function fecharCentroCusto() {
    document.getElementById("submenuCentroCusto").classList.remove("ativo");
}
const overlayCentro = document.getElementById("submenuCentroCusto");

overlayCentro.addEventListener("click", function(e) {

    if (e.target === overlayCentro) {
        fecharCentroCusto();
    }

});
async function gerarPDFCentroCusto() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const baseAtual = obterBaseAtualFiltrada();

    const resumo = {};
    let totalGeral = 0;

    // 🔥 AGRUPA POR RASTREIO PRIMEIRO (igual à tela)
    const grupos = {};

    baseAtual.forEach(l => {
        const rastreio = l[1];
        if (!rastreio) return;

        if (!grupos[rastreio]) {
            grupos[rastreio] = l; // guarda só a primeira linha
        }
    });

    // 🔥 SOMA UMA VEZ POR RASTREIO
    Object.values(grupos).forEach(l => {

        const centro = l[10] || "Não informado";
        const valor = converterValorBR(l[COL_ENVIO]);

        if (!resumo[centro]) resumo[centro] = 0;

        resumo[centro] += valor;
        totalGeral += valor;
    });

    // 🔥 ORDENA IGUAL À TELA (CRESCENTE)
    const corpoTabela = Object.entries(resumo)
        .sort((a, b) => b[1] - a[1])
        .map(([centro, total]) => {

    const percentual = totalGeral > 0
    ? ((total / totalGeral) * 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : "0,00";
    return [
        centro,
        total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }),
        percentual + "%"
    ];
});

    await carregarLogo(); // garante que a logo carregou

// =========================
// HEADER PADRÃO 4K
// =========================

// Faixa azul
doc.setFillColor(19, 51, 102);
doc.rect(0, 0, 210, 25, "F");

// Logo
doc.addImage(logoBase64, "PNG", 10, 4, 20, 15);

// Texto branco
doc.setTextColor(255, 255, 255);

// Título
doc.setFontSize(13);
doc.setFont(undefined, "normal");
doc.text("CUSTOS POR DEPARTAMENTOS", 35, 14);

// Período dinâmico
const dataInicio = document.getElementById("dataInicio").value;
const dataFim = document.getElementById("dataFim").value;

doc.setFontSize(8);
doc.text(
    `Período: ${
        dataInicio ? formatarDataBR(dataInicio) : "Todos os registros"
    } ${
        dataFim ? "até " + formatarDataBR(dataFim) : ""
    }`,
    35,
    19
);

// Reset cor texto
doc.setTextColor(0, 0, 0);

// Faixa cinza inferior
doc.setFillColor(230, 230, 230);
doc.rect(0, 25, 210, 5, "F");

    doc.autoTable({
    startY: 35,
    head: [["Centro de Custo", "Valor Total", "% Total"]],
    body: corpoTabela,
    theme: "grid",

    headStyles: {
        fillColor: [220, 226, 238],
        textColor: 0,
        fontStyle: "bold",
        halign: "center"
    },

    columnStyles: {
        1: { halign: "center" }, // Valor Total
        2: { halign: "center" }  // Percentual
    }
});

    const finalY = doc.lastAutoTable.finalY + 10;

   const textoTotal = `TOTAL GERAL: ${totalGeral.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
})}`;

    // Fundo cinza claro atrás do total
    doc.setFillColor(240, 240, 240);
    doc.rect(10, finalY - 6, 190, 10, "F");

    // Texto do total
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(textoTotal, 14, finalY);

    doc.save("Resumo_Centro_Custo_4K.pdf");
}

function filtrarPorRastreio() {
    const input = document.getElementById("inputRastreio");
    input.value = input.value.toUpperCase(); // força maiúsculas
    const valor = input.value.trim();
    const linhas = document.querySelectorAll("#listaAnalises tr");

    linhas.forEach(linha => {
        const rastreio = linha.querySelector("td:nth-child(2)").textContent.toUpperCase();
        linha.style.display = rastreio.includes(valor) ? "" : "none";
    });
}

function mostrarSecao(id) {

    // 🔹 Esconde todas as seções
    document.querySelectorAll(".secao").forEach(sec => {
        sec.classList.remove("ativa");
    });

    // 🔹 Mostra a seção clicada
    const secaoAtiva = document.getElementById(id);
    if (secaoAtiva) {
        secaoAtiva.classList.add("ativa");
    }

    // 🔹 Destaca botão ativo na sidebar
    document.querySelectorAll(".sidebar button").forEach(btn => {
        btn.classList.remove("ativo");
    });

    const botaoClicado = document.querySelector(
        `.sidebar button[onclick="mostrarSecao('${id}')"]`
    );

    if (botaoClicado) {
        botaoClicado.classList.add("ativo");
    }

    // 🔹 Fecha a sidebar (se estiver usando modo oculto)
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.remove("ativa");

    const overlay = document.querySelector(".overlay-sidebar");
    if (overlay) overlay.classList.remove("ativo");
}
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("ativa");

    const overlay = document.querySelector(".overlay-sidebar");
    if (overlay) overlay.classList.toggle("ativo");
}

// fechar clicando fora
document.addEventListener("click", function(e) {
    const sidebar = document.querySelector(".sidebar");
    const btn = document.querySelector(".btn-menu");

    if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
        sidebar.classList.remove("ativa");

        const overlay = document.querySelector(".overlay-sidebar");
        if (overlay) overlay.classList.remove("ativo");
    }
});

// marcação de pagina ao clicar na barra lateral
const links = document.querySelectorAll(".menu-btn");

links.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add("ativo");
    }
});
const botoes = document.querySelectorAll(".menu-btn");
const paginaAtual = window.location.pathname;

botoes.forEach(btn => {
    if (
        (paginaAtual.includes("analytics.html") && btn.textContent.includes(" Análises de Amostras")) ||
        (paginaAtual.includes("retornos.html") && btn.textContent.includes("Retorno de Amostras")) ||
        (paginaAtual.includes("dash.html") && btn.textContent.includes("Dashboard"))
    ) {
        btn.classList.add("ativo");
    }
});

// ================= LOGOUT =================
document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("btnLogout");

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {

            // 🔥 limpa tudo que você usa de sessão
            localStorage.clear();
            sessionStorage.clear();

            // 🔥 se você salva algo tipo "usuarioLogado"
            // localStorage.removeItem("usuario");

            // 🔥 redireciona
            window.location.href = "index.html";
        });
    }
});