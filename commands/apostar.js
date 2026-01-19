const config = require('../configuration');

module.exports = {
    nome: "apostar",
    descricao: "Aposta uma quantia",
    categoria: "economia",
    exemplo: "100",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const usuario = msg.key.participant || fromJid;
        
        if (!commandArgs[0] || isNaN(commandArgs[0])) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite uma quantia para apostar.\nExemplo: !apostar 100"
            });
        }
        
        const quantia = parseInt(commandArgs[0]);
        const vitoria = Math.random() < 0.4; // 40% de chance de ganhar
        const multiplicador = vitoria ? 2 : 0;
        const resultado = vitoria ? `✅ Ganhou +$${quantia * multiplicador}` : `❌ Perdeu -$${quantia}`;
        
        await sock.sendMessage(fromJid, { 
            text: `🎰 *Aposta*\n\n` +
                  `👤 *Apostador:* @${usuario.split('@')[0]}\n` +
                  `💰 *Quantia:* $${quantia}\n` +
                  `🎯 *Resultado:* ${resultado}\n` +
                  `📊 *Chance de vitória:* 40%\n` +
                  `🎲 *Multiplicador:* ${multiplicador}x\n\n` +
                  `⚠️ *Lembre-se:* Jogue com responsabilidade!`
        }, { quoted: msg, mentions: [usuario] });
    }
};
/* CarsaiBot - cbot - carsai */
