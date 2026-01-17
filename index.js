const iniciarConexao = require('./conexao');

const { logVertical, cores } = require('./lib/utils');
const { validateSession } = require('./lib/cache-system');
const config = require('./configuracao');
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const util = require('util')
const path = require('path');

// Caminho para o banco de dados de grupos
const dbPath = path.join(__dirname, 'database', 'grupos.json');

// Função para ler o banco de dados
function lerDB() {
try {
if (!fs.existsSync(dbPath)) return {};
return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
} catch (e) {
return {}; 
}}

// Função para salvar no banco de dados
function salvarDB(dados) {
fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
}

async function principal() {
// Verificação de Chave
if (!validateSession(config.chaveAtivacao)) {
console.log(cores.erro("\n[ERRO DE ATIVAÇÃO]"));
console.log(cores.aviso("Chave de ativação inválida ou ausente no arquivo configuracao.js"));
console.log(cores.info("Por favor, insira uma chave válida para iniciar o bot.\n"));
process.exit(1);
}

const sock = await iniciarConexao();
const comandos = new Map();

// Carregar comandos 
const pastaComandos = path.join(__dirname, 'comandos');
const arquivosComandos = fs.readdirSync(pastaComandos).filter(file => file.endsWith('.js'));

for (const arquivo of arquivosComandos) {
const comando = require(path.join(pastaComandos, arquivo));
comandos.set(comando.nome, comando);
}
logVertical({ evento: 'SISTEMA', texto: `${comandos.size} comandos carregados.` });

// Eventos de Grupo (Bem-vindo/Adeus)
sock.ev.on('group-participants.update', async (anu) => {
try {
const from = anu.id;
const metadata = await sock.groupMetadata(from);
const participants = anu.participants;

for (let num of participants) {
// Tratamento de ID para evitar TypeError: 
const id = typeof num === 'string' ? num : num.id;
const numeroLimpo = id.split('@')[0];

if (anu.action === 'add') {
const bemVindo = `Olá @${numeroLimpo}, bem-vindo ao grupo *${metadata.subject}*! 👋`;
await sock.sendMessage(from, { text: bemVindo, mentions: [id] });
} else if (anu.action === 'remove') {
const adeus = `@${numeroLimpo} saiu do grupo. Até logo! 👋`;
await sock.sendMessage(from, { text: adeus, mentions: [id] });
}} } catch (err) {
console.log(cores.erro(`Erro no evento group-participants.update: ${err.message}`));
}});

sock.ev.on('messages.upsert', async (m) => {
if (m.type !== 'notify') return;

const msg = m.messages[0];
if (!msg.message || msg.key.fromMe) return;

const from = msg.key.remoteJid;
const eGrupo = from.endsWith('@g.us');
const remetente = msg.key.participant || from;
const nomeUsuario = msg.pushName || "Usuário";

// Extração de texto
const texto = msg.message.conversation || 
msg.message.extendedTextMessage?.text || 
msg.message.imageMessage?.caption ||
msg.message.videoMessage?.caption ||
"";

// Lógica Antilink (Verificação Real de ADM)
if (eGrupo && texto.includes('chat.whatsapp.com')) {
const db = lerDB();
const antilinkAtivo = db[from]?.antilink || false;

if (antilinkAtivo) {
const metadata = await sock.groupMetadata(from);
const participantes = metadata.participants;
                
// Identificar Admins
const admins = participantes.filter(p => p.admin !== null).map(p => p.id);
const eAdmin = admins.includes(remetente);
if (!eAdmin) {
logVertical({ evento: 'ANTILINK', texto: `Link detectado de ${nomeUsuario}. Removendo...` });
await sock.sendMessage(from, { delete: msg.key });
await sock.groupParticipantsUpdate(from, [remetente], "remove");
return;
}}}

if (!texto.startsWith(config.prefixo)) {
// Lógica de Auto-Sticker
if (config.autoSticker && (msg.message.imageMessage || msg.message.videoMessage)) {
const legenda = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption;
if (legenda === 's') {
logVertical({ nome: nomeUsuario, numero: remetente.split('@')[0], evento: 'MÍDIA', texto: 'Auto-Sticker solicitado' });
}}
return;
}

const args = texto.slice(config.prefixo.length).trim().split(/ +/);
const nomeComando = args.shift().toLowerCase();

logVertical({ 
nome: nomeUsuario, 
numero: remetente.split('@')[0], 
evento: 'COMANDO', 
comando: nomeComando,
texto: texto
});

// Simular "Digitando..."
await sock.sendPresenceUpdate('composing', from);

const comando = comandos.get(nomeComando);
if (comando) {
try {
// Passar funções de DB para os comandos se necessário
await comando.executar(sock, msg, args, { lerDB, salvarDB });
} catch (erro) {
console.log(cores.erro(`Erro ao executar ${nomeComando}: ${erro.message}`));
await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao executar este comando." });
}}});
}

principal().catch(err => console.log(cores.erro(`ERRO FATAL: ${err.message}`)));

/* Este arquivo contém algumas funções existentes no bot e responsável pela leitura de mensagens, etc ** */