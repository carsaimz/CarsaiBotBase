const config = require('../configuration');

module.exports = {
    nome: "toimg",
    descricao: "Converte figurinha em imagem",
    categoria: "midia",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!msg.message?.stickerMessage) {
            return sock.sendMessage(fromJid, { text: "❌ Envie uma figurinha para converter." });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            await sock.sendMessage(fromJid, { 
                image: stream,
                caption: "🖼️ Figurinha convertida para imagem!"
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao converter figurinha." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
