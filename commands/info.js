const config = require('../configuration');
const os = require('os');

module.exports = {
    nome: "info",
    descricao: "Mostra informações do sistema",
    categoria: "utilidades",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const memoriaTotal = Math.round(os.totalmem() / (1024 * 1024));
        const memoriaLivre = Math.round(os.freemem() / (1024 * 1024));
        const memoriaUsada = memoriaTotal - memoriaLivre;
        const usoMemoria = Math.round((memoriaUsada / memoriaTotal) * 100);
        
        const infoTexto = `💻 *Informações do Sistema*\n\n` +
                         `🖥️ *Sistema:* ${os.type()} ${os.release()}\n` +
                         `📊 *CPU:* ${os.cpus()[0].model}\n` +
                         `🎛️ *Núcleos:* ${os.cpus().length}\n` +
                         `💾 *Memória:* ${memoriaUsada}MB / ${memoriaTotal}MB (${usoMemoria}%)\n` +
                         `⏱️ *Uptime:* ${Math.round(process.uptime() / 60)} minutos\n` +
                         `📦 *Node.js:* ${process.version}\n` +
                         `🤖 *Bot:* ${config.botName} v${config.versao || '1.0.0'}`;
        
        await sock.sendMessage(fromJid, { text: infoTexto }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
