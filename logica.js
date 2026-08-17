  /* ================= CONFIG ================= */
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7og0_9fNfXHoINFiE-s75rCPc-RIqAFLwcl8dQqMvEKXimWrMfgQz30QxPKul8_1Cf8RB4YSoizJy/pub?gid=0&single=true&output=csv";

  /* ================= ESTADO ================= */
  let dados = [];
  let dadosVendedora = [];
  let csvCarregado = false;
  
  let codigoVendedorAPI = null;
  

  /* ================= ELEMENTOS ================= */
  const loginBox = document.getElementById("loginVendedor");
  const btnLogin = document.getElementById("btnEntrarLogin");
  const erroLogin = document.getElementById("erroLogin");
  const logoMarca = document.getElementById("logoMarca");
  const sistema = document.getElementById("sistema");
  
  const campoBusca = document.getElementById("filtroBusca");
  const resultado = document.getElementById("resultado");
  
  const contador = document.getElementById("contador");
  const boasVindas = document.getElementById("boasVindas");
  const overlay = document.getElementById("overlayDetalhes");
  const conteudoDetalhes = document.getElementById("conteudoDetalhes");
  const tipoBusca = document.getElementById("tipoBusca");
  const btnAjudaSuporte = document.getElementById("btnAjudaSuporte");
  const btnTipoBusca = document.getElementById("btnTipoBusca");
  const menuTipoBusca = document.getElementById("menuTipoBusca");
  const labelTipoBusca = document.getElementById("labelTipoBusca");
  const btnAnalises = document.getElementById("btnAnalises");
  const logoMarcaBox = document.getElementById("logoMarcaBox");
  const usuariosFullAccess = ["v.santos"];

  function formatarAmostraDetalhe(i) {
    const tipo = normalizar(i[17] || "");

    // 🟡 cartela de cores → só descrição
    if (tipo.includes("CARTELA")) {
    return `${i[16]} - ${i[15]}`;
  }


    // padrão
    return `${i[16]} - ${i[17]} - ${i[15]}`;
  }

  function atualizarItemAtivoMenu() {
    if (!menuTipoBusca) return;

    menuTipoBusca.querySelectorAll(".menu-item").forEach(item => {
      item.classList.toggle(
        "ativo",
        item.dataset.tipo === tipoBusca.value
      );
    });
  }



  function obterPedidosPendentes() {
    const mapa = new Map();

    dadosVendedora.forEach(l => {
      const situacao = normalizar(l[26] || "");
      if (!situacao.includes("PENDENTE")) return;

      const nota = l[0];
      if (!mapa.has(nota)) mapa.set(nota, l);
    });

    return [...mapa.values()];
  }


  /* ================= INICIALIZA TIPO DE BUSCA PADRÃO ================= */
  (function initTipoBuscaPadrao() {
    tipoBusca.value = "nota";

    labelTipoBusca.innerText = "📄 Nota Fiscal";
    campoBusca.placeholder = "Digite para buscar...";
  })();



  function atualizarPlaceholderBusca() {
    const placeholders = {
      nota: "Digite a nota",
      pedido: "Digite o Pedido",
      cliente: "Digite o Cliente",
      representante: "Digite o Representante"
    };

    const tipo = tipoBusca.value;
    campoBusca.placeholder = placeholders[tipo] || "Digite para buscar";
  }

  function atualizarMenuTipoBusca() {
    const itemRepresentante = menuTipoBusca.querySelector(
      '.menu-item[data-tipo="representante"]'
    );

    if (!itemRepresentante) return;

    if (window.exibirRepresentante) {
      itemRepresentante.classList.remove("oculto");
    } else {
      itemRepresentante.classList.add("oculto");

      // se estava selecionado, volta pra Nota Fiscal
      if (tipoBusca.value === "representante") {
        tipoBusca.value = "nota";
        labelTipoBusca.innerText = "📄 Nota Fiscal";
        atualizarPlaceholderBusca();
      }
    }
    atualizarItemAtivoMenu();
  }



  /* ================= TIPO DE BUSCA ================= */
  btnTipoBusca.onclick = (e) => {
  e.stopPropagation(); // 🔥 evita fechar imediatamente
  menuTipoBusca.classList.toggle("oculto");
  atualizarItemAtivoMenu();
};

      // visual ativo
      menuTipoBusca.querySelectorAll(".menu-item").forEach(item => {
    item.onclick = () => {

      const tipo = item.dataset.tipo;

      tipoBusca.value = tipo;
      labelTipoBusca.innerText = item.innerText;

   

      atualizarPlaceholderBusca();
      campoBusca.value = "";


      filtrar();
      atualizarItemAtivoMenu();
      menuTipoBusca.classList.add("oculto");
    };
  });


  // fecha ao clicar fora
  document.addEventListener("click", e => {
  const dentroDoCampo = e.target.closest(".campo-busca-wrapper");

  if (!dentroDoCampo) {
    menuTipoBusca.classList.add("oculto");
  }
});



  /* ================= UTIL ================= */
  function saudacaoPorHorario() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia,";
    if (h < 18) return "Boa tarde,";
    return "Boa noite,";
  }

  function hashSimples(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h >>> 0; // 🔥 força unsigned (corrige o ADM)
  }

  const HASH_ADM = 3872595084; // <-- use EXATAMENTE o número do console



  function normalizarTextoOrdenacao(txt) {
    if (!txt) return "";

    // remove tudo até o terceiro hífen
    // exemplo: "1 - Pilotagem - PUNHO AP INFINITY BCO 1Q"
    // vira: "PUNHO AP INFINITY BCO 1Q"
    const descricao = txt.replace(/^.*?-\s*.*?-\s*/,"");

    return descricao
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }



  function normalizar(v) {
    return v
      ?.toString()
      .normalize("NFD")                 // quebra caracteres compostos
      .replace(/[\u0300-\u036f]/g, "")  // remove acentos
      .replace(/\uFE0F/g, "")           // 🔥 remove variation selector do emoji
      .replace(/⚠/g, "")                // 🔥 remove o emoji em si
      .trim()
      .toUpperCase();
  }


  function parseDataBR(data) {
    if (!data) return new Date(0);
    const [dia, mes, ano] = data.split("/");
    return new Date(ano, mes - 1, dia);
  }

  /* ================= SCROLL ================= */
  function travarScroll() {
    document.body.style.overflow = "hidden";
  }
  function liberarScroll() {
    document.body.style.overflow = "";
  }

  /* ================= CSV ================= */
