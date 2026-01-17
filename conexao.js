const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const readline = require('readline');
const { logVertical } = require('./lib/utils');
const config = require('./configuracao');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function iniciarConexao() {
const { state, saveCreds } = await useMultiFileAuthState('./lib/lixoQR');
const { version, isLatest } = await fetchLatestBaileysVersion();
    
logVertical({ evento: 'SISTEMA', texto: `Iniciando ${config.nomeBot} v${version.join('.')}` });

const sock = makeWASocket({
version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),}, browser: ["Ubuntu", "Chrome", "20.0.04"], markOnlineOnConnect: true,
});

if (!sock.authState.creds.registered) {
console.log("\n--- CONFIGURAÇÃO DE NOVO NÚMERO ---");
let phoneNumber = config.numeroBot;
if (!phoneNumber) {
phoneNumber = await question('Digite o número do WhatsApp (ex: 258862414345):\n> ');
}
const numLimpo = phoneNumber.replace(/[^0-9]/g, '');

setTimeout(async () => {
try {
const code = await sock.requestPairingCode(numLimpo);
console.log(`\n✅ SEU CÓDIGO DE PAREAMENTO: ${code}\n`); } catch (error) { logVertical({ evento: 'ERRO', texto: "Erro ao solicitar código de pareamento" });} }, 3000);
}

sock.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update;

if (connection === 'close') {
const erroCode = (lastDisconnect.error instanceof Boom)?.output?.statusCode;
const deveReconectar = erroCode !== DisconnectReason.loggedOut;
            
logVertical({ evento: 'CONEXÃO', texto: `Fechada. Reconectando: ${deveReconectar}` });
            
if (deveReconectar) {
iniciarConexao(); }
} else if (connection === 'open') {
logVertical({ evento: 'SISTEMA', texto: 'BOT CONECTADO COM SUCESSO!' }); }});

sock.ev.on('creds.update', saveCreds);

return sock;
}

module.exports = iniciarConexao;

/* Este arquivo contém a lógica de conexão do bot nem precisa mexer algo si ainda não sabe o que está fazendo **** */