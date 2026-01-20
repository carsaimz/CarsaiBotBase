const config = require('../configuration');

module.exports = {
    nome: "promover",
    descricao: "Promove um membro a administrador",
    categoria: "admin",
    exemplo: "@membro",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        if (!fromJid.endsWith('@g.us')) return;
        
        const groupMetadata = await sock.groupMetadata(fromJid);
        const participants = groupMetadata.participants;
        const sender = msg.key.participant || fromJid;
        
        const admins = participants.filter(p => p.admin !== null).map(p => p.id);
        const isAdmin = admins.includes(sender);
        const isOwner = sender.includes(config.ownerNumber);
        
        if (!isAdmin && !isOwner) {
            return sock.sendMessage(fromJid, { text: "❌ Apenas administradores podem usar este comando." });
        }
        
        const mencionado = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        const remetente = msg.key.participant || msg.key.remoteJid;
        if (!mencionado) {
            return sock.sendMessage(fromJid, { text: "❌ Marque o membro que deseja promover." });
        }
        
        try {
            await sock.groupParticipantsUpdate(fromJid, [mencionado], "promote");
            await sock.sendMessage(fromJid, { text: `✅ @${mencionado.split('@')[0]} foi promovido a administrador por @${remetente.split('@')[0]}.` }, { mentions: [mencionado, remetente] });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao promover membro." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
