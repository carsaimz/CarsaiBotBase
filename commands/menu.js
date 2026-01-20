const fs = require('fs');
const path = require('path');
const config = require('../configuration');

// Carregar todos os comandos do diretório atual (commands/)
let loadedCommands = [];
const commandsDir = __dirname;

try {
    const files = fs.readdirSync(commandsDir);
    
    for (const file of files) {
        if (file === 'menu.js' || file === 'menu.js.bak') continue;
        
        if (file.endsWith('.js')) {
            try {
                const commandPath = path.join(commandsDir, file);
                const resolvedPath = require.resolve(commandPath);
                
                if (require.cache[resolvedPath]) {
                    const command = require.cache[resolvedPath].exports;
                    if (command.nome && command.descricao && command.executar) {
                        if (!command.categoria) command.categoria = "geral";
                        loadedCommands.push(command);
                    }
                } else {
                    const command = require(commandPath);
                    if (command.nome && command.descricao && command.executar) {
                        if (!command.categoria) command.categoria = "geral";
                        loadedCommands.push(command);
                    }
                }
            } catch (error) {
                console.error(`Erro ao carregar comando ${file}:`, error.message);
            }
        }
    }
} catch (error) {
    console.error('Erro ao ler diretório de comandos:', error.message);
}

// Adicionar o próprio comando menu manualmente
loadedCommands.push({
    nome: "menu",
    descricao: "Exibe o menu principal do bot - CarsaiBot",
    categoria: "utilidades"
});

// Agrupar comandos por categoria
function groupCommands(commands) {
    const categories = {};
    
    for (const cmd of commands) {
        const category = cmd.categoria.toLowerCase();
        
        if (!categories[category]) {
            categories[category] = [];
        }
        
        categories[category].push(cmd);
    }
    
    return categories;
}

// Mapear categorias para emojis/títulos
function formatCategory(category) {
    const formats = {
        'grupos': { title: '👥 Grupos & ADM', emoji: '👥' },
        'adm': { title: '👮 Administração', emoji: '👮' },
        'utilidades': { title: '🛠️ Utilitários', emoji: '🛠️' },
        'utilitarios': { title: '🛠️ Utilitários', emoji: '🛠️' },
        'diversao': { title: '🎮 Diversão', emoji: '🎮' },
        'entretenimento': { title: '🎭 Entretenimento', emoji: '🎭' },
        'midia': { title: '📸 Mídia', emoji: '📸' },
        'figurinhas': { title: '🖼️ Figurinhas', emoji: '🖼️' },
        'informacao': { title: '📊 Informação', emoji: '📊' },
        'info': { title: 'ℹ️ Informação', emoji: 'ℹ️' },
        'musica': { title: '🎵 Música', emoji: '🎵' },
        'pesquisa': { title: '🔍 Pesquisa', emoji: '🔍' },
        'download': { title: '⬇️ Download', emoji: '⬇️' },
        'jogos': { title: '🎯 Jogos', emoji: '🎯' },
        'economia': { title: '💰 Economia', emoji: '💰' },
        'nsfw': { title: '🔞 NSFW', emoji: '🔞' },
        'dono': { title: '👑 Comandos do Dono', emoji: '👑' },
        'geral': { title: '📌 Geral', emoji: '📌' }
    };
    
    return formats[category] || { 
        title: `📌 ${category.charAt(0).toUpperCase() + category.slice(1)}`, 
        emoji: '📌' 
    };
}

module.exports = {
    nome: "menu",
    descricao: "Exibe o menu principal do bot - CarsaiBot",
    categoria: "utilidades",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const userName = msg.pushName || "Usuário";
        
        const categories = groupCommands(loadedCommands);
        
        let menuText = `
╔═════════════════════════╗
║   👋 Olá, *${userName}!*  
║   Bem-vindo ao *${config.botName}*  
╚═════════════════════════╝

🤖 *Informações do Bot (cbot):*
• Prefixo: [ ${config.prefix} ]
• Dono: ${config.ownerName}
• Comandos: ${loadedCommands.length}
• Categorias: ${Object.keys(categories).length}

📜 *Comandos Disponíveis:*

`;

const sortedCategories = Object.keys(categories).sort();

for (const category of sortedCategories) {
  const format = formatCategory(category);
  const categoryCommands = categories[category];

  categoryCommands.sort((a, b) => a.nome.localeCompare(b.nome));

  menuText += `*${format.title}:*\n`;
  for (const cmd of categoryCommands) {
    menuText += `• \`${config.prefix}${cmd.nome}\` (${cmd.descricao})\n`;
  }
  menuText += '\n';
}

menuText += `_Para mais ajuda, use ${config.prefix}ajuda [comando]_`;
menuText += `\n\n💡 *Dica:* Envie uma imagem com a legenda *s* para criar uma figurinha! - CarsaiBot`;
menuText += `\n\n💸 *Ajude a manter o bot:*
• M-pesa: 842846463 (Carimo) \n
• e-Mola: 862414345 (Carimo)`;
        
        try {
            if (config.logo) {
                await sock.sendMessage(fromJid, { 
                    image: { url: config.logo },
                    caption: menuText
                }, { quoted: msg });
            } else {
                await sock.sendMessage(fromJid, { 
                    text: menuText
                }, { quoted: msg });
            }
        } catch (error) {
            console.error('Erro ao enviar menu:', error);
            await sock.sendMessage(fromJid, { 
                text: menuText
            }, { quoted: msg });
        }
    }
};
/* CarsaiBot - cbot - carsai */
