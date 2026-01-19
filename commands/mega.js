// commands/mega.js
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "mega",
    descricao: "Baixa arquivos do MEGA.nz",
    categoria: "download",
    exemplo: "!mega <link>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "⚡ *MEGA Downloader*\n\n📌 *Como usar:*\n!mega <link do MEGA.nz>\n\n📝 *Exemplo:*\n!mega https://mega.nz/file/abc123#xyz456\n\n⚠️ *Arquivos públicos apenas*\n⚠️ *Links com senha não suportados*\n📦 *Limite: 100MB*"
            });
        }
        
        const url = commandArgs[0].startsWith('http') ? commandArgs[0] : 'https://' + commandArgs[0];
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Processando MEGA...*\n⚠️ *Pode demorar para arquivos grandes*"
            });
            
            // Usa API pública para MEGA
            // Primeiro obtém informações do arquivo
            const apiUrl = 'https://meganz-api.vercel.app/api';
            
            const response = await axios.post(apiUrl, {
                url: url
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data;
            
            if (!data.success) {
                throw new Error(data.error || 'Falha na API');
            }
            
            const fileInfo = data.fileInfo;
            const downloadUrl = data.directLink;
            
            const infoText = `⚡ *MEGA.nz*\n📁 *Arquivo:* ${fileInfo.name}\n📊 *Tamanho:* ${formatBytes(fileInfo.size)}\n📄 *Tipo:* ${fileInfo.type || 'Desconhecido'}`;
            
            await sock.sendMessage(fromJid, { 
                text: `${infoText}\n\n⬇️ *Baixando arquivo...*\n⏳ *Isso pode demorar alguns minutos*`
            });
            
            // Configura timeout longo para downloads grandes
            const fileResponse = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 300000, // 5 minutos
                maxContentLength: 150 * 1024 * 1024, // 150MB
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': '*/*',
                    'Connection': 'keep-alive'
                },
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        if (percent % 25 === 0) { // Atualiza a cada 25%
                            sock.sendMessage(fromJid, { 
                                text: `📥 *Download: ${percent}%*`
                            }).catch(() => {});
                        }
                    }
                }
            });
            
            const fileBuffer = Buffer.from(fileResponse.data);
            const actualSize = fileBuffer.length;
            
            if (actualSize > 100 * 1024 * 1024) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ *Arquivo muito grande*\nTamanho: ${(actualSize/(1024*1024)).toFixed(1)}MB\nLimite WhatsApp: 100MB\n\n🔗 *Link direto:* ${downloadUrl}\n💡 *Baixe no PC usando o link acima*`
                });
            }
            
            // Detecta tipo de arquivo
            const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';
            const fileName = fileInfo.name;
            const extension = fileName.split('.').pop().toLowerCase();
            
            let mediaType = 'document';
            let options = {
                fileName: fileName,
                mimetype: contentType,
                caption: infoText
            };
            
            // Verifica tipo de mídia
            if (contentType.startsWith('image/')) {
                mediaType = 'image';
                options.caption = undefined;
            } else if (contentType.startsWith('video/')) {
                mediaType = 'video';
            } else if (contentType.startsWith('audio/')) {
                mediaType = 'audio';
            } else if (extension === 'pdf') {
                options.mimetype = 'application/pdf';
            } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
                options.mimetype = 'application/zip';
            }
            
            // Envia o arquivo
            await sock.sendMessage(fromJid, {
                [mediaType]: fileBuffer,
                ...options
            }, { quoted: msg });
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Download completo!*\n📁 ${formatBytes(actualSize)}\n⚡ *Via MEGA.nz*`
            });
            
        } catch (error) {
            console.error('Erro MEGA:', error);
            
            if (error.code === 'ECONNABORTED') {
                return sock.sendMessage(fromJid, { 
                    text: "⏰ *Timeout excedido*\nO arquivo é muito grande ou a conexão está lenta.\n\n💡 *Solução:* Use o aplicativo MEGA oficial ou baixe no PC."
                });
            }
            
            // Método alternativo usando biblioteca
            try {
                await sock.sendMessage(fromJid, { 
                    text: "🔄 *Tentando método alternativo...*"
                });
                
                // Fallback para biblioteca mega (se instalada)
                try {
                    const MEGA = require('megajs');
                    const file = MEGA.File.fromURL(url);
                    
                    await new Promise((resolve, reject) => {
                        file.loadAttributes((err, attributes) => {
                            if (err) reject(err);
                            
                            if (attributes.size > 100 * 1024 * 1024) {
                                reject(new Error('Arquivo muito grande'));
                            }
                            
                            file.download((err, data) => {
                                if (err) reject(err);
                                
                                sock.sendMessage(fromJid, {
                                    document: data,
                                    fileName: attributes.name,
                                    mimetype: 'application/octet-stream'
                                }, { quoted: msg }).then(() => {
                                    sock.sendMessage(fromJid, { 
                                        text: "✅ *Download via biblioteca concluído!*"
                                    });
                                    resolve();
                                }).catch(reject);
                            });
                        });
                    });
                    
                } catch (libError) {
                    throw new Error('Biblioteca não disponível');
                }
                
            } catch (fallbackError) {
                await sock.sendMessage(fromJid, { 
                    text: `❌ *Falha no download do MEGA*\n\n💡 *Possíveis causas:*\n1. Link inválido ou expirado\n2. Arquivo com senha\n3. Limite de banda excedido\n4. Bloqueio por região\n5. Arquivo muito grande (>100MB)\n\n🔧 *Instale a biblioteca:*\nnpm install megajs\n\n⚠️ *MEGA tem proteções contra download automático.*`
                });
            }
        }
    }
};

// Função auxiliar para formatar bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}