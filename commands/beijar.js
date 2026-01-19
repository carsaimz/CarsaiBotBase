const config = require('../configuration');

module.exports = {
    nome: "beijar",
    descricao: "Beijar outro usuário.",
    categoria: "interacao",
    exemplo: "beijar @amigo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!msg.message.extendedTextMessage || 
            !msg.message.extendedTextMessage.contextInfo || 
            !msg.message.extendedTextMessage.contextInfo.mentionedJid) {
            await sock.sendMessage(from, { 
                text: "❌ Marque um usuário para beijar!\nExemplo: beijar @amigo" 
            });
            return;
        }
        
        const mencionado = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        const remetente = msg.key.participant || msg.key.remoteJid;
        
        const beijos = ["💋", "😘", "👄", "💏", "🥰"];
        const beijoAleatorio = beijos[Math.floor(Math.random() * beijos.length)];
        
        await sock.sendMessage(from, { 
            text: `${beijoAleatorio} *Beijo enviado!*\n\nDe: @${remetente.split('@')[0]}\nPara: @${mencionado.split('@')[0]}`,
            mentions: [remetente, mencionado]
        });
    }
};
