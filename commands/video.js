const config = require('../configuration');
const ytdl = require('ytdl-core');

module.exports = {
    nome: "video",
    descricao: "Baixa vídeo do YouTube",
    categoria: "diversao",
    exemplo: "https://youtube.com/watch?v=...",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Envie o link do vídeo do YouTube.\nExemplo: !video https://youtube.com/watch?v=..."
            });
        }
        
        const url = commandArgs[0];
        
        if (!ytdl.validateURL(url)) {
            return sock.sendMessage(fromJid, { text: "❌ URL do YouTube inválida." });
        }
        
        try {
            const info = await ytdl.getInfo(url);
            const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
            
            await sock.sendMessage(fromJid, { 
                text: `📥 *Download em andamento...*\n\n` +
                      `🎬 *Título:* ${info.videoDetails.title}\n` +
                      `⏱️ *Duração:* ${info.videoDetails.lengthSeconds} segundos\n` +
                      `👁️ *Visualizações:* ${info.videoDetails.viewCount}`
            });
            
            // Nota: Baixar e enviar vídeos grandes pode ser problemático
            // Recomenda-se usar um serviço externo para downloads grandes
            
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao processar vídeo." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
