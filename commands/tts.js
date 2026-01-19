const config = require('../configuration');
const gTTS = require('gtts');

module.exports = {
    nome: "tts",
    descricao: "Converte text em fala (Text-to-Speech)",
    categoria: "midia",
    exemplo: "Olá mundo",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o text para converter em fala.\nExemplo: !tts Olá mundo"
            });
        }
        
        const text = commandArgs.join(' ');
        
        if (text.length > 200) {
            return sock.sendMessage(fromJid, { text: "❌ Texto muito longo! Máximo 200 caracteres." });
        }
        
        try {
            const gtts = new gTTS(text, 'pt');
            const buffer = await new Promise((resolve, reject) => {
                gtts.getBuffer((err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            });
            
            await sock.sendMessage(fromJid, { 
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao gerar áudio." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
