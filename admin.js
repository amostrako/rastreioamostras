    const TELAS = [
        "rastreio_amostra",
        "rankprod",
        "retorno_amostras",
        "relatorio",
        "analytics",
        "admin"
    ];

    // ================= UI =================
    async function carregarUI() {
        const container = document.getElementById("listaUsuarios");
        container.innerHTML = "";

        const permissoes = await obterPermissoes();

        if (!permissoes || !permissoes.usuarios) {
            console.error("Permissões inválidas:", permissoes);
            return;
        }

        Object.keys(permissoes.usuarios).forEach(usuario => {
            const userData = permissoes.usuarios[usuario];

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="col-usuario">
                    <span>${usuario}</span>
                </td>

                <td class="col-permissoes">

                    <label class="tag-supervisao">
                        ${["V00", "S50", "S55", "S00"].map(codigo => `
    <label class="tag-supervisao">
        <input type="checkbox"
            data-supervisao="${usuario}"
            value="${codigo}"
            ${
              userData.supervisao?.includes(codigo)
                ? "checked"
                : ""
            }
        >
        ${codigo}
    </label>
`).join("")}
                    </label>

                    ${TELAS.map(tela => `
                        <label class="tag-permissao">
                            <input type="checkbox"
                                data-usuario="${usuario}"
                                data-tela="${tela}"
                                ${userData.telas.includes("*") || userData.telas.includes(tela)
                    ? "checked"
                    : ""
                }>
                            ${tela}
                        </label>
                    `).join("")}

                </td>

                <td class="col-acoes">
                    <button class="btn-excluir" onclick="excluirUsuario('${usuario}')">🗑️</button>
                </td>
            `;

            container.appendChild(tr);
        });
    }

    // ================= SALVAR =================
    async function salvarPermissoesUI() {
        const checkboxes = document.querySelectorAll("#listaUsuarios input[type='checkbox']");
        const usuariosTemp = {};

        checkboxes.forEach(cb => {

            // 🔥 SUPERVISÃO
            if (cb.dataset.supervisao) {
                const usuario = cb.dataset.supervisao;

                if (!usuariosTemp[usuario]) {
                    usuariosTemp[usuario] = {
    telas: [],
    supervisao: []
};
                }

                if (cb.checked) {
    usuariosTemp[usuario].supervisao.push(cb.value);
}
                return;
            }

            // 🔥 TELAS
            const usuario = cb.dataset.usuario;
            const tela = cb.dataset.tela;

            if (!usuario || !tela) return;

            if (!usuariosTemp[usuario]) {
                usuariosTemp[usuario] = {
    telas: [],
    supervisao: []
};
            }

            if (cb.checked && !usuariosTemp[usuario].telas.includes(tela)) {
                usuariosTemp[usuario].telas.push(tela);
            }
        });

        // 🔥 PEGA CONFIG COMPLETA EXISTENTE
        const permissoesAtuais = await obterPermissoes();

        const novaConfig = {
            ...permissoesAtuais,
            usuarios: usuariosTemp
        };

        await salvarPermissoes(novaConfig);

        cachePermissoes = null;
        localStorage.removeItem("permissoes");

        await carregarUI();

        alert("Permissões atualizadas com sucesso!");
    }

    // ================= MODAL =================
    function abrirModalUsuario() {
        document.getElementById("modalUsuario").classList.remove("oculto");
    }

    function fecharModalUsuario() {
        document.getElementById("modalUsuario").classList.add("oculto");

        document.getElementById("modalNomeUsuario").value = "";

        document
            .querySelectorAll("#modalUsuario input[type='checkbox']")
            .forEach(cb => cb.checked = false);
    }

    // ================= CRIAR USUÁRIO =================
    async function salvarNovoUsuario() {
        const nome = document
            .getElementById("modalNomeUsuario")
            .value.trim()
            .toLowerCase();

        if (!nome) {
            alert("Digite um nome válido");
            return;
        }

        const checkboxes = document.querySelectorAll("#modalUsuario input[type='checkbox']");
        const telasSelecionadas = [];

        checkboxes.forEach(cb => {
            if (cb.checked && cb.value) {
                telasSelecionadas.push(cb.value);
            }
        });

        const supervisao = [];

document.querySelectorAll(".chkSupervisao").forEach(cb => {
    if (cb.checked) {
        supervisao.push(cb.value);
    }
});

        const permissoes = await obterPermissoes();

        if (permissoes.usuarios[nome]) {
            alert("Usuário já existe");
            return;
        }

        permissoes.usuarios[nome] = {
            telas: telasSelecionadas,
            supervisao: supervisao
        };

        await salvarPermissoes(permissoes);

        cachePermissoes = null;
        localStorage.removeItem("permissoes");

        await carregarUI();

        fecharModalUsuario();

        alert("Usuário criado com sucesso!");
    }

    // ================= EXCLUIR USUÁRIO =================
    async function excluirUsuario(usuario) {
        const usuarioLogado = localStorage.getItem("usuarioLogado");

        if (usuario === usuarioLogado) {
            alert("Você não pode excluir seu próprio usuário");
            return;
        }

        const confirmar = confirm(`Deseja realmente excluir o usuário "${usuario}"?`);
        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/${usuario}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (data.ok) {
                alert("Usuário excluído com sucesso!");

                cachePermissoes = null;
                localStorage.removeItem("permissoes");

                await carregarUI();

            } else {
                alert(data.erro || "Erro ao excluir usuário");
            }

        } catch (e) {
            console.error(e);
            alert("Erro na requisição");
        }
    }

    // ================= INIT =================
    document.addEventListener("DOMContentLoaded", () => {
        carregarUI();
    });