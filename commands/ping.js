const config = require('../configuration');

module.exports = {
    nome: "ping",
    descricao: "Mostra a latência do bot",
    categoria: "utilidades",
    aliases: ["latencia", "teste"],
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const inicio = Date.now();
        
        const mensagem = await sock.sendMessage(fromJid, { text: "🏓 Pong!" });
        const fim = Date.now();
        const latencia = fim - inicio;
        
        await sock.sendMessage(fromJid, { 
            text: `📊 *Status do Bot*\n\n🏓 Latência: ${latencia}ms\n🕐 Hora: ${new Date().toLocaleTimeString('pt-BR')}\n📈 Uptime: ${process.uptime().toFixed(2)}s` 
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
