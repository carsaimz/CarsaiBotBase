// commands/mp3.js
const axios = require('axios');
const ytdl = require('ytdl-core');

module.exports = {
    nome: "mp3",
    descricao: "Converte YouTube para MP3 via API",
    categoria: "multimidia",
    exemplo: "!mp3 <link YouTube>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: `🎵 *YouTube para MP3*\n\nUse: !mp3 <link YouTube>\nEx: !mp3 https://youtu.be/abc123\n\n⚠️ *Limite:* 10 minutos\n💡 *Dica:* Use !yt <link> áudio para mais opções`
            });
        }
        
        const url = commandArgs[0];
        
        try {
            // Verifica se é link do YouTube
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Apenas links do YouTube são suportados"
                });
            }
            
            await sock.sendMessage(fromJid, { 
                text: "🔍 Obtendo informações..."
            });
            
            // Obtém info do vídeo
            const info = await ytdl.getInfo(url);
            const titulo = info.videoDetails.title;
            const duracao = parseInt(info.videoDetails.lengthSeconds);
            
            if (duracao > 600) { // 10 minutos
                return sock.sendMessage(fromJid, { 
                    text: `❌ Vídeo muito longo: ${Math.floor(duracao/60)}min\nLimite: 10 minutos`
                });
            }
            
            await sock.sendMessage(fromJid, { 
                text: `🎵 *${titulo}*\n⏱️ ${Math.floor(duracao/60)}:${(duracao%60).toString().padStart(2, '0')}\n\n⬇️ Baixando áudio...`
            });
            
            // Baixa áudio com ytdl-core
            const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
            const chunks = [];
            
            stream.on('data', chunk => chunks.push(chunk));
            
            stream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                
                if (buffer.length > 16 * 1024 * 1024) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ Áudio muito grande (>16MB). Vídeo muito longo."
                    });
                }
                
                await sock.sendMessage(fromJid, {
                    audio: buffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${titulo.substring(0, 50)}.mp3`
                }, { quoted: msg });
                
                await sock.sendMessage(fromJid, { 
                    text: `✅ MP3 pronto!\n📁 ${(buffer.length/(1024*1024)).toFixed(1)}MB`
                });
            });
            
            stream.on('error', (err) => {
                console.error('Erro stream:', err);
                sock.sendMessage(fromJid, { 
                    text: "❌ Erro ao baixar áudio"
                });
            });
            
        } catch (error) {
            console.error('Erro mp3:', error);
            await sock.sendMessage(fromJid, { 
                text: `❌ Erro: ${error.message}\nVerifique o link.`
            });
        }
    }
};