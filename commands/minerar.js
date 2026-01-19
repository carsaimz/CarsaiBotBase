const config = require('../configuration');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    nome: "minerar",
    descricao: "Minerar criptomoedas para ganhar dinheiro.",
    categoria: "jogos",
    exemplo: "minerar",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const userId = msg.key.participant || msg.key.remoteJid;
        
        try {
            const dbPath = path.join(__dirname, '../database/games.json');
            const data = await fs.readFile(dbPath, 'utf8');
            const db = JSON.parse(data);
            
            if (!db.usuarios[userId]) {
                db.usuarios[userId] = { 
                    saldo: 1000,
                    ultimaMineração: 0 
                };
            }
            
            const agora = Date.now();
            const cooldown = 5 * 60 * 1000; // 5 minutos
            
            if (db.usuarios[userId].ultimaMineração && 
                (agora - db.usuarios[userId].ultimaMineração) < cooldown) {
                const tempoRestante = Math.ceil((cooldown - (agora - db.usuarios[userId].ultimaMineração)) / 60000);
                await sock.sendMessage(from, { 
                    text: `⏳ Aguarde ${tempoRestante} minutos para minerar novamente!` 
                });
                return;
            }
            
            // Ganho aleatório entre 50-200
            const ganho = Math.floor(Math.random() * 151) + 50;
            db.usuarios[userId].saldo += ganho;
            db.usuarios[userId].ultimaMineração = agora;
            
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
            
            await sock.sendMessage(from, { 
                text: `⛏️ *MINERAÇÃO BEM-SUCEDIDA!*\n+¢${ganho}\nNovo saldo: ¢${db.usuarios[userId].saldo}` 
            });
            
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: "❌ Erro ao minerar!" });
        }
    }
};
