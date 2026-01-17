const fs = require('fs');
const path = require('path');
const config = require('../configuracao');

// Carregar todos os comandos do diretório comandos/
let comandosCarregados = [];
const diretorioComandos = path.join(__dirname, '../comandos/');

try {
    const arquivos = fs.readdirSync(diretorioComandos);
    
    for (const arquivo of arquivos) {
        if (arquivo.endsWith('.js')) {
            try {
                const comando = require(path.join(diretorioComandos, arquivo));
                if (comando.nome && comando.descricao && comando.executar) {
                    // Definir categoria padrão se não existir
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

// Agrupar comandos por categoria
function agruparComandos(comandos) {
    const categorias = {};
    
    for (const cmd of comandos) {
        const categoria = cmd.categoria.toLowerCase();
        
        if (!categorias[categoria]) {
            categorias[categoria] = [];
        }
        
        categorias[categoria].push(cmd);
    }
    
    return categorias;
}

// Mapear categorias para emojis/títulos
function formatarCategoria(categoria) {
    const formatos = {
        'grupos': { titulo: '👥 Grupos & ADM', emoji: '👥' },
        'adm': { titulo: '👮 Administração', emoji: '👮' },
        'utilidades': { titulo: '🛠️ Utilitários', emoji: '🛠️' },
        'utilitarios': { titulo: '🛠️ Utilitários', emoji: '🛠️' },
        'diversao': { titulo: '🎮 Diversão', emoji: '🎮' },
        'entretenimento': { titulo: '🎭 Entretenimento', emoji: '🎭' },
        'midia': { titulo: '📸 Mídia', emoji: '📸' },
        'figurinhas': { titulo: '🖼️ Figurinhas', emoji: '🖼️' },
        'informacao': { titulo: '📊 Informação', emoji: '📊' },
        'info': { titulo: 'ℹ️ Informação', emoji: 'ℹ️' },
        'musica': { titulo: '🎵 Música', emoji: '🎵' },
        'pesquisa': { titulo: '🔍 Pesquisa', emoji: '🔍' },
        'download': { titulo: '⬇️ Download', emoji: '⬇️' },
        'jogos': { titulo: '🎯 Jogos', emoji: '🎯' },
        'economia': { titulo: '💰 Economia', emoji: '💰' },
        'nsfw': { titulo: '🔞 NSFW', emoji: '🔞' },
        'dono': { titulo: '👑 Comandos do Dono', emoji: '👑' },
        'geral': { titulo: '📌 Geral', emoji: '📌' }
    };
    
    return formatos[categoria] || { 
        titulo: `📌 ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`, 
        emoji: '📌' 
    };
}

module.exports = {
    nome: "menu",
    descricao: "Exibe o menu principal do bot",
    categoria: "utilidades",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const nomeUsuario = msg.pushName || "Usuário";
        
        // Agrupar comandos por categoria
        const categorias = agruparComandos(comandosCarregados);
        
        // Construir texto do menu
        let menuTexto = `👋 Olá, *${nomeUsuario}!*\n`;
        menuTexto += `Bem-vindo ao *${config.nomeBot}*\n\n`;
        
        menuTexto += `🤖 *Informações do Bot:*\n`;
        menuTexto += `├ Prefixo: [ ${config.prefixo} ]\n`;
        menuTexto += `├ Dono: ${config.nomeDono}\n`;
        menuTexto += `├ Comandos: ${comandosCarregados.length}\n`;
        menuTexto += `└ Categorias: ${Object.keys(categorias).length}\n\n`;
        
        menuTexto += `📜 *Comandos Disponíveis:*\n\n`;
        
        // Ordenar categorias alfabeticamente (ou você pode definir uma ordem específica)
        const categoriasOrdenadas = Object.keys(categorias).sort();
        
        // Adicionar comandos de cada categoria
        for (const categoria of categoriasOrdenadas) {
            const formato = formatarCategoria(categoria);
            const comandosDaCategoria = categorias[categoria];
            
            // Ordenar comandos alfabeticamente
            comandosDaCategoria.sort((a, b) => a.nome.localeCompare(b.nome));
            
            menuTexto += `${formato.emoji} *${formato.titulo}:*\n`;
            
            for (const cmd of comandosDaCategoria) {
                menuTexto += `├ ${config.prefixo}${cmd.nome.padEnd(15)} - ${cmd.descricao}\n`;
            }
            
            menuTexto += '\n';
        }
        
        menuTexto += `_Para mais ajuda, use ${config.prefixo}ajuda [comando]_`;
        menuTexto += `\n\n💡 *Dica:* Envie uma imagem com a legenda *s* para criar uma figurinha!`;
        
        menuTexto += `\n\n💸 *Ajude a manter o bot:*\n`;
        menuTexto += `├ M-pesa: 842846463\n`;
        menuTexto += `└ e-Mola: 862414345`;
        
        try {
            // Enviar mensagem com imagem se config.logo existir
            if (config.logo) {
                await sock.sendMessage(from, { 
                    image: { url: config.logo },
                    caption: menuTexto
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    text: menuTexto
                }, { quoted: msg });
            }
        } catch (erro) {
            console.error('Erro ao enviar menu:', erro);
            // Fallback: enviar apenas texto se a imagem falhar
            await sock.sendMessage(from, { 
                text: menuTexto
            }, { quoted: msg });
        }
    }
};