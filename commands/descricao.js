const config = require('../configuration');

module.exports = {
    nome: "descricao",
    descricao: "Altera a descrição do grupo",
    categoria: "admin",
    exemplo: "Nova descrição",
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
        
        const novaDescricao = commandArgs.join(' ');
        if (!novaDescricao) {
            return sock.sendMessage(fromJid, { text: "❌ Digite a nova descrição do grupo." });
        }
        
        try {
            await sock.groupUpdateDescription(fromJid, novaDescricao);
            await sock.sendMessage(fromJid, { text: "✅ Descrição do grupo atualizada!" });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao alterar descrição." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
