const config = require('../configuracao');

module.exports = {
    nome: "eval",
    descricao: "Executa código JavaScript (apenas dono)",
    categoria: "dono",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const remetente = msg.key.participant || from;
        
        if (!remetente.includes(config.numeroDono)) {
            return sock.sendMessage(from, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!args[0]) {
            return sock.sendMessage(from, { text: "❌ Digite o código para executar." });
        }
        
        try {
            const codigo = args.join(' ');
            let resultado = eval(codigo);
            
            if (typeof resultado === 'object') {
                resultado = JSON.stringify(resultado, null, 2);
            }
            
            await sock.sendMessage(from, { 
                text: `💻 *EVAL Result*\n\n📝 *Código:* ${codigo}\n\n✅ *Resultado:*\n${resultado}` 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ *Erro no eval:*\n${error.message}` 
            }, { quoted: msg });
        }
    }
};
