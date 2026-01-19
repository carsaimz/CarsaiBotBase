const config = require('../configuration');

module.exports = {
    nome: "dado",
    descricao: "Rola um dado",
    categoria: "diversao",
    exemplo: "6",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const lados = parseInt(commandArgs[0]) || 6;
        const resultado = Math.floor(Math.random() * lados) + 1;
        
        const dadosEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const emoji = dadosEmoji[resultado - 1] || '🎲';
        
        await sock.sendMessage(fromJid, { 
            text: `${emoji} *Resultado do Dado*\n\n` +
                  `🎯 *Você rolou:* ${resultado}\n` +
                  `📊 *Lados do dado:* ${lados}\n` +
                  `🎰 *Número aleatório:* ${Math.random().toFixed(4)}`
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
