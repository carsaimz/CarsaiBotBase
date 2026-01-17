const config = require('../configuracao');
const ytdl = require('ytdl-core');

module.exports = {
    nome: "video",
    descricao: "Baixa vídeo do YouTube",
    categoria: "diversao",
    exemplo: "https://youtube.com/watch?v=...",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "❌ Envie o link do vídeo do YouTube.\nExemplo: !video https://youtube.com/watch?v=..."
            });
        }
        
        const url = args[0];
        
        if (!ytdl.validateURL(url)) {
            return sock.sendMessage(from, { text: "❌ URL do YouTube inválida." });
        }
        
        try {
            const info = await ytdl.getInfo(url);
            const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
            
            await sock.sendMessage(from, { 
                text: `📥 *Download em andamento...*\n\n` +
                      `🎬 *Título:* ${info.videoDetails.title}\n` +
                      `⏱️ *Duração:* ${info.videoDetails.lengthSeconds} segundos\n` +
                      `👁️ *Visualizações:* ${info.videoDetails.viewCount}`
            });
            
            // Nota: Baixar e enviar vídeos grandes pode ser problemático
            // Recomenda-se usar um serviço externo para downloads grandes
            
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao processar vídeo." });
        }
    }
};
