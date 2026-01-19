const config = require('../configuration');
const { Sticker, createSticker, StickerTypes } = require('fluent-ffmpeg');

module.exports = {
    nome: "figurinha",
    descricao: "Cria uma figurinha a partir de imagem/vídeo",
    categoria: "midia",
    exemplo: "s",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const tipo = msg.message?.imageMessage ? 'image' :
                    msg.message?.videoMessage ? 'video' : null;
        
        if (!tipo) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Envie uma imagem ou vídeo com caption 'figurinha' ou 's'."
            });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            const autor = config.botName || "WhatsApp Bot";
            
            const sticker = new Sticker(stream, {
                pack: `Criado por ${autor}`,
                author: msg.pushName || "Usuário",
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#00000000'
            });
            
            await sock.sendMessage(fromJid, await sticker.toMessage(), { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao criar figurinha." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
