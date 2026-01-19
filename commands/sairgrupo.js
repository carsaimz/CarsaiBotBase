const config = require('../configuration');

module.exports = {
    nome: "sairgrupo",
    descricao: "Faz o bot sair do grupo (apenas dono)",
    categoria: "dono",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!fromJid.endsWith('@g.us')) {
            return sock.sendMessage(fromJid, { text: "❌ Este comando só funciona em grupos." });
        }
        
        try {
            await sock.sendMessage(fromJid, { text: "👋 Adeus! Estou saindo do grupo..." });
            await sock.groupLeave(fromJid);
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao sair do grupo." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
