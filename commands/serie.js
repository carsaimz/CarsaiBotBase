
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "serie",
    descricao: "Busca informações sobre séries de TV",
    categoria: "pesquisa",
    exemplo: "!serie Breaking Bad",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "📺 *Como usar:*\n!serie <nome da série>\n\nExemplos:\n• !serie Game of Thrones\n• !serie Stranger Things\n• !serie The Walking Dead"
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
            // Busca a série
            const searchResponse = await axios.get(
                `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`
            );
            
            if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ Nenhuma série encontrada para "${query}"`
                });
            }
            
            // Pega a série mais relevante
            const serie = searchResponse.data.results.sort((a, b) => b.popularity - a.popularity)[0];
            const serieId = serie.id;
            
            // Busca detalhes completos
            const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/tv/${serieId}?api_key=${apiKey}&language=pt-BR&append_to_response=credits,content_ratings`
            );
            
            const details = detailsResponse.data;
            
            // Busca a última temporada
            let ultimaTemporada = null;
            if (details.seasons && details.seasons.length > 0) {
                const lastSeason = await axios.get(
                    `https://api.themoviedb.org/3/tv/${serieId}/season/${details.seasons.length}?api_key=${apiKey}&language=pt-BR`
                );
                ultimaTemporada = lastSeason.data;
            }
            
            // Formata a mensagem
            let mensagem = `📺 *${details.name}*`;
            
            if (details.original_name !== details.name) {
                mensagem += `\n*Título Original:* ${details.original_name}`;
            }
            
            if (details.first_air_date) {
                const anoInicio = new Date(details.first_air_date).getFullYear();
                mensagem += `\n📅 *Estreia:* ${anoInicio}`;
                
                if (details.status === 'Ended' && details.last_air_date) {
                    const anoFim = new Date(details.last_air_date).getFullYear();
                    mensagem += ` - ${anoFim}`;
                } else if (details.status === 'Returning Series') {
                    mensagem += ` - Atual`;
                }
            }
            
            mensagem += '\n\n';
            
            // Sinopse
            if (details.overview) {
                const sinopse = details.overview.length > 350 
                    ? details.overview.substring(0, 350) + '...' 
                    : details.overview;
                mensagem += `📝 *Sinopse:* ${sinopse}\n\n`;
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
            
            // Informações da série
            if (details.genres?.length > 0) {
                mensagem += `🎭 *Gêneros:* ${details.genres.map(g => g.name).join(', ')}\n`;
            }
            
            mensagem += `📊 *Status:* ${traduzirStatusSerie(details.status)}\n`;
            
            if (details.number_of_seasons) {
                mensagem += `📚 *Temporadas:* ${details.number_of_seasons}`;
                if (details.number_of_episodes) {
                    mensagem += ` (${details.number_of_episodes} episódios)\n`;
                } else {
                    mensagem += '\n';
                }
            }
            
            // Duração por episódio
            if (details.episode_run_time?.length > 0) {
                mensagem += `⏱️ *Duração/episódio:* ${details.episode_run_time[0]}min\n`;
            }
            
            // Canais
            if (details.networks?.length > 0) {
                mensagem += `📡 *Canal:* ${details.networks.map(n => n.name).join(', ')}\n`;
            }
            
            // Criadores
            if (details.created_by?.length > 0) {
                mensagem += `✍️ *Criado por:* ${details.created_by.map(c => c.name).join(', ')}\n`;
            }
            
            // Última temporada
            if (ultimaTemporada) {
                mensagem += `\n🎬 *Última Temporada:* ${ultimaTemporada.name || `Temporada ${details.seasons.length}`}`;
                if (ultimaTemporada.air_date) {
                    const ano = new Date(ultimaTemporada.air_date).getFullYear();
                    mensagem += ` (${ano})`;
                }
                if (ultimaTemporada.episode_count) {
                    mensagem += ` - ${ultimaTemporada.episode_count} episódios`;
                }
                mensagem += '\n';
            }
            
            // Elenco principal
            if (details.credits?.cast?.length > 0) {
                const elenco = details.credits.cast.slice(0, 4).map(a => a.name).join(', ');
                mensagem += `👥 *Elenco:* ${elenco}${details.credits.cast.length > 4 ? '...' : ''}\n`;
            }
            
            // Próximos episódios (se série em andamento)
            if (details.status === 'Returning Series' && details.next_episode_to_air) {
                const proxEp = details.next_episode_to_air;
                if (proxEp.air_date) {
                    const data = new Date(proxEp.air_date).toLocaleDateString('pt-BR');
                    mensagem += `\n📅 *Próximo episódio:* ${data}`;
                    if (proxEp.name) {
                        mensagem += `\n"${proxEp.name}"`;
                    }
                    mensagem += '\n';
                }
            }
            
            // Link
            mensagem += `\n🔗 *Mais info:* https://www.themoviedb.org/tv/${serieId}`;
            
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
            console.error("Erro no comando série:", error.message);
            await sock.sendMessage(fromJid, { 
                text: "❌ Erro ao buscar a série. Tente novamente."
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

function traduzirStatusSerie(status) {
    const statusMap = {
        'Returning Series': 'Em andamento',
        'Ended': 'Concluída',
        'Canceled': 'Cancelada',
        'In Production': 'Em produção',
        'Pilot': 'Piloto'
    };
    return statusMap[status] || status;
}