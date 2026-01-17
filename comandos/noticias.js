const config = require('../configuracao');
const axios = require('axios');

module.exports = {
    nome: "noticias",
    descricao: "Mostra as últimas notícias",
    categoria: "pesquisa",
    exemplo: "mozambique",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        try {
            // Usando API de notícias do NewsAPI (precisa de chave)
            const apiKey = config.newsApiKey || '30beb8e52698484ea3b45c76572729b2';
            const pais = args[0] || 'mz';
            
            const response = await axios.get(
                `https://newsapi.org/v2/top-headlines?country=${pais}&apiKey=${apiKey}`
            );
            
            const noticias = response.data.articles.slice(0, 5);
            
            let noticiasTexto = `📰 *Últimas Notícias* (${pais.toUpperCase()})\n\n`;
            
            noticias.forEach((noticia, index) => {
                noticiasTexto += `${index + 1}. *${noticia.title}*\n`;
                noticiasTexto += `   📝 ${noticia.description || 'Sem descrição'}\n`;
                noticiasTexto += `   📊 Fonte: ${noticia.source.name}\n`;
                noticiasTexto += `   🔗 ${noticia.url}\n\n`;
            });
            
            noticiasTexto += `📊 Total de notícias: ${response.data.totalResults}`;
            
            await sock.sendMessage(from, { text: noticiasTexto }, { quoted: msg });
            
        } catch (error) {
            // Fallback para notícias estáticas se a API falhar
            const noticiasFallback = `📰 *Notícias do Dia* (Apenas simulações, não são reais)\n\n` +
                                    `1. *Economia moçambicana mostra sinais de recuperação*\n` +
                                    `   Mercado financeiro reage positivamente aos novos indicadores\n\n` +
                                    `2. *Avances na tecnologia de IA preocupam especialistas*\n` +
                                    `   Debate sobre regulamentação ganha força globalmente\n\n` +
                                    `3. *Esportes: Time local vence campeonato importante*\n` +
                                    `   Vitória histórica após anos de espera\n\n` +
                                    `💡 Para notícias em tempo real, configure sua chave da NewsAPI.`;
            
            await sock.sendMessage(from, { text: noticiasFallback }, { quoted: msg });
        }
    }
};
