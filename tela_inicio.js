// =====================================================
// CONFIGURAÇÃO
// =====================================================

const API_URL =
    `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.PERMISSOES}`;


// =====================================================
// CACHE DE PERMISSÕES
// =====================================================

let cachePermissoes = null;


// =====================================================
// LOADING
// =====================================================

function mostrarLoading() {
    document.body.classList.add("loading");
}


function esconderLoading() {
    document.body.classList.remove("loading");
}


// =====================================================
// OBTER PERMISSÕES
// =====================================================

async function obterPermissoes() {

    // -------------------------------------------------
    // Retorna o cache se já carregado
    // -------------------------------------------------

    if (cachePermissoes) {
        return cachePermissoes;
    }


    try {

        console.log(
            "🔄 Buscando permissões do backend..."
        );


        // -------------------------------------------------
        // Consulta ao backend
        // -------------------------------------------------

        const res = await fetch(
            API_URL + "?t=" + Date.now()
        );


        if (!res.ok) {

            throw new Error(
                "Erro HTTP: " + res.status
            );

        }


        const data = await res.json();


        console.log(
            "✅ Permissões carregadas:",
            data
        );


        // -------------------------------------------------
        // Controle de versão
        // -------------------------------------------------

        const versaoLocal =
            localStorage.getItem(
                "versaoPermissoes"
            );


        const usuario =
            localStorage.getItem(
                "usuarioLogado"
            );


        const usuarioMaster =
            CONFIG.ADMIN.USUARIO_MASTER.toLowerCase();


        // -------------------------------------------------
        // Verifica se as permissões foram alteradas
        // -------------------------------------------------

        if (
            usuario?.toLowerCase() !== usuarioMaster
        ) {

            if (
                versaoLocal &&
                data.versao &&
                versaoLocal != data.versao
            ) {

                console.warn(
                    "🔒 Permissões alteradas → forçando logout"
                );


                localStorage.clear();


                if (
                    !window.location.pathname.includes(
                        "index.html"
                    )
                ) {

                    window.location.href =
                        "index.html";

                }


                return {
                    usuarios: {}
                };

            }

        }


        // -------------------------------------------------
        // Salva versão atual
        // -------------------------------------------------

        if (data.versao) {

            localStorage.setItem(
                "versaoPermissoes",
                data.versao
            );

        }


        // -------------------------------------------------
        // Salva no cache
        // -------------------------------------------------

        cachePermissoes = data;


        return data;

    }


    // =====================================================
    // BACKEND INDISPONÍVEL
    // =====================================================

    catch (e) {

        console.warn(
            "⚠️ Backend indisponível, usando fallback local"
        );


        const local =
            localStorage.getItem(
                "permissoes"
            );


        if (local) {

            try {

                const parsed =
                    JSON.parse(local);


                cachePermissoes =
                    parsed;


                return parsed;

            }
            catch (erroJSON) {

                console.error(
                    "❌ Erro ao ler permissões locais:",
                    erroJSON
                );

            }

        }


        return {
            usuarios: {}
        };

    }

}


// =====================================================
// SALVAR PERMISSÕES
// =====================================================

async function salvarPermissoes(data) {

    try {

        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        console.log(
            "💾 Permissões salvas no backend"
        );

    }
    catch (e) {

        console.warn(
            "⚠️ Salvando apenas local (offline)"
        );

    }


    // -------------------------------------------------
    // Backup local
    // -------------------------------------------------

    localStorage.setItem(
        "permissoes",
        JSON.stringify(data)
    );


    cachePermissoes =
        data;

}


// =====================================================
// VERIFICAR PERMISSÃO DE TELA
// =====================================================

