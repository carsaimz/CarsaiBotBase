const config = require('../configuracao');
const translate = require('@vitalets/google-translate-api');

module.exports = {
    nome: "traducao",
    descricao: "Traduz texto entre idiomas",
    categoria: "utilidades",
    exemplo: "pt en Olá mundo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (args.length < 3) {
            return sock.sendMessage(from, { 
                text: "❌ *Uso:* !traducao [de] [para] [texto]\n" +
                      "🌐 *Idiomas:* pt, en, es, fr, de, it, ja, etc.\n" +
                      "📝 *Exemplo:* !traducao pt en Olá mundo"
            });
        }
        
        const de = args[0];
        const para = args[1];
        const texto = args.slice(2).join(' ');
        
        try {
            const resultado = await translate(texto, { from: de, to: para });
            
            const traducaoTexto = `🌍 *Tradução*\n\n` +
                                 `📥 *Original (${resultado.from.language.iso}):* ${texto}\n` +
                                 `📤 *Tradução (${para}):* ${resultado.text}\n` +
                                 `📊 *Confiança:* ${(resultado.raw[0][0][0] * 100).toFixed(1)}%`;
            
            await sock.sendMessage(from, { text: traducaoTexto }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro na tradução. Verifique os idiomas." });
        }
    }
};
