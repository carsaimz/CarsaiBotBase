const chalk = require('chalk');
const moment = require('moment-timezone');

const colors = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
    date: chalk.cyan,
    event: chalk.magenta,
    label: chalk.white.bold,
    gradient: (text) => chalk.hex('#00D9FF')(text)
};

function showBanner() {
    console.clear();
    const banner = `
${chalk.hex('#00D9FF').bold('╔═══════════════════════════════════════════════════════════╗')}
${chalk.hex('#00D9FF').bold('║')}                                                           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}      ${chalk.hex('#FFD700').bold('██████╗ ') + chalk.hex('#00D9FF').bold('█████╗ ') + chalk.hex('#FF6B9D').bold('██████╗ ') + chalk.hex('#98FB98').bold('███████╗') + chalk.hex('#FFD700').bold(' █████╗ ') + chalk.hex('#00D9FF').bold('██╗')}           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}     ${chalk.hex('#FFD700').bold('██╔════╝') + chalk.hex('#00D9FF').bold('██╔══██╗') + chalk.hex('#FF6B9D').bold('██╔══██╗') + chalk.hex('#98FB98').bold('██╔════╝') + chalk.hex('#FFD700').bold('██╔══██╗') + chalk.hex('#00D9FF').bold('██║')}           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}     ${chalk.hex('#FFD700').bold('██║     ') + chalk.hex('#00D9FF').bold('███████║') + chalk.hex('#FF6B9D').bold('██████╔╝') + chalk.hex('#98FB98').bold('███████╗') + chalk.hex('#FFD700').bold('███████║') + chalk.hex('#00D9FF').bold('██║')}           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}     ${chalk.hex('#FFD700').bold('██║     ') + chalk.hex('#00D9FF').bold('██╔══██║') + chalk.hex('#FF6B9D').bold('██╔══██╗') + chalk.hex('#98FB98').bold('╚════██║') + chalk.hex('#FFD700').bold('██╔══██║') + chalk.hex('#00D9FF').bold('██║')}           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}     ${chalk.hex('#FFD700').bold('╚██████╗') + chalk.hex('#00D9FF').bold('██║  ██║') + chalk.hex('#FF6B9D').bold('██║  ██║') + chalk.hex('#98FB98').bold('███████║') + chalk.hex('#FFD700').bold('██║  ██║') + chalk.hex('#00D9FF').bold('██║')}           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}     ${chalk.hex('#FFD700').bold(' ╚═════╝') + chalk.hex('#00D9FF').bold('╚═╝  ╚═╝') + chalk.hex('#FF6B9D').bold('╚═╝  ╚═╝') + chalk.hex('#98FB98').bold('╚══════╝') + chalk.hex('#FFD700').bold('╚═╝  ╚═╝') + chalk.hex('#00D9FF').bold('╚═╝')}           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}                                                           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}          ${chalk.hex('#98FB98')('🤖 Bot de WhatsApp Multi-Funcional 🤖')}            ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}     ${chalk.hex('#FFD700')('Versão 2.0 | Desenvolvido com ❤️ por CarsaiDev')}         ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('║')}                                                           ${chalk.hex('#00D9FF').bold('║')}
${chalk.hex('#00D9FF').bold('╚═══════════════════════════════════════════════════════════╝')}

${chalk.hex('#00D9FF')('┌─────────────────────────────────────────────────────────┐')}
${chalk.hex('#00D9FF')('│')} ${chalk.hex('#98FB98').bold('STATUS:')} ${chalk.hex('#FFD700')('Inicializando sistema...')}                        ${chalk.hex('#00D9FF')('│')}
${chalk.hex('#00D9FF')('│')} ${chalk.hex('#98FB98').bold('HORA:')}   ${chalk.hex('#FFD700')(moment().tz('Africa/Maputo').format('DD/MM/YYYY HH:mm:ss'))}                             ${chalk.hex('#00D9FF')('│')}
${chalk.hex('#00D9FF')('└─────────────────────────────────────────────────────────┘')}
`;
    console.log(banner);
}

function verticalLog(data) {
    const date = moment().tz('Africa/Maputo').format('DD/MM/YYYY HH:mm:ss');
    
    console.log(chalk.hex('#444444')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(`${chalk.hex('#00D9FF').bold('⏰ DATA:')} ${chalk.hex('#FFD700')(date)}`);
    
    if (data.name) console.log(`${chalk.hex('#98FB98').bold('👤 NOME:')} ${chalk.hex('#FFFFFF')(data.name)}`);
    if (data.number) console.log(`${chalk.hex('#00D9FF').bold('📱 NÚMERO:')} ${chalk.hex('#FFFFFF')(data.number)}`);
    if (data.event) console.log(`${chalk.hex('#FF6B9D').bold('📍 EVENTO:')} ${chalk.hex('#FFFFFF')(data.event)}`);
    if (data.command) console.log(`${chalk.hex('#FFD700').bold('⚡ COMANDO:')} ${chalk.hex('#FFFFFF')(data.command)}`);
    if (data.text) console.log(`${chalk.hex('#98FB98').bold('💬 MENSAGEM:')} ${chalk.hex('#CCCCCC')(data.text)}`);
    
    console.log(chalk.hex('#444444')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

module.exports = { colors, verticalLog, showBanner };
/* CarsaiBot - cbot - carsai */
