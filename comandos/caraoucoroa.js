const config = require('../configuracao');

module.exports = {
    nome: "caraoucoroa",
    descricao: "Joga cara ou coroa",
    categoria: "diversao",
    aliases: ["coinflip", "moeda"],
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        const emoji = resultado === 'Cara' ? '👨' : '🪙';
        const aposta = args[0] ? `\n🎯 *Você apostou:* ${args[0]}\n${args[0].toLowerCase() === resultado.toLowerCase() ? '✅ Ganhou!' : '❌ Perdeu!'}` : '';
        
        await sock.sendMessage(from, { 
            text: `${emoji} *Cara ou Coroa*\n\n` +
                  `🪙 *Resultado:* ${resultado}${aposta}\n` +
                  `🎰 *Probabilidade:* 50% cada`
        }, { quoted: msg });
    }
};
