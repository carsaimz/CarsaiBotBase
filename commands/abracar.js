const config = require('../configuration');

module.exports = {
    nome: "abracar",
    descricao: "Abraçar outro usuário.",
    categoria: "interacao",
    exemplo: "abracar @amigo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!msg.message.extendedTextMessage || 
            !msg.message.extendedTextMessage.contextInfo || 
            !msg.message.extendedTextMessage.contextInfo.mentionedJid) {
            await sock.sendMessage(from, { 
                text: "❌ Marque um usuário para abraçar!\nExemplo: abracar @amigo" 
            });
            return;
        }
        
        const mencionado = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        const remetente = msg.key.participant || msg.key.remoteJid;
        
        const abracos = ["🤗", "🫂", "💝", "❤️", "🧡"];
        const abracoAleatorio = abracos[Math.floor(Math.random() * abracos.length)];
        
        await sock.sendMessage(from, { 
            text: `${abracoAleatorio} *Abraço enviado!*\n\nO (a) @${remetente.split('@')[0]} mandou um abraço para @${mencionado.split('@')[0]}`,
            mentions: [remetente, mencionado]
        });
    }
};
