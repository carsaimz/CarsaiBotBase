const config = require('../configuration');
const os = require('os');

module.exports = {
    nome: "status",
    descricao: "Mostra o status completo do bot",
    categoria: "informacao",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const memoriaTotal = Math.round(os.totalmem() / (1024 * 1024));
        const memoriaLivre = Math.round(os.freemem() / (1024 * 1024));
        const memoriaUsada = memoriaTotal - memoriaLivre;
        const usoMemoria = Math.round((memoriaUsada / memoriaTotal) * 100);
        
        const uptime = process.uptime();
        const horas = Math.floor(uptime / 3600);
        const minutos = Math.floor((uptime % 3600) / 60);
        const segundos = Math.floor(uptime % 60);
        
        const statusTexto = `🤖 *Status do ${config.botName}*\n\n` +
                           `📊 *Sistema:*\n` +
                           `├ 💾 Memória: ${usoMemoria}% (${memoriaUsada}MB/${memoriaTotal}MB)\n` +
                           `├ 🎛️ CPU: ${os.cpus().length} núcleos\n` +
                           `└ 🖥️ SO: ${os.type()} ${os.release()}\n\n` +
                           `⏱️ *Uptime:* ${horas}h ${minutos}m ${segundos}s\n` +
                           `📦 *Node.js:* ${process.version}\n` +
                           `📈 *Versão:* ${config.versao || '1.0.0'}\n` +
                           `👑 *Dono:* ${config.ownerName}\n` +
                           `🔧 *Prefixo:* ${config.prefix}\n\n` +
                           `🟢 *Status:* Online e operacional`;
        
        await sock.sendMessage(fromJid, { text: statusTexto }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
