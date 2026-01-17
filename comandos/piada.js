const config = require('../configuracao');
const axios = require('axios');

module.exports = {
    nome: "piada",
    descricao: "Conta uma piada aleatória",
    categoria: "diversao",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        const piadas = [
            {
                pergunta: "Por que o pinheiro não se perde na floresta?",
                resposta: "Porque ele tem uma pinha (pinha = mapa em espanhol)"
            },
            {
                pergunta: "O que o pato disse para a pata?",
                resposta: "Vem quá!"
            },
            {
                pergunta: "Por que o livro de matemática cometeu suicídio?",
                resposta: "Porque tinha muitos problemas."
            },
            {
                pergunta: "Qual é o café mais perigoso do mundo?",
                resposta: "O cappuccino, porque é um café puccino (café pulicento)"
            },
            {
                pergunta: "O que o zero disse para o oito?",
                resposta: "Que cinto bonito!"
            }
        ];
        
        const piada = piadas[Math.floor(Math.random() * piadas.length)];
        
        await sock.sendMessage(from, { 
            text: `😂 *Piada do Dia*\n\n` +
                  `❓ *${piada.pergunta}*\n` +
                  `(...aguarde 3 segundos...)`
        }, { quoted: msg });
        
        // Aguardar 3 segundos para mostrar a resposta
        setTimeout(async () => {
            await sock.sendMessage(from, { 
                text: `🎭 *Resposta:* ${piada.resposta}\n\n😄 Espero que tenha gostado!\n\n*MEU DONO NÃO É BOM EM PIADAS 😂😂😂😂*`
            });
        }, 3000);
    }
};