Papa.parse(url, {
  download: true,
  skipEmptyLines: true,
  complete: (res) => {
    dados = res.data.slice(1);
    csvCarregado = true;
    

    // 🔥 habilita o login só agora
    btnLogin.disabled = false;
  }
});

  /* ================= LOGIN ================= */
document.addEventListener("DOMContentLoaded", function () {
  const formLogin = document.getElementById("formLogin");
  const erroLogin = document.getElementById("erroLogin");

  if (!formLogin) return;

  formLogin.addEventListener("submit", async function (e) {

    e.preventDefault();

const usuario = document.getElementById("usuarioLogin").value.trim();
const senha = document.getElementById("senhaLogin").value.trim();

erroLogin.innerText = "Validando login...";

const usuarioLower = usuario.toLowerCase();
const acessoTotal = usuariosFullAccess.includes(usuarioLower);

// valida CSV
if (!csvCarregado) {
  erroLogin.innerText = "Aguarde carregando dados...";
  return;
}



// 🔥 ACESSO DIRETO (SEM API)

    try {

  const resposta = await fetch("http://127.0.0.1:8000/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: usuario,
    password: senha
  })
});

let data = {};
let codigo = null;

try {
  data = await resposta.json();
  codigo = data?.seller_code || null;

  
} catch (e) {
  console.warn("Erro ao ler JSON:", e);
  codigo = null;
}

// 🔴 se for erro de login REAL (401) → bloqueia
if (resposta.status === 401) {
  erroLogin.innerText = "Usuário ou senha inválidos";
  return;
}

// 🟡 se for 404 (sem vendedor)
if (resposta.status === 404) {
  console.warn("Usuário sem vendedor:", data);

  if (!acessoTotal) {
    erroLogin.innerText = "Usuário sem código de vendedor.";
    return;
  }

  // 🔓 acesso total → deixa passar
  codigo = null;
}

// 🟢 qualquer outro caso OK
codigoVendedorAPI = codigo;

// 🔥 se NÃO tem código mas é FULL ACCESS → LIBERA
if (!codigo && !acessoTotal) {
  erroLogin.innerText = "Usuário sem código de vendedor.";
  return;
}

// 🔥 pega código
codigoVendedorAPI = codigo || null;

const vendedorAPI = (codigoVendedorAPI || "").trim().toUpperCase();

console.log("Código vendedor API:", codigoVendedorAPI);

console.log("Código vendedor escolhido:", codigoVendedorAPI);

console.log("Filtrando dados para o vendedor:", codigoVendedorAPI);

window.exibirCliente = true;
window.exibirRepresentante = true;

console.log("Marca logada:", window.marcaLogada);

if (!csvCarregado) {
  console.warn("CSV ainda não carregado");
  return;
}

console.log("exibirCliente:", window.exibirCliente);
if (acessoTotal) {
  console.log("🔓 Acesso total liberado para:", usuarioLower);

  dadosVendedora = [...dados]; // 🔥 pega tudo

  window.isAdmin = true;
  window.exibirCliente = true;
  window.exibirRepresentante = true;

} else {
  dadosVendedora = dados.filter((l) => {
    const vendedorPlanilha = (l[22] || "").trim().toUpperCase();
    return vendedorPlanilha === vendedorAPI;
  });
    // ⚠️ Se não houver dados, bloqueia
    if (!dadosVendedora.length) {
      erroLogin.innerText = "Vendedor não encontrado na base.";
      return;
    }

}

console.log("TOTAL FILTRADO:", dadosVendedora.length);

// 🚨 VALIDA PRIMEIRO
if (!dadosVendedora.length) {
  erroLogin.innerText = "Vendedor não encontrado na base.";
  return;
}

// 🔥 👉 COLE AQUI (EXATAMENTE AQUI)
const marcaPlanilha = (dadosVendedora[0][24] || "")
  .toUpperCase()
  .trim();

  // 🔥 LIMPA TEMAS
// 🔥 LIMPA TEMAS
document.body.classList.remove("tema-luara", "tema-quatrok", "tema-direto");

// 🔥 APLICA TEMA DIRETO PARA FULL ACCESS
if (acessoTotal) {
  document.body.classList.remove(
    "tema-luara",
    "tema-quatrok",
    "tema-direto"
  );

  document.body.classList.add("tema-direto");

  window.marcaLogada = "DIRETO";
}

// 🔥 DEFINE TEMA + LOGOS
if (marcaPlanilha.includes("LUARA")) {
  window.marcaLogada = "LUARA";
  document.body.classList.add("tema-luara");

  // ✅ LOGIN
  logoMarca.src = "/Imagens/luara branco.png";

  // ✅ SISTEMA (🔥 FALTAVA ISSO)
  if (logoMarcaBox) {
    logoMarcaBox.src = "/Imagens/luara branco.png";
  }

} else if (marcaPlanilha.includes("4K")) {
  window.marcaLogada = "4K";
  document.body.classList.add("tema-quatrok");

  logoMarca.src = "/Imagens/4k BRANCO.png";

  if (logoMarcaBox) {
    logoMarcaBox.src = "/Imagens/4k BRANCO.png";
  }

} else {
  console.warn("Marca não identificada:", marcaPlanilha);

  // fallback
  logoMarca.src = "/Imagens/4k BRANCO.png";

  if (logoMarcaBox) {
    logoMarcaBox.src = "/Imagens/Logo - Grupo 4k - Branco.png";
  }
}
// prossegue para mostrar cards, boas-vindas, gráfico etc.
erroLogin.innerText = "";

atualizarNotificacoes();

console.log("TOTAL FILTRADO:", dadosVendedora.length);
erroLogin.innerText = "";
     iniciarSistema(usuario, acessoTotal);

    } catch (erro) {

      console.error("Erro no login:", erro);

      
      erroLogin.innerText =
        "Erro ao conectar com o servidor de autenticação.";

    }

  });

});

  if (btnAnalises) {
    btnAnalises.addEventListener("click", () => {
      window.open("pag01.html", "_blank");
    });
  }

  const btnNotificacoes = document.getElementById("btnNotificacoes");
  const contadorNotificacoes = document.getElementById("contadorNotificacoes");

  function atualizarNotificacoes() {
    // 🔥 filtra apenas pendentes
    const pendentes = dadosVendedora.filter(l =>
      normalizar(l[26]).includes("PENDENTE")
    );

    // 🔥 AGRUPA POR RASTREIO (IGUAL AO CARD)
    const grupos = agruparPorRastreio(pendentes);

    contadorNotificacoes.innerText = grupos.length;

    const deveMostrarBotao =
      window.marcaLogada === "LUARA" || grupos.length > 0;

    btnNotificacoes.classList.toggle("oculto", !deveMostrarBotao);

    if (!listaNotificacoes) return;

    if (!grupos.length) {
      listaNotificacoes.innerHTML =
        "<p style='text-align:center'>Nenhuma notificação no momento.</p>";
      return;
    }

    grupos.forEach(grupo => {
      const l = grupo[0];

      // 🔥 CONSOLIDAÇÃO IGUAL AO CARD
      const notasUnicas = [...new Set(grupo.map(i => i[0]))];
      const labelNota = notasUnicas.length === 1 ? "Nota" : "Notas";

      const situacaoTexto = normalizar(l[25] || "");

      const div = document.createElement("div");

      let classeAlerta = "";
      if (situacaoTexto.includes("AGUARDANDO RETIRADA")) {
        classeAlerta = "alerta-retirada";
      }

      div.className = `notificacao-item ${classeAlerta}`;

      div.innerHTML = `
        <strong>${labelNota}:</strong> ${notasUnicas.join(", ")}<br>
        <strong>Cliente:</strong> ${l[19]}<br>
        <strong>Situação:</strong> ${l[25]}
      `;

      // 👉 abre exatamente o mesmo grupo do card
      div.onclick = () => {
        fecharNotificacoes();
        abrirDetalhes(grupo);
      };

      listaNotificacoes.appendChild(div);
    });
  }
