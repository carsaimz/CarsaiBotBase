const config = require('../configuration');

module.exports = {
    nome: "marcartodos",
    descricao: "Menciona todos os membros do grupo",
    categoria: "admin",
    exemplo: "Mensagem opcional",
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
        
        const mensagem = commandArgs.length > 0 ? commandArgs.join(' ') : 'Olá a todos!';
        const mentions = participants.map(p => p.id);
        
        try {
            await sock.sendMessage(fromJid, { 
                text: `${mensagem}\n\n${participants.map(p => `@${p.id.split('@')[0]}`).join(' ')}`,
                mentions: mentions
            });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao mencionar todos." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
