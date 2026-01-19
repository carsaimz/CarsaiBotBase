const config = require('../configuration');

module.exports = {
    nome: "antilink",
    descricao: "Ativa ou desativa o sistema de antilink no grupo - CarsaiBot",
    categoria: "grupos",
    executar: async (sock, msg, commandArgs, { readDB, saveDB }) => {
        const fromJid = msg.key.remoteJid;
        if (!fromJid.endsWith('@g.us')) return sock.sendMessage(fromJid, { text: "Este comando só funciona em grupos." });

        // Verificar se o sender é admin ou dono
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
            return sock.sendMessage(fromJid, { text: `💡 Use: *${config.prefix}antilink on* ou *${config.prefix}antilink off*` });
        }

        const db = readDB();
        if (!db[fromJid]) db[fromJid] = {};
        
        if (commandArgs[0] === 'on') {
            db[fromJid].antilink = true;
            saveDB(db);
            await sock.sendMessage(fromJid, { text: "✅ *Antilink ativado!* O bot agora irá remover links de convite de outros grupos. - CarsaiBot" });
        } else if (commandArgs[0] === 'off') {
            db[fromJid].antilink = false;
            saveDB(db);
            await sock.sendMessage(fromJid, { text: "❌ *Antilink desativado!* - CarsaiBot" });
        } else {
            await sock.sendMessage(fromJid, { text: "❌ Opção inválida. Use 'on' ou 'off'." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
