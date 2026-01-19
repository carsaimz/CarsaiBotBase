const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "cep",
    descricao: "Consulta informações de um CEP",
    categoria: "utilidades",
    exemplo: "01001000",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite um CEP (apenas números)." });
        }
        
        const cep = commandArgs[0].replace(/\D/g, '');
        
        if (cep.length !== 8) {
            return sock.sendMessage(fromJid, { text: "❌ CEP inválido! Deve conter 8 dígitos." });
        }
        
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const data = response.data;
            
            if (data.error) {
                return sock.sendMessage(fromJid, { text: "❌ CEP não encontrado." });
            }
            
            const info = `📮 *Informações do CEP:* ${cep}\n\n` +
                        `📍 *Endereço:* ${data.logradouro}\n` +
                        `🏘️ *Bairro:* ${data.bairro}\n` +
                        `🏙️ *Cidade:* ${data.localidade}\n` +
                        `🏛️ *Estado:* ${data.uf}\n` +
                        `🌍 *Região:* ${data.ibge ? (data.ibge.toString().startsWith('1') ? 'Norte' : 
                          data.ibge.toString().startsWith('2') ? 'Nordeste' :
                          data.ibge.toString().startsWith('3') ? 'Sudeste' :
                          data.ibge.toString().startsWith('4') ? 'Sul' : 'Centro-Oeste') : 'N/A'}\n` +
                        `📞 *DDD:* ${data.ddd || 'N/A'}`;
            
            await sock.sendMessage(fromJid, { text: info }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(fromJid, { text: "❌ Erro ao consultar CEP." });
        }
    }
};
/* CarsaiBot - cbot - carsai */
