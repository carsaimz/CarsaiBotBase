const config = require('../configuracao');

module.exports = {
nome: "abrir",
descricao: "Abre o grupo para todos os membros enviarem mensagens",
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

try {
await sock.groupSettingUpdate(from, 'not_announcement');
await sock.sendMessage(from, { text: "🔓 *Grupo aberto!* Todos podem enviar mensagens." }); } catch (e) {
await sock.sendMessage(from, { text: "❌ Erro ao abrir grupo." });
}}};
