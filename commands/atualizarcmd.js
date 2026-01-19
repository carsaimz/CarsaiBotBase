const fs = require('fs');
const path = require('path');
const config = require('../configuration');

module.exports = {
    nome: "atualizarcmd",
    descricao: "Atualiza um comando existente (apenas dono)",
    categoria: "dono",
    exemplo: "commandName novoCódigo",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (commandArgs.length < 2) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Uso:* !atualizarcmd [nome] {novo código}\n\n" +
                      "📝 *Exemplo:*\n" +
                      "!atualizarcmd teste module.exports = { nome: 'teste', descricao: 'Comando atualizado', executar: async () => {} };"
            });
        }
        
        const commandName = commandArgs[0].toLowerCase();
        const codigo = commandArgs.slice(1).join(' ');
        const caminhoComando = path.join(__dirname, `${commandName}.js`);
        
        if (!fs.existsSync(caminhoComando)) {
            return sock.sendMessage(fromJid, { 
                text: `❌ Comando '${commandName}' não existe!\nUse !novocmd para criar um novo.`
            });
        }
        
        try {
            // Fazer backup do código antigo
            const codigoAntigo = fs.readFileSync(caminhoComando, 'utf8');
            
            // Validar novo código
            if (!codigo.includes('module.exports') || !codigo.includes('executar')) {
                return sock.sendMessage(fromJid, { 
                    text: "❌ Código inválido! Deve conter 'module.exports' e função 'executar'."
                });
            }
            
            // Atualizar arquivo
            fs.writeFileSync(caminhoComando, codigo);
            
            // Verificar se o novo código é válido
            try {
                delete require.cache[require.resolve(`./${commandName}.js`)];
                require(`./${commandName}.js`);
            } catch (error) {
                // Restaurar backup em caso de error
                fs.writeFileSync(caminhoComando, codigoAntigo);
                return sock.sendMessage(fromJid, { 
                    text: `❌ Erro no novo código: ${error.message}\n\nCódigo restaurado para versão anterior.`
                });
            }
            
            await sock.sendMessage(fromJid, { 
                text: `✅ *Comando atualizado com sucesso!*\n\n` +
                      `📁 *Arquivo:* ${commandName}.js\n` +
                      `🔧 *Uso:* !${commandName}\n` +
                      `📝 *Código atualizado:* ${codigo.length > 150 ? codigo.substring(0, 150) + '...' : codigo}\n\n` +
                      `⚡ Alterações aplicadas imediatamente!`
            });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: `❌ Erro ao atualizar comando: ${error.message}`
            });
        }
    }
};
/* CarsaiBot - cbot - carsai */
