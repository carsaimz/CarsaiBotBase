// comandos/teste.js
const config = require('../configuration');

module.exports = {
    nome: "teste",
    descricao: "Comando de teste para verificar funcionamento",
    categoria: "utilidades",
    executar: async (sock, msg, commandArgs, { readDB, saveDB }) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        const userName = msg.pushName || "Usuário";
        
        const response = `✅ *Bot funcionando!*\n\n` +
                        `👤 *Usuário:* ${userName}\n` +
                        `📞 *Número:* ${sender.split('@')[0]}\n` +
                        `📍 *Chat:* ${fromJid.endsWith('@g.us') ? 'Grupo' : 'Privado'}\n` +
                        `🤖 *Bot:* ${config.botName}\n` +
                        `🔧 *Prefixo:* ${config.prefix}\n` +
                        `🕐 *Hora:* ${new Date().toLocaleTimeString('pt-BR')}\n\n` +
                        `⚡ *Status:* Conectado e operacional!`;
        
        await sock.sendMessage(fromJid, { text: response }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
