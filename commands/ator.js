
const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "ator",
    descricao: "Busca informações sobre atores/atrizes",
    categoria: "pesquisa",
    exemplo: "!ator Tom Hanks",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "🌟 *Como usar:*\n!ator <nome do ator/atriz>\n\nExemplos:\n• !ator Leonardo DiCaprio\n• !ator Meryl Streep\n• !ator Fernanda Montenegro"
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
            // Busca o ator
            const searchResponse = await axios.get(
                `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`
            );
            
            if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
                return sock.sendMessage(fromJid, { 
                    text: `❌ Nenhum ator/atriz encontrado para "${query}"`
                });
            }
            
            // Pega o mais relevante
            const pessoa = searchResponse.data.results.sort((a, b) => b.popularity - a.popularity)[0];
            const pessoaId = pessoa.id;
            
            // Busca detalhes completos
            const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/person/${pessoaId}?api_key=${apiKey}&language=pt-BR&append_to_response=movie_credits,tv_credits`
            );
            
            const details = detailsResponse.data;
            
            // Formata a mensagem
            let mensagem = `🌟 *${details.name}*`;
            
            // Informações básicas
            if (details.known_for_department) {
                mensagem += `\n🎭 *Profissão:* ${traduzirDepartamento(details.known_for_department)}`;
            }
            
            if (details.birthday) {
                const dataNasc = new Date(details.birthday);
                const idade = details.deathday 
                    ? Math.floor((new Date(details.deathday) - dataNasc) / (365.25 * 24 * 60 * 60 * 1000))
                    : Math.floor((new Date() - dataNasc) / (365.25 * 24 * 60 * 60 * 1000));
                
                mensagem += `\n🎂 *Nascimento:* ${dataNasc.toLocaleDateString('pt-BR')}`;
                mensagem += ` (${idade} anos)`;
                
                if (details.deathday) {
                    const dataMorte = new Date(details.deathday);
                    mensagem += `\n✝️ *Falecimento:* ${dataMorte.toLocaleDateString('pt-BR')}`;
                }
            }
            
            if (details.place_of_birth) {
                mensagem += `\n📍 *Local de nascimento:* ${details.place_of_birth}`;
            }
            
            mensagem += '\n\n';
            
            // Biografia
            if (details.biography) {
                const bio = details.biography.length > 300 
                    ? details.biography.substring(0, 300) + '...' 
                    : details.biography;
                mensagem += `📖 *Biografia:* ${bio}\n\n`;
            }
            
            // Popularidade
            if (details.popularity) {
                mensagem += `🔥 *Popularidade:* ${Math.round(details.popularity)} pontos\n`;
            }
            
            // Trabalhos mais conhecidos
            mensagem += `\n🎬 *Trabalhos Notáveis:*\n`;
            
            // Combina filmes e séries
            const todosTrabalhos = [
                ...(details.movie_credits?.cast || []).map(m => ({...m, type: 'Filme'})),
                ...(details.tv_credits?.cast || []).map(t => ({...t, type: 'Série'}))
            ];
            
            // Ordena por popularidade e pega os 5 mais populares
            const notaveis = todosTrabalhos
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 5);
            
            notaveis.forEach((trabalho, index) => {
                const nome = trabalho.title || trabalho.name;
                const ano = trabalho.release_date 
                    ? new Date(trabalho.release_date || trabalho.first_air_date).getFullYear()
                    : 'N/A';
                const avaliacao = trabalho.vote_average ? ` ⭐ ${trabalho.vote_average.toFixed(1)}` : '';
                
                mensagem += `${index + 1}. *${nome}* (${ano}) - ${trabalho.type}${avaliacao}\n`;
            });
            
            // Estatísticas
            if (details.movie_credits?.cast) {
                mensagem += `\n📊 *Estatísticas:*\n`;
                mensagem += `• Filmes: ${details.movie_credits.cast.length}`;
                
                if (details.tv_credits?.cast) {
                    mensagem += ` • Séries: ${details.tv_credits.cast.length}`;
                }
                
                const total = (details.movie_credits.cast.length || 0) + (details.tv_credits?.cast?.length || 0);
                mensagem += `\n• Total de trabalhos: ${total}`;
            }
            
            // Prêmios (se disponível)
            if (details.awards) {
                mensagem += `\n🏆 *Prêmios:* ${details.awards}\n`;
            }
            
            // Link
            mensagem += `\n🔗 *Mais info:* https://www.themoviedb.org/person/${pessoaId}`;
            
            // Envia com foto
            if (details.profile_path) {
                const fotoUrl = `https://image.tmdb.org/t/p/w500${details.profile_path}`;
                await sock.sendMessage(fromJid, { 
                    image: { url: fotoUrl },
                    caption: mensagem
                }, { quoted: msg });
            } else {
                await sock.sendMessage(fromJid, { text: mensagem }, { quoted: msg });
            }
            
        } catch (error) {
            console.error("Erro no comando ator:", error.message);
            await sock.sendMessage(fromJid, { 
                text: "❌ Erro ao buscar o ator/atriz. Tente novamente."
            });
        }
    }
};

// Funções auxiliares
function traduzirDepartamento(dept) {
    const departamentos = {
        'Acting': 'Ator/Atriz',
        'Directing': 'Diretor(a)',
        'Production': 'Produtor(a)',
        'Writing': 'Roteirista',
        'Sound': 'Sonoplastia',
        'Camera': 'Fotografia',
        'Art': 'Direção de Arte',
        'Editing': 'Edição'
    };
    return departamentos[dept] || dept;
}