const config = require('../configuracao');
const QRCode = require('qrcode');

module.exports = {
    nome: "qrcode",
    descricao: "Gera um QR Code a partir de texto/URL",
    categoria: "utilidades",
    exemplo: "https://exemplo.com",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "❌ Digite o texto ou URL para o QR Code.\nExemplo: !qrcode https://google.com"
            });
        }
        
        const texto = args.join(' ');
        
        try {
            const qrDataURL = await QRCode.toDataURL(texto);
            const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            await sock.sendMessage(from, { 
                image: buffer,
                caption: `📱 *QR Code Gerado*\n\n📝 *Conteúdo:* ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao gerar QR Code." });
        }
    }
};
