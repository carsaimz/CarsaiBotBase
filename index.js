const startConnection = require('./connection');
const { verticalLog, colors } = require('./lib/utils');
const { validateSession } = require('./lib/system');
const config = require('./configuration');
const fs = require('fs');
const path = require('path');

// Caminho para o banco de dados de grupos
const dbPath = path.join(__dirname, 'database', 'groups.json');

// Função para ler o banco de dados
function readDB() {
    try {
        if (!fs.existsSync(dbPath)) return {};
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (e) {
        return {};
    }
}

// Função para salvar no banco de dados
function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Carregar comandos
function loadCommands() {
    const commands = new Map();
    const commandsFolder = path.join(__dirname, 'commands/');
    
    try {
        if (!fs.existsSync(commandsFolder)) {
            fs.mkdirSync(commandsFolder, { recursive: true });
            console.log(colors.info('📁 Diretório de comandos criado'));
            return commands;
        }
        
        const commandFiles = fs.readdirSync(commandsFolder).filter(file => 
            file.endsWith('.js') && !file.startsWith('_')
        );
        
        console.log(colors.info(`📂 Encontrados ${commandFiles.length} arquivos de comando`));
        
        for (const file of commandFiles) {
            try {
                const fullPath = path.join(commandsFolder, file);
                delete require.cache[require.resolve(fullPath)];
                const command = require(fullPath);
                
                if (command.nome && command.executar) {
                    commands.set(command.nome.toLowerCase(), command);
                    
                    // Adicionar aliases
                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            commands.set(alias.toLowerCase(), command);
                        });
                    }
                    
                    console.log(colors.success(`  ✅ ${command.nome}`));
                } else {
                    console.log(colors.warning(`  ⚠️  ${file} - Estrutura inválida`));
                }
            } catch (loadError) {
                console.log(colors.error(`  ❌ ${file} - Erro: ${loadError.message}`));
            }
        }
    } catch (dirError) {
        console.log(colors.error(`Erro ao acessar diretório de comandos: ${dirError.message}`));
    }
    
    return commands;
}

