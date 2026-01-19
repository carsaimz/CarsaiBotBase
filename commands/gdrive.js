// commands/gdrive.js
const config = require('../configuration');
const axios = require('axios');
const { google } = require('googleapis');

module.exports = {
    nome: "gdrive",
    descricao: "Baixa arquivos do Google Drive",
    categoria: "download",
    exemplo: "!gdrive <link ou ID>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "☁️ *Google Drive Downloader*\n\n📌 *Como usar:*\n!gdrive <link ou ID do arquivo>\n\n📝 *Exemplos:*\n• !gdrive https://drive.google.com/file/d/ID/view\n• !gdrive ID_DO_ARQUIVO\n\n⚠️ *Arquivos públicos apenas*\n📦 *Limite: 100MB*"
            });
        }
        
        let fileId = extractFileId(commandArgs[0]);
        
        if (!fileId) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Link ou ID inválido*\n\n💡 *Formato correto:*\nhttps://drive.google.com/file/d/SEU_ID_AQUI/view\n\nOu apenas o ID do arquivo."
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Conectando ao Google Drive...*"
            });
            
            // Usa API do Google Drive sem autenticação (para arquivos públicos)
            const drive = google.drive({
                version: 'v3',
                auth: config.googleApiKey // Opcional, pode funcionar sem
            });
            
            // Obtém informações do arquivo
            const fileInfo = await drive.files.get({
                fileId: fileId,
                fields: 'name,size,mimeType,webContentLink'
            });
            
            const fileName = fileInfo.data.name;
            const fileSize = parseInt(fileInfo.data.size || '0');
            const mimeType = fileInfo.data.mimeType;
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            
            // Verifica tamanho
            if (fileSize > 100 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ *Arquivo muito grande*\n📁 ${fileName}\n📊 Tamanho: ${(fileSize/(1024*1024)).toFixed(1)}MB\n⚠️ Limite: 100MB\n\n💡 *Solução:* Use o link direto para baixar no PC`
                });
            }
            
            const fileInfoText = `📁 *${fileName}*\n📊 *Tamanho:* ${formatBytes(fileSize)}\n📄 *Tipo:* ${mimeType.split('/').pop().toUpperCase()}`;
            
            await sock.sendMessage(fromJid, { 
                text: `${fileInfoText}\n\n⬇️ *Baixando arquivo...*`
            });
            
            // Baixa o arquivo
            const response = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            const fileBuffer = Buffer.from(response.data);
            
            // Determina o tipo de mídia
            let mediaType = 'document';
            let options = {
                fileName: fileName,
                mimetype: mimeType,
                caption: `📁 *${fileName}*\n📊 ${formatBytes(fileSize)}\n☁️ *Fonte:* Google Drive`
            };
            
            if (mimeType.startsWith('image/')) {
                mediaType = 'image';
                options.caption = undefined;
            } else if (mimeType.startsWith('video/')) {
                mediaType = 'video';
            } else if (mimeType.startsWith('audio/')) {
                mediaType = 'audio';
            }
            
            // Envia o arquivo
            await sock.sendMessage(fromJid, {
                [mediaType]: fileBuffer,
                ...options
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Download completo!*\n📁 ${formatBytes(fileBuffer.length)}`
            });
            
        } catch (error) {
            console.error('Erro Google Drive:', error);
            
            // Tenta método direto para arquivos públicos
            try {
                await sock.sendMessage(fromJid, { 
                    text: "🔄 *Tentando método direto...*"
                });
                
                const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                const response = await axios.get(directUrl, {
                    responseType: 'arraybuffer',
                    maxRedirects: 5
                });
                
                const buffer = Buffer.from(response.data);
                
                await sock.sendMessage(fromJid, {
                    document: buffer,
                    fileName: `gdrive_${Date.now()}.bin`,
                    mimetype: 'application/octet-stream'
                }, { quoted: msg });
                
                await sock.sendMessage(fromJid, { 
                    text: `✅ *Download direto concluído!*\n📁 ${formatBytes(buffer.length)}`
                });
                
            } catch (directError) {
                await sock.sendMessage(fromJid, { 
                    text: `❌ *Falha no download*\n\n💡 *Possíveis causas:*\n1. Arquivo privado\n2. Limite de downloads excedido\n3. ID inválido\n4. Arquivo muito grande\n\n🔗 *Link direto:* https://drive.google.com/uc?export=download&id=${fileId}`
                });
            }
        }
    }
};

// Extrai ID do arquivo do Google Drive
function extractFileId(input) {
    if (input.includes('drive.google.com')) {
        const match = input.match(/\/d\/([^\/]+)/);
        return match ? match[1] : null;
    }
    // Assume que é o ID diretamente
    return input.length > 10 ? input : null;
}

// Formata bytes para string legível
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}