// commands/facebook.js
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "facebook",
    descricao: "Baixa vídeos do Facebook",
    categoria: "download",
    exemplo: "!facebook <link>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "📘 *Facebook Downloader*\n\n📌 *Como usar:*\n!facebook <link do vídeo do Facebook>\n\n⚠️ *Apenas vídeos públicos*\n⚠️ *Pode não funcionar para alguns vídeos*"
            });
        }
        
        const url = commandArgs[0].startsWith('http') ? commandArgs[0] : 'https://' + commandArgs[0];
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Processando Facebook...*"
            });
            
            // API pública para Facebook
            const apiUrl = 'https://fb.watch/download/';
            
            const response = await axios.post(apiUrl, {
                url: url
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            const data = response.data;
            
            if (!data.success || !data.url) {
                // Tenta método alternativo
                return await facebookAlternative(sock, fromJid, url, msg);
            }
            
            await sock.sendMessage(fromJid, { 
                text: `⬇️ *Baixando vídeo...*\n📁 *Qualidade:* ${data.quality || 'HD'}`
            });
            
            // Baixa o vídeo
            const videoResponse = await axios.get(data.url, {
                responseType: 'arraybuffer',
                maxContentLength: 200 * 1024 * 1024 // 200MB
            });
            
            const videoBuffer = Buffer.from(videoResponse.data);
            
            if (videoBuffer.length > 100 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ *Vídeo muito grande*\nTamanho: ${(videoBuffer.length/(1024*1024)).toFixed(1)}MB\nLimite WhatsApp: 100MB\n\n💡 *Solução:* Tente baixar em qualidade menor`
                });
            }
            
            // Envia o vídeo
            await sock.sendMessage(fromJid, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                fileName: `facebook_${Date.now()}.mp4`,
                caption: `📘 *Facebook Video*\n🔗 *Fonte:* ${url}`
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Download completo!*\n📁 ${(videoBuffer.length/(1024*1024)).toFixed(1)}MB`
            });
            
        } catch (error) {
            console.error('Erro Facebook:', error);
            await facebookAlternative(sock, fromJid, url, msg);
        }
    }
};

// Método alternativo para Facebook
async function facebookAlternative(sock, fromJid, url, originalMsg) {
    try {
        await sock.sendMessage(fromJid, { 
            text: "🔄 *Tentando método alternativo...*"
        });
        
        // Usa serviços externos
        const services = [
            `https://getfvid.com/downloader`,
            `https://fbdown.net/download.php`
        ];
        
        for (const service of services) {
            try {
                const response = await axios.get(service, {
                    params: { url: url },
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });
                
                const html = response.data;
                
                // Extrai link do vídeo do HTML (simplificado)
                const videoRegex = /(https?:\/\/[^\s"']*\.mp4[^\s"']*)/gi;
                const matches = html.match(videoRegex);
                
                if (matches && matches[0]) {
                    const videoUrl = matches[0];
                    
                    const videoResponse = await axios.get(videoUrl, {
                        responseType: 'arraybuffer'
                    });
                    
                    const videoBuffer = Buffer.from(videoResponse.data);
                    
                    await sock.sendMessage(fromJid, {
                        video: videoBuffer,
                        mimetype: 'video/mp4',
                        fileName: `fb_${Date.now()}.mp4`
                    }, { quoted: originalMsg });
                    
                    await sock.sendMessage(fromJid, { 
                        text: "✅ *Download concluído via método alternativo!*"
                    });
                    
                    return;
                }
            } catch (e) {
                continue;
            }
        }
        
        throw new Error('Todos os métodos falharam');
        
    } catch (fallbackError) {
        await sock.sendMessage(fromJid, { 
            text: `❌ *Falha ao baixar do Facebook*\n\n💡 *Possíveis causas:*\n1. Vídeo privado\n2. Link inválido\n3. Restrições do Facebook\n4. Vídeo muito longo\n\n⚠️ *Facebook tem proteções contra download.*`
        });
    }
}