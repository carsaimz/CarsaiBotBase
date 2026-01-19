// commands/tiktok.js
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "tiktok",
    descricao: "Baixa vídeos do TikTok",
    categoria: "download",
    exemplo: "!tiktok <link>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "📱 *TikTok Downloader*\n\n📌 *Como usar:*\n!tiktok <link do TikTok>\n\n📝 *Exemplos:*\n• !tiktok https://vm.tiktok.com/abc123\n• !tiktok https://www.tiktok.com/@user/video/123"
            });
        }
        
        const url = commandArgs[0].startsWith('http') ? commandArgs[0] : 'https://' + commandArgs[0];
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Processando link do TikTok...*"
            });
            
            // Usa API pública do TikTok
            const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.data.data) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Não foi possível baixar o vídeo.\nVerifique se o link está correto."
                });
            }
            
            const data = response.data.data;
            const videoUrl = data.play || data.hdplay || data.wmplay;
            
            if (!videoUrl) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Vídeo não disponível para download."
                });
            }
            
            // Informações do vídeo
            const infoText = `📱 *TikTok*\n👤 *Autor:* ${data.author?.nickname || 'Desconhecido'}\n📝 *Descrição:* ${data.title || 'Sem descrição'}\n❤️ *Curtidas:* ${data.digg_count?.toLocaleString() || '0'}\n💬 *Comentários:* ${data.comment_count?.toLocaleString() || '0'}\n🔄 *Compartilhamentos:* ${data.share_count?.toLocaleString() || '0'}\n🎵 *Música:* ${data.music_info?.title || 'Original'}`;
            
            await sock.sendMessage(fromJid, { 
                text: `${infoText}\n\n⬇️ *Baixando vídeo...*`
            });
            
            // Baixa o vídeo
            const videoResponse = await axios.get(videoUrl.startsWith('http') ? videoUrl : `https://www.tikwm.com${videoUrl}`, {
                responseType: 'arraybuffer'
            });
            
            const videoBuffer = Buffer.from(videoResponse.data);
            
            if (videoBuffer.length > 100 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Vídeo muito grande para o WhatsApp (limite: 100MB)."
                });
            }
            
            // Envia o vídeo
            await sock.sendMessage(fromJid, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                fileName: `tiktok_${Date.now()}.mp4`,
                caption: infoText
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Download completo!*\n📁 ${(videoBuffer.length/(1024*1024)).toFixed(1)}MB`
            });
            
        } catch (error) {
            console.error('Erro TikTok:', error);
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro ao baixar:* ${error.message}\n\n💡 *Tente:*\n1. Copiar o link diretamente do app\n2. Verificar se o vídeo não foi removido\n3. Usar outro método de download`
            });
        }
    }
};