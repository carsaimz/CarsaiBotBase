const config = require('../configuration');

module.exports = {
    nome: "calc",
    descricao: "Calculadora simples",
    categoria: "utilidades",
    exemplo: "2 + 2",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (commandArgs.length < 3) {
            return sock.sendMessage(fromJid, { 
                text: "❌ *Uso:* !calc [número] [operador] [número]\n" +
                      "📊 *Operadores:* +, -, *, /, ^\n" +
                      "📝 *Exemplo:* !calc 5 * 3"
            });
        }
        
        const num1 = parseFloat(commandArgs[0]);
        const operador = commandArgs[1];
        const num2 = parseFloat(commandArgs[2]);
        
        if (isNaN(num1) || isNaN(num2)) {
            return sock.sendMessage(fromJid, { text: "❌ Números inválidos!" });
        }
        
        let resultado;
        switch(operador) {
            case '+': resultado = num1 + num2; break;
            case '-': resultado = num1 - num2; break;
            case '*': resultado = num1 * num2; break;
            case '/': resultado = num2 !== 0 ? num1 / num2 : "Erro: Divisão por zero"; break;
            case '^': resultado = Math.pow(num1, num2); break;
            default: return sock.sendMessage(fromJid, { text: "❌ Operador inválido!" });
        }
        
        await sock.sendMessage(fromJid, { 
            text: `🧮 *Calculadora*\n\n` +
                  `${num1} ${operador} ${num2} = *${resultado}*`
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
