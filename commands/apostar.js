const config = require('../configuration');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    nome: "apostar",
    descricao: "Apostar uma quantia na roleta. Ganhe o dobro ou perca tudo.",
    categoria: "jogos",
    exemplo: "apostar 100",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const userId = msg.key.participant || msg.key.remoteJid;
        
        if (!args[0] || isNaN(args[0]) || args[0] <= 0) {
            await sock.sendMessage(from, { 
                text: "❌ Use: *apostar <quantia>*\nExemplo: aposta 100" 
            });
            return;
        }
        
        const quantia = parseInt(args[0]);
        
        try {
            const dbPath = path.join(__dirname, '../database/games.json');
            const data = await fs.readFile(dbPath, 'utf8');
            const db = JSON.parse(data);
            
            if (!db.usuarios[userId]) {
                db.usuarios[userId] = { saldo: 1000 };
            }
            
            if (db.usuarios[userId].saldo < quantia) {
                await sock.sendMessage(from, { 
                    text: `❌ Saldo insuficiente! Você tem ¢${db.usuarios[userId].saldo}` 
                });
                return;
            }
            
            // Roleta: 20% de chance
            const vitoria = Math.random() > 0.2;
            
            if (vitoria) {
                db.usuarios[userId].saldo += quantia;
                await sock.sendMessage(from, { 
                    text: `🎉 *VOCÊ GANHOU!*\n+¢${quantia}\nNovo saldo: ¢${db.usuarios[userId].saldo}` 
                });
            } else {
                db.usuarios[userId].saldo -= quantia;
                await sock.sendMessage(from, { 
                    text: `💥 *VOCÊ PERDEU!*\n-¢${quantia}\nNovo saldo: ¢${db.usuarios[userId].saldo}` 
                });
            }
            
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
            
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: "❌ Erro ao processar aposta!" });
        }
    }
};
