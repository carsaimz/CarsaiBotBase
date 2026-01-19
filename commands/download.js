// commands/download.js
/* ESTE É COMANDO UNIVERSAL QUE SE COMUNICA COM OUTROS COMANDOS DE DOWNLOAD 
*/
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "download",
    descricao: "Tenta baixar de qualquer link automaticamente",
    categoria: "download",
    exemplo: "!download <qualquer link>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "🌐 *Download Universal*\n\n📌 *Como usar:*\n!download <qualquer link>\n\n🔄 *Suporte automático para:*\n• YouTube\n• TikTok\n• Instagram\n• Facebook\n• Google Drive\n• MediaFire\n• MEGA\n• Links diretos\n\n💡 *Detecta automaticamente a plataforma*"
            });
        }
        
        const url = commandArgs[0].startsWith('http') ? commandArgs[0] : 'https://' + commandArgs[0];
        
        // Detecta a plataforma
        let platform = 'unknown';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = 'youtube';
        } else if (url.includes('tiktok.com')) {
            platform = 'tiktok';
        } else if (url.includes('instagram.com')) {
            platform = 'instagram';
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            platform = 'facebook';
        } else if (url.includes('drive.google.com')) {
            platform = 'gdrive';
        } else if (url.includes('mediafire.com')) {
            platform = 'mediafire';
        } else if (url.includes('mega.nz')) {
            platform = 'mega';
        } else if (url.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
            platform = 'direct_video';
        } else if (url.match(/\.(mp3|wav|flac|aac)$/i)) {
            platform = 'direct_audio';
        } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            platform = 'direct_image';
        } else {
            platform = 'direct';
        }
        
        await sock.sendMessage(fromJid, { 
            text: `🔍 *Detectado:* ${getPlatformName(platform)}\n📎 *URL:* ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}`
        });
        
        try {
            switch (platform) {
                case 'youtube':
                    // Chama comando YouTube
                    const youtubeCmd = require('./youtube');
                    return await youtubeCmd.executar(sock, msg, commandArgs);
                    
                case 'tiktok':
                    // Chama comando TikTok
                    const tiktokCmd = require('./tiktok');
                    return await tiktokCmd.executar(sock, msg, commandArgs);
                    
                case 'instagram':
                    // Chama comando Instagram
                    const instaCmd = require('./instagram');
                    return await instaCmd.executar(sock, msg, commandArgs);
                    
                case 'facebook':
                    // Chama comando Facebook
                    const fbCmd = require('./facebook');
                    return await fbCmd.executar(sock, msg, commandArgs);
                    
                case 'gdrive':
                    // Chama comando Google Drive
                    const gdriveCmd = require('./gdrive');
                    return await gdriveCmd.executar(sock, msg, commandArgs);
                    
                case 'mediafire':
                    // Chama comando MediaFire
                    const mfCmd = require('./mediafire');
                    return await mfCmd.executar(sock, msg, commandArgs);
                    
                case 'mega':
                    // Chama comando MEGA
                    const megaCmd = require('./mega');
                    return await megaCmd.executar(sock, msg, commandArgs);
                    
                default:
                    // Tenta baixar como link direto
                    return await downloadDirectLink(sock, fromJid, url, msg);
            }
        } catch (error) {
            console.error('Erro download universal:', error);
            await sock.sendMessage(fromJid, { 
                text: `❌ *Falha no download*\nPlataforma: ${getPlatformName(platform)}\nErro: ${error.message}\n\n💡 *Tente usar o comando específico:*\n!yt, !tiktok, !instagram, etc.`
            });
        }
    }
};

// Baixa link direto
async function downloadDirectLink(sock, fromJid, url, originalMsg) {
    try {
        await sock.sendMessage(fromJid, { 
            text: "⬇️ *Baixando link direto...*"
        });
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': '*/*'
            },
            maxContentLength: 100 * 1024 * 1024
        });
        
        const buffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const contentLength = parseInt(response.headers['content-length']) || buffer.length;
        
        if (contentLength > 100 * 1024 * 1024) {
            return sock.sendMessage(fromJid, { 
                text: `❌ *Arquivo muito grande*\nTamanho: ${formatBytes(contentLength)}\nLimite: 100MB\n\n🔗 *Link direto:* ${url}`
            });
        }
        
        // Extrai nome do arquivo da URL
        let fileName = url.split('/').pop().split('?')[0];
        if (!fileName || fileName.length < 3) {
            fileName = `download_${Date.now()}.bin`;
        }
        
        // Determina tipo de mídia
        let mediaType = 'document';
        let options = {
            fileName: fileName,
            mimetype: contentType
        };
        
        if (contentType.startsWith('image/')) {
            mediaType = 'image';
        } else if (contentType.startsWith('video/')) {
            mediaType = 'video';
        } else if (contentType.startsWith('audio/')) {
            mediaType = 'audio';
        }
        
        // Envia arquivo
        await sock.sendMessage(fromJid, {
            [mediaType]: buffer,
            ...options
        }, { quoted: originalMsg });
        
        await sock.sendMessage(fromJid, { 
            text: `✅ *Download direto completo!*\n📁 ${formatBytes(buffer.length)}`
        });
        
    } catch (error) {
        throw new Error(`Link direto: ${error.message}`);
    }
}

// Retorna nome da plataforma
function getPlatformName(platform) {
    const names = {
        'youtube': 'YouTube',
        'tiktok': 'TikTok',
        'instagram': 'Instagram',
        'facebook': 'Facebook',
        'gdrive': 'Google Drive',
        'mediafire': 'MediaFire',
        'mega': 'MEGA.nz',
        'direct': 'Link Direto',
        'direct_video': 'Vídeo Direto',
        'direct_audio': 'Áudio Direto',
        'direct_image': 'Imagem Direta',
        'unknown': 'Desconhecido'
    };
    return names[platform] || platform;
}

// Formata bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}