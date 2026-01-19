const config = require('../configuration');

module.exports = {
    nome: "horario",
    descricao: "Mostra a data e hora atual",
    categoria: "utilidades",
    aliases: ["hora", "data", "tempo"],
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const agora = new Date();
        
        const opcoes = { 
            timeZone: 'Africa/Maputo',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        const dataFormatada = agora.toLocaleDateString('pt-BR', opcoes);
        const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        await sock.sendMessage(fromJid, { 
            text: `🕐 *Data e Hora Atual*\n\n📅 ${dataFormatada}\n🌍 Fuso: ${fuso}\n⏰ Timestamp: ${agora.getTime()}` 
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