function mostrarAlerta(mensagem, tempo = 3000) {
  const alerta = document.getElementById("alertaTela");
  if (!alerta) return;

  alerta.innerText = mensagem;
  alerta.classList.add("show");
  alerta.classList.remove("oculto");

  setTimeout(() => {
    alerta.classList.remove("show");
    setTimeout(() => alerta.classList.add("oculto"), 300);
  }, tempo);
}

  const overlayNotificacoes = document.getElementById("overlayNotificacoes");
  const listaNotificacoes = document.getElementById("listaNotificacoes");

btnNotificacoes.onclick = (e) => {
  e.stopPropagation(); // evita conflito com clique fora

  const aberto = overlayNotificacoes.classList.contains("show");

  if (aberto) {
    fecharNotificacoes();
    return;
  }

  overlayNotificacoes.classList.remove("oculto");
  overlayNotificacoes.classList.add("show");

  const painelNotif = overlayNotificacoes?.querySelector(".painel-detalhes");

  if (painelNotif) {
    painelNotif.classList.add("modo-legenda");
  }


  travarScroll();
};

document.addEventListener("click", (e) => {
  const clicouDentro = e.target.closest("#overlayNotificacoes, #btnNotificacoes");

  if (!clicouDentro && overlayNotificacoes.classList.contains("show")) {
    fecharNotificacoes();
  }
});

