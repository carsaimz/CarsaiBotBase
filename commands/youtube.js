const config = require('../configuration');
const yts = require('yt-search');

module.exports = {
    nome: "youtube",
    descricao: "Busca vídeos no YouTube",
    categoria: "midia",
    exemplo: "música 2024",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o termo de busca.\nExemplo: !youtube música brasileira"
            });
        }
        
        const query = commandArgs.join(' ');
        
        try {
            const resultado = await yts(query);
            const videos = resultado.videos.slice(0, 5);
            
            let response = `🎬 *Resultados do YouTube:* "${query}"\n\n`;
            
            videos.forEach((video, index) => {
                response += `${index + 1}. *${video.title}*\n`;
                response += `   👁️ ${video.views} views | ⏱️ ${video.timestamp}\n`;
                response += `   👤 ${video.author.name}\n`;
                response += `   🔗 ${video.url}\n\n`;
            });
            
            response += `📊 Total de resultados: ${resultado.videos.length}`;
            
            await sock.sendMessage(fromJid, { text: response }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro na busca do YouTube." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
