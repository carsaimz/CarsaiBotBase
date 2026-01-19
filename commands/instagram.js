// commands/instagram.js
const config = require('../configuration');
const axios = require('axios');
const { Instagram } = require('instagram-web-api');

module.exports = {
    nome: "instagram",
    descricao: "Baixa vídeos e fotos do Instagram",
    categoria: "download",
    exemplo: "!instagram <link>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "📷 *Instagram Downloader*\n\n📌 *Como usar:*\n!instagram <link do Instagram>\n\n📝 *Suporte:*\n• Fotos\n• Vídeos\n• Reels\n• Stories (às vezes)\n\n⚠️ *Links diretos apenas*"
            });
        }
        
        const url = commandArgs[0].startsWith('http') ? commandArgs[0] : 'https://' + commandArgs[0];
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Processando Instagram...*"
            });
            
            // API pública para Instagram
            const apiUrl = `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info`;
            
            // Extrai código do post
            const postCode = url.split('/').filter(part => part).pop();
            
            const response = await axios.get(apiUrl, {
                params: {
                    code_or_id_or_url: postCode
                },
                headers: {
                    'X-RapidAPI-Key': config.rapidApiKey || '',
                    'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
                }
            });
            
            const data = response.data.data;
            
            if (!data) {
                // Fallback para API alternativa
                return await instagramFallback(sock, msg, fromJid, url);
            }
            
            const postInfo = `📷 *Instagram*\n👤 *Autor:* ${data.owner?.username || 'Desconhecido'}\n📝 *Legenda:* ${data.caption?.text?.substring(0, 200) || 'Sem legenda'}${data.caption?.text?.length > 200 ? '...' : ''}\n❤️ *Curtidas:* ${data.like_count?.toLocaleString() || '0'}\n💬 *Comentários:* ${data.comment_count?.toLocaleString() || '0'}`;
            
            await sock.sendMessage(fromJid, { 
                text: `${postInfo}\n\n⬇️ *Baixando mídia...*`
            });
            
            // Verifica se é carrossel (múltiplas mídias)
            if (data.carousel_media && data.carousel_media.length > 0) {
                for (let i = 0; i < Math.min(data.carousel_media.length, 5); i++) {
                    const media = data.carousel_media[i];
                    const mediaUrl = media.video_versions?.[0]?.url || media.image_versions2?.candidates?.[0]?.url;
                    
                    if (mediaUrl) {
                        await downloadAndSendMedia(sock, fromJid, mediaUrl, i + 1, data.carousel_media.length, msg);
                    }
                }
            } else {
                // Mídia única
                const mediaUrl = data.video_versions?.[0]?.url || data.image_versions2?.candidates?.[0]?.url;
                if (mediaUrl) {
                    await downloadAndSendMedia(sock, fromJid, mediaUrl, 1, 1, msg);
                } else {
                    throw new Error('Mídia não encontrada');
                }
            }
            
            await sock.sendMessage(fromJid, { 
                text: "✅ *Todos os downloads concluídos!*"
            });
            
        } catch (error) {
            console.error('Erro Instagram:', error);
            await instagramFallback(sock, msg, fromJid, url);
        }
    }
};

// Função fallback para Instagram
async function instagramFallback(sock, msg, fromJid, url) {
    try {
        await sock.sendMessage(fromJid, { 
            text: "🔄 *Usando método alternativo...*"
        });
        
        // API alternativa
        const apiUrls = [
            `https://api.instagram.com/oembed/?url=${url}`,
            `https://www.instagram.com/p/${url.split('/').filter(p => p).pop()}/?__a=1`
        ];
        
        let mediaUrl = null;
        
        for (const apiUrl of apiUrls) {
            try {
                const response = await axios.get(apiUrl);
                const data = response.data;
                
                if (data.thumbnail_url) {
                    mediaUrl = data.thumbnail_url;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!mediaUrl) {
            throw new Error('Não foi possível acessar o post');
        }
        
        await downloadAndSendMedia(sock, fromJid, mediaUrl, 1, 1, msg);
        
    } catch (fallbackError) {
        await sock.sendMessage(fromJid, { 
            text: `❌ *Erro ao baixar do Instagram*\n\n💡 *Possíveis causas:*\n1. Post privado\n2. Conta verificada\n3. API indisponível\n4. Link inválido\n\n⚠️ *Instagram limita downloads de postagens.*`
        });
    }
}

// Função auxiliar para baixar e enviar mídia
async function downloadAndSendMedia(sock, fromJid, url, current, total, originalMsg) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const isVideo = url.includes('.mp4') || response.headers['content-type']?.includes('video');
    
    if (isVideo) {
        await sock.sendMessage(fromJid, {
            video: buffer,
            mimetype: 'video/mp4',
            fileName: `instagram_${Date.now()}.mp4`
        }, { quoted: originalMsg });
    } else {
        await sock.sendMessage(fromJid, {
            image: buffer,
            mimetype: 'image/jpeg',
            caption: total > 1 ? `📷 ${current}/${total}` : undefined
        }, { quoted: originalMsg });
    }
}