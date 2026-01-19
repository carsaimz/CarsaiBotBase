const config = require('../configuration');
const QRCode = require('qrcode');

module.exports = {
    nome: "qrcode",
    descricao: "Gera um QR Code a partir de text/URL",
    categoria: "utilidades",
    exemplo: "https://exemplo.com",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o text ou URL para o QR Code.\nExemplo: !qrcode https://google.com"
            });
        }
        
        const text = commandArgs.join(' ');
        
        try {
            const qrDataURL = await QRCode.toDataURL(text);
            const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.fromJid(base64Data, 'base64');
            
            await sock.sendMessage(fromJid, { 
                image: buffer,
                caption: `📱 *QR Code Gerado*\n\n📝 *Conteúdo:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao gerar QR Code." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
