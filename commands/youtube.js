// commands/youtube.js
const config = require('../configuration');
const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

module.exports = {
    nome: "yt",
    descricao: "Baixa vídeos ou músicas do YouTube",
    categoria: "download",
    exemplo: "!youtube <link ou nome> [áudio]",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "🎵 *YouTube Downloader*\n\n📌 *Como usar:*\n!youtube <link ou nome do vídeo> [áudio]\n\n📝 *Exemplos:*\n• !youtube https://youtube.com/watch?v=...\n• !youtube música nome - para pesquisar\n• !youtube link áudio - baixa só áudio"
            });
        }
        
        const isAudio = commandArgs.includes('áudio') || commandArgs.includes('audio') || commandArgs.includes('mp3');
        const query = commandArgs.filter(arg => !['áudio', 'audio', 'mp3'].includes(arg.toLowerCase())).join(' ');
        
        try {
            let videoId, videoInfo;
            
            // Verifica se é link direto
            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                const url = query.startsWith('http') ? query : 'https://' + query;
                videoId = ytdl.getVideoID(url);
                videoInfo = await ytdl.getInfo(videoId);
            } else {
                // Pesquisa pelo nome
                await sock.sendMessage(fromJid, { 
                    text: "🔍 *Pesquisando no YouTube...*"
                });
                
                const searchResults = await yts(query);
                if (!searchResults.videos || searchResults.videos.length === 0) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ Nenhum vídeo encontrado para essa pesquisa."
                    });
                }
                
                const video = searchResults.videos[0];
                videoId = video.videoId;
                videoInfo = await ytdl.getInfo(video.url);
                
                await sock.sendMessage(fromJid, { 
                    text: `✅ *Encontrado:* ${video.title}\n📊 *Duração:* ${video.timestamp}\n👁️ *Visualizações:* ${video.views.toLocaleString()}`
                });
            }
            
            const title = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
            const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
            
            // Verifica limite de tamanho/duração
            const maxDuration = 30 * 60; // 30 minutos
            if (duration > maxDuration) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ *Vídeo muito longo*\nDuração: ${Math.floor(duration/60)}min\nLimite: 30 minutos\n\n💡 *Solução:* Use !ytmp3 para extrair apenas o áudio`
                });
            }
            
            await sock.sendMessage(fromJid, { 
                text: `⬇️ *Baixando ${isAudio ? 'áudio' : 'vídeo'}...*\n🎬 *${title}*\n⏱️ ${Math.floor(duration/60)}:${(duration%60).toString().padStart(2, '0')}`
            });
            
            // Configurações de qualidade
            let quality = 'highest';
            let filter = isAudio ? 'audioonly' : 'audioandvideo';
            
            const stream = ytdl(videoInfo.videoDetails.video_url, {
                filter: filter,
                quality: quality
            });
            
            // Buffer do vídeo/áudio
            const chunks = [];
            stream.on('data', chunk => chunks.push(chunk));
            
            stream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const fileSize = buffer.length;
                
                if (fileSize > 100 * 1024 * 1024) { // 100MB limite do WhatsApp
                    return sock.sendMessage(fromJid, { 
                        text: `❌ *Arquivo muito grande*\nTamanho: ${(fileSize/(1024*1024)).toFixed(1)}MB\nLimite: 100MB\n\n💡 *Solução:* Use !ytmp3 para áudio apenas`
                    });
                }
                
                // Envia o arquivo
                if (isAudio) {
                    await sock.sendMessage(fromJid, {
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(fromJid, {
                        video: buffer,
                        mimetype: 'video/mp4',
                        fileName: `${title}.mp4`,
                        caption: `🎬 *${title}*`
                    }, { quoted: msg });
                }
                
                await sock.sendMessage(fromJid, { 
                    text: `✅ *Download completo!*\n📁 ${(fileSize/(1024*1024)).toFixed(1)}MB`
                });
            });
            
            stream.on('error', (err) => {
                console.error('Erro no download:', err);
                sock.sendMessage(fromJid, { 
                    text: "❌ Erro ao baixar o vídeo. Tente novamente."
                });
            });
            
        } catch (error) {
            console.error('Erro YouTube:', error);
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro:* ${error.message}\n\n💡 *Dicas:*\n• Verifique o link\n• Vídeo pode estar privado/removido\n• Tente usar o comando de pesquisa: !youtube nome do vídeo`
            });
        }
    }
};