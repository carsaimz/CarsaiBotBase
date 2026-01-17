const config = require('../configuracao');

module.exports = {
    nome: "broadcast",
    descricao: "Envia mensagem para todos os grupos (apenas dono)",
    categoria: "dono",
    exemplo: "Mensagem importante",
    executar: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const remetente = msg.key.participant || from;
        
        if (!remetente.includes(config.numeroDono)) {
            return sock.sendMessage(from, { text: "❌ Comando restrito ao dono do bot." });
        }
        
        if (!args[0]) {
            return sock.sendMessage(from, { text: "❌ Digite a mensagem para broadcast." });
        }
        
        const mensagem = args.join(' ');
        const grupos = await sock.groupFetchAllParticipating();
        
        let sucesso = 0;
        let falhas = 0;
        const total = Object.keys(grupos).length;
        
        await sock.sendMessage(from, { 
            text: `📢 *Iniciando Broadcast*\n\n📝 *Mensagem:* ${mensagem}\n📊 *Grupos:* ${total}\n⏳ *Status:* Enviando...` 
        });
        
        for (const grupoId in grupos) {
            try {
                await sock.sendMessage(grupoId, { 
                    text: `📢 *Broadcast do ${config.nomeBot}*\n\n${mensagem}\n\n_Esta é uma mensagem automática enviada para todos os grupos._`
                });
                sucesso++;
                
                // Pequena pausa para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                falhas++;
            }
        }
        
        await sock.sendMessage(from, { 
            text: `✅ *Broadcast Concluído*\n\n📊 *Resultado:*\n✅ Sucesso: ${sucesso}\n❌ Falhas: ${falhas}\n📈 Total: ${total}\n📝 Mensagem enviada para ${sucesso} grupo(s).` 
        });
    }
};
