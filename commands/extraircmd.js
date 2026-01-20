// comandos/extraircmd.js
const fs = require('fs');
const path = require('path');
const config = require('../configuration');

module.exports = {
    nome: "extraircmd",
    descricao: "Extrai código de um comando",
    categoria: "utilitarios",
    exemplo: "menu [text/arquivo]",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        

        
        if (commandArgs.length < 1) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Uso:* !extraircmd [nome] [formato]\n" +
                      "📊 *Formatos:* text, arquivo\n" +
                      "📝 *Exemplos:*\n" +
                      "!extraircmd menu text\n" +
                      "!extraircmd ping arquivo"
            });
        }
        
        const commandName = commandArgs[0].toLowerCase();
        const formato = commandArgs[1]?.toLowerCase() || 'text';
        const caminhoComando = path.join(__dirname, `${commandName}.js`);
        
        if (!fs.existsSync(caminhoComando)) {
            return sock.sendMessage(fromJid, { 
                text: `❌ Comando '${commandName}' não encontrado!`
            });
        }
        
        try {
            const codigo = fs.readFileSync(caminhoComando, 'utf8');
            
            if (formato === 'arquivo') {
                // Enviar como arquivo
                await sock.sendMessage(fromJid, {
                    document: Buffer.fromJid(codigo),
                    fileName: `${commandName}.js`,
                    mimetype: 'application/javascript',
                    caption: `📁 *Código do comando:* ${commandName}.js\n📊 *Tamanho:* ${codigo.length} caracteres`
                });
            } else {
                // Enviar como text
                const limite = 3000;
                if (codigo.length > limite) {
                    const parte1 = codigo.substring(0, limite);
                    const parte2 = codigo.substring(limite, limite * 2);
                    
                    await sock.sendMessage(fromJid, { 
                        text: `📝 *Código de ${commandName}.js (1/2)*\n\n\`\`\`javascript\n${parte1}\n\`\`\`` 
                    });
                    
                    if (parte2.length > 0) {
                        await sock.sendMessage(fromJid, { 
                            text: `📝 *Código de ${commandName}.js (2/2)*\n\n\`\`\`javascript\n${parte2}\n\`\`\`` 
                        });
                    }
                } else {
                    await sock.sendMessage(fromJid, { 
                        text: `📝 *Código de ${commandName}.js*\n\n\`\`\`javascript\n${codigo}\n\`\`\`\n📊 *Tamanho:* ${codigo.length} caracteres` 
                    });
                }
            }
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: `❌ Erro ao extrair código: ${error.message}`
            });
        }
    }
};
/* CarsaiBot - cbot - carsai */
