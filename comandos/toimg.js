const config = require('../configuracao');

module.exports = {
    nome: "toimg",
    descricao: "Converte figurinha em imagem",
    categoria: "midia",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!msg.message?.stickerMessage) {
            return sock.sendMessage(from, { text: "❌ Envie uma figurinha para converter." });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            await sock.sendMessage(from, { 
                image: stream,
                caption: "🖼️ Figurinha convertida para imagem!"
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao converter figurinha." });
        }
    }
};
