// commands/tradutor.js
const axios = require('axios');

module.exports = {
    nome: "traduzir",
    descricao: "Traduz texto automaticamente",
    categoria: "utilidades",
    exemplo: "!tradutor en pt Hello world",
    executar: async (sock, msg, commandArgs) => {
        // Reutiliza o código do comando traducao
        const traducaoCmd = require('./traducao');
        return await traducaoCmd.executar(sock, msg, commandArgs);
    }
};