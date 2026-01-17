const config = require('../configuracao');

module.exports = {
    nome: "promover",
    descricao: "Promove um membro a administrador",
    categoria: "admin",
    exemplo: "@membro",
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
        
        const mencionado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mencionado) {
            return sock.sendMessage(from, { text: "❌ Marque o membro que deseja promover." });
        }
        
        try {
            await sock.groupParticipantsUpdate(from, [mencionado], "promote");
            await sock.sendMessage(from, { text: `✅ @${mencionado.split('@')[0]} foi promovido a administrador.` }, { mentions: [mencionado] });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Erro ao promover membro." });
        }
    }
};
