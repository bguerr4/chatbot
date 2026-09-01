/*
    classificador de emails academicos
    integracao com Gemini. 
    retorna um JSON com categoria, setor responsável e ação recomendada
*/

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

function escapeHtml(texto) { // remover caracteres especiais
    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function adicionarMensagem(texto, classe) { // add mensagem no html
    const textoEscapado = escapeHtml(texto);

    chat.innerHTML += `<div class="msg ${classe}" style="white-space: pre-wrap;">${textoEscapado}</div>`;
    chat.scrollTop = chat.scrollHeight;

    return chat.lastElementChild;
}

function formatarItem(item) { // separar json
    return `Categoria: ${item.categoria || "N/A"}\n` +
        `Setor responsável: ${item.setor_responsavel || "N/A"}\n` +
        `Ação recomendada: ${item.acao_recomendada || "N/A"}`;
}

function formatarClassificacao(dados) {
    if (Array.isArray(dados)) { // se forem multiplos assuntos
        return dados
            .map((item, i) => `Assunto ${i + 1}:\n${formatarItem(item)}`)
            .join("\n\n─────────────\n\n");
    }
    if (typeof dados === "object" && dados !== null) {
        return formatarItem(dados);
    }
    return String(dados);
}

function habilitarBotao(habilitado) {
    sendBtn.disabled = !habilitado;
}

async function chamarAPI(mensagem) { // chamar api
    const output = await fetch("/api/classificar", { // ver functions/api/chamar.js
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ mensagem })
    });
    const resposta = await output.json();
    const raw = resposta.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return JSON.parse(raw);
}

async function enviar() { // funcao principal
    if (sendBtn.disabled) {
        return;
    }

    const mensagem = input.value.trim();

    if (!mensagem) {
        return;
    }

    adicionarMensagem(mensagem, "user");
    input.value = "";
    habilitarBotao(false);

    const thinkingEl = adicionarMensagem("classificando...", "thinking");

    const resultado = await chamarAPI(mensagem); // joga a mensagem pro gemini
    thinkingEl.remove();
    adicionarMensagem(formatarClassificacao(resultado), "bot"); // passa os valores da mensagem pra formatarClassificacao()

    habilitarBotao(true);
}

// on doc load

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        enviar();
    }
});

habilitarBotao(true);