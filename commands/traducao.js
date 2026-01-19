const config = require('../configuration');
// commands/traducao.js
const axios = require('axios');

module.exports = {
    nome: "traducao",
    descricao: "Traduz texto entre idiomas",
    categoria: "utilidades",
    exemplo: "!traducao pt en Olá mundo",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (commandArgs.length < 3) {
            return sock.sendMessage(fromJid, { 
                text: `🌐 *Tradutor Simples*\n\n📌 *Como usar:*\n!traducao <de> <para> <texto>\n\n📝 *Exemplos:*\n• !traducao pt en Olá mundo\n• !traducao en es Hello world\n• !traducao auto pt Texto a traduzir\n\n📚 *Códigos de idioma:*\npt - Português\nen - Inglês\nes - Espanhol\nfr - Francês\nde - Alemão\nit - Italiano\nja - Japonês\nko - Coreano\nzh - Chinês\nar - Árabe\nru - Russo\n\n💡 *Use "auto" para detecção automática*`
            });
        }
        
        const deIdioma = commandArgs[0].toLowerCase();
        const paraIdioma = commandArgs[1].toLowerCase();
        const texto = commandArgs.slice(2).join(' ');
        
        if (texto.length > 1000) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Texto muito longo*\nLimite: 1000 caracteres"
            });
        }
        
        try {
            await sock.sendMessage(fromJid, { 
                text: "🔍 *Traduzindo...*"
            });
            
            // Método 1: API do Google Translate (simples)
            const traducao = await traduzirGoogle(texto, deIdioma, paraIdioma);
            
            if (traducao) {
                return sock.sendMessage(fromJid, { 
                    text: `🌐 *Tradução*\n\n📥 *Original (${deIdioma === 'auto' ? 'Auto-detectado' : deIdioma}):*\n${texto}\n\n📤 *Traduzido (${paraIdioma}):*\n${traducao.text}\n\n🎯 *Idioma detectado:* ${traducao.detectedLanguage || deIdioma}`
                }, { quoted: msg });
            }
            
            // Método 2: Fallback com MyMemory API
            const traducao2 = await traduzirMyMemory(texto, deIdioma, paraIdioma);
            
            if (traducao2) {
                return sock.sendMessage(fromJid, { 
                    text: `🌐 *Tradução*\n\n📥 *Original (${deIdioma}):*\n${texto}\n\n📤 *Traduzido (${paraIdioma}):*\n${traducao2}`
                }, { quoted: msg });
            }
            
            throw new Error('Nenhum serviço de tradução disponível');
            
        } catch (error) {
            console.error('Erro tradução:', error);
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro na tradução*\n\n💡 *Tente:*\n• Verificar os códigos de idioma\n• Texto mais curto\n• Outra combinação de idiomas\n\n🔧 *Método alternativo:* Envie "!traducao" para ver ajuda`
            });
        }
    }
};

// Função 1: Google Translate via API pública
async function traduzirGoogle(texto, de, para) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${de}&tl=${para}&dt=t&q=${encodeURIComponent(texto)}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const data = response.data;
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            const traducao = data[0].map(item => item[0]).join('');
            const detectedLang = data[2] || de;
            
            return {
                text: traducao,
                detectedLanguage: detectedLang
            };
        }
        
        return null;
    } catch (error) {
        console.log('Google Translate falhou:', error.message);
        return null;
    }
}

// Função 2: MyMemory Translation API (fallback)
async function traduzirMyMemory(texto, de, para) {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${de}|${para}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const data = response.data;
        
        if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
        
        return null;
    } catch (error) {
        console.log('MyMemory falhou:', error.message);
        return null;
    }
}