const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const sessionPath = path.join(__dirname, 'lib', 'session_data');

console.log(chalk.hex('#00D9FF').bold('\n╔════════════════════════════════════╗'));
console.log(chalk.hex('#00D9FF').bold('║  🗑️  LIMPADOR DE SESSÃO CARSAI  🗑️   ║'));
console.log(chalk.hex('#00D9FF').bold('╚════════════════════════════════════╝\n'));

if (fs.existsSync(sessionPath)) {
    try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(chalk.green('✅ Sessão removida com sucesso!'));
        console.log(chalk.yellow('\n📱 Agora você pode:'));
        console.log(chalk.cyan('   1. Executar: sh start.sh'));
        console.log(chalk.cyan('   2. Parear novamente com o WhatsApp\n'));
    } catch (error) {
        console.log(chalk.red('❌ Erro ao remover sessão: ' + error.message));
        console.log(chalk.yellow('\n💡 Tente deletar manualmente a pasta: lib/session_data\n'));
    }
} else {
    console.log(chalk.yellow('⚠️  Pasta de sessão não encontrada.'));
    console.log(chalk.cyan('   A sessão já está limpa!\n'));
}

console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
/* CarsaiBot - cbot - carsai */
