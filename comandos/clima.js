const config = require('../configuracao');
const axios = require('axios');

module.exports = {
    nome: "clima",
    descricao: "Consulta previsão do tempo",
    categoria: "utilidades",
    exemplo: "São Paulo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { text: "❌ Digite uma cidade.\nExemplo: !clima São Paulo" });
        }
        
        const cidade = args.join(' ');
        const apiKey = config.openWeatherKey || 'sua_chave_aqui';
        
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`
            );
            
            const dados = response.data;
            const emojiClima = {
                'Clear': '☀️',
                'Clouds': '☁️',
                'Rain': '🌧️',
                'Snow': '❄️',
                'Thunderstorm': '⛈️',
                'Drizzle': '🌦️',
                'Mist': '🌫️'
            };
            
            const climaTexto = `🌤️ *Previsão do Tempo*\n\n` +
                              `📍 *Cidade:* ${dados.name}, ${dados.sys.country}\n` +
                              `${emojiClima[dados.weather[0].main] || '🌡️'} *Condição:* ${dados.weather[0].description}\n` +
                              `🌡️ *Temperatura:* ${dados.main.temp}°C\n` +
                              `💨 *Sensação:* ${dados.main.feels_like}°C\n` +
                              `💧 *Umidade:* ${dados.main.humidity}%\n` +
                              `🌬️ *Vento:* ${dados.wind.speed} m/s\n` +
                              `📊 *Pressão:* ${dados.main.pressure} hPa`;
            
            await sock.sendMessage(from, { text: climaTexto }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Cidade não encontrada ou erro na consulta." });
        }
    }
};
