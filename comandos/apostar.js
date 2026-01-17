const config = require('../configuracao');

module.exports = {
    nome: "apostar",
    descricao: "Aposta uma quantia",
    categoria: "economia",
    exemplo: "100",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const usuario = msg.key.participant || from;
        
        if (!args[0] || isNaN(args[0])) {
            return sock.sendMessage(from, { 
                text: "❌ Digite uma quantia para apostar.\nExemplo: !apostar 100"
            });
        }
        
        const quantia = parseInt(args[0]);
        const vitoria = Math.random() < 0.4; // 40% de chance de ganhar
        const multiplicador = vitoria ? 2 : 0;
        const resultado = vitoria ? `✅ Ganhou +$${quantia * multiplicador}` : `❌ Perdeu -$${quantia}`;
        
        await sock.sendMessage(from, { 
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
