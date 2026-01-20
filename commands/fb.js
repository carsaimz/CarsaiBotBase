const axios = require("axios");

async function baixarFacebook(url) {
    const headers = {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0"
    };

    try {
        const response = await axios.get(url, { headers });
        const html = response.data;

        const title = html.match(/<meta name="description" content="([^"]+?)"/)?.[1] || null;
        const views = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]
            ?.match(/([\d.,]+[ \u00A0]?[KM]?[ \u00A0]?(views|tayangan|vues))/i)?.[1] || null;
        const video_sd = html.match(/"browser_native_sd_url":"(.+?)",/)?.[1]?.replace(/\\/g, "");
        const video_hd = html.match(/"browser_native_hd_url":"(.+?)",/)?.[1]?.replace(/\\/g, "");
        const audio = html.match(/"mime_type":"audio\\\/mp4","codecs":"mp4a\.40\.5","base_url":"(.+?)",/)?.[1]?.replace(/\\/g, "");

        return {
            titulo: title,
            visualizacoes: views,
            video_sd: video_sd ? `https://www.facebook.com${video_sd}` : null,
            video_hd: video_hd ? `https://www.facebook.com${video_hd}` : null,
            audio: audio ? `https://www.facebook.com${audio}` : null
        };
    } catch (error) {
        console.error("❌ Erro no baixarFacebook():", error.message || error);
        throw new Error("Falha ao obter dados do Facebook.");
    }
}

module.exports = {
    nome: "facebook",
    descricao: "Baixa vídeos do Facebook.",
    categoria: "Download",
    exemplo: "!facebook https://facebook.com/video",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const url = texto.split(" ")[1];
        
        if (!url) {
            return await sock.sendMessage(from, {
                text: "📱 *Como usar o Facebook Downloader:*\n\n" +
                      "> !facebook <URL>\n\n" +
                      "*Exemplo:*\n" +
                      "```!facebook https://www.facebook.com/reel/123456789```\n\n" +
                      "*Nota:* Funciona com vídeos, reels e stories públicos."
            });
        }

        if (!url.includes("facebook.com") && !url.includes("fb.watch")) {
            return await sock.sendMessage(from, { 
                text: "❌ Por favor, forneça um link válido do Facebook." 
            });
        }

        try {
            await sock.sendMessage(from, { text: "⏳ Processando link do Facebook..." });
            
            const resultado = await baixarFacebook(url);
            
            if (!resultado.video_sd && !resultado.video_hd) {
                return await sock.sendMessage(from, { 
                    text: "❌ Não foi possível encontrar o vídeo. Verifique se o vídeo é público." 
                });
            }

            let mensagem = `📱 *Facebook Downloader*\n\n`;
            if (resultado.titulo) mensagem += `*📌 Título:* ${resultado.titulo}\n`;
            if (resultado.visualizacoes) mensagem += `*👁 Visualizações:* ${resultado.visualizacoes}\n\n`;
            
            mensagem += `*Links disponíveis:*\n`;
            if (resultado.video_hd) mensagem += `• HD: ${resultado.video_hd}\n`;
            if (resultado.video_sd) mensagem += `• SD: ${resultado.video_sd}\n`;
            if (resultado.audio) mensagem += `• Áudio: ${resultado.audio}`;

            await sock.sendMessage(from, { text: mensagem });

            // Tenta enviar o vídeo em SD (menor tamanho)
            if (resultado.video_sd) {
                try {
                    const response = await axios.get(resultado.video_sd, { responseType: 'arraybuffer' });
                    const videoBuffer = Buffer.from(response.data, 'binary');
                    
                    await sock.sendMessage(from, {
                        video: videoBuffer,
                        mimetype: 'video/mp4',
                        caption: "Vídeo baixado do Facebook"
                    });
                } catch (e) {
                    console.log("Não foi possível enviar o vídeo automaticamente");
                }
            }

        } catch (err) {
            await sock.sendMessage(from, {
                text: `❌ *Erro ao processar o vídeo*\n\n` +
                      `*Mensagem:* ${err.message}\n\n` +
                      `Verifique se o link está correto e o vídeo é público.`
            });
        }
    }
};