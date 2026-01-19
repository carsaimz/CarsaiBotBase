const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "filme",
    descricao: "Busca informações sobre filmes",
    categoria: "pesquisa",
    exemplo: "!filme Titanic",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "🎬 *Como usar:*\n!filme <nome do filme>\n\nExemplos:\n• !filme O Poderoso Chefão\n• !filme Cidade de Deus\n• !filme Interestelar"
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
            // Busca o filme
            const searchResponse = await axios.get(
                `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`
            );
            
            if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ Nenhum filme encontrado para "${query}"\n💡 Tente usar o título original em inglês`
                });
            }
            
            // Pega o filme mais relevante
            const movie = searchResponse.data.results.sort((a, b) => b.popularity - a.popularity)[0];
            const movieId = movie.id;
            
            // Busca detalhes completos
            const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR&append_to_response=credits,release_dates`
            );
            
            const details = detailsResponse.data;
            
            // Formata a mensagem
            let mensagem = `🎬 *${details.title}*`;
            
            if (details.original_title !== details.title) {
                mensagem += `\n*Título Original:* ${details.original_title}`;
            }
            
            if (details.release_date) {
                const ano = new Date(details.release_date).getFullYear();
                mensagem += `\n📅 *Ano:* ${ano}`;
            }
            
            if (details.runtime) {
                const horas = Math.floor(details.runtime / 60);
                const minutos = details.runtime % 60;
                mensagem += ` • ⏱️ *Duração:* ${horas}h ${minutos}min`;
            }
            
            // Classificação indicativa
            if (details.release_dates?.results) {
                const brRelease = details.release_dates.results.find(r => r.iso_3166_1 === 'BR');
                if (brRelease?.release_dates[0]?.certification) {
                    mensagem += ` • 📊 *Classificação:* ${brRelease.release_dates[0].certification}`;
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
            
            // Gêneros
            if (details.genres?.length > 0) {
                mensagem += `🎭 *Gêneros:* ${details.genres.map(g => g.name).join(', ')}\n`;
            }
            
            // Diretor
            if (details.credits?.crew) {
                const director = details.credits.crew.find(p => p.job === 'Director');
                if (director) {
                    mensagem += `🎥 *Diretor:* ${director.name}\n`;
                }
            }
            
            // Elenco principal
            if (details.credits?.cast?.length > 0) {
                const elenco = details.credits.cast.slice(0, 4).map(a => a.name).join(', ');
                mensagem += `👥 *Elenco:* ${elenco}${details.credits.cast.length > 4 ? '...' : ''}\n`;
            }
            
            // Produção
            if (details.production_companies?.length > 0) {
                mensagem += `🏢 *Produção:* ${details.production_companies[0].name}\n`;
            }
            
            // Orçamento e receita
            if (details.budget > 0) {
                mensagem += `💰 *Orçamento:* $${formatarDinheiro(details.budget)}\n`;
            }
            if (details.revenue > 0) {
                mensagem += `📈 *Receita:* $${formatarDinheiro(details.revenue)}\n`;
            }
            
            // Status
            if (details.status) {
                mensagem += `📊 *Status:* ${traduzirStatus(details.status)}\n`;
            }
            
            // Tagline
            if (details.tagline) {
                mensagem += `\n💬 *"${details.tagline}"*\n`;
            }
            
            // Link
            mensagem += `\n🔗 *Mais info:* https://www.themoviedb.org/movie/${movieId}`;
            
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
            console.error("Erro no comando filme:", error.message);
            await sock.sendMessage(fromJid, { 
                text: "❌ Erro ao buscar o filme. Tente novamente."
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

function formatarDinheiro(valor) {
    if (valor >= 1000000000) return (valor / 1000000000).toFixed(1) + 'B';
    if (valor >= 1000000) return (valor / 1000000).toFixed(1) + 'M';
    if (valor >= 1000) return (valor / 1000).toFixed(1) + 'K';
    return valor.toString();
}

function traduzirStatus(status) {
    const statusMap = {
        'Released': 'Lançado',
        'In Production': 'Em produção',
        'Post Production': 'Pós-produção',
        'Planned': 'Planejado',
        'Rumored': 'Rumor',
        'Canceled': 'Cancelado'
    };
    return statusMap[status] || status;
}