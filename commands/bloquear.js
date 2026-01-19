const config = require('../configuration');

module.exports = {
    nome: "bloquear",
    descricao: "Bloqueia um usuário (apenas dono)",
    categoria: "dono",
    exemplo: "258842846463",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite o número para bloquear." });
        }
        
        const numero = commandArgs[0].replace(/\D/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.updateBlockStatus(numero, 'block');
            await sock.sendMessage(fromJid, { text: `✅ Número ${commandArgs[0]} bloqueado com sucesso.` });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao bloquear número." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
