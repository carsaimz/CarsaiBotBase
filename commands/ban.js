const config = require('../configuration');

module.exports = {
nome: "ban",
descricao: "Remove um membro do grupo",
categoria: "grupos",
executar: async (sock, msg, commandArgs) => {
const fromJid = msg.key.remoteJid;
if (!fromJid.endsWith('@g.us')) return;

const groupMetadata = await sock.groupMetadata(fromJid);
const participants = groupMetadata.participants;
const sender = msg.key.participant || fromJid;
        
const admins = participants.filter(p => p.admin !== null).map(p => p.id);
const isAdmin = admins.includes(sender);
const isOwner = sender.includes(config.ownerNumber);
if (!isAdmin && !isOwner) {
return sock.sendMessage(fromJid, { text: "❌ Apenas administradores podem usar este comando." });
}

const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
const quotedParticipant = msg.message.extendedTextMessage?.contextInfo?.participant;
const target = mentions[0] || quotedParticipant;

if (!target) {
return sock.sendMessage(fromJid, { text: "💡 Mencione alguém ou responda a uma mensagem para banir." });
}

if (admins.includes(target)) {
return sock.sendMessage(fromJid, { text: "❌ Não posso banir um administrador." });
}

try {
await sock.groupParticipantsUpdate(fromJid, [target], "remove");
await sock.sendMessage(fromJid, { text: "✅ Membro removido com sucesso. 🫡" });
} catch (e) {
await sock.sendMessage(fromJid, { text: "❌ Erro ao remover membro." });
}
}};
/* CarsaiBot - cbot - carsai */
