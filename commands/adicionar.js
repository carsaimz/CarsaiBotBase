const config = require('../configuration');

module.exports = {
    nome: "adicionar",
    descricao: "Adiciona um número ao grupo",
    categoria: "admin",
    exemplo: "258862414345",
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
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite o número para adicionar (com DDD)." });
        }
        
        const numero = commandArgs[0].replace(/\D/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.groupParticipantsUpdate(fromJid, [numero], "add");
            await sock.sendMessage(fromJid, { text: `✅ Número adicionado ao grupo.` });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao adicionar número." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
