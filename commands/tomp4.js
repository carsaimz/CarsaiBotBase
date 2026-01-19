// commands/tomp4.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    nome: "tomp4",
    descricao: "Converte vídeos para formato MP4",
    categoria: "multimidia",
    exemplo: "!tomp4",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        // Verifica se há vídeo
        if (!msg.message?.videoMessage) {
            return sock.sendMessage(fromJid, { 
                text: `🎬 *Conversor para MP4*\n\n📌 *Como usar:*\n1. Envie um vídeo\n2. Responda com !tomp4\n\n📝 *Formatos suportados:*\n• AVI, MOV, MKV, WEBM, etc.\n• Vídeos do WhatsApp\n\n⚙️ *Limites:*\n• Duração: Até 5 minutos\n• Tamanho: Até 30MB\n• Saída: MP4 compatível\n\n💡 *Para otimizar vídeos grandes*`
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔧 *Convertendo para MP4...*"
            });
            
            // Baixa o vídeo
            const stream = await sock.downloadMediaMessage(msg);
            const videoBuffer = Buffer.from(stream);
            
            // Verifica tamanho
            if (videoBuffer.length > 50 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ *Vídeo muito grande*\nLimite para conversão: 50MB"
                });
            }
            
            // Cria arquivos temporários
            const timestamp = Date.now();
            const inputPath = path.join(__dirname, `../temp/input_${timestamp}.tmp`);
            const outputPath = path.join(__dirname, `../temp/output_${timestamp}.mp4`);
            
            // Garante pasta temp
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
            }
            
            // Salva vídeo temporariamente
            fs.writeFileSync(inputPath, videoBuffer);
            
            // Converte para MP4
            await new Promise((resolve, reject) => {
                const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${outputPath}" -y`;
                
                exec(ffmpegCmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error('FFmpeg error:', stderr);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Lê o MP4 convertido
            const mp4Buffer = fs.readFileSync(outputPath);
            
            // Limpa arquivos temporários
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            // Verifica tamanho final
            if (mp4Buffer.length > 100 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ *MP4 muito grande para WhatsApp*\nLimite: 100MB"
                });
            }
            
            // Envia o MP4
            await sock.sendMessage(fromJid, {
                video: mp4Buffer,
                mimetype: 'video/mp4',
                fileName: `video_${timestamp}.mp4`,
                caption: "✅ *Vídeo convertido para MP4*"
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `🎬 *Conversão completa!*\n📁 ${(mp4Buffer.length/(1024*1024)).toFixed(1)}MB`
            });
            
        } catch (error) {
            console.error('Erro tomp4:', error);
            
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
                text: `❌ *Erro na conversão*\n\n💡 *Instale FFmpeg:*\nUbuntu: sudo apt install ffmpeg\nWindows: Baixe do site oficial\n\n🔧 *Ou envie vídeo já em MP4*`
            });
        }
    }
};