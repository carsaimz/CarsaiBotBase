const config = require('../configuration');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    nome: "sticker",
    descricao: "Criar sticker de imagem ou vídeo.",
    categoria: "utilidades",
    exemplo: "sticker (marque uma imagem/vídeo)",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!msg.message.imageMessage && !msg.message.videoMessage) {
            await sock.sendMessage(from, { 
                text: "❌ Marque uma imagem ou vídeo para criar sticker!\nEnvie a mídia como visível (sem ⚡)" 
            });
            return;
        }
        
        try {
            await sock.sendMessage(from, { 
                text: "⏳ Criando sticker..." 
            });
            
            const media = await downloadMediaMessage(msg, 'buffer', {});
            
            await sock.sendMessage(from, {
                sticker: media,
                mimetype: msg.message.imageMessage ? 'image/jpeg' : 'video/mp4'
            });
            
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: "❌ Erro ao criar sticker!" });
        }
    }
};
