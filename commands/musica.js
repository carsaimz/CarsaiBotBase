const config = require('../configuration');
const ytdl = require('ytdl-core');

module.exports = {
    nome: "musica",
    descricao: "Baixa áudio do YouTube",
    categoria: "diversao",
    exemplo: "https://youtube.com/watch?v=...",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Envie o link do vídeo do YouTube.\nExemplo: !musica https://youtube.com/watch?v=..."
            });
        }
        
        const url = commandArgs[0];
        
        if (!ytdl.validateURL(url)) {
            return sock.sendMessage(fromJid, { text: "❌ URL do YouTube inválida." });
        }
        
        try {
            const info = await ytdl.getInfo(url);
            
            await sock.sendMessage(fromJid, { 
                text: `🎵 *Informações da Música*\n\n` +
                      `📀 *Título:* ${info.videoDetails.title}\n` +
                      `👤 *Artista/Canal:* ${info.videoDetails.author.name}\n` +
                      `⏱️ *Duração:* ${Math.floor(info.videoDetails.lengthSeconds / 60)}:${info.videoDetails.lengthSeconds % 60}\n` +
                      `👁️ *Visualizações:* ${info.videoDetails.viewCount}\n` +
                      `👍 *Curtidas:* ${info.videoDetails.likes || 'N/A'}\n\n` +
                      `⚠️ *Atenção:* Downloads diretos podem violar termos de serviço.`
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao processar música." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
