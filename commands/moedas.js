const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "moedas",
    descricao: "Consulta cotação de moedas",
    categoria: "utilidades",
    exemplo: "MZN USD",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        try {
            const response = await axios.get('https://economia.awesomeapi.com.br/json/all');
            const moedas = response.data;
            
            if (commandArgs.length === 2) {
                const de = commandArgs[0].toUpperCase();
                const para = commandArgs[1].toUpperCase();
                
                if (moedas[de]) {
                    const cotacao = moedas[de];
                    const text = `💱 *Conversão:* ${de} → ${para}\n\n` +
                                 `💰 *Compra:* MZN ${parseFloat(cotacao.bid).toFixed(4)}\n` +
                                 `💵 *Venda:* MZN ${parseFloat(cotacao.ask).toFixed(4)}\n` +
                                 `📈 *Variação:* ${cotacao.pctChange}%\n` +
                                 `🕐 *Atualizado:* ${cotacao.create_date}`;
                    
                    return sock.sendMessage(fromJid, { text: text }, { quoted: msg });
                }
            }
            
            let lista = "📊 *Cotações Disponíveis*\n\n";
            Object.keys(moedas).forEach(moeda => {
                if (moeda.includes('MZN')) {
                    lista += `• ${moeda}: MZN ${parseFloat(moedas[moeda].bid).toFixed(4)}\n`;
                }
            });
            
            lista += "\n💡 *Use:* !moedas USD MZN para conversão específica";
            await sock.sendMessage(fromJid, { text: lista }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao consultar cotações." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