function fecharNotificacoes() {
  overlayNotificacoes.classList.add("oculto");
  overlayNotificacoes.classList.remove("show");

  const painel = overlayNotificacoes?.querySelector(".painel-detalhes");

  if (painel) {
    painel.classList.remove("modo-legenda");
  }

  liberarScroll();
}

  /* ================= FILTRO ================= */
  campoBusca.oninput = () => {
    const temBusca = campoBusca.value.trim().length > 5;

    document.body.classList.toggle("modo-busca", temBusca);

    filtrar();
  };


  function filtrar() {
    let lista = [...dadosVendedora];
    const termo = campoBusca.value.trim();

  if (termo) {
    const tipo = tipoBusca.value;

    lista = lista.filter(l => {
      switch (tipo) {
        case "nota":
          return l[0]?.includes(termo); // Nota Fiscal

        case "pedido":
          return l[14]?.includes(termo); // Pedido

        case "cliente":
          return l[18]?.includes(termo); // Nº Cliente

        case "representante":
          return l[20]?.includes(termo); // Nº Representante

        default:
          return false;
      }
    });
  }


if (situacoesSelecionadas.length > 0) {
  lista = lista.filter(l => {
    const situacao = normalizar(l[26]);

    return situacoesSelecionadas.some(status => {

      if (status === "ENTREGUE") {
        return situacao.includes("ENTREGUE");
      }

      if (status === "RETORN") {
        return situacao.includes("RETORN") || situacao.includes("DEVOL");
      }

      if (status === "PENDENTE") {
        return situacao.includes("PENDENTE");
      }

      return false;
    });

  });
}

    renderizar(lista);
    atualizarCardsDashboard();
  }

 function atualizarCardsDashboard() {
  let entregue = 0;
  let pendente = 0;  
  let retornado = 0;

  
  const grupos = agruparPorRastreio(dadosVendedora);

  grupos.forEach(grupo => {
    const situacao = normalizar(grupo[0][26] || "");

    if (situacao.includes("PENDENTE")) pendente++;
    else if (situacao.includes("ENTREGUE")) entregue++;
    else if (
      situacao.includes("RETORN") ||
      situacao.includes("DEVOL")
    ) retornado++;
  });

  document.getElementById("totalPendentes").innerText = pendente;
  document.getElementById("totalEntregues").innerText = entregue;
  document.getElementById("totalRetornados").innerText = retornado;
  const total = grupos.length;
document.getElementById("totalGeral").innerText = total;
}

