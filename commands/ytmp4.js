const axios = require('axios');

async function getVideoInfo(url) {
    const { data } = await axios.post(`https://api.ytmp4.fit/api/video-info`, { url }, {
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://ytmp4.fit',
            'Referer': 'https://ytmp4.fit/'
        }
    });

    if (!data || !data.title) throw new Error('Falha ao obter informações do vídeo.');
    return data;
}

async function getDownloadLink(url, quality) {
    const res = await axios.post(`https://api.ytmp4.fit/api/download`, { url, quality }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/octet-stream',
            'Origin': 'https://ytmp4.fit',
            'Referer': 'https://ytmp4.fit/'
        },
        responseType: 'arraybuffer'
    });

    const contentType = res.headers['content-type'];
    if (!contentType.includes('video')) throw new Error('Link de download não disponível.');

    return Buffer.from(res.data);
}

module.exports = {
    nome: "ytmp4",
    descricao: "Baixa vídeos do YouTube em formato MP4.",
    categoria: "Download",
    exemplo: "!ytmp4 https://youtube.com/watch?v=VIDEO_ID 360p",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const argumentos = texto.split(" ").slice(1);
        
        if (argumentos.length < 2) {
            return await sock.sendMessage(from, {
                text: "📼 *Como usar o YouTube Downloader:*\n\n" +
                      "> !ytmp4 <URL> <qualidade>\n\n" +
                      "*Exemplo:*\n" +
                      "```!ytmp4 https://youtube.com/watch?v=dQw4w9WgXcQ 360p```\n\n" +
                      "*Qualidades disponíveis:* 144p, 240p, 360p, 480p, 720p, 1080p"
            });
        }

        const url = argumentos[0];
        const qualidade = argumentos[1].toLowerCase();
        
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            return await sock.sendMessage(from, { 
                text: "❌ Por favor, forneça um link válido do YouTube." 
            });
        }

        try {
            await sock.sendMessage(from, { text: "⏳ Baixando vídeo, por favor aguarde..." });
            
            const info = await getVideoInfo(url);
            const videoBuffer = await getDownloadLink(url, qualidade);
            
            await sock.sendMessage(from, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                fileName: `${info.title.substring(0, 50)} - ${qualidade}.mp4`,
                caption: `🎬 *YouTube Downloader*\n\n` +
                         `*📌 Título:* ${info.title}\n` +
                         `*📺 Canal:* ${info.channel}\n` +
                         `*⏱ Duração:* ${info.duration}\n` +
                         `*👁 Visualizações:* ${info.views}\n` +
                         `*💾 Qualidade:* ${qualidade}`
            });

        } catch (err) {
            await sock.sendMessage(from, {
                text: `❌ *Falha ao baixar o vídeo*\n\n` +
                      `*Erro:* ${err.message}\n\n` +
                      `Verifique se o vídeo está disponível e a qualidade é suportada.`
            });
        }
    }
};