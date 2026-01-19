const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "google",
    descricao: "Pesquisa no Google",
    categoria: "pesquisa",
    exemplo: "notícias hoje",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o termo para pesquisar no Google.\nExemplo: !google clima hoje"
            });
        }
        
        const termo = commandArgs.join(' ');
        const encodedTerm = encodeURIComponent(termo);
        
        const googleTexto = `🔍 *Pesquisa no Google*\n\n` +
                           `📝 *Termo:* ${termo}\n\n` +
                           `🌐 *Link da pesquisa:*\n` +
                           `https://www.google.com/search?q=${encodedTerm}\n\n` +
                           `💡 *Dicas de pesquisa:*\n` +
                           `• Use aspas para termos exatos\n` +
                           `• Use - para excluir palavras\n` +
                           `• Use site: para pesquisar em sites específicos`;
        
        await sock.sendMessage(fromJid, { text: googleTexto }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
