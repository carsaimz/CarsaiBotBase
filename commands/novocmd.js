// comandos/novocmd.js
const fs = require('fs');
const path = require('path');
const config = require('../configuration');

module.exports = {
    nome: "novocmd",
    descricao: "Cria um novo comando dinamicamente (apenas dono)",
    categoria: "dono",
    exemplo: "commandName códigoJS",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (commandArgs.length < 2) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Uso:* !novocmd [nome] {código}\n\n" +
                      "📝 *Exemplo:*\n" +
                      "!novocmd teste module.exports = { nome: 'teste', descricao: 'Comando de teste', executar: async () => {} };"
            });
        }
        
        const commandName = commandArgs[0].toLowerCase();
        const codigo = commandArgs.slice(1).join(' ');
        
        // Verificar se o comando já existe
        const caminhoComando = path.join(__dirname, `${commandName}.js`);
        
        if (fs.existsSync(caminhoComando)) {
            return sock.sendMessage(fromJid, { 
                text: `❌ O comando '${commandName}' já existe!\nUse !atualizarcmd para atualizar.`
            });
        }
        
        try {
            // Validar código básico
            if (!codigo.includes('module.exports') || !codigo.includes('executar')) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Código inválido! Deve conter 'module.exports' e função 'executar'."
                });
            }
            
            // Criar arquivo do comando
            fs.writeFileSync(caminhoComando, codigo);
            
            // Verificar se o código é válido
            try {
                require(`./${commandName}.js`);
                delete require.cache[require.resolve(`./${commandName}.js`)];
            } catch (error) {
                fs.unlinkSync(caminhoComando);
                return sock.sendMessage(fromJid, { 
                    text: `❌ Erro no código: ${error.message}\n\nArquivo não criado.`
                });
            }
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Comando criado com sucesso!*\n\n` +
                      `📁 *Arquivo:* ${commandName}.js\n` +
                      `🔧 *Uso:* !${commandName}\n` +
                      `📝 *Código:* ${codigo.length > 200 ? codigo.substring(0, 200) + '...' : codigo}\n\n` +
                      `⚡ O comando já está disponível!`
            });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: `❌ Erro ao criar comando: ${error.message}`
            });
        }
    }
};
/* CarsaiBot - cbot - carsai */
