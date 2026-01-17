const config = require('../configuracao');

module.exports = {
    nome: "sairgrupo",
    descricao: "Faz o bot sair do grupo (apenas dono)",
    categoria: "dono",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const remetente = msg.key.participant || from;
        
        if (!remetente.includes(config.numeroDono)) {
            return sock.sendMessage(from, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Este comando só funciona em grupos." });
        }
        
        try {
            await sock.sendMessage(from, { text: "👋 Adeus! Estou saindo do grupo..." });
            await sock.groupLeave(from);
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao sair do grupo." });
        }
    }
};
