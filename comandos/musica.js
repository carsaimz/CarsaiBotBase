const config = require('../configuracao');
const ytdl = require('ytdl-core');

module.exports = {
    nome: "musica",
    descricao: "Baixa áudio do YouTube",
    categoria: "diversao",
    exemplo: "https://youtube.com/watch?v=...",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "❌ Envie o link do vídeo do YouTube.\nExemplo: !musica https://youtube.com/watch?v=..."
            });
        }
        
        const url = args[0];
        
        if (!ytdl.validateURL(url)) {
            return sock.sendMessage(from, { text: "❌ URL do YouTube inválida." });
        }
        
        try {
            const info = await ytdl.getInfo(url);
            
            await sock.sendMessage(from, { 
                text: `🎵 *Informações da Música*\n\n` +
                      `📀 *Título:* ${info.videoDetails.title}\n` +
                      `👤 *Artista/Canal:* ${info.videoDetails.author.name}\n` +
                      `⏱️ *Duração:* ${Math.floor(info.videoDetails.lengthSeconds / 60)}:${info.videoDetails.lengthSeconds % 60}\n` +
                      `👁️ *Visualizações:* ${info.videoDetails.viewCount}\n` +
                      `👍 *Curtidas:* ${info.videoDetails.likes || 'N/A'}\n\n` +
                      `⚠️ *Atenção:* Downloads diretos podem violar termos de serviço.`
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao processar música." });
        }
    }
};
