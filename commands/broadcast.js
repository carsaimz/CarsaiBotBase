const config = require('../configuration');

module.exports = {
    nome: "broadcast",
    descricao: "Envia mensagem para todos os grupos (apenas dono)",
    categoria: "dono",
    exemplo: "Mensagem importante",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        
        if (!sender.includes(config.ownerNumber)) {
            return sock.sendMessage(fromJid, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!commandArgs[0]) {
            return sock.sendMessage(fromJid, { text: "❌ Digite a mensagem para broadcast." });
        }
        
        const mensagem = commandArgs.join(' ');
        const grupos = await sock.groupFetchAllParticipating();
        
        let sucesso = 0;
        let falhas = 0;
        const total = Object.keys(grupos).length;
        
        await sock.sendMessage(fromJid, { 
            text: `📢 *Iniciando Broadcast*\n\n📝 *Mensagem:* ${mensagem}\n📊 *Grupos:* ${total}\n⏳ *Status:* Enviando...` 
        });
        
        for (const grupoId in grupos) {
            try {
                await sock.sendMessage(grupoId, { 
                    text: `📢 *Broadcast do ${config.botName}*\n\n${mensagem}\n\n_Esta é uma mensagem automática enviada para todos os grupos._`
                });
                sucesso++;
                
                // Pequena pausa para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                falhas++;
            }
        }
        
        await sock.sendMessage(fromJid, { 
            text: `✅ *Broadcast Concluído*\n\n📊 *Resultado:*\n✅ Sucesso: ${sucesso}\n❌ Falhas: ${falhas}\n📈 Total: ${total}\n📝 Mensagem enviada para ${sucesso} grupo(s).` 
        });
    }
};
/* CarsaiBot - cbot - carsai */
