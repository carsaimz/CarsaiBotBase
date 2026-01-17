const config = require('../configuracao');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    nome: "figurinha",
    descricao: "Cria uma figurinha a partir de imagem/vídeo",
    categoria: "midia",
    exemplo: "s",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        const tipo = msg.message?.imageMessage ? 'image' :
                    msg.message?.videoMessage ? 'video' : null;
        
        if (!tipo) {
            return sock.sendMessage(from, { 
                text: "❌ Envie uma imagem ou vídeo com legenda 'figurinha' ou 's'."
            });
        }
        
        try {
            const stream = await sock.downloadMediaMessage(msg);
            const autor = config.nomeBot || "WhatsApp Bot";
            
            const sticker = new Sticker(stream, {
                pack: `Criado por ${autor}`,
                author: msg.pushName || "Usuário",
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#00000000'
            });
            
            await sock.sendMessage(from, await sticker.toMessage(), { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao criar figurinha." });
        }
    }
};
