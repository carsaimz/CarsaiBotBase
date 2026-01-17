const config = require('../configuracao');

module.exports = {
    nome: "audio",
    descricao: "Converte áudio para diferentes formatos",
    categoria: "midia",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!msg.message?.audioMessage) {
            return sock.sendMessage(from, { 
                text: "❌ Envie um áudio com legenda 'audio' para processar."
            });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            await sock.sendMessage(from, { 
                audio: stream,
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao processar áudio." });
        }
    }
};
