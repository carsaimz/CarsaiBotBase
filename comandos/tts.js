const config = require('../configuracao');
const gTTS = require('gtts');

module.exports = {
    nome: "tts",
    descricao: "Converte texto em fala (Text-to-Speech)",
    categoria: "midia",
    exemplo: "Olá mundo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "❌ Digite o texto para converter em fala.\nExemplo: !tts Olá mundo"
            });
        }
        
        const texto = args.join(' ');
        
        if (texto.length > 200) {
            return sock.sendMessage(from, { text: "❌ Texto muito longo! Máximo 200 caracteres." });
        }
        
        try {
            const gtts = new gTTS(texto, 'pt');
            const buffer = await new Promise((resolve, reject) => {
                gtts.getBuffer((err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            });
            
            await sock.sendMessage(from, { 
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao gerar áudio." });
        }
    }
};
