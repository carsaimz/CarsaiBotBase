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
const { verticalLog } = require('./lib/utils');
const config = require('./configuration');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startConnection() {
    const { state, saveCreds } = await useMultiFileAuthState('./lib/session_data');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    verticalLog({ event: 'SISTEMA', text: `Iniciando ${config.botName} v${version.join('.')}` });

    const sock = makeWASocket({
        version, 
        logger: pino({ level: 'silent' }), 
        printQRInTerminal: false, 
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        }, 
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        markOnlineOnConnect: true,
    });

    if (!sock.authState.creds.registered) {
        console.log("\n--- CONFIGURAÇÃO DE NÚMERO ---");
        let phoneNumber = config.botNumber;
        if (!phoneNumber) {
            phoneNumber = await question('Digite o número do WhatsApp (ex: 258834888228):\n> ');
        }
        const cleanNum = phoneNumber.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(cleanNum);
                console.log(`\n✅ SEU CÓDIGO DE PAREAMENTO: ${code}\n`); 
            } catch (error) { 
                verticalLog({ event: 'ERRO', text: "Erro ao solicitar código de pareamento" });
            } 
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const errorCode = (lastDisconnect.error instanceof Boom)?.output?.statusCode;
            const shouldReconnect = errorCode !== DisconnectReason.loggedOut;
            
            verticalLog({ event: 'CONEXÃO', text: `Fechada. Reconectando: ${shouldReconnect}` });
            
            if (shouldReconnect) {
                startConnection(); 
            }
        } else if (connection === 'open') {
            verticalLog({ event: 'SISTEMA', text: 'BOT CONECTADO COM SUCESSO! - CarsaiBot' }); 
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

module.exports = startConnection;

/* Este arquivo contém a lógica de conexão do bot. CarsaiBot / cbot */
