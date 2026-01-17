const config = require('../configuracao');
const axios = require('axios');

module.exports = {
    nome: "filme",
    descricao: "Busca informações sobre filmes",
    categoria: "pesquisa",
    exemplo: "Titanic",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "❌ Digite o nome do filme.\nExemplo: !filme Star Wars"
            });
        }
        
        const filme = args.join(' ');
        const apiKey = config.omdbApiKey || '7d2ac176';
        
        try {
            const response = await axios.get(
                `http://www.omdbapi.com/?t=${encodeURIComponent(filme)}&apikey=${apiKey}`
            );
            
            const data = response.data;
            
            if (data.Response === 'False') {
                return sock.sendMessage(from, { text: "❌ Filme não encontrado." });
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
                await sock.sendMessage(from, { 
                    image: { url: data.Poster },
                    caption: filmeTexto
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: filmeTexto }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao buscar informações do filme." });
        }
    }
};
