// commands/mediafire.js
const config = require('../configuration');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    nome: "mediafire",
    descricao: "Baixa arquivos do MediaFire",
    categoria: "download",
    exemplo: "!mediafire <link>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "📦 *MediaFire Downloader*\n\n📌 *Como usar:*\n!mediafire <link do MediaFire>\n\n📝 *Exemplo:*\n!mediafire https://www.mediafire.com/file/abc123/arquivo.zip/file\n\n⚠️ *Arquivos públicos apenas*\n📊 *Limite: 100MB*"
            });
        }
        
        let url = commandArgs[0];
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Processando MediaFire...*"
            });
            
            // Faz requisição para obter página
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            
            // Extrai informações da página
            const fileName = $('div.filename').text().trim() || 'arquivo_mediafire';
            const fileSize = $('div.file-size').text().trim() || 'Tamanho desconhecido';
            const downloadButton = $('a#downloadButton');
            
            let downloadUrl = downloadButton.attr('href');
            
            if (!downloadUrl) {
                // Tenta encontrar link de download alternativo
                downloadUrl = $('a[href*="download"]').attr('href') || 
                             $('a[href*="mediafire.com/file"]').attr('href');
            }
            
            if (!downloadUrl) {
                throw new Error('Link de download não encontrado');
            }
            
            // Garante que é URL completa
            if (!downloadUrl.startsWith('http')) {
                downloadUrl = new URL(downloadUrl, url).href;
            }
            
            const fileInfo = `📦 *MediaFire*\n📁 *Arquivo:* ${fileName}\n📊 *Tamanho:* ${fileSize}`;
            
            await sock.sendMessage(fromJid, { 
                text: `${fileInfo}\n\n⬇️ *Baixando arquivo...*`
            });
            
            // Baixa o arquivo
            const fileResponse = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://www.mediafire.com/'
                },
                maxContentLength: 150 * 1024 * 1024 // 150MB
            });
            
            const fileBuffer = Buffer.from(fileResponse.data);
            const actualSize = fileBuffer.length;
            
            if (actualSize > 100 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ *Arquivo muito grande*\nTamanho: ${(actualSize/(1024*1024)).toFixed(1)}MB\nLimite: 100MB\n\n🔗 *Link direto:* ${downloadUrl}`
                });
            }
            
            // Detecta tipo de arquivo
            const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';
            const extension = fileName.split('.').pop().toLowerCase();
            
            let mediaType = 'document';
            let options = {
                fileName: fileName,
                mimetype: contentType,
                caption: fileInfo
            };
            
            // Verifica se é imagem, vídeo ou áudio
            if (contentType.startsWith('image/')) {
                mediaType = 'image';
                options.caption = undefined;
            } else if (contentType.startsWith('video/')) {
                mediaType = 'video';
            } else if (contentType.startsWith('audio/')) {
                mediaType = 'audio';
            } else if (extension === 'pdf') {
                options.mimetype = 'application/pdf';
            } else if (['zip', 'rar', '7z'].includes(extension)) {
                options.mimetype = 'application/zip';
            } else if (['txt', 'text'].includes(extension)) {
                options.mimetype = 'text/plain';
            }
            
            // Envia o arquivo
            await sock.sendMessage(fromJid, {
                [mediaType]: fileBuffer,
                ...options
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Download completo!*\n📁 ${formatBytes(actualSize)}`
            });
            
        } catch (error) {
            console.error('Erro MediaFire:', error);
            
            // Método alternativo usando API
            try {
                await sock.sendMessage(fromJid, { 
                    text: "🔄 *Tentando método alternativo...*"
                });
                
                // API alternativa para MediaFire
                const apiUrl = `https://media-fire-api.vercel.app/api?url=${encodeURIComponent(url)}`;
                const apiResponse = await axios.get(apiUrl);
                
                if (apiResponse.data.download) {
                    const directUrl = apiResponse.data.download;
                    
                    const fileResponse = await axios.get(directUrl, {
                        responseType: 'arraybuffer'
                    });
                    
                    const buffer = Buffer.from(fileResponse.data);
                    
                    await sock.sendMessage(fromJid, {
                        document: buffer,
                        fileName: apiResponse.data.filename || `mediafire_${Date.now()}.bin`
                    }, { quoted: msg });
                    
                    await sock.sendMessage(fromJid, { 
                        text: "✅ *Download via API concluído!*"
                    });
                } else {
                    throw new Error('API não retornou link');
                }
                
            } catch (apiError) {
                await sock.sendMessage(fromJid, { 
                    text: `❌ *Falha no download*\n\n💡 *Possíveis causas:*\n1. Link inválido ou expirado\n2. Arquivo privado/removido\n3. Limite de downloads excedido\n4. Bloqueio por região\n\n⚠️ *MediaFire pode bloquear downloads automáticos.*`
                });
            }
        }
    }
};

// Função auxiliar para formatar bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}