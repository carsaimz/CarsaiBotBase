const config = require('../configuration');

module.exports = {
    nome: "pergunta",
    descricao: "Faz uma pergunta e o bot responde (apenas respostas simuladas, não reais)",
    categoria: "diversao",
    exemplo: "Devo sair hoje?",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { 
                text: "❌ Faça uma pergunta!\nExemplo: !pergunta Vou ganhar na loteria?"
            });
        }
        
        const respostas = [
            "Sim, definitivamente! ✅",
            "Não, de jeito nenhum! ❌",
            "Talvez... 🤔",
            "Com certeza! 👍",
            "Melhor não contar com isso. 👎",
            "Os sinais apontam que sim! 🔮",
            "Pergunte novamente mais tarde. ⏳",
            "Não posso prever agora. 🔮",
            "Concentre-se e pergunte novamente. 🧘",
            "Minhas fontes dizem não. 📉"
        ];
        
        const response = respostas[Math.floor(Math.random() * respostas.length)];
        const pergunta = commandArgs.join(' ');
        
        await sock.sendMessage(fromJid, { 
            text: `🎱 *Bola Mágica 8*\n\n` +
                  `❓ *Pergunta:* ${pergunta}\n` +
                  `🔮 *Resposta:* ${response}`
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
