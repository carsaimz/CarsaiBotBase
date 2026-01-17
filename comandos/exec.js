const config = require('../configuracao');
const { exec } = require('child_process');

module.exports = {
    nome: "exec",
    descricao: "Executa comando no terminal (apenas dono)",
    categoria: "dono",
    exemplo: "ls -la",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const remetente = msg.key.participant || from;
        
        if (!remetente.includes(config.numeroDono)) {
            return sock.sendMessage(from, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!args[0]) {
            return sock.sendMessage(from, { text: "❌ Digite o comando para executar." });
        }
        
        const comando = args.join(' ');
        
        exec(comando, (error, stdout, stderr) => {
            let resultado = '';
            
            if (error) {
                resultado = `❌ *Erro:* ${error.message}`;
            } else if (stderr) {
                resultado = `⚠️ *Stderr:*\n${stderr}`;
            } else {
                resultado = `✅ *Stdout:*\n${stdout || '(Sem saída)'}`;
            }
            
            // Limitar tamanho da resposta
            if (resultado.length > 1500) {
                resultado = resultado.substring(0, 1500) + '\n\n... (resposta truncada)';
            }
            
            sock.sendMessage(from, { 
                text: `💻 *EXEC Result*\n\n📟 *Comando:* ${comando}\n\n${resultado}` 
            });
        });
    }
};
