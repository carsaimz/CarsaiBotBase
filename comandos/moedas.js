const config = require('../configuracao');
const axios = require('axios');

module.exports = {
    nome: "moedas",
    descricao: "Consulta cotação de moedas",
    categoria: "utilidades",
    exemplo: "MZN USD",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        try {
            const response = await axios.get('https://economia.awesomeapi.com.br/json/all');
            const moedas = response.data;
            
            if (args.length === 2) {
                const de = args[0].toUpperCase();
                const para = args[1].toUpperCase();
                
                if (moedas[de]) {
                    const cotacao = moedas[de];
                    const texto = `💱 *Conversão:* ${de} → ${para}\n\n` +
                                 `💰 *Compra:* MZN ${parseFloat(cotacao.bid).toFixed(4)}\n` +
                                 `💵 *Venda:* MZN ${parseFloat(cotacao.ask).toFixed(4)}\n` +
                                 `📈 *Variação:* ${cotacao.pctChange}%\n` +
                                 `🕐 *Atualizado:* ${cotacao.create_date}`;
                    
                    return sock.sendMessage(from, { text: texto }, { quoted: msg });
                }
            }
            
            let lista = "📊 *Cotações Disponíveis*\n\n";
            Object.keys(moedas).forEach(moeda => {
                if (moeda.includes('MZN')) {
                    lista += `• ${moeda}: MZN ${parseFloat(moedas[moeda].bid).toFixed(4)}\n`;
                }
            });
            
            lista += "\n💡 *Use:* !moedas USD MZN para conversão específica";
            await sock.sendMessage(from, { text: lista }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { text: "❌ Erro ao consultar cotações." });
        }
    }
};
