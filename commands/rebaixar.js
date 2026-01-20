const config = require('../configuration');

module.exports = {
    nome: "rebaixar",
    descricao: "Rebaixa um administrador a membro comum",
    categoria: "admin",
    exemplo: "@admin",
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
        if (!mencionado) {
            return sock.sendMessage(fromJid, { text: "❌ Marque o administrador que deseja rebaixar." });
        }
        
        try {
            await sock.groupParticipantsUpdate(fromJid, [mencionado], "demote");
            await sock.sendMessage(fromJid, { text: `✅ @${mencionado.split('@')[0]} foi rebaixado a membro comum.` }, { mentions: [mencionado] });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao rebaixar administrador." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
