module.exports = {
nome: "marcartodos2",
descricao: "Marca todos os membros do grupo",
categoria: "grupos",
executar: async (sock, msg, commandArgs) => {
const fromJid = msg.key.remoteJid;
if (!fromJid.endsWith('@g.us')) return sock.sendMessage(fromJid, { text: "Este comando só pode ser usado em grupos." });

const groupMetadata = await sock.groupMetadata(fromJid);
const participants = groupMetadata.participants;
const mentions = participants.map(p => p.id);
        
let text = commandArgs.length > 0 ? commandArgs.join(' ') : 'Atenção todos!';
text += '\n\n';
        
// Adiciona menções 
for (let p of participants) {
text += `@${p.id.split('@')[0]} `;
}

await sock.sendMessage(fromJid, { text: text, mentions: mentions }, { quoted: msg });
}};
/* CarsaiBot - cbot - carsai */
