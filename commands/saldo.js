const config = require('../configuration');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    nome: "saldo",
    descricao: "Verificar seu saldo no banco virtual.",
    categoria: "jogos",
    exemplo: "saldo",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const userId = msg.key.participant || msg.key.remoteJid;
        
        try {
            const dbPath = path.join(__dirname, '../database/games.json');
            const data = await fs.readFile(dbPath, 'utf8');
            const db = JSON.parse(data);
            
            if (!db.usuarios[userId]) {
                db.usuarios[userId] = { saldo: 1000 };
                await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
            }
            
            await sock.sendMessage(from, { 
                text: `🏦 *Carsai Virtual Bank*\n\n💰 Saldo: ¢${db.usuarios[userId].saldo}` 
            });
            
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: "❌ Erro ao verificar saldo!" });
        }
    }
};
