module.exports = {
nome: "marcartodos",
descricao: "Marca todos os membros do grupo",
categoria: "grupos",
executar: async (sock, msg, args) => {
const from = msg.key.remoteJid;
if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "Este comando só pode ser usado em grupos." });

const metadata = await sock.groupMetadata(from);
const participantes = metadata.participants;
const mentions = participantes.map(p => p.id);
        
let texto = args.length > 0 ? args.join(' ') : 'Atenção todos!';
texto += '\n\n';
        
// Adiciona menções 
for (let p of participantes) {
texto += `@${p.id.split('@')[0]} `;
}

await sock.sendMessage(from, { text: texto, mentions: mentions }, { quoted: msg });
}};
