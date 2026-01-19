const fs = require('fs');
const path = require('path');
const config = require('../configuration');

function carregarComandos() {
    let comandosCarregados = [];
    const diretorioComandos = path.join(__dirname, '../commands/');
    
    try {
        const arquivos = fs.readdirSync(diretorioComandos);
        
        for (const arquivo of arquivos) {
            if (arquivo.endsWith('.js')) {
                try {
                    const comando = require(path.join(diretorioComandos, arquivo));
                    if (comando.nome && comando.descricao && comando.executar) {
                        if (!comando.categoria) {
                            comando.categoria = "geral";
                        }
                        comandosCarregados.push(comando);
                    }
                } catch (error) {
                    console.error(`Erro ao carregar comando ${arquivo}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao ler diretório de comandos:', error.message);
    }
    
    return comandosCarregados;
}

module.exports = {
    nome: "comandos",
    descricao: "Mostra ajuda sobre comandos",
    categoria: "informacao",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const comandosCarregados = carregarComandos();
        
        if (commandArgs.length === 0) {
            const categorias = {};
            comandosCarregados.forEach(cmd => {
                if (!categorias[cmd.categoria]) {
                    categorias[cmd.categoria] = [];
                }
                categorias[cmd.categoria].push(cmd);
            });
            
            let ajudaTexto = `📖 *Sistema de Ajuda*\n\n`;
            ajudaTexto += `Use: ${config.prefix}ajuda [nome do comando]\n`;
            ajudaTexto += `Exemplo: ${config.prefix}ajuda ping\n\n`;
            
            ajudaTexto += `📂 *Categorias disponíveis:*\n`;
            for (const [categoria, comandos] of Object.entries(categorias)) {
                ajudaTexto += `\n*${categoria.toUpperCase()} (${comandos.length}):*\n`;
                comandos.forEach(cmd => {
                    ajudaTexto += `• ${config.prefix}${cmd.nome}: ${cmd.descricao}\n`;
                });
            }
            
            ajudaTexto += `\n📋 Total: ${comandosCarregados.length} comandos`;
            
            return sock.sendMessage(fromJid, { 
                text: ajudaTexto
            }, { quoted: msg });
        }
        
        const commandName = commandArgs[0].toLowerCase();
        const comando = comandosCarregados.find(cmd => cmd.nome.toLowerCase() === commandName);
        
        if (!comando) {
            return sock.sendMessage(fromJid, { 
                text: `❌ Comando *${commandName}* não encontrado.\nUse ${config.prefix}menu para ver todos os comandos disponíveis.`
            }, { quoted: msg });
        }
        
        const ajudaTexto = `📖 *Ajuda do comando:* ${config.prefix}${comando.nome}\n\n` +
                          `📝 *Descrição:* ${comando.descricao}\n` +
                          `📂 *Categoria:* ${comando.categoria}\n\n` +
                          `⚙️ *Uso:* ${config.prefix}${comando.nome}`;
        
        if (comando.exemplo) {
            ajudaTexto += ` ${comando.exemplo}\n`;
        } else {
            ajudaTexto += '\n';
        }
        
        if (comando.sintaxe) {
            ajudaTexto += `\n📋 *Sintaxe:* ${config.prefix}${comando.nome} ${comando.sintaxe}`;
        }
        
        if (comando.notas) {
            ajudaTexto += `\n\n💡 *Notas:* ${comando.notas}`;
        }
        
        if (comando.aliases) {
            ajudaTexto += `\n🔤 *Aliases:* ${comando.aliases.join(', ')}`;
        }
        
        await sock.sendMessage(fromJid, { 
            text: ajudaTexto
        }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
