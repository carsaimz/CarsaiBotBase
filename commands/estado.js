const config = require('../configuration');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    nome: "estado",
    descricao: "Ver ou alterar seu status de relacionamento.",
    categoria: "geral",
    exemplo: "estado solteiro\nstatus namorando @amigo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const userId = msg.key.participant || msg.key.remoteJid;
        
        try {
            const dbPath = path.join(__dirname, '../database/games.json');
            const data = await fs.readFile(dbPath, 'utf8');
            const db = JSON.parse(data);
            
            if (!db.usuarios[userId]) {
                db.usuarios[userId] = { saldo: 1000 };
            }
            
            if (!args[0]) {
                // Mostrar status atual
                const status = db.usuarios[userId].status || "solteiro";
                const parceiro = db.usuarios[userId].parceiro || null;
                
                let textoStatus = `📊 *SEU ESTADO*\n\nRelacionamento: ${status}`;
                
                if (parceiro && status !== "solteiro") {
                    textoStatus += `\nCom: @${parceiro.split('@')[0]}`;
                }
                
                await sock.sendMessage(from, { 
                    text: textoStatus,
                    mentions: parceiro ? [parceiro] : []
                });
                return;
            }
            
            const novoStatus = args[0].toLowerCase();
            const statusValidos = ["solteiro", "namorando", "casado"];
            
            if (!statusValidos.includes(novoStatus)) {
                await sock.sendMessage(from, { 
                    text: `❌ Estado inválido!\n Estados válidos: ${statusValidos.join(", ")}` 
                });
                return;
            }
            
            if (novoStatus === "solteiro") {
                db.usuarios[userId].status = "solteiro";
                delete db.usuarios[userId].parceiro;
                await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
                
                await sock.sendMessage(from, { 
                    text: "💔 Status atualizado para: *Solteiro*" 
                });
                return;
            }
            
            // Para namorando/casado, precisa marcar alguém
            if (!msg.message.extendedTextMessage || 
                !msg.message.extendedTextMessage.contextInfo || 
                !msg.message.extendedTextMessage.contextInfo.mentionedJid) {
                await sock.sendMessage(from, { 
                    text: `❌ Para status "${novoStatus}", marque um usuário!\nExemplo: status ${novoStatus} @amigo` 
                });
                return;
            }
            
            const parceiro = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            
            db.usuarios[userId].status = novoStatus;
            db.usuarios[userId].parceiro = parceiro;
            
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
            
            await sock.sendMessage(from, { 
                text: `💖 Status atualizado!\n${novoStatus.charAt(0).toUpperCase() + novoStatus.slice(1)} com @${parceiro.split('@')[0]}`,
                mentions: [parceiro]
            });
            
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: "❌ Erro ao atualizar status!" });
        }
    }
};
