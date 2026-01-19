const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "series",
    descricao: "Busca informações sobre séries",
    categoria: "pesquisa",
    exemplo: "Breaking Bad",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o nome da série.\nExemplo: !series Friends"
            });
        }
        
        const serie = commandArgs.join(' ');
        
        try {
            // Usando TVMaze API (gratuita)
            const response = await axios.get(
                `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(serie)}&embed=episodes`
            );
            
            const data = response.data;
            
            const serieTexto = `📺 *${data.name}*\n\n` +
                              `📝 *Resumo:* ${data.summary ? data.summary.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : 'Sem resumo'}\n` +
                              `🎭 *Gêneros:* ${data.genres.join(', ')}\n` +
                              `📅 *Estreia:* ${data.premiered}\n` +
                              `🏁 *Status:* ${data.status}\n` +
                              `⭐ *Avaliação:* ${data.rating?.average || 'N/A'}/10\n` +
                              `🌍 *País:* ${data.network?.country?.name || data.webChannel?.country?.name || 'N/A'}\n` +
                              `📊 *Temporadas:* ${data._embedded?.episodes ? Math.max(...data._embedded.episodes.map(e => e.season)) : 'N/A'}\n` +
                              `🔗 *Site:* ${data.officialSite || 'N/A'}`;
            
            if (data.image?.medium) {
                await sock.sendMessage(fromJid, { 
                    image: { url: data.image.medium },
                    caption: serieTexto
                }, { quoted: msg });
            } else {
                await sock.sendMessage(fromJid, { text: serieTexto }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Série não encontrada." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
