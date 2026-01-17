const config = require('../configuracao');

module.exports = {
    nome: "listaradmins",
    descricao: "Lista todos os administradores do grupo",
    categoria: "admin",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;
        
        try {
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(p => p.admin !== null);
            
            let lista = "👑 *Administradores do Grupo:*\n\n";
            admins.forEach((admin, index) => {
                lista += `${index + 1}. @${admin.id.split('@')[0]}\n`;
            });
            
            await sock.sendMessage(from, { 
                text: lista + `\nTotal: ${admins.length} administrador(es)`,
                mentions: admins.map(a => a.id)
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Erro ao listar administradores." });
        }
    }
};
