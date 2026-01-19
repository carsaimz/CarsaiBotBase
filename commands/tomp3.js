// commands/tomp3.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    nome: "tomp3",
    descricao: "Converte vídeo/áudio para MP3",
    categoria: "multimidia",
    exemplo: "!tomp3",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        // Verifica se há mídia ou se é link
        const hasMedia = msg.message?.videoMessage || msg.message?.audioMessage;
        const hasLink = commandArgs[0]?.includes('http');
        
        if (!hasMedia && !hasLink) {
            return sock.sendMessage(fromJid, { 
                text: `🎵 *Conversor para MP3*\n\n📌 *Como usar:*\n1. Envie um vídeo ou áudio\n2. Responda com !tomp3\n\n📝 *Também funciona com:*\n• !tomp3 <link do YouTube>\n• !tomp3 <link de áudio/vídeo>\n\n⚙️ *Limites:*\n• Vídeos: Até 10 minutos\n• Tamanho: Até 50MB\n• Qualidade: 128kbps\n\n💡 *Para YouTube:* Use !yt <link> áudio`
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔧 *Convertendo para MP3...*"
            });
            
            let audioBuffer;
            
            if (hasLink) {
                // Se for link, baixa primeiro
                const url = commandArgs[0];
                await sock.sendMessage(fromJid, { 
                    text: "⬇️ *Baixando áudio do link...*"
                });
                
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                audioBuffer = Buffer.from(response.data);
                
            } else if (hasMedia) {
                // Baixa mídia do WhatsApp
                const stream = await sock.downloadMediaMessage(msg);
                audioBuffer = Buffer.from(stream);
            }
            
            if (!audioBuffer || audioBuffer.length === 0) {
                throw new Error('Falha ao baixar mídia');
            }
            
            // Verifica tamanho
            if (audioBuffer.length > 50 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ *Arquivo muito grande*\nLimite: 50MB\n\n💡 *Tente um arquivo menor*"
                });
            }
            
            // Cria nome do arquivo
            const timestamp = Date.now();
            const inputPath = path.join(__dirname, `../temp/input_${timestamp}.tmp`);
            const outputPath = path.join(__dirname, `../temp/output_${timestamp}.mp3`);
            
            // Garante que a pasta temp existe
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
            }
            
            // Salva buffer temporariamente
            fs.writeFileSync(inputPath, audioBuffer);
            
            // Converte para MP3 usando ffmpeg
            await new Promise((resolve, reject) => {
                const ffmpegCmd = `ffmpeg -i "${inputPath}" -codec:a libmp3lame -qscale:a 2 "${outputPath}" -y`;
                
                exec(ffmpegCmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error('FFmpeg error:', stderr);
                        
                        // Fallback: se ffmpeg falhar, tenta enviar o áudio original
                        if (hasMedia && msg.message.audioMessage) {
                            // Já é áudio, envia como está
                            fs.readFile(inputPath, (err, data) => {
                                if (!err) {
                                    audioBuffer = data;
                                    resolve();
                                } else {
                                    reject(error);
                                }
                            });
                        } else {
                            reject(error);
                        }
                    } else {
                        resolve();
                    }
                });
            });
            
            // Lê o MP3 convertido
            let finalBuffer;
            if (fs.existsSync(outputPath)) {
                finalBuffer = fs.readFileSync(outputPath);
                
                // Limpa arquivos temporários
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            } else {
                // Usa buffer original se conversão falhou
                finalBuffer = audioBuffer;
                if (fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }
            }
            
            // Verifica tamanho final
            if (finalBuffer.length > 16 * 1024 * 1024) { // Limite WhatsApp para áudio
                return sock.sendMessage(fromJid, { 
                    text: `❌ *MP3 muito grande*\nTamanho: ${(finalBuffer.length/(1024*1024)).toFixed(1)}MB\nLimite WhatsApp: 16MB\n\n💡 *Tente:*\n• Vídeo mais curto\n• Qualidade menor\n• Link direto do áudio`
                });
            }
            
            // Envia o MP3
            await sock.sendMessage(fromJid, {
                audio: finalBuffer,
                mimetype: 'audio/mpeg',
                fileName: `audio_${timestamp}.mp3`
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Conversão para MP3 completa!*\n📁 ${(finalBuffer.length/(1024*1024)).toFixed(1)}MB`
            });
            
        } catch (error) {
            console.error('Erro tomp3:', error);
            
            // Limpa arquivos temporários em caso de erro
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
            } catch (cleanError) {
                // Ignora erros de limpeza
            }
            
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro na conversão*\n\n💡 *Possíveis causas:*\n1. FFmpeg não instalado\n2. Formato não suportado\n3. Arquivo corrompido\n\n🔧 *Solução:*\n• Instale FFmpeg no servidor\n• Use vídeos em formatos comuns\n• Para YouTube: use !yt <link> áudio`
            });
        }
    }
};