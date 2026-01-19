const config = require('../configuration');

module.exports = {
    nome: "desbloquear",
    descricao: "Desbloqueia um usuário (apenas dono)",
    categoria: "dono",
    exemplo: "258861424345",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite o número para desbloquear." });
        }
        
        const numero = commandArgs[0].replace(/\D/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.updateBlockStatus(numero, 'unblock');
            await sock.sendMessage(fromJid, { text: `✅ Número ${commandArgs[0]} desbloqueado com sucesso.` });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao desbloquear número." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
