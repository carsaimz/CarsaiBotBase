const config = require('../configuration');

module.exports = {
    nome: "eval",
    descricao: "Executa código JavaScript (apenas dono)",
    categoria: "dono",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite o código para executar." });
        }
        
        try {
            const codigo = commandArgs.join(' ');
            let resultado = eval(codigo);
            
            if (typeof resultado === 'object') {
                resultado = JSON.stringify(resultado, null, 2);
            }
            
            await sock.sendMessage(fromJid, { 
                text: `💻 *EVAL Result*\n\n📝 *Código:* ${codigo}\n\n✅ *Resultado:*\n${resultado}` 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: `❌ *Erro no eval:*\n${error.message}` 
            }, { quoted: msg });
        }
    }
};
/* CarsaiBot - cbot - carsai */
