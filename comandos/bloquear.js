const config = require('../configuracao');

module.exports = {
    nome: "bloquear",
    descricao: "Bloqueia um usuário (apenas dono)",
    categoria: "dono",
    exemplo: "258842846463",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const remetente = msg.key.participant || from;
        
        if (!remetente.includes(config.numeroDono)) {
            return sock.sendMessage(from, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!args[0]) {
            return sock.sendMessage(from, { text: "❌ Digite o número para bloquear." });
        }
        
        const numero = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.updateBlockStatus(numero, 'block');
            await sock.sendMessage(from, { text: `✅ Número ${args[0]} bloqueado com sucesso.` });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao bloquear número." });
        }
    }
};