let situacoesSelecionadas = [];

document.querySelectorAll(".card-status").forEach(card => {
  card.addEventListener("click", () => {
    const status = card.dataset.status;

    // TOTAL limpa tudo
    if (status === "TOTAL") {
      situacoesSelecionadas = [];

      document.querySelectorAll(".card-status").forEach(c =>
        c.classList.remove("ativo")
      );

      card.classList.add("ativo");
    } else {
      // 🔥 deixa só UM selecionado
      situacoesSelecionadas = [status];

      document.querySelectorAll(".card-status").forEach(c =>
        c.classList.remove("ativo")
      );

      card.classList.add("ativo");
    }

    filtrar();
    atualizarCardsDashboard();
  });
});
  /* ================= AGRUPAR ================= */
  function agruparPorRastreio(lista) {
    const mapa = {};

    lista.forEach(l => {
      const rastreio = l[1] || "SEM_RASTREIO";

      if (!mapa[rastreio]) mapa[rastreio] = [];
      mapa[rastreio].push(l);
    });

    return Object.values(mapa);
  }


  /* ================= RENDER ================= */
  function renderizar(lista) {
    resultado.innerHTML = "";
    let grupos = agruparPorRastreio(lista);


    // 🔒 ORDEM FIXA: MAIS RECENTE PRIMEIRO
    // 🔒 PRIORIDADE + ORDEM POR DATA
  grupos.sort((a, b) => {
    const situacaoA = normalizar(a[0][25] || "");
    const situacaoB = normalizar(b[0][25] || "");

    const prioridadeA = situacaoA.includes("AGUARDANDO RETIRADA") ? 0 : 1;
    const prioridadeB = situacaoB.includes("AGUARDANDO RETIRADA") ? 0 : 1;

    // 1º: prioridade (aguardando retirada sempre em cima)
    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB;
    }

    // 2º: mais recente primeiro
    const dataA = Math.max(...a.map(i => parseDataBR(i[5])));
    const dataB = Math.max(...b.map(i => parseDataBR(i[5])));
    return dataB - dataA;
  });


    

    grupos.forEach(grupo => {
      const l = grupo[0];
        // 🔥 DADOS CONSOLIDADOS DO GRUPO (POR RASTREIO)
    const notasUnicas = [...new Set(grupo.map(i => i[0]))];
    const pedidosUnicos = [...new Set(grupo.map(i => i[14]))];
    const rastreio = l[1] || "Não informado";
    const labelNota = notasUnicas.length === 1 ? "Nota" : "Notas";
    const labelPedido = pedidosUnicos.length === 1 ? "Pedido" : "Pedidos";
   // ================= TIPO DE ENVIO (COLUNA C) =================
    const tipoEnvio = normalizar(l[2] || "");
    let iconeEnvio = "";

  if (tipoEnvio.includes("SEDEX PAG")) {
    iconeEnvio =
      `<img src="/Imagens/sedexcobrar.png" class="icone-envio" alt="SEDEX PAG. ENTREGA">`;
  }
  else if (tipoEnvio.includes("SEDEX")) {
    iconeEnvio =
      `<img src="/Imagens/sedex.png" class="icone-envio" alt="SEDEX">`;
  }
  else if (tipoEnvio.includes("PAC")) {
    iconeEnvio =
      `<img src="/Imagens/pac.png" class="icone-envio" alt="PAC">`;
  }


      const codigoCliente = l[18] || "-";
      const nomeCliente = l[19] || l[7] || "-";

      const numeroRepresentante = l[20] || "-";
      const nomeRepresentante = l[21] || "-";

      const card = document.createElement("div");

      const situacao = normalizar(l[26]);
      
      // 🔴 ALERTA: aguardando retirada no endereço indicado (coluna 25)
      const situacaoTexto = normalizar(l[25]);

      // ================= FAIXA LATERAL (ENTREGUE / RETORNOU) =================
  const dataStatus = l[27]; // 🔥 coluna da DATA (ajuste se for outra)

  let faixaHTML = "";

  if (situacao.includes("ENTREGUE") && dataStatus) {
    faixaHTML = `
      <div class="faixa-status entregue">
        <span>ENTREGUE</span>
        <small>${dataStatus}</small>
      </div>
    `;
  }
  else if (
    situacao.includes("RETORN") ||
    situacao.includes("DEVOL")
  ) {
    faixaHTML = `
      <div class="faixa-status retornou">
        <span>RETORNOU</span>
        <small>${dataStatus || ""}</small>
      </div>
    `;
  }
  else if (situacao.includes("PENDENTE")) {
    faixaHTML = `
      <div class="faixa-status pendente">
        <span>PENDENTE</span>
      </div>
    `;
  }
      const temAlertaRetirada =
        situacaoTexto.includes("AGUARDANDO RETIRADA");


      let classeStatus = "outro";

      if (situacao.includes("ENTREGUE")) {
        classeStatus = "entregue";
      } 
      else if (situacao.includes("PENDENTE")) {
        classeStatus = "pendente";
      } 
      else if (
        situacao.includes("RETORN") ||
        situacao.includes("DEVOL")
      ) {
        classeStatus = "retornado";
      }

      card.className = `card ${classeStatus}`;

      card.onclick = () => abrirDetalhes(grupo);
      const codigoVendedorCard = l[22] || "-";
      const nomeVendedorCard = l[23] || "-";


      card.innerHTML = `
      ${faixaHTML}

      ${iconeEnvio}

      ${temAlertaRetirada ? `<div class="alerta-retirada">📦⛔</div>` : ""}

      <div class="linhacard">


        <strong>${labelNota}:</strong> ${notasUnicas.join(" / ")}<br>
        <strong>${labelPedido}:</strong> ${pedidosUnicos.join(" / ")}<br><br>


        ${window.isAdmin ? `
    <div class="card-vendedor">
      <strong>Vendedor:</strong>
      ${codigoVendedorCard} - ${nomeVendedorCard}
    </div>
  ` : ""}


        <div class="cardcliente">
          ${window.exibirCliente ? `
          <strong>Cliente: </strong>${nomeCliente}<br>
          ` : ""}
        </div>

        <div class="cardrepresentante">
        ${window.exibirRepresentante ? `
        <span class="linha-representante">
          <strong>Representante:</strong>
          ${nomeRepresentante}
        </span><br><br>
        ` : ""}</div>
        
        <div class="cardsituacao">
        <strong>Situação:</strong>
        <span class="situacao ${temAlertaRetirada ? "aguardando-retirada" : ""}">
          ${l[25]}
        </span><br></div>

        <strong>Itens:</strong> ${grupo.length}
    </div>
  `;

      resultado.appendChild(card);
    });
  }

 
  /* ================= DETALHES ================= */
  function abrirDetalhes(grupo) {
    grupo.sort((a, b) => {
    return prioridadeDescricao(a[17]) 
        - prioridadeDescricao(b[17]);
  });
    const l = grupo[0];
    // 🔥 CONSOLIDAÇÃO POR RASTREIO (IGUAL AO CARD)
  const notasUnicas = [...new Set(grupo.map(i => i[0]))];
  const pedidosUnicos = [...new Set(grupo.map(i => i[14]))];

  const labelNota = notasUnicas.length === 1 ? "Nota Fiscal" : "Notas Fiscais";
  const labelPedido = pedidosUnicos.length === 1 ? "Pedido" : "Pedidos";

    // ================= TIPO DE ENVIO (DETALHES) =================
  const tipoEnvio = normalizar(l[2] || "");
  let iconeEnvioDetalhes = "";

  if (tipoEnvio.includes("SEDEX PAG")) {
    iconeEnvioDetalhes =
      `<img src="/Imagens/sedexcobrar.png" class="icone-envio-detalhes" alt="SEDEX PAG. ENTREGA">`;
  }
  else if (tipoEnvio.includes("SEDEX")) {
    iconeEnvioDetalhes =
      `<img src="/Imagens/sedex.png" class="icone-envio-detalhes" alt="SEDEX">`;
  }
  else if (tipoEnvio.includes("PAC")) {
    iconeEnvioDetalhes =
      `<img src="/Imagens/pac.png" class="icone-envio-detalhes" alt="PAC">`;
  }




    const uf = l[11] || "-";
    const estado = l[12] || "-";

    const codigoCliente = l[18] || "-";
    const nomeCliente = l[19] || l[7] || "-";

    const numeroRepresentante = l[20] || "-";
    const nomeRepresentante = l[21] || "-";

    const rastreio = l[1] || "Não informado";
    const temScroll = grupo.length > 2;

    conteudoDetalhes.innerHTML = `
      <div class="detalhes-centro">
    ${iconeEnvioDetalhes}

    <h3>Detalhes da Nota</h3>

        <div class="linha-dupla">
    <span>
      <strong>${labelNota}:</strong>
      ${notasUnicas.join(" / ")}
    </span>
    <span>
      <strong>${labelPedido}:</strong>
      ${pedidosUnicos.join(" / ")}
    </span>
  </div>


        <div class="linha-rastreio-central">
          <strong>Rastreio:</strong>
          <span>${rastreio}</span>
          ${rastreio !== "Não informado"
            ? `<button onclick="rastrearCorreios('${rastreio}')">📦 Rastrear</button>`
            : ""}
        </div>

              ${window.exibirCliente ? `
        <p>
          <strong>Cliente:</strong>
          ${codigoCliente} - ${nomeCliente}
        </p>
      ` : ""}

          ${window.exibirRepresentante ? `
            <p class="linha-representante">
              <strong>Representante:</strong>
              ${numeroRepresentante} - ${nomeRepresentante}
            </p>
          ` : ""}
                  ${window.exibirCliente ? `
            <p>
              <strong>Localização:</strong>
              ${uf} / ${estado}
            </p>
          ` : ""}

          <strong>Situação:</strong>
          <span class="situacao ${
            normalizar(l[25]).includes("AGUARDANDO RETIRADA")
              ? "aguardando-retirada"
              : ""
          }">
            ${l[25]}
          </span>
        </p>


        <div class="linha-dupla">
          <span><strong>Postagem:</strong> ${l[5] || "-"}</span>
          <span><strong>Prazo:</strong> ${l[13] || "-"}</span>
        </div>

        <hr>
        <p>
              <div class="amenv">
              <strong>Amostras Enviadas</strong>
              </div>
            </p>

        <ul class="lista-itens ${temScroll ? "lista-scroll" : ""}">
  ${[...grupo]
    .sort((a, b) => {
      const p =
        prioridadeDescricao(a[17]) - prioridadeDescricao(b[17]);
      if (p !== 0) return p;

      const da = normalizarTextoOrdenacao(a[15]);
      const db = normalizarTextoOrdenacao(b[15]);
      return da.localeCompare(db, "pt-BR");
    })
  .map(i => `
    <li>${formatarAmostraDetalhe(i)}</li>
  `)

    .join("")}

  </ul>

      </div>
    `;
      const painel = overlay.querySelector(".painel-detalhes");
    painel.style.animation = "none";
    painel.offsetHeight; // força reflow
    painel.style.animation = "";
    overlay.classList.add("show");
    overlay.classList.remove("oculto");
    travarScroll();
  }


  function prioridadeDescricao(texto) {
    const t = normalizar(texto || "");

    if (t.includes("PILOTAGEM")) return 1;
    if (t.includes("BANDEIRA")) return 2;
    if (t.includes("CARTELA")) return 3;

    return 99;
  }


  /* ================= FECHAR ================= */
  function fecharDetalhes() {
    const painel = overlay.querySelector(".painel-detalhes");

    // ativa animação de saída
    painel.classList.add("saindo");

    // espera a animação terminar
    setTimeout(() => {
      overlay.classList.remove("show");
      overlay.classList.add("oculto");
      painel.classList.remove("saindo");
      liberarScroll();
    }, 300); // mesmo tempo do CSS
  }


  overlay.addEventListener("click", e => {
    if (e.target === overlay) fecharDetalhes();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("show")) {
      fecharDetalhes();
    }
  });

  /* ================= RASTREIO ================= */
  function rastrearCorreios(codigo) {
    navigator.clipboard.writeText(codigo);
    window.open(
      `https://rastreamento.correios.com.br/app/index.php?objetos=${codigo}`,
      "_blank"
    );
  }

  // usuários que podem ver o analytics
  function controlarAnalytics(usuario) {
  const usuariosAnalytics = ["v.santos", "kcipriano"];
  const btn = document.getElementById("btnAnalytics");

  if (!btn) return;

  const user = usuario?.trim().toLowerCase();

  if (usuariosAnalytics.includes(user)) {
    btn.classList.remove("oculto");
  } else {
    btn.classList.add("oculto");
  }
}

function iniciarSistema(usuario, acessoTotal) {
  // mostra sistema
  loginBox.classList.add("oculto");
  sistema.classList.remove("oculto");
  resultado.classList.remove("oculto");
  document.getElementById("boxFiltros").classList.remove("oculto");

  // boas-vindas
  boasVindas.innerHTML =
    `${saudacaoPorHorario()} <strong>${usuario}</strong><br>
    ${acessoTotal ? "Acesso total liberado." : "Abaixo, seus envios."}`;

  // ativa campos de busca
  campoBusca.disabled = false;
  btnTipoBusca.disabled = false;

  // renderiza cards
  filtrar();

  // controla analytics
  controlarAnalytics(usuario.toLowerCase());
}