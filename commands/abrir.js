const config = require('../configuration');

module.exports = {
nome: "abrir",
descricao: "Abre o grupo para todos os membros enviarem mensagens",
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

try {
await sock.groupSettingUpdate(fromJid, 'not_announcement');
await sock.sendMessage(fromJid, { text: "🔓 *Grupo aberto!* Todos podem enviar mensagens." }); } catch (e) {
await sock.sendMessage(fromJid, { text: "❌ Erro ao abrir grupo." });
}}};
/* CarsaiBot - cbot - carsai */
