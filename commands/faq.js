const fs = require('fs');
const path = require('path');
const config = require('../configuration');

const caminhoFAQ = path.join(__dirname, '../storage/faq.json');

function carregarFAQs() {
    try {
        if (fs.existsSync(caminhoFAQ)) {
            const dados = fs.readFileSync(caminhoFAQ, 'utf8');
            return JSON.parse(dados);
        }
    } catch (error) {
        console.error('Erro ao carregar FAQs:', error);
    }
    return { faqs: [] };
}

function salvarFAQs(dados) {
    try {
        fs.writeFileSync(caminhoFAQ, JSON.stringify(dados, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar FAQs:', error);
        return false;
    }
}

function normalizarTexto(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();
}

module.exports = {
    nome: "faq",
    descricao: "Gerencia o sistema de FAQ (adicionar/editar/remover/listar)",
    categoria: "admin",
    exemplo: "adicionar pergunta response",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        if (!fromJid.endsWith('@g.us')) {
            return sock.sendMessage(fromJid, { text: "❌ Este comando só funciona em grupos." });
        }
        
        const groupMetadata = await sock.groupMetadata(fromJid);
        const participants = groupMetadata.participants;
        const sender = msg.key.participant || fromJid;
        
        const admins = participants.filter(p => p.admin !== null).map(p => p.id);
        const isAdmin = admins.includes(sender);
        const isOwner = sender.includes(config.ownerNumber);
        
        if (!isAdmin && !isOwner) {
            return sock.sendMessage(fromJid, { text: "❌ Apenas administradores podem gerenciar FAQs." });
        }
        
        if (commandArgs.length === 0) {
            return sock.sendMessage(fromJid, { 
                text: "📚 *Sistema de FAQ*\n\n" +
                      "📋 *Subcomandos disponíveis:*\n" +
                      "├ !faq adicionar [pergunta] [response]\n" +
                      "├ !faq editar [id] [nova pergunta] [nova response]\n" +
                      "├ !faq remover [id]\n" +
                      "├ !faq listar\n" +
                      "├ !faq buscar [termo]\n" +
                      "└ !faq ajuda [pergunta]\n\n" +
                      "💡 *Exemplo:*\n" +
                      "!faq adicionar \"Como usar o bot?\" \"Use !menu para ver todos os comandos.\""
            });
        }
        
        const subcomando = commandArgs[0].toLowerCase();
        const dadosFAQ = carregarFAQs();
        
        switch (subcomando) {
            case 'adicionar':
                if (commandArgs.length < 3) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ *Uso:* !faq adicionar \"pergunta\" \"response\"\n" +
                              "💡 Use aspas para perguntas/respostas com múltiplas palavras."
                    });
                }
                
                let textoRestante = commandArgs.slice(1).join(' ');
                const matches = textoRestante.match(/"(.*?)"/g);
                
                if (!matches || matches.length < 2) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ Formato inválido! Use:\n!faq adicionar \"sua pergunta\" \"sua response\""
                    });
                }
                
                const pergunta = matches[0].replace(/"/g, '');
                const response = matches[1].replace(/"/g, '');
                
                const novaFAQ = {
                    id: dadosFAQ.faqs.length + 1,
                    pergunta: pergunta,
                    response: response,
                    criador: sender.split('@')[0],
                    data: new Date().toISOString(),
                    usos: 0
                };
                
                dadosFAQ.faqs.push(novaFAQ);
                
                if (salvarFAQs(dadosFAQ)) {
                    await sock.sendMessage(fromJid, { 
                        text: `✅ *FAQ adicionada com sucesso!*\n\n` +
                              `🆔 *ID:* ${novaFAQ.id}\n` +
                              `❓ *Pergunta:* ${pergunta}\n` +
                              `💡 *Resposta:* ${response}\n` +
                              `👤 *Criador:* @${sender.split('@')[0]}\n` +
                              `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}`
                    }, { mentions: [sender] });
                } else {
                    await sock.sendMessage(fromJid, { text: "❌ Erro ao salvar FAQ." });
                }
                break;
                
            case 'editar':
                if (commandArgs.length < 4) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ *Uso:* !faq editar [id] \"nova pergunta\" \"nova response\""
                    });
                }
                
                const idEditar = parseInt(commandArgs[1]);
                const faqEditar = dadosFAQ.faqs.find(f => f.id === idEditar);
                
                if (!faqEditar) {
                    return sock.sendMessage(fromJid, { text: `❌ FAQ com ID ${idEditar} não encontrada.` });
                }
                
                textoRestante = commandArgs.slice(2).join(' ');
                const matchesEditar = textoRestante.match(/"(.*?)"/g);
                
                if (!matchesEditar || matchesEditar.length < 2) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ Formato inválido! Use:\n!faq editar [id] \"nova pergunta\" \"nova response\""
                    });
                }
                
                faqEditar.pergunta = matchesEditar[0].replace(/"/g, '');
                faqEditar.response = matchesEditar[1].replace(/"/g, '');
                faqEditar.editadoPor = sender.split('@')[0];
                faqEditar.dataEdicao = new Date().toISOString();
                
                if (salvarFAQs(dadosFAQ)) {
                    await sock.sendMessage(fromJid, { 
                        text: `✏️ *FAQ editada com sucesso!*\n\n` +
                              `🆔 *ID:* ${idEditar}\n` +
                              `❓ *Nova pergunta:* ${faqEditar.pergunta}\n` +
                              `💡 *Nova response:* ${faqEditar.response}\n` +
                              `👤 *Editado por:* @${sender.split('@')[0]}`
                    }, { mentions: [sender] });
                } else {
                    await sock.sendMessage(fromJid, { text: "❌ Erro ao salvar alterações." });
                }
                break;
                
            case 'remover':
                if (commandArgs.length < 2) {
                    return sock.sendMessage(fromJid, { text: "❌ *Uso:* !faq remover [id]" });
                }
                
                const idRemover = parseInt(commandArgs[1]);
                const indexRemover = dadosFAQ.faqs.findIndex(f => f.id === idRemover);
                
                if (indexRemover === -1) {
                    return sock.sendMessage(fromJid, { text: `❌ FAQ com ID ${idRemover} não encontrada.` });
                }
                
                const faqRemovida = dadosFAQ.faqs.splice(indexRemover, 1)[0];
                
                dadosFAQ.faqs.forEach((faq, index) => {
                    faq.id = index + 1;
                });
                
                if (salvarFAQs(dadosFAQ)) {
                    await sock.sendMessage(fromJid, { 
                        text: `🗑️ *FAQ removida com sucesso!*\n\n` +
                              `🆔 *ID removido:* ${idRemover}\n` +
                              `❓ *Pergunta:* ${faqRemovida.pergunta}\n` +
                              `👤 *Removido por:* @${sender.split('@')[0]}\n` +
                              `📊 *Total restante:* ${dadosFAQ.faqs.length} FAQs`
                    }, { mentions: [sender] });
                } else {
                    await sock.sendMessage(fromJid, { text: "❌ Erro ao remover FAQ." });
                }
                break;
                
            case 'listar':
                if (dadosFAQ.faqs.length === 0) {
                    return sock.sendMessage(fromJid, { text: "📭 Nenhuma FAQ cadastrada ainda." });
                }
                
                let listaTexto = `📚 *FAQs Cadastradas (${dadosFAQ.faqs.length})*\n\n`;
                
                dadosFAQ.faqs.forEach(faq => {
                    listaTexto += `🆔 *${faq.id}.* ${faq.pergunta}\n`;
                    listaTexto += `   💡 ${faq.response.substring(0, 50)}${faq.response.length > 50 ? '...' : ''}\n`;
                    listaTexto += `   👤 @${faq.criador} | 📊 Usos: ${faq.usos}\n\n`;
                });
                
                listaTexto += `💡 Use: !faq ajuda [termo] para buscar\n`;
                listaTexto += `🔍 Ou: !ajuda [pergunta] para uso automático`;
                
                await sock.sendMessage(fromJid, { text: listaTexto });
                break;
                
            case 'buscar':
                if (commandArgs.length < 2) {
                    return sock.sendMessage(fromJid, { text: "❌ *Uso:* !faq buscar [termo]" });
                }
                
                const termoBusca = normalizarTexto(commandArgs.slice(1).join(' '));
                const resultados = dadosFAQ.faqs.filter(faq => 
                    normalizarTexto(faq.pergunta).includes(termoBusca) ||
                    normalizarTexto(faq.response).includes(termoBusca)
                );
                
                if (resultados.length === 0) {
                    return sock.sendMessage(fromJid, { 
                        text: `🔍 Nenhum resultado para "${commandArgs.slice(1).join(' ')}"\n\n` +
                              `💡 Tente palavras-chave diferentes ou use !faq listar para ver todas.`
                    });
                }
                
                let buscaTexto = `🔍 *Resultados da busca:* "${commandArgs.slice(1).join(' ')}"\n`;
                buscaTexto += `📊 *Encontrados:* ${resultados.length} FAQ(s)\n\n`;
                
                resultados.forEach(faq => {
                    buscaTexto += `🆔 *${faq.id}.* ${faq.pergunta}\n`;
                    buscaTexto += `   💡 ${faq.response}\n\n`;
                });
                
                await sock.sendMessage(fromJid, { text: buscaTexto });
                break;
                
            case 'ajuda':
                if (commandArgs.length < 2) {
                    return sock.sendMessage(fromJid, { 
                        text: "❌ *Uso:* !faq ajuda [pergunta]\n" +
                              "💡 *Exemplo:* !faq ajuda Como usar o bot?"
                    });
                }
                
                const perguntaUsuario = commandArgs.slice(1).join(' ');
                const perguntaNormalizada = normalizarTexto(perguntaUsuario);
                
                const faqsRelevantes = dadosFAQ.faqs.map(faq => {
                    const perguntaFAQ = normalizarTexto(faq.pergunta);
                    const palavrasFAQ = perguntaFAQ.split(' ');
                    const palavrasUsuario = perguntaNormalizada.split(' ');
                    
                    let correspondencias = 0;
                    palavrasUsuario.forEach(palavra => {
                        if (palavrasFAQ.includes(palavra)) {
                            correspondencias++;
                        }
                    });
                    
                    const similaridade = (correspondencias / Math.max(palavrasFAQ.length, palavrasUsuario.length)) * 100;
                    
                    return {
                        faq: faq,
                        similaridade: similaridade,
                        palavrasCorrespondentes: correspondencias
                    };
                });
                
                faqsRelevantes.sort((a, b) => b.similaridade - a.similaridade);
                
                if (faqsRelevantes.length === 0 || faqsRelevantes[0].similaridade < 30) {
                    const faqMaisUsada = [...dadosFAQ.faqs].sort((a, b) => b.usos - a.usos)[0];
                    
                    if (faqMaisUsada) {
                        faqMaisUsada.usos++;
                        salvarFAQs(dadosFAQ);
                        
                        await sock.sendMessage(fromJid, { 
                            text: `🤔 *Não encontrei exatamente o que procura, mas talvez isso ajude:*\n\n` +
                                  `❓ *Pergunta:* ${faqMaisUsada.pergunta}\n` +
                                  `💡 *Resposta:* ${faqMaisUsada.response}\n\n` +
                                  `📊 *Esta FAQ já ajudou ${faqMaisUsada.usos} pessoa(s)*\n` +
                                  `💡 Use !faq listar para ver todas as FAQs disponíveis.`
                        });
                    } else {
                        await sock.sendMessage(fromJid, { 
                            text: `❓ *Pergunta:* ${perguntaUsuario}\n\n` +
                                  `🤖 Nenhuma FAQ cadastrada ainda para esta pergunta.\n` +
                                  `💡 Administradores podem adicionar FAQs usando:\n` +
                                  `!faq adicionar "sua pergunta" "sua response"`
                        });
                    }
                } else {
                    const melhorResultado = faqsRelevantes[0].faq;
                    
                    melhorResultado.usos++;
                    salvarFAQs(dadosFAQ);
                    
                    await sock.sendMessage(fromJid, { 
                        text: `💡 *Encontrei uma FAQ que pode ajudar:*\n\n` +
                              `❓ *Pergunta:* ${melhorResultado.pergunta}\n` +
                              `💡 *Resposta:* ${melhorResultado.response}\n\n` +
                              `📊 *Esta FAQ já ajudou ${melhorResultado.usos} pessoa(s)*\n` +
                              `👤 *Criada por:* @${melhorResultado.criador}\n` +
                              `💎 *Relevância:* ${Math.round(faqsRelevantes[0].similaridade)}%`
                    });
                }
                break;
                
            default:
                await sock.sendMessage(fromJid, { 
                    text: "❌ Subcomando inválido!\nUse: !faq para ver opções disponíveis."
                });
        }
    }
};
/* CarsaiBot - cbot - carsai */