async function main() {
    // Verificação de Chave
    if (!validateSession(config.activationKey)) {
        console.log(colors.error("\n[ERRO DE ATIVAÇÃO]"));
        console.log(colors.warning("Chave de ativação inválida ou ausente no arquivo configuration.js"));
        console.log(colors.info("Por favor, insira uma chave válida para iniciar o bot.\n"));
        process.exit(1);
    }

    const sock = await startConnection();
    let commands = loadCommands();
    
    console.log(colors.success(`\n🤖 ${config.botName} (cbot) iniciado com sucesso!`));
    console.log(colors.info(`🔧 Prefixo: ${config.prefix}`));
    console.log(colors.info(`📁 Comandos carregados: ${commands.size}\n`));

    // Eventos de Grupo (Bem-vindo/Adeus)
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            const from = anu.id;
            
            // Verificar se é um grupo
            if (!from.endsWith('@g.us')) return;
            
            const metadata = await sock.groupMetadata(from);
            const participants = anu.participants;

            for (let participant of participants) {
                // Tratamento de ID
                const id = typeof participant === 'string' ? participant : participant.id;
                const cleanNumber = id.split('@')[0];

                if (anu.action === 'add') {
                    const welcome = `🌟 *BEM-VINDO(A) AO GRUPO!* 🌟\n\n` +
                                  `👋 Olá @${cleanNumber}!\n` +
                                  `🏢 Grupo: *${metadata.subject}*\n\n` +
                                  `📌 *Descrição:* \n${metadata.desc || 'Sem descrição.'}\n\n` +
                                  `🤖 Eu sou o *${config.botName}* (cbot). Digite *${config.prefix}menu* para ver o que posso fazer!\n\n` +
                                  `Divirta-se e siga as regras! 🫡 - CarsaiBot`;
                    await sock.sendMessage(from, { text: welcome, mentions: [id] });
                } else if (anu.action === 'remove') {
                    const goodbye = `👋 *ATÉ LOGO!* 🫡\n\n` +
                                  `@${cleanNumber} saiu do grupo *${metadata.subject}*.\n` +
                                  `Esperamos que volte um dia! ✨ - CarsaiBot`;
                    await sock.sendMessage(from, { text: goodbye, mentions: [id] });
                }
            }
        } catch (err) {
            console.log(colors.error(`Erro no evento group-participants.update: ${err.message}`));
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            if (m.type !== 'notify') return;

            const msg = m.messages[0];
            if (!msg.message) return; // Removida validação msg.key.fromMe para permitir auto-resposta

            const from = msg.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = msg.key.participant || from;
            const userName = msg.pushName || "Usuário";
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            // Extração de texto
            let text = '';
            
            if (msg.message.conversation) {
                text = msg.message.conversation;
            } else if (msg.message.extendedTextMessage?.text) {
                text = msg.message.extendedTextMessage.text;
            } else if (msg.message.imageMessage?.caption) {
                text = msg.message.imageMessage.caption;
            } else if (msg.message.videoMessage?.caption) {
                text = msg.message.videoMessage.caption;
            } else if (msg.message.documentWithCaptionMessage?.message?.documentMessage?.caption) {
                text = msg.message.documentWithCaptionMessage.message.documentMessage.caption;
            }

            // Ignorar se não houver texto
            if (!text) return;

            // DEBUG: Log da mensagem recebida
            console.log(colors.info(`📥 Mensagem de ${userName}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`));

            // Lógica Antilink
            if (isGroup && text.includes('chat.whatsapp.com')) {
                const db = readDB();
                const antilinkActive = db[from]?.antilink || false;

                if (antilinkActive) {
                    const metadata = await sock.groupMetadata(from);
                    const participants = metadata.participants;
                    
                    // Identificar Admins
                    const admins = participants.filter(p => p.admin !== null).map(p => p.id);
                    const isAdmin = admins.includes(sender);
                    
                    if (!isAdmin) {
                        console.log(colors.warning(`ANTILINK: Link detectado de ${userName} no grupo ${metadata.subject}`));
                        await sock.sendMessage(from, { delete: msg.key });
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        return;
                    }
                }
            }

            // Verificar se é comando
            if (text.startsWith(config.prefix)) {
                const args = text.slice(config.prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();

                // Verificação de Admin em Grupos
                if (isGroup) {
                    const metadata = await sock.groupMetadata(from);
                    const participants = metadata.participants;
                    const botAdmin = participants.find(p => p.id === botNumber)?.admin !== null;
                    
                    if (!botAdmin) {
                        console.log(colors.warning(`⚠️ Ignorando comando ${commandName} no grupo ${metadata.subject} (Bot não é admin)`));
                        return;
                    }
                }

                console.log(colors.info(`🔧 Comando detectado: ${commandName} por ${userName}`));

                // Simular "Digitando..."
                await sock.sendPresenceUpdate('composing', from);

                const command = commands.get(commandName);
                
                if (command) {
                    try {
                        await command.executar(sock, msg, args, { readDB, saveDB });
                        console.log(colors.success(`✅ Comando ${commandName} executado com sucesso`));
                    } catch (error) {
                        console.log(colors.error(`❌ Erro ao executar ${commandName}: ${error.message}`));
                        console.log(error.stack);
                        
                        await sock.sendMessage(from, { 
                            text: "❌ Ocorreu um erro ao executar este comando.\n\n" +
                                  "💡 *Erro técnico:* " + error.message.substring(0, 100)
                        });
                    }
                } else {
                    console.log(colors.warning(`⚠️ Comando desconhecido: ${commandName}`));
                    
                    // Sugerir comando similar
                    const availableCommands = Array.from(commands.keys());
                    const similarCommand = availableCommands.find(cmd => 
                        cmd.includes(commandName) || commandName.includes(cmd)
                    );
                    
                    let response = `❌ Comando *${commandName}* não encontrado.`;
                    if (similarCommand) {
                        response += `\n💡 Você quis dizer *${config.prefix}${similarCommand}*?`;
                    }
                    response += `\n\n📝 Use *${config.prefix}menu* para ver todos os comandos disponíveis. - CarsaiBot`;
                    
                    await sock.sendMessage(from, { text: response });
                }
            } 
            // Lógica de Auto-Sticker
            else if (config.autoSticker && (msg.message.imageMessage || msg.message.videoMessage)) {
                const caption = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption;
                if (caption === 's' || caption === 'S' || caption === 'figurinha' || caption === 'sticker') {
                    
                    // Verificação de Admin para Auto-Sticker em Grupos
                    if (isGroup) {
                        const metadata = await sock.groupMetadata(from);
                        const participants = metadata.participants;
                        const botAdmin = participants.find(p => p.id === botNumber)?.admin !== null;
                        if (!botAdmin) return;
                    }

                    console.log(colors.info(`🎨 Auto-Sticker solicitado por ${userName}`));
                    
                    try {
                        const stickerCommand = commands.get('sticker') || commands.get('figurinha') || commands.get('s');
                        if (stickerCommand) {
                            await stickerCommand.executar(sock, msg, [], { readDB, saveDB });
                        } else {
                            await sock.sendMessage(from, { 
                                text: "⚠️ Comando de sticker não disponível. Use !figurinha"
                            });
                        }
                    } catch (stickerError) {
                        console.log(colors.error(`Erro ao criar sticker: ${stickerError.message}`));
                    }
                }
            }
        } catch (generalError) {
            console.log(colors.error(`❌ ERRO GERAL no processamento: ${generalError.message}`));
            console.log(generalError.stack);
        }
    });

    // Conexão WhatsApp
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log(colors.success('✅ Conexão WhatsApp estabelecida! - CarsaiBot (cbot)'));
        }
    });

    // Comando para recarregar comandos (apenas dono)
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        
        const msg = m.messages[0];
        if (!msg.message) return;
        
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        
        let text = '';
        if (msg.message.conversation) text = msg.message.conversation;
        else if (msg.message.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
        
        if (text === `${config.prefix}reload` && sender.includes(config.ownerNumber)) {
            commands = loadCommands();
            await sock.sendMessage(from, { 
                text: `✅ Comandos recarregados!\n📊 Total: ${commands.size} comandos disponíveis. - CarsaiBot`
            });
        }
    });
}

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.log(colors.error(`💥 ERRO NÃO CAPTURADO: ${err.message}`));
    console.log(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log(colors.error(`💥 PROMISE REJEITADA: ${reason}`));
});

main().catch(err => {
    console.log(colors.error(`💀 ERRO FATAL: ${err.message}`));
    console.log(err.stack);
    process.exit(1);
});
/* CarsaiBot - cbot - carsai */
