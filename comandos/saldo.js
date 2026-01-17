const config = require('../configuracao');

module.exports = {
    nome: "saldo",
    descricao: "Verifica seu saldo",
    categoria: "economia",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const usuario = msg.key.participant || from;
        
        // Sistema de economia simples
        // Em um sistema real, você teria um banco de dados
        const saldoPadrao = 1000;
        const saldoUsuario = saldoPadrao; // Aqui você buscaria do banco de dados
        
        await sock.sendMessage(from, { 
            text: `💰 *Sistema de Economia*\n\n` +
                  `👤 *Usuário:* @${usuario.split('@')[0]}\n` +
                  `💵 *Saldo:* $${saldoUsuario}\n` +
                  `🏦 *Banco:* ${config.nomeBot} Bank\n` +
                  `📅 *Conta criada:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
                  `💡 Use !diario para receber dinheiro diário!`
        }, { quoted: msg, mentions: [usuario] });
    }
};
