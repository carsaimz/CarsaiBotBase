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
            text: `${beijoAleatorio} *Beijo enviado!*\n\nO (a) @${remetente.split('@')[0]} mandou um beijo para @${mencionado.split('@')[0]}\n*Nota*: Se um de vocês é casado ou está num relacionamento, eu não estou envolvido de jeito nenhum. Estou fora e nem reclamei com meu dono, eu só atendi o pedido de @${remetente.split('@')[0]}.`,
            mentions: [remetente, mencionado]
        });
    }
};
