// commands/converter.js
const axios = require('axios');

module.exports = {
    nome: "converter",
    descricao: "Conversor de mídia simples",
    categoria: "multimidia",
    exemplo: "!converter <opção>",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: `🔄 *Conversor Simples*\n\n📌 *Opções:*\n• !converter mp3 - Converte vídeo para MP3\n• !converter gif - Cria GIF de vídeo\n• !converter img - Converte figurinha para imagem\n\n💡 *Como usar:*\n1. Envie a mídia (vídeo/imagem/figurinha)\n2. Responda com !converter <opção>`
            });
        }
        
        const opcao = commandArgs[0].toLowerCase();
        
        try {
            switch(opcao) {
                case 'mp3':
                    // Para MP3, usa o comando tomp3 se for link
                    if (commandArgs[1]) {
                        const tomp3Cmd = require('./tomp3');
                        return await tomp3Cmd.executar(sock, msg, [commandArgs[1]]);
                    }
                    // Se não for link, verifica se tem vídeo na mensagem
                    if (msg.message?.videoMessage) {
                        await sock.sendMessage(fromJid, { 
                            text: "⚠️ Para converter vídeo local para MP3, use:\n1. !tomp3 <link YouTube>\n2. Ou envie o link do vídeo\n\n💡 Vou enviar o vídeo original..."
                        });
                        
                        // Envia o vídeo original como fallback
                        const media = await sock.downloadMediaMessage(msg);
                        const buffer = Buffer.from(media);
                        
                        await sock.sendMessage(fromJid, {
                            video: buffer,
                            caption: "🎬 Vídeo original (conversão local requer FFmpeg)"
                        }, { quoted: msg });
                    }
                    break;
                    
                case 'gif':
                    await sock.sendMessage(fromJid, { 
                        text: "🎞️ *Criar GIF*\n\n📌 *Como fazer:*\n1. Use !togif (se FFmpeg instalado)\n2. Ou use site online: ezgif.com\n3. Envie vídeo curto (<5s)\n\n⚠️ *Requer FFmpeg no servidor*"
                    });
                    break;
                    
                case 'img':
                case 'imagem':
                    // Converte figurinha para imagem
                    if (msg.message?.stickerMessage) {
                        const media = await sock.downloadMediaMessage(msg);
                        const buffer = Buffer.from(media);
                        
                        await sock.sendMessage(fromJid, {
                            image: buffer,
                            caption: "🖼️ Figurinha convertida para imagem"
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(fromJid, { 
                            text: "❌ Envie uma figurinha primeiro"
                        });
                    }
                    break;
                    
                default:
                    await sock.sendMessage(fromJid, { 
                        text: "❌ Opção inválida. Use: mp3, gif ou img"
                    });
            }
            
        } catch (error) {
            console.error('Erro converter:', error);
            await sock.sendMessage(fromJid, { 
                text: "❌ Erro na conversão"
            });
        }
    }
};