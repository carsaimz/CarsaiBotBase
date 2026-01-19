const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "filme",
    descricao: "Busca informações sobre filmes",
    categoria: "pesquisa",
    exemplo: "Titanic",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Digite o nome do filme.\nExemplo: !filme Star Wars"
            });
        }
        
        const filme = commandArgs.join(' ');
        const apiKey = config.omdbApiKey || '7d2ac176';
        
        try {
            const response = await axios.get(
                `http://www.omdbapi.com/?t=${encodeURIComponent(filme)}&apikey=${apiKey}`
            );
            
            const data = response.data;
            
            if (data.Response === 'False') {
                return sock.sendMessage(fromJid, { text: "❌ Filme não encontrado." });
            }
            
            const filmeTexto = `🎬 *${data.Title}* (${data.Year})\n\n` +
                              `📝 *Sinopse:* ${data.Plot}\n` +
                              `🎭 *Gênero:* ${data.Genre}\n` +
                              `🎥 *Diretor:* ${data.Director}\n` +
                              `👤 *Elenco:* ${data.Actors}\n` +
                              `⏱️ *Duração:* ${data.Runtime}\n` +
                              `⭐ *Avaliação IMDb:* ${data.imdbRating}/10\n` +
                              `🏆 *Prêmios:* ${data.Awards}\n` +
                              `🌍 *País:* ${data.Country}\n` +
                              `🎞️ *Tipo:* ${data.Type}`;
            
            if (data.Poster && data.Poster !== 'N/A') {
                await sock.sendMessage(fromJid, { 
                    image: { url: data.Poster },
                    caption: filmeTexto
                }, { quoted: msg });
            } else {
                await sock.sendMessage(fromJid, { text: filmeTexto }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao buscar informações do filme." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
