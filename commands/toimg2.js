// commands/toimg2.js
module.exports = {
    nome: "toimg2",
    descricao: "Converte figurinha em imagem normal",
    categoria: "multimidia",
    exemplo: "!toimg2",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        // Verifica se é uma figurinha
        if (!msg.message?.stickerMessage) {
            return sock.sendMessage(fromJid, { 
                text: `🔄 *Converter Figurinha*\n\n📌 *Como usar:*\n1. Envie uma figurinha\n2. Responda com !toimg2\n\n📝 *Também funciona com:*\n• !toimg2 - Converte para imagem\n• Responda a qualquer figurinha\n\n⚙️ *Formatos suportados:*\n• Figurinhas WebP\n• Figurinhas animadas (GIF)\n• Qualquer figurinha do WhatsApp`
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔄 *Convertendo figurinha...*"
            });
            
            // Baixa a figurinha
            const stream = await sock.downloadMediaMessage(msg);
            const buffer = Buffer.from(stream);
            
            // Verifica se é animada (GIF)
            const isAnimated = msg.message.stickerMessage?.isAnimated || false;
            
            if (isAnimated) {
                // Para GIFs animados, envia como vídeo
                await sock.sendMessage(fromJid, {
                    video: buffer,
                    mimetype: 'video/mp4',
                    caption: "🎞️ *Figurinha animada convertida para vídeo*"
                }, { quoted: msg });
            } else {
                // Para figurinhas estáticas, envia como imagem
                await sock.sendMessage(fromJid, {
                    image: buffer,
                    mimetype: 'image/png',
                    caption: "🖼️ *Figurinha convertida para imagem*"
                }, { quoted: msg });
            }
            
            await sock.sendMessage(fromJid, { 
                text: "✅ *Conversão concluída!*"
            });
            
        } catch (error) {
            console.error('Erro toimg2:', error);
            await sock.sendMessage(fromJid, { 
                text: "❌ *Erro ao converter figurinha*\nTente novamente ou use outra figurinha."
            });
        }
    }
};