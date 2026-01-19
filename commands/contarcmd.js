// comandos/contarcmd.js
const fs = require('fs');
const path = require('path');
const config = require('../configuration');

module.exports = {
    nome: "contarcmd",
    descricao: "Conta quantos comandos estão disponíveis",
    categoria: "informacao",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        try {
            const diretorioComandos = path.join(__dirname);
            const arquivos = fs.readdirSync(diretorioComandos);
            
            const comandosJS = arquivos.filter(arquivo => 
                arquivo.endsWith('.js') && arquivo !== 'index.js'
            );
            
            // Contar por categoria
            const categorias = {};
            let totalComandos = 0;
            
            for (const arquivo of comandosJS) {
                try {
                    const caminhoComando = path.join(diretorioComandos, arquivo);
                    const comando = require(caminhoComando);
                    
                    if (comando.categoria) {
                        if (!categorias[comando.categoria]) {
                            categorias[comando.categoria] = 0;
                        }
                        categorias[comando.categoria]++;
                        totalComandos++;
                    }
                    
                    // Liberar da cache para não interferir
                    delete require.cache[require.resolve(caminhoComando)];
                } catch (error) {
                    // Ignorar erros de carregamento
                }
            }
            
            let response = `📊 *Estatísticas de Comandos*\n\n`;
            response += `🤖 *Bot:* ${config.botName}\n`;
            response += `🔧 *Prefixo:* ${config.prefix}\n`;
            response += `📁 *Total de comandos:* ${totalComandos}\n\n`;
            
            response += `📂 *Distribuição por categoria:*\n`;
            for (const [categoria, quantidade] of Object.entries(categorias)) {
                const porcentagem = Math.round((quantidade / totalComandos) * 100);
                const barras = '█'.repeat(Math.round(porcentagem / 10));
                const espacos = '░'.repeat(10 - Math.round(porcentagem / 10));
                
                response += `├ ${categoria.padEnd(15)}: ${quantidade.toString().padStart(3)} [${barras}${espacos}] ${porcentagem}%\n`;
            }
            
            response += `\n📈 *Status:* ${totalComandos > 50 ? 'Excelente' : totalComandos > 20 ? 'Bom' : 'Básico'}`;
            
            await sock.sendMessage(fromJid, { text: response }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: `❌ Erro ao contar comandos: ${error.message}`
            });
        }
    }
};
/* CarsaiBot - cbot - carsai */
