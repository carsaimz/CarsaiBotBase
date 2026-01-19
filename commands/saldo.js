const config = require('../configuration');

module.exports = {
    nome: "saldo",
    descricao: "Verifica seu saldo",
    categoria: "economia",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const usuario = msg.key.participant || fromJid;
        
        // Sistema de economia simples
        // Em um sistema real, você teria um banco de dados
        const saldoPadrao = 1000;
        const saldoUsuario = saldoPadrao; // Aqui você buscaria do banco de dados
        
        await sock.sendMessage(fromJid, { 
            text: `💰 *Sistema de Economia*\n\n` +
                  `👤 *Usuário:* @${usuario.split('@')[0]}\n` +
                  `💵 *Saldo:* $${saldoUsuario}\n` +
                  `🏦 *Banco:* ${config.botName} Bank\n` +
                  `📅 *Conta criada:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
                  `💡 Use !diario para receber dinheiro diário!`
        }, { quoted: msg, mentions: [usuario] });
    }
};
/* CarsaiBot - cbot - carsai */
