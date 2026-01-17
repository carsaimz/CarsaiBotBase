const config = require('../configuracao');

module.exports = {
    nome: "marcartodos",
    descricao: "Menciona todos os membros do grupo",
    categoria: "admin",
    exemplo: "Mensagem opcional",
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
        
        const mensagem = args.length > 0 ? args.join(' ') : 'Olá a todos!';
        const mencoes = participantes.map(p => p.id);
        
        try {
            await sock.sendMessage(from, { 
                text: `${mensagem}\n\n${participantes.map(p => `@${p.id.split('@')[0]}`).join(' ')}`,
                mentions: mencoes
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Erro ao mencionar todos." });
        }
    }
};
