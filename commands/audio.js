const config = require('../configuration');

module.exports = {
    nome: "audio",
    descricao: "Converte áudio para diferentes formatos",
    categoria: "midia",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!msg.message?.audioMessage) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Envie um áudio com caption 'audio' para processar."
            });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            await sock.sendMessage(fromJid, { 
                audio: stream,
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao processar áudio." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
