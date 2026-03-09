const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7og0_9fNfXHoINFiE-s75rCPc-RIqAFLwcl8dQqMvEKXimWrMfgQz30QxPKul8_1Cf8RB4YSoizJy/pub?gid=0&single=true&output=csv";

const tabela = document.getElementById("listaAnalises");

Papa.parse(url, {
    download: true,
    skipEmptyLines: true,
    complete: res => {
        const dados = res.data.slice(1);
        renderizarTabela(dados);
    }
});

function renderizarTabela(dados) {
    tabela.innerHTML = "";

    // 🔥 agrupa por rastreio
    const grupos = {};

    dados.forEach(l => {
        const rastreio = l[1];
        if (!rastreio) return;

        if (!grupos[rastreio]) grupos[rastreio] = [];
        grupos[rastreio].push(l);
    });

    Object.values(grupos).forEach(grupo => {
        const l = grupo[0];

        const rastreio = l[1];

        const cliente =
            `${l[18]} - ${l[19]}`;

        const representante =
            `${l[20]} - ${l[21]}`;

        const vendedor =
            `${l[22]} - ${l[23]}`;

        // 🔥 soma valor por rastreio
        const valorTotal = grupo.reduce((soma, i) => {
            const v = parseFloat(
                (i[1] || "0").replace(",", ".")
            );
            return soma + (isNaN(v) ? 0 : v);
        }, 0);

        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${rastreio}</td>
      <td>${cliente}</td>
      <td>${representante}</td>
      <td>${vendedor}</td>
      <td>R$ ${valorTotal.toFixed(2)}</td>
      <td>🔍</td>
    `;

        tabela.appendChild(tr);
    });
}
