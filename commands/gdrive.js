const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeDrive(url) {
    try {
        if (!/drive\.google\.com\/file\/d\//gi.test(url)) {
            throw new Error("URL inválida do Google Drive");
        }
        
        const res = await axios.get(url, { 
            timeout: 30000, 
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
            } 
        }).then((v) => v.data);

        const $ = cheerio.load(res);
        const id = url.split("/")[5];
        
        const data = {
            nome: $("head").find("title").text().split("-")[0].trim(),
            download: `https://drive.usercontent.google.com/uc?id=${id}&export=download`,
            link: url,
            tamanho: $("head").find("meta[property='og:description']").attr("content") || "Desconhecido"
        };
        return data;
    } catch (e) {
        console.error("Erro no Google Drive:", e.message);
        throw new Error("Falha ao obter dados do Google Drive");
    }
}

module.exports = {
    nome: "gdrive",
    descricao: "Obtém links de download direto do Google Drive.",
    categoria: "Download",
    exemplo: "!gdrive https://drive.google.com/file/d/ID_DO_ARQUIVO",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const url = texto.split(" ")[1];
        
        if (!url) {
            return await sock.sendMessage(from, {
                text: "☁️ *Google Drive Downloader*\n\n" +
                      "> !gdrive <URL>\n\n" +
                      "*Exemplo:*\n" +
                      "```!gdrive https://drive.google.com/file/d/1ABC123XYZ/view```\n\n" +
                      "*Nota:* Funciona apenas com links públicos do Google Drive."
            });
        }

        if (!url.includes("drive.google.com")) {
            return await sock.sendMessage(from, { 
                text: "❌ Por favor, forneça um link válido do Google Drive." 
            });
        }

        try {
            await sock.sendMessage(from, { text: "⏳ Processando link do Google Drive..." });
            
            const resultado = await scrapeDrive(url);
            
            const mensagem = `📁 *Google Drive Downloader*\n\n` +
                            `*📌 Nome:* ${resultado.nome}\n` +
                            `*💾 Tamanho:* ${resultado.tamanho}\n` +
                            `*🔗 Link original:* ${resultado.link}\n` +
                            `*⬇️ Download direto:* ${resultado.download}\n\n` +
                            `*Instruções:* Copie o link de download e cole no navegador.`;

            await sock.sendMessage(from, { text: mensagem });

        } catch (err) {
            await sock.sendMessage(from, {
                text: `❌ *Erro ao processar o link*\n\n` +
                      `*Mensagem:* ${err.message}\n\n` +
                      `Verifique se:\n` +
                      `1. O link é válido\n` +
                      `2. O arquivo é público\n` +
                      `3. O link está no formato correto`
            });
        }
    }
};