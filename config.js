// =====================================================
// CONFIGURAÇÃO CENTRAL DO SISTEMA
// =====================================================

const CONFIG = {

    


    // =================================================
    // BACKEND
    // =================================================

    API: {

        // Endereço do computador onde o FastAPI está rodando
        BASE_URL: "http://10.70.4.212:8000",

        // Endpoints disponíveis
        ENDPOINTS: {
            LOGIN: "/login",
            PERMISSOES: "/permissoes"
        }
    },


    // =================================================
    // ADMINISTRADOR
    // =================================================

    ADMIN: {

        // Usuário que possui acesso administrativo
        USUARIO_MASTER: "v.santos"
    },


    // =================================================
    // GOOGLE SHEETS
    // =================================================

    PLANILHA: {

        // Planilha publicada como CSV
        URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7og0_9fNfXHoINFiE-s75rCPc-RIqAFLwcl8dQqMvEKXimWrMfgQz30QxPKul8_1Cf8RB4YSoizJy/pub?gid=0&single=true&output=csv"
    }

};