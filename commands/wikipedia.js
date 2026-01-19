const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "wikipedia",
    descricao: "Busca na Wikipedia",
    categoria: "pesquisa",
    exemplo: "Brasil",
    aliases: ["wiki"],
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o termo para pesquisar na Wikipedia.\nExemplo: !wikipedia Inteligência Artificial"
            });
        }
        
        const termo = commandArgs.join(' ');
        
        try {
            const response = await axios.get(
                `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`
            );
            
            const data = response.data;
            
            if (data.type === 'disambiguation') {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Termo ambíguo. Seja mais específico na sua busca."
                });
            }
            
            let resumo = data.extract;
            if (resumo.length > 800) {
                resumo = resumo.substring(0, 800) + '...';
            }
            
            const wikiTexto = `📚 *Wikipedia: ${data.title}*\n\n` +
                             `${resumo}\n\n` +
                             `📖 *Fonte:* ${data.content_urls.desktop.page}\n` +
                             `🕐 *Última atualização:* ${data.timestamp ? new Date(data.timestamp).toLocaleDateString('pt-BR') : 'N/A'}`;
            
            await sock.sendMessage(fromJid, { text: wikiTexto }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: "❌ Artigo não encontrado na Wikipedia. Tente outro termo."
            });
        }
    }
};
/* CarsaiBot - cbot - carsai */
