const config = require('../configuration');

module.exports = {
    nome: "diario",
    descricao: "Recebe recompensa diária",
    categoria: "economia",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const usuario = msg.key.participant || fromJid;
        
        const recompensa = Math.floor(Math.random() * 500) + 100; // 100-600
        
        await sock.sendMessage(fromJid, { 
            text: `🎁 *Recompensa Diária*\n\n` +
                  `👤 *Usuário:* @${usuario.split('@')[0]}\n` +
                  `💰 *Recompensa:* +$${recompensa}\n` +
                  `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n` +
                  `⏰ *Próxima recompensa:* Amanhã\n\n` +
                  `💡 Volte amanhã para outra recompensa!`
        }, { quoted: msg, mentions: [usuario] });
    }
};
/* CarsaiBot - cbot - carsai */
