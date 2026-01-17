const config = require('../configuracao');

module.exports = {
    nome: "calc",
    descricao: "Calculadora simples",
    categoria: "utilidades",
    exemplo: "2 + 2",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        if (args.length < 3) {
            return sock.sendMessage(from, { 
                text: "❌ *Uso:* !calc [número] [operador] [número]\n" +
                      "📊 *Operadores:* +, -, *, /, ^\n" +
                      "📝 *Exemplo:* !calc 5 * 3"
            });
        }
        
        const num1 = parseFloat(args[0]);
        const operador = args[1];
        const num2 = parseFloat(args[2]);
        
        if (isNaN(num1) || isNaN(num2)) {
            return sock.sendMessage(from, { text: "❌ Números inválidos!" });
        }
        
        let resultado;
        switch(operador) {
            case '+': resultado = num1 + num2; break;
            case '-': resultado = num1 - num2; break;
            case '*': resultado = num1 * num2; break;
            case '/': resultado = num2 !== 0 ? num1 / num2 : "Erro: Divisão por zero"; break;
            case '^': resultado = Math.pow(num1, num2); break;
            default: return sock.sendMessage(from, { text: "❌ Operador inválido!" });
        }
        
        await sock.sendMessage(from, { 
            text: `🧮 *Calculadora*\n\n` +
                  `${num1} ${operador} ${num2} = *${resultado}*`
        }, { quoted: msg });
    }
};
