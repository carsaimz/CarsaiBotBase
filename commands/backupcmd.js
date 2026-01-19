// comandos/backupcmd.js
const fs = require('fs');
const path = require('path');
const config = require('../configuration');

module.exports = {
    nome: "backupcmd",
    descricao: "Cria backup de todos os comandos (apenas dono)",
    categoria: "dono",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        try {
            const diretorioComandos = path.join(__dirname);
            const arquivos = fs.readdirSync(diretorioComandos);
            const comandosJS = arquivos.filter(arquivo => arquivo.endsWith('.js'));
            
            // Criar pasta de backup se não existir
            const backupDir = path.join(__dirname, '../backup_comandos');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir);
            }
            
            // Criar backup com timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupDir, `backup-${timestamp}.zip`);
            
            let backupInfo = `📊 *Backup de Comandos*\n\n`;
            backupInfo += `📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n`;
            backupInfo += `📁 *Total de comandos:* ${comandosJS.length}\n\n`;
            backupInfo += `📋 *Lista de comandos:*\n`;
            
            // Criar arquivo de backup como text
            let backupConteudo = `// BACKUP DE COMANDOS - ${new Date().toLocaleString('pt-BR')}\n`;
            backupConteudo += `// Total: ${comandosJS.length} comandos\n\n`;
            
            for (const arquivo of comandosJS) {
                try {
                    const conteudo = fs.readFileSync(path.join(diretorioComandos, arquivo), 'utf8');
                    backupConteudo += `// ========== ${arquivo} ==========\n`;
                    backupConteudo += conteudo + '\n\n';
                    
                    backupInfo += `├ ${arquivo}\n`;
                } catch (error) {
                    backupInfo += `├ ${arquivo} ❌ (error: ${error.message})\n`;
                }
            }
            
            // Salvar backup
            const backupPath = path.join(backupDir, `comandos-${timestamp}.txt`);
            fs.writeFileSync(backupPath, backupConteudo);
            
            backupInfo += `\n✅ *Backup criado com sucesso!*\n`;
            backupInfo += `📁 *Arquivo:* comandos-${timestamp}.txt\n`;
            backupInfo += `📍 *Local:* ${backupPath}\n`;
            backupInfo += `💾 *Tamanho:* ${Math.round(backupConteudo.length / 1024)} KB`;
            
            // Enviar backup como arquivo
            await sock.sendMessage(fromJid, {
                document: Buffer.fromJid(backupConteudo),
                fileName: `backup-comandos-${timestamp}.txt`,
                mimetype: 'text/plain',
                caption: backupInfo
            });
            
        } catch (error) {
            await sock.sendMessage(fromJid, { 
                text: `❌ Erro ao criar backup: ${error.message}`
            });
        }
    }
};
/* CarsaiBot - cbot - carsai */
