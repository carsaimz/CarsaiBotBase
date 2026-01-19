const config = require('../configuration');

module.exports = {
    nome: "foto",
    descricao: "Altera a foto do grupo",
    categoria: "admin",
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
        
        if (!msg.message?.imageMessage) {
            return sock.sendMessage(fromJid, { text: "❌ Envie uma imagem com caption 'foto'." });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            await sock.updateProfilePicture(fromJid, stream);
            await sock.sendMessage(fromJid, { text: "✅ Foto do grupo atualizada!" });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao alterar foto." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
