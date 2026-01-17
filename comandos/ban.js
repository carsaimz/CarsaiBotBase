const config = require('../configuracao');

module.exports = {
nome: "ban",
descricao: "Remove um membro do grupo",
categoria: "grupos",
executar: async (sock, msg, args) => {
const from = msg.key.remoteJid;
if (!from.endsWith('@g.us')) return;

const metadata = await sock.groupMetadata(from);
const participantes = metadata.participants;
const remetente = msg.key.participant || from;
        
const admins = participantes.filter(p => p.admin !== null).map(p => p.id);
const eAdmin = admins.includes(remetente);
const eDono = remetente.includes(config.numeroDono);
if (!eAdmin && !eDono) {
return sock.sendMessage(from, { text: "❌ Apenas administradores podem usar este comando." });
}

const mencoes = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
const citado = msg.message.extendedTextMessage?.contextInfo?.participant;
const alvo = mencoes[0] || citado;

if (!alvo) {
return sock.sendMessage(from, { text: "💡 Mencione alguém ou responda a uma mensagem para banir." });
}

if (admins.includes(alvo)) {
return sock.sendMessage(from, { text: "❌ Não posso banir um administrador." });
}

try {
await sock.groupParticipantsUpdate(from, [alvo], "remove");
await sock.sendMessage(from, { text: "✅ Membro removido com sucesso. 🫡" });
} catch (e) {
await sock.sendMessage(from, { text: "❌ Erro ao remover membro." });
}
}};
