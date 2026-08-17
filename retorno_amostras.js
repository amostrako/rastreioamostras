async function carregarPermissoes() {
  try {
    const resp = await fetch("./backend/permissoes.json");
    permissoes = await resp.json();

    console.log("Permissões carregadas:", permissoes);

  } catch (e) {
    console.error("Erro ao carregar permissões", e);
  }
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
document.addEventListener("click", function (e) {
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
        (paginaAtual.includes("retorno_amostras.html") && btn.textContent.includes("Retorno de Amostras")) ||
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
