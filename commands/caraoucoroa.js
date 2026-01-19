const config = require('../configuration');

module.exports = {
    nome: "caraoucoroa",
    descricao: "Joga cara ou coroa",
    categoria: "diversao",
    aliases: ["coinflip", "moeda"],
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        const emoji = resultado === 'Cara' ? '👨' : '🪙';
        const aposta = commandArgs[0] ? `\n🎯 *Você apostou:* ${commandArgs[0]}\n${commandArgs[0].toLowerCase() === resultado.toLowerCase() ? '✅ Ganhou!' : '❌ Perdeu!'}` : '';
        
        await sock.sendMessage(fromJid, { 
            text: `${emoji} *Cara ou Coroa*\n\n` +
                  `🪙 *Resultado:* ${resultado}${aposta}\n` +
                  `🎰 *Probabilidade:* 50% cada`
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
