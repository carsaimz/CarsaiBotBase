const config = require('../configuracao');

module.exports = {
    nome: "pergunta",
    descricao: "Faz uma pergunta e o bot responde (apenas respostas simuladas, não reais)",
    categoria: "diversao",
    exemplo: "Devo sair hoje?",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
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
        
        const resposta = respostas[Math.floor(Math.random() * respostas.length)];
        const pergunta = args.join(' ');
        
        await sock.sendMessage(from, { 
            text: `🎱 *Bola Mágica 8*\n\n` +
                  `❓ *Pergunta:* ${pergunta}\n` +
                  `🔮 *Resposta:* ${resposta}`
        }, { quoted: msg });
    }
};
