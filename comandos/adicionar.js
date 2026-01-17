const config = require('../configuracao');

module.exports = {
    nome: "adicionar",
    descricao: "Adiciona um número ao grupo",
    categoria: "admin",
    exemplo: "258862414345",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;
        
        const metadata = await sock.groupMetadata(from);
        const participantes = metadata.participants;
        const remetente = msg.key.participant || from;
        
        const admins = participantes.filter(p => p.admin !== null).map(p => p.id);
        const eAdmin = admins.includes(remetente);
        const eDono = remetente.includes(config.numeroDono);
        
        if (!eAdmin && !eDono) {
            return sock.sendMessage(from, { text: "❌ Apenas administradores podem usar este comando." });
        }
        
        if (!args[0]) {
            return sock.sendMessage(from, { text: "❌ Digite o número para adicionar (com DDD)." });
        }
        
        const numero = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.groupParticipantsUpdate(from, [numero], "add");
            await sock.sendMessage(from, { text: `✅ Número adicionado ao grupo.` });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Erro ao adicionar número." });
        }
    }
};
