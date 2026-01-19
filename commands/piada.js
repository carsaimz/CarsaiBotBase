const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "piada",
    descricao: "Conta uma piada aleatória",
    categoria: "diversao",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const piadas = [
            {
                pergunta: "Por que o pinheiro não se perde na floresta?",
                response: "Porque ele tem uma pinha (pinha = mapa em espanhol)"
            },
            {
                pergunta: "O que o pato disse para a pata?",
                response: "Vem quá!"
            },
            {
                pergunta: "Por que o livro de matemática cometeu suicídio?",
                response: "Porque tinha muitos problemas."
            },
            {
                pergunta: "Qual é o café mais perigoso do mundo?",
                response: "O cappuccino, porque é um café puccino (café pulicento)"
            },
            {
                pergunta: "O que o zero disse para o oito?",
                response: "Que cinto bonito!"
            }
        ];
        
        const piada = piadas[Math.floor(Math.random() * piadas.length)];
        
        await sock.sendMessage(fromJid, { 
            text: `😂 *Piada do Dia*\n\n` +
                  `❓ *${piada.pergunta}*\n` +
                  `(...aguarde 3 segundos...)`
        }, { quoted: msg });
        
        // Aguardar 3 segundos para mostrar a response
        setTimeout(async () => {
            await sock.sendMessage(fromJid, { 
                text: `🎭 *Resposta:* ${piada.response}\n\n😄 Espero que tenha gostado!\n\n*MEU DONO NÃO É BOM EM PIADAS 😂😂😂😂*`
            });
        }, 3000);
    }
};
/* CarsaiBot - cbot - carsai */
