const fs = require('fs');
const path = require('path');
const config = require('../configuracao');

function carregarComandos() {
    let comandosCarregados = [];
    const diretorioComandos = path.join(__dirname, '../comandos/');
    
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
                } catch (erro) {
                    console.error(`Erro ao carregar comando ${arquivo}:`, erro.message);
                }
            }
        }
    } catch (erro) {
        console.error('Erro ao ler diretório de comandos:', erro.message);
    }
    
    return comandosCarregados;
}

module.exports = {
    nome: "ajuda",
    descricao: "Mostra ajuda sobre comandos",
    categoria: "informacao",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const comandosCarregados = carregarComandos();
        
        if (args.length === 0) {
            const categorias = {};
            comandosCarregados.forEach(cmd => {
                if (!categorias[cmd.categoria]) {
                    categorias[cmd.categoria] = [];
                }
                categorias[cmd.categoria].push(cmd);
            });
            
            let ajudaTexto = `📖 *Sistema de Ajuda*\n\n`;
            ajudaTexto += `Use: ${config.prefixo}ajuda [nome do comando]\n`;
            ajudaTexto += `Exemplo: ${config.prefixo}ajuda ping\n\n`;
            
            ajudaTexto += `📂 *Categorias disponíveis:*\n`;
            for (const [categoria, comandos] of Object.entries(categorias)) {
                ajudaTexto += `\n*${categoria.toUpperCase()} (${comandos.length}):*\n`;
                comandos.forEach(cmd => {
                    ajudaTexto += `├ ${config.prefixo}${cmd.nome}: ${cmd.descricao}\n`;
                });
            }
            
            ajudaTexto += `\n📋 Total: ${comandosCarregados.length} comandos`;
            
            return sock.sendMessage(from, { 
                text: ajudaTexto
            }, { quoted: msg });
        }
        
        const nomeComando = args[0].toLowerCase();
        const comando = comandosCarregados.find(cmd => cmd.nome.toLowerCase() === nomeComando);
        
        if (!comando) {
            return sock.sendMessage(from, { 
                text: `❌ Comando *${nomeComando}* não encontrado.\nUse ${config.prefixo}menu para ver todos os comandos disponíveis.`
            }, { quoted: msg });
        }
        
        const ajudaTexto = `📖 *Ajuda do comando:* ${config.prefixo}${comando.nome}\n\n` +
                          `📝 *Descrição:* ${comando.descricao}\n` +
                          `📂 *Categoria:* ${comando.categoria}\n\n` +
                          `⚙️ *Uso:* ${config.prefixo}${comando.nome}`;
        
        if (comando.exemplo) {
            ajudaTexto += ` ${comando.exemplo}\n`;
        } else {
            ajudaTexto += '\n';
        }
        
        if (comando.sintaxe) {
            ajudaTexto += `\n📋 *Sintaxe:* ${config.prefixo}${comando.nome} ${comando.sintaxe}`;
        }
        
        if (comando.notas) {
            ajudaTexto += `\n\n💡 *Notas:* ${comando.notas}`;
        }
        
        if (comando.aliases) {
            ajudaTexto += `\n🔤 *Aliases:* ${comando.aliases.join(', ')}`;
        }
        
        await sock.sendMessage(from, { 
            text: ajudaTexto
        }, { quoted: msg });
    }
};
