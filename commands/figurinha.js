// commands/figurinha.js
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs');
const path = require('path');

module.exports = {
    nome: "figurinha",
    descricao: "Cria figurinhas de imagens/vídeos",
    categoria: "midia",
    exemplo: "!figurinha [com legenda]",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        // Verifica se há mídia na mensagem
        if (!msg.message?.imageMessage && !msg.message?.videoMessage) {
            return sock.sendMessage(fromJid, { 
                text: `🎨 *Criador de Figurinhas*\n\n📌 *Como usar:*\n1. Envie uma imagem ou vídeo (até 5s)\n2. Responda com !figurinha\n3. Opcional: !figurinha texto - adiciona legenda\n\n📝 *Exemplos:*\n• Envie imagem + !figurinha\n• Envie vídeo + !figurinha Legenda aqui\n\n⚙️ *Opções:*\n• !figurinha círculo - Figurinha redonda\n• !figurinha cheia - Preenche toda a imagem\n• !figurinha texto - Adiciona texto na parte inferior\n\n📏 *Limites:*\n• Imagens: Qualquer tamanho\n• Vídeos: Até 5 segundos\n• Tamanho: Até 500KB`
            });
        }
        
        const legenda = commandArgs.join(' ');
        const isCirculo = legenda.toLowerCase().includes('círculo') || legenda.toLowerCase().includes('circulo');
        const isCheia = legenda.toLowerCase().includes('cheia') || legenda.toLowerCase().includes('full');
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🎭 *Criando figurinha...*"
            });
            
            let buffer;
            let mimetype;
            
            // Baixa a mídia
            if (msg.message.imageMessage) {
                const stream = await sock.downloadMediaMessage(msg);
                buffer = Buffer.from(stream);
                mimetype = msg.message.imageMessage.mimetype;
            } else if (msg.message.videoMessage) {
                // Verifica duração do vídeo
                const duration = msg.message.videoMessage.seconds;
                if (duration > 10) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ *Vídeo muito longo*\nLimite: 10 segundos\n\n💡 *Corte o vídeo ou use um mais curto*"
                    });
                }
                
                const stream = await sock.downloadMediaMessage(msg);
                buffer = Buffer.from(stream);
                mimetype = msg.message.videoMessage.mimetype;
            } else {
                return sock.sendMessage(fromJid, { 
                    text: "❌ *Nenhuma mídia encontrada*\nEnvie uma imagem ou vídeo primeiro"
                });
            }
            
            // Configurações da figurinha
            const packName = "CarsaiBot";
            const authorName = "WhatsApp Bot";
            const categories = ["🤖", "✨"];
            
            const stickerOptions = {
                pack: packName,
                author: authorName,
                type: isCirculo ? StickerTypes.CIRCLE : StickerTypes.FULL,
                quality: 50,
                categories: categories
            };
            
            // Se for vídeo, ajusta qualidade
            if (mimetype.includes('video')) {
                stickerOptions.quality = 30; // Qualidade menor para vídeos
            }
            
            // Remove palavras especiais da legenda
            let finalCaption = legenda
                .replace(/círculo|circulo|cheia|full/gi, '')
                .trim();
            
            // Cria a figurinha
            const sticker = new Sticker(buffer, stickerOptions);
            
            if (finalCaption) {
                // Adiciona texto se houver legenda
                await sticker.addText(finalCaption, {
                    font: 'Arial',
                    fontSize: 20,
                    color: '#FFFFFF',
                    strokeColor: '#000000',
                    strokeWidth: 2,
                    position: 'bottom'
                });
            }
            
            const stickerBuffer = await sticker.toBuffer();
            
            // Verifica tamanho
            if (stickerBuffer.length > 500 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ *Figurinha muito grande*\nTamanho: " + Math.round(stickerBuffer.length/1024) + "KB\nLimite: 500KB\n\n💡 *Tente:*\n• Imagem menor\n• Qualidade reduzida\n• Sem legenda"
                });
            }
            
            // Envia a figurinha
            await sock.sendMessage(fromJid, {
                sticker: stickerBuffer
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: "✅ *Figurinha criada com sucesso!*"
            });
            
        } catch (error) {
            console.error('Erro figurinha:', error);
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro ao criar figurinha*\n\n💡 *Possíveis causas:*\n• Mídia muito grande\n• Formato não suportado\n• Erro de processamento\n\n🔧 *Tente:*\n• Imagem JPG/PNG\n• Vídeo MP4 curto\n• Reduzir qualidade`
            });
        }
    }
};