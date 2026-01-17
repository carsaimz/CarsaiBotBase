const config = require('../configuracao');
const yts = require('yt-search');

module.exports = {
    nome: "youtube",
    descricao: "Busca vídeos no YouTube",
    categoria: "midia",
    exemplo: "música 2024",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "❌ Digite o termo de busca.\nExemplo: !youtube música brasileira"
            });
        }
        
        const query = args.join(' ');
        
        try {
            const resultado = await yts(query);
            const videos = resultado.videos.slice(0, 5);
            
            let resposta = `🎬 *Resultados do YouTube:* "${query}"\n\n`;
            
            videos.forEach((video, index) => {
                resposta += `${index + 1}. *${video.title}*\n`;
                resposta += `   👁️ ${video.views} views | ⏱️ ${video.timestamp}\n`;
                resposta += `   👤 ${video.author.name}\n`;
                resposta += `   🔗 ${video.url}\n\n`;
            });
            
            resposta += `📊 Total de resultados: ${resultado.videos.length}`;
            
            await sock.sendMessage(from, { text: resposta }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro na busca do YouTube." });
        }
    }
};
