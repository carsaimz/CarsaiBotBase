const config = require('../configuracao');

module.exports = {
    nome: "quiz",
    descricao: "Quiz de perguntas e respostas",
    categoria: "diversao",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        const quizzes = [
            {
                pergunta: "Qual é a capital do Brasil?",
                opcoes: ["A) Rio de Janeiro", "B) São Paulo", "C) Brasília", "D) Salvador"],
                resposta: "C"
            },
            {
                pergunta: "Quantos planetas existem no sistema solar?",
                opcoes: ["A) 7", "B) 8", "C) 9", "D) 10"],
                resposta: "B"
            },
            {
                pergunta: "Quem pintou a Mona Lisa?",
                opcoes: ["A) Van Gogh", "B) Picasso", "C) Leonardo da Vinci", "D) Michelangelo"],
                resposta: "C"
            },
            {
                pergunta: "Qual é o maior animal do mundo?",
                opcoes: ["A) Elefante", "B) Baleia Azul", "C) Girafa", "D) Tubarão Branco"],
                resposta: "B"
            },
            {
                pergunta: "Em que ano o homem pisou na Lua?",
                opcoes: ["A) 1965", "B) 1969", "C) 1972", "D) 1958"],
                resposta: "B"
            }
        ];
        
        const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        
        const quizTexto = `🧠 *Quiz do Dia*\n\n` +
                         `❓ *Pergunta:* ${quiz.pergunta}\n\n` +
                         `${quiz.opcoes.join('\n')}\n\n` +
                         `💡 Responda com a letra da alternativa correta!`;
        
        await sock.sendMessage(from, { text: quizTexto }, { quoted: msg });
    }
};
