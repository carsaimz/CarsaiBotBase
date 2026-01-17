const config = require('../configuracao');

module.exports = {
nome: "antilink",
descricao: "Ativa ou desativa o sistema de antilink no grupo",
categoria: "grupos",
executar: async (sock, msg, args, { lerDB, salvarDB }) => {
const from = msg.key.remoteJid;
if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "Este comando só funciona em grupos." });

// Verificar se o remetente é admin ou dono
const metadata = await sock.groupMetadata(from);
const participantes = metadata.participants;
const remetente = msg.key.participant || from;
        
const admins = participantes.filter(p => p.admin !== null).map(p => p.id);
const eAdmin = admins.includes(remetente);
const eDono = remetente.includes(config.numeroDono);

if (!eAdmin && !eDono) {
return sock.sendMessage(from, { text: "❌ Apenas administradores podem usar este comando." });
}

if (!args[0]) {
return sock.sendMessage(from, { text: `💡 Use: *${config.prefixo}antilink on* ou *${config.prefixo}antilink off*` });
}

const db = lerDB();
if (!db[from]) db[from] = {};
if (args[0] === 'on') {
db[from].antilink = true;
salvarDB(db);
await sock.sendMessage(from, { text: "✅ *Antilink ativado!* O bot agora irá remover links de convite de outros grupos." });
} else if (args[0] === 'off') {
db[from].antilink = false;
salvarDB(db);
await sock.sendMessage(from, { text: "❌ *Antilink desativado!*" });
} else {
await sock.sendMessage(from, { text: "❌ Opção inválida. Use 'on' ou 'off'." });
}}};
