const config = require('../configuration');

module.exports = {
    nome: "jogodavelha",
    descricao: "Jogo da velha multiplayer",
    categoria: "diversao",
    aliases: ["velha", "ttt"],
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const tabuleiro = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9']
        ];
        
        const tabuleiroTexto = `🎮 *Jogo da Velha*\n\n` +
                              `Use !jogar [posição] para fazer sua jogada\n\n` +
                              `${tabuleiro[0].join(' | ')}\n` +
                              `---------\n` +
                              `${tabuleiro[1].join(' | ')}\n` +
                              `---------\n` +
                              `${tabuleiro[2].join(' | ')}\n\n` +
                              `Jogador atual: ❌`;
        
        await sock.sendMessage(fromJid, { text: tabuleiroTexto }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
