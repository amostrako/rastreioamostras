const API_BASE_URL = "http://10.70.4.212:8000";

document.addEventListener("DOMContentLoaded", function () {

    const formLogin = document.getElementById("formLogin");
    const erroLogin = document.getElementById("erroLogin");

    const usuarioMaster =
        CONFIG.ADMIN.USUARIO_MASTER.toLowerCase();

    const urlCSV =
        CONFIG.PLANILHA.URL;


    formLogin.addEventListener("submit", async function (e) {

        e.preventDefault();

        const usuario =
            document.getElementById("usuarioLogin").value.trim();

        const senha =
            document.getElementById("senhaLogin").value.trim();

        erroLogin.innerText = "Validando login...";

        const acessoTotal =
            usuario.toLowerCase() === usuarioMaster;

        try {

            const resposta = await fetch(
                `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.LOGIN}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: usuario,
                        password: senha
                    })
                }
            );

            let data = {};
            let codigo = null;

            try {

                data = await resposta.json();

                codigo =
                    data?.seller_code || null;

            } catch {

                codigo = null;

            }

            if (resposta.status === 401) {

                erroLogin.innerText =
                    "Usuário ou senha inválidos";

                return;
            }

            if (resposta.status === 404 && !acessoTotal) {

                erroLogin.innerText =
                    "Usuário sem código de vendedor.";

                return;
            }

            erroLogin.innerText =
                "Carregando pedidos...";

            Papa.parse(urlCSV, {

                download: true,

                skipEmptyLines: true,

                complete: function (res) {

                    const dados =
                        res.data.slice(1);


                    let dadosFiltrados = [];

                    if (acessoTotal) {

                        dadosFiltrados =
                            dados;

                    }

                    else {

                        dadosFiltrados =
                            dados.filter(linha => {

                                return linha[22] === codigo;

                            });

                    }

                    localStorage.setItem(
                        "dadosFiltrados",
                        JSON.stringify(dadosFiltrados)
                    );


                    localStorage.setItem(
                        "usuarioLogado",
                        usuario
                    );


                    localStorage.setItem(
                        "codigoVendedor",
                        codigo || ""
                    );


                    localStorage.setItem(
                        "acessoTotal",
                        acessoTotal
                    );

                    window.location.href =
                        "tela_inicio.html";

                },

                error: function () {

                    erroLogin.innerText =
                        "Erro ao carregar planilha.";

                }

            });


        }

        catch (erro) {

            console.error(
                "Erro ao conectar com o backend:",
                erro
            );

            erroLogin.innerText =
                "Servidor indisponível. Tente novamente mais tarde.";

        }

    });

});
const toggle = document.getElementById("toggleSenha");
const senha = document.getElementById("senhaLogin");
const eye = document.getElementById("iconEye");
const eyeOff = document.getElementById("iconEyeOff");

toggle.addEventListener("click", () => {
    const isPassword = senha.type === "password";

    senha.type = isPassword ? "text" : "password";

    eye.style.display = isPassword ? "none" : "block";
    eyeOff.style.display = isPassword ? "block" : "none";
});