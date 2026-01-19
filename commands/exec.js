const config = require('../configuration');
const { exec } = require('child_process');

module.exports = {
    nome: "exec",
    descricao: "Executa comando no terminal (apenas dono)",
    categoria: "dono",
    exemplo: "ls -la",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite o comando para executar." });
        }
        
        const comando = commandArgs.join(' ');
        
        exec(comando, (error, stdout, stderr) => {
            let resultado = '';
            
            if (error) {
                resultado = `❌ *Erro:* ${error.message}`;
            } else if (stderr) {
                resultado = `⚠️ *Stderr:*\n${stderr}`;
            } else {
                resultado = `✅ *Stdout:*\n${stdout || '(Sem saída)'}`;
            }
            
            // Limitar tamanho da response
            if (resultado.length > 1500) {
                resultado = resultado.substring(0, 1500) + '\n\n... (response truncada)';
            }
            
            sock.sendMessage(fromJid, { 
                text: `💻 *EXEC Result*\n\n📟 *Comando:* ${comando}\n\n${resultado}` 
            });
        });
    }
};
/* CarsaiBot - cbot - carsai */
