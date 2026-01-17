const config = require('../configuracao');

module.exports = {
    nome: "foto",
    descricao: "Altera a foto do grupo",
    categoria: "admin",
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
        
        if (!msg.message?.imageMessage) {
            return sock.sendMessage(from, { text: "❌ Envie uma imagem com legenda 'foto'." });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            await sock.updateProfilePicture(from, stream);
            await sock.sendMessage(from, { text: "✅ Foto do grupo atualizada!" });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Erro ao alterar foto." });
        }
    }
};
