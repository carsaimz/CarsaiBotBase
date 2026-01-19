// commands/togif.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const gifEncoder = require('gif-encoder-2');

module.exports = {
    nome: "togif",
    descricao: "Converte vídeo para GIF",
    categoria: "multimidia",
    exemplo: "!togif",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!msg.message?.videoMessage) {
            return sock.sendMessage(fromJid, { 
                text: `🎞️ *Conversor para GIF*\n\n📌 *Como usar:*\n1. Envie um vídeo curto (até 10s)\n2. Responda com !togif\n\n📝 *Dicas:*\n• Vídeos curtos funcionam melhor\n• Mantenha abaixo de 10 segundos\n• GIFs podem ficar grandes\n\n⚙️ *Limites:*\n• Duração: 10 segundos\n• Tamanho: 8MB\n• FPS: 10 (otimizado)`
            });
        }
        
        // Verifica duração do vídeo
        const duration = msg.message.videoMessage.seconds || 0;
        if (duration > 15) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Vídeo muito longo*\nLimite para GIF: 15 segundos\n\n💡 *Use vídeos mais curtos*"
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔄 *Criando GIF...*\n⏳ *Pode demorar para vídeos longos*"
            });
            
            // Baixa o vídeo
            const stream = await sock.downloadMediaMessage(msg);
            const videoBuffer = Buffer.from(stream);
            
            // Cria arquivos temporários
            const timestamp = Date.now();
            const tempDir = path.join(__dirname, '../temp');
            const inputPath = path.join(tempDir, `input_${timestamp}.mp4`);
            const outputPath = path.join(tempDir, `output_${timestamp}.gif`);
            
            // Garante pasta temp
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Salva vídeo
            fs.writeFileSync(inputPath, videoBuffer);
            
            // Converte para GIF usando ffmpeg
            await new Promise((resolve, reject) => {
                // Otimiza GIF: reduz FPS, tamanho e cores
                const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${outputPath}" -y`;
                
                exec(ffmpegCmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error('FFmpeg GIF error:', stderr);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Lê o GIF
            const gifBuffer = fs.readFileSync(outputPath);
            
            // Verifica tamanho
            if (gifBuffer.length > 8 * 1024 * 1024) {
                // Tenta criar GIF menor
                await new Promise((resolve, reject) => {
                    const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "fps=8,scale=240:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${outputPath}" -y`;
                    
                    exec(ffmpegCmd, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });
                
                const newGifBuffer = fs.readFileSync(outputPath);
                if (newGifBuffer.length > 8 * 1024 * 1024) {
                    throw new Error('GIF muito grande mesmo após otimização');
                }
            }
            
            // Limpa arquivos
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            // Envia como imagem (WhatsApp trata GIF como imagem)
            await sock.sendMessage(fromJid, {
                image: gifBuffer,
                mimetype: 'image/gif',
                caption: "🎞️ *GIF criado com sucesso!*"
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *GIF pronto!*\n📁 ${(gifBuffer.length/(1024*1024)).toFixed(1)}MB`
            });
            
        } catch (error) {
            console.error('Erro togif:', error);
            
            // Limpeza
            try {
                const tempDir = path.join(__dirname, '../temp');
                if (fs.existsSync(tempDir)) {
                    const files = fs.readdirSync(tempDir);
                    files.forEach(file => {
                        if (file.includes('_')) {
                            fs.unlinkSync(path.join(tempDir, file));
                        }
                    });
                }
            } catch (cleanError) {}
            
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro ao criar GIF*\n\n💡 *Tente:*\n1. Vídeo mais curto (3-5s)\n2. Instalar FFmpeg\n3. Usar vídeo com menos movimento\n\n🔧 *FFmpeg necessário para conversão*`
            });
        }
    }
};