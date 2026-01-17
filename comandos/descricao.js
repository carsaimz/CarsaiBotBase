const config = require('../configuracao');

module.exports = {
    nome: "descricao",
    descricao: "Altera a descrição do grupo",
    categoria: "admin",
    exemplo: "Nova descrição",
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
        
        const novaDescricao = args.join(' ');
        if (!novaDescricao) {
            return sock.sendMessage(from, { text: "❌ Digite a nova descrição do grupo." });
        }
        
        try {
            await sock.groupUpdateDescription(from, novaDescricao);
            await sock.sendMessage(from, { text: "✅ Descrição do grupo atualizada!" });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Erro ao alterar descrição." });
        }
    }
};
