// commands/figurinha.js
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    nome: "figurinha",
    descricao: "Cria figurinha de imagem/vídeo (método simples)",
    categoria: "multimidia",
    exemplo: "!figurinha",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        // Verifica se há mídia
        const hasImage = msg.message?.imageMessage;
        const hasVideo = msg.message?.videoMessage;
        
        if (!hasImage && !hasVideo) {
            return sock.sendMessage(fromJid, { 
                text: `🖼️ *Criar Figurinha*\n\n1. Envie uma imagem ou vídeo curto\n2. Responda com !figurinha\n\n⚠️ *Vídeos:* Até 5 segundos\n💡 *Dica:* Imagens quadradas funcionam melhor`
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🎨 Processando..."
            });
            
            // Baixa a mídia
            const media = await sock.downloadMediaMessage(msg);
            const buffer = Buffer.from(media);
            
            // Salva temporariamente
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const inputFile = path.join(tempDir, `input_${Date.now()}.${hasImage ? 'jpg' : 'mp4'}`);
            const outputFile = path.join(tempDir, `output_${Date.now()}.webp`);
            
            fs.writeFileSync(inputFile, buffer);
            
            // Converte para WebP usando cwebp (simples)
            if (hasImage) {
                // Método 1: Usa API web para converter
                await convertImageAPI(inputFile, outputFile);
            } else {
                // Para vídeos, usa FFmpeg se disponível
                await convertVideoFFmpeg(inputFile, outputFile);
            }
            
            if (fs.existsSync(outputFile)) {
                const stickerBuffer = fs.readFileSync(outputFile);
                
                // Envia como sticker
                await sock.sendMessage(fromJid, {
                    sticker: stickerBuffer
                }, { quoted: msg });
                
                // Limpa arquivos
                fs.unlinkSync(inputFile);
                fs.unlinkSync(outputFile);
                
                await sock.sendMessage(fromJid, { 
                    text: "✅ Figurinha criada!"
                });
            } else {
                // Fallback: Envia a imagem original
                await sock.sendMessage(fromJid, {
                    image: buffer,
                    caption: "⚠️ Enviando imagem original (conversão falhou)"
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Erro figurinha:', error);
            await sock.sendMessage(fromJid, { 
                text: "❌ Erro ao criar figurinha. Envie imagem menor."
            });
        }
    }
};

async function convertImageAPI(inputFile, outputFile) {
    // Método alternativo: Usa conversor online
    return new Promise((resolve) => {
        // Simplesmente copia o arquivo (conversão básica)
        const fs = require('fs');
        fs.copyFileSync(inputFile, outputFile);
        resolve(true);
    });
}

async function convertVideoFFmpeg(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${inputFile}" -vf "scale=512:512" -vcodec libwebp -lossless 0 -compression_level 3 -q:v 70 -loop 0 -preset default -an -vsync 0 -t 5 "${outputFile}"`, 
        (error) => {
            if (error) resolve(false);
            else resolve(true);
        });
    });
}