async function temPermissaoTela(usuario, tela) {

    const permissoes =
        await obterPermissoes();


    const user =
        usuario?.trim().toLowerCase();


    const acessoTotal =
        localStorage.getItem(
            "acessoTotal"
        ) === "true";


    const usuarioMaster =
        CONFIG.ADMIN.USUARIO_MASTER.toLowerCase();


    // -------------------------------------------------
    // Administrador master
    // -------------------------------------------------

    if (
        user === usuarioMaster
    ) {

        return true;

    }


    // -------------------------------------------------
    // Usuário com acesso total
    // -------------------------------------------------

    if (acessoTotal) {

        return true;

    }


    // -------------------------------------------------
    // Configuração do usuário
    // -------------------------------------------------

    const config =
        permissoes?.usuarios?.[user];


    if (!config) {

        return false;

    }


    // -------------------------------------------------
    // Todas as telas
    // -------------------------------------------------

    if (
        Array.isArray(config.telas) &&
        config.telas.includes("*")
    ) {

        return true;

    }


    // -------------------------------------------------
    // Tela específica
    // -------------------------------------------------

    if (
        Array.isArray(config.telas)
    ) {

        return config.telas.includes(tela);

    }


    return false;

}


// =====================================================
// CONTROLAR MENU
// =====================================================

async function controlarMenu() {

    const usuario =
        localStorage.getItem(
            "usuarioLogado"
        );


    const botoes =
        document.querySelectorAll(
            "[data-tela]"
        );


    for (
        const btn of botoes
    ) {

        const tela =
            btn.dataset.tela;


        const permitido =
            await temPermissaoTela(
                usuario,
                tela
            );


        if (!permitido) {

            btn.classList.add(
                "desativado"
            );

        }
        else {

            btn.classList.remove(
                "desativado"
            );

        }


        // -------------------------------------------------
        // Não desabilita o botão.
        // A proteção é feita no clique.
        // -------------------------------------------------

        btn.disabled = false;

    }

}


// =====================================================
// PROTEGER NAVEGAÇÃO
// =====================================================

function protegerNavegacao() {

    const usuario =
        localStorage.getItem(
            "usuarioLogado"
        );


    const botoes =
        document.querySelectorAll(
            "[data-tela]"
        );


    botoes.forEach(
        btn => {

            btn.addEventListener(
                "click",
                async function () {

                    const tela =
                        btn.dataset.tela;


                    const link =
                        btn.dataset.link;


                    const permitido =
                        await temPermissaoTela(
                            usuario,
                            tela
                        );


                    if (!permitido) {

                        alert(
                            "Usuário sem permissão para acessar essa aba"
                        );

                        return;

                    }


                    if (link) {

                        window.location.href =
                            link;

                    }

                }
            );

        }
    );

}


// =====================================================
// PROTEÇÃO DE PÁGINA
// =====================================================

async function protegerPagina() {

    const usuario =
        localStorage.getItem(
            "usuarioLogado"
        );


    const telaAtual =
        window.location.pathname
            .split("/")
            .pop()
            .replace(
                ".html",
                ""
            );


    console.log(
        "📍 Tela atual:",
        telaAtual
    );


    // -------------------------------------------------
    // Tela inicial não precisa de permissão específica
    // -------------------------------------------------

    if (
        telaAtual === "tela_inicio"
    ) {

        return;

    }


    const permitido =
        await temPermissaoTela(
            usuario,
            telaAtual
        );


    console.log(
        "🔐 Permissão:",
        permitido
    );


    if (!permitido) {

        alert(
            "Você não tem acesso a essa página."
        );


        window.location.href =
            "tela_inicio.html";

    }

}


// =====================================================
// CARDS
// =====================================================

function configurarCards() {

    document
        .querySelectorAll(".card")
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const link =
                            card.dataset.link;


                        if (link) {

                            window.location.href =
                                link;

                        }

                    }
                );


                // -------------------------------------------------
                // Acessibilidade pelo teclado
                // -------------------------------------------------

                card.setAttribute(
                    "tabindex",
                    "0"
                );


                card.addEventListener(
                    "keydown",
                    e => {

                        if (
                            e.key === "Enter"
                        ) {

                            card.click();

                        }

                    }
                );

            }
        );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // -------------------------------------------------
        // Evita executar duas vezes
        // -------------------------------------------------

        if (
            window.__initPermissoesExecutado
        ) {

            return;

        }


        window.__initPermissoesExecutado =
            true;


        mostrarLoading();


        try {

            await controlarMenu();

            protegerNavegacao();

            await protegerPagina();

            configurarCards();

        }
        catch (e) {

            console.error(
                "❌ Erro geral:",
                e
            );

        }


        esconderLoading();

    }
);


// =====================================================
// ANIMAÇÃO DA PÁGINA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.body.classList.add(
            "fade-in"
        );

    }
);