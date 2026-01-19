
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "anime",
    descricao: "Busca informações sobre animes",
    categoria: "pesquisa",
    exemplo: "!anime Naruto",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "🎌 *Como usar:*\n!anime <nome do anime>\n\nExemplos:\n• !anime Attack on Titan\n• !anime One Piece\n• !anime Demon Slayer"
            });
        }
        
        const query = commandArgs.join(' ');
        const apiKey = config.tmdbApiKey;
        
        if (!apiKey) {
            return sock.sendMessage(fromJid, { 
                text: "❌ API Key não configurada. Adicione sua chave do TMDB no configuration.js"
            });
        }
        
        try {
            // Busca anime no TMDB (como série)
            const searchResponse = await axios.get(
                `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}&with_genres=16`
            );
            
            let anime;
            let animeId;
            
            if (searchResponse.data.results && searchResponse.data.results.length > 0) {
                anime = searchResponse.data.results.sort((a, b) => b.popularity - a.popularity)[0];
                animeId = anime.id;
            } else {
                // Se não encontrar como série, tenta como filme
                const movieSearch = await axios.get(
                    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}&with_genres=16`
                );
                
                if (!movieSearch.data.results || movieSearch.data.results.length === 0) {
                    return sock.sendMessage(fromJid, { 
                        text: `❌ Nenhum anime encontrado para "${query}"\n💡 Tente buscar pelo título em inglês ou japonês`
                    });
                }
                
                anime = movieSearch.data.results.sort((a, b) => b.popularity - a.popularity)[0];
                animeId = anime.id;
            }
            
            // Determina se é série ou filme
            const isTv = anime.media_type === 'tv' || !anime.media_type;
            const endpoint = isTv ? 'tv' : 'movie';
            
            // Busca detalhes completos
            const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/${endpoint}/${animeId}?api_key=${apiKey}&language=pt-BR&append_to_response=credits`
            );
            
            const details = detailsResponse.data;
            
            // Formata a mensagem
            let mensagem = `🎌 *${details.title || details.name}*`;
            
            // Título original (japonês/inglês)
            if ((details.original_title && details.original_title !== details.title) || 
                (details.original_name && details.original_name !== details.name)) {
                const original = details.original_title || details.original_name;
                mensagem += `\n*Título Original:* ${original}`;
            }
            
            // Tipo
            mensagem += `\n📺 *Tipo:* ${isTv ? 'Série' : 'Filme'}`;
            
            // Datas
            if (details.release_date || details.first_air_date) {
                const data = new Date(details.release_date || details.first_air_date);
                mensagem += ` • 📅 *${isTv ? 'Estreia:' : 'Lançamento:'}* ${data.getFullYear()}`;
                
                if (isTv && details.status === 'Ended' && details.last_air_date) {
                    const anoFim = new Date(details.last_air_date).getFullYear();
                    mensagem += ` - ${anoFim}`;
                }
            }
            
            mensagem += '\n\n';
            
            // Sinopse
            if (details.overview) {
                const sinopse = details.overview.length > 350 
                    ? details.overview.substring(0, 350) + '...' 
                    : details.overview;
                mensagem += `📖 *Sinopse:* ${sinopse}\n\n`;
            }
            
            // Avaliação
            if (details.vote_average) {
                const estrelas = Math.round(details.vote_average / 2);
                mensagem += `⭐ *Avaliação:* ${details.vote_average.toFixed(1)}/10`;
                if (details.vote_count) {
                    mensagem += ` (${formatarNumero(details.vote_count)} votos)`;
                }
                mensagem += `\n${'★'.repeat(estrelas)}${'☆'.repeat(5 - estrelas)}\n`;
            }
            
            // Gêneros (filtra para gêneros de anime)
            if (details.genres?.length > 0) {
                const generosAnime = details.genres
                    .filter(g => ['Animação', 'Aventura', 'Fantasia', 'Ficção científica', 'Ação'].includes(g.name))
                    .map(g => g.name);
                
                if (generosAnime.length > 0) {
                    mensagem += `🎭 *Gêneros:* ${generosAnime.join(', ')}\n`;
                }
            }
            
            // Informações específicas
            if (isTv) {
                if (details.number_of_seasons) {
                    mensagem += `📚 *Temporadas:* ${details.number_of_seasons}`;
                    if (details.number_of_episodes) {
                        mensagem += ` (${details.number_of_episodes} episódios)`;
                    }
                    mensagem += '\n';
                }
                
                if (details.episode_run_time?.length > 0) {
                    mensagem += `⏱️ *Duração/episódio:* ${details.episode_run_time[0]}min\n`;
                }
            } else {
                if (details.runtime) {
                    const horas = Math.floor(details.runtime / 60);
                    const minutos = details.runtime % 60;
                    mensagem += `⏱️ *Duração:* ${horas}h ${minutos}min\n`;
                }
            }
            
            // Status
            if (details.status) {
                mensagem += `📊 *Status:* ${traduzirStatusAnime(details.status)}\n`;
            }
            
            // Estúdio (busca na equipe de produção)
            if (details.credits?.crew) {
                const studio = details.credits.crew.find(p => 
                    p.job === 'Producer' || p.department === 'Production'
                );
                if (studio) {
                    mensagem += `🏢 *Estúdio:* ${studio.name}\n`;
                }
            }
            
            // Popularidade
            if (details.popularity) {
                mensagem += `🔥 *Popularidade:* ${Math.round(details.popularity)} pontos\n`;
            }
            
            // Link
            mensagem += `\n🔗 *Mais info:* https://www.themoviedb.org/${endpoint}/${animeId}`;
            mensagem += `\n\n💡 *Dica:* Para mais detalhes sobre animes, use sites especializados como MyAnimeList ou AniList`;
            
            // Envia com poster
            if (details.poster_path) {
                const posterUrl = `https://image.tmdb.org/t/p/w500${details.poster_path}`;
                await sock.sendMessage(fromJid, { 
                    image: { url: posterUrl },
                    caption: mensagem
                }, { quoted: msg });
            } else {
                await sock.sendMessage(fromJid, { text: mensagem }, { quoted: msg });
            }
            
        } catch (error) {
            console.error("Erro no comando anime:", error.message);
            await sock.sendMessage(fromJid, { 
                text: "❌ Erro ao buscar o anime. Tente novamente."
            });
        }
    }
};

// Funções auxiliares
function formatarNumero(num) {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.', ',') + 'K';
    return num.toString();
}

function traduzirStatusAnime(status) {
    const statusMap = {
        'Returning Series': 'Em lançamento',
        'Ended': 'Concluído',
        'Canceled': 'Cancelado',
        'Released': 'Lançado',
        'In Production': 'Em produção',
        'Post Production': 'Pós-produção'
    };
    return statusMap[status] || status;
}