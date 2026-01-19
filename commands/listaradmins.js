const config = require('../configuration');

module.exports = {
    nome: "listaradmins",
    descricao: "Lista todos os administradores do grupo",
    categoria: "admin",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        if (!fromJid.endsWith('@g.us')) return;
        
        try {
            const groupMetadata = await sock.groupMetadata(fromJid);
            const admins = groupMetadata.participants.filter(p => p.admin !== null);
            
            let lista = "👑 *Administradores do Grupo:*\n\n";
            admins.forEach((admin, index) => {
                lista += `${index + 1}. @${admin.id.split('@')[0]}\n`;
            });
            
            await sock.sendMessage(fromJid, { 
                text: lista + `\nTotal: ${admins.length} administrador(es)`,
                mentions: admins.map(a => a.id)
            });
        } catch (e) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao listar administradores." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
