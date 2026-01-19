const config = require('../configuration');
const translate = require('@vitalets/google-translate-api');

module.exports = {
    nome: "traducao",
    descricao: "Traduz text entre idiomas",
    categoria: "utilidades",
    exemplo: "pt en Olá mundo",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (commandArgs.length < 3) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Uso:* !traducao [de] [para] [text]\n" +
                      "🌐 *Idiomas:* pt, en, es, fr, de, it, ja, etc.\n" +
                      "📝 *Exemplo:* !traducao pt en Olá mundo"
            });
        }
        
        const de = commandArgs[0];
        const para = commandArgs[1];
        const text = commandArgs.slice(2).join(' ');
        
        try {
            const resultado = await translate(text, { fromJid: de, to: para });
            
            const traducaoTexto = `🌍 *Tradução*\n\n` +
                                 `📥 *Original (${resultado.fromJid.language.iso}):* ${text}\n` +
                                 `📤 *Tradução (${para}):* ${resultado.text}\n` +
                                 `📊 *Confiança:* ${(resultado.raw[0][0][0] * 100).toFixed(1)}%`;
            
            await sock.sendMessage(fromJid, { text: traducaoTexto }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro na tradução. Verifique os idiomas." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
