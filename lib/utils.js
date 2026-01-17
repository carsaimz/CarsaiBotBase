const chalk = require('chalk');
const moment = require('moment-timezone');

const cores = {
    info: chalk.blue,
    sucesso: chalk.green,
    erro: chalk.red,
    aviso: chalk.yellow,
    data: chalk.cyan,
    evento: chalk.magenta,
    label: chalk.white.bold
};

function logVertical(dados) {
const data = moment().tz('Africa/Maputo').format('DD/MM/YYYY HH:mm:ss');
console.log(chalk.gray('===================='));
console.log(`${cores.label('DATA:')} ${cores.data(data)}`);
if (dados.nome) console.log(`${cores.label('NOME:')} ${cores.sucesso(dados.nome)}`);
if (dados.numero) console.log(`${cores.label('NÚMERO:')} ${cores.info(dados.numero)}`);
if (dados.evento) console.log(`${cores.label('EVENTO:')} ${cores.evento(dados.evento)}`);
if (dados.comando) console.log(`${cores.label('COMANDO:')} ${cores.aviso(dados.comando)}`);
if (dados.texto) console.log(`${cores.label('MENSAGEM:')} ${chalk.white(dados.texto)}`);
console.log(chalk.gray('===================='));
}

module.exports = { cores, logVertical };

/* Este arquivo contém a console do bot àquelas mensagens que vc vê no seu terminal que está executado o bot **** */
