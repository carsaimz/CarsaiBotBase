// comandos/ajuda.js
const fs = require('fs');
const path = require('path');
const config = require('../configuration');

// Load FAQs
const faqPath = path.join(__dirname, '../storage/faq.json');

function loadFAQs() {
    try {
        if (fs.existsSync(faqPath)) {
            const data = fs.readFileSync(faqPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
    return { faqs: [] };
}

function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();
}

module.exports = {
    nome: "ajuda",
    descricao: "Sistema automático de ajuda usando FAQ - CarsaiBot",
    categoria: "informacao",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        // If no arguments, show general help
        if (commandArgs.length === 0) {
            return sock.sendMessage(fromJid, { 
                text: `🤖 *Sistema de Ajuda Automática (cbot)*\n\n` +
                      `💡 *Como usar:* Digite sua pergunta após o comando\n` +
                      `📝 *Exemplos:*\n` +
                      `• !ajuda como usar o bot\n` +
                      `• !ajuda comandos disponíveis\n` +
                      `• !ajuda configurar\n\n` +
                      `📚 *FAQs disponíveis:* ${loadFAQs().faqs.length} perguntas cadastradas\n` +
                      `🔍 *Busca inteligente:* Encontra a response mais relevante - CarsaiBot`
            }, { quoted: msg });
        }
        
        const userQuestion = commandArgs.join(' ');
        const faqData = loadFAQs();
        
        if (faqData.faqs.length === 0) {
            return sock.sendMessage(fromJid, { 
                text: `❓ *Pergunta:* ${userQuestion}\n\n` +
                      `📭 *Nenhuma FAQ cadastrada ainda.*\n` +
                      `💡 Administradores podem configurar o sistema de FAQ usando:\n` +
                      `!faq adicionar "pergunta" "response"`
            }, { quoted: msg });
        }
        
        // Search for most relevant FAQ
        const normalizedQuestion = normalizeText(userQuestion);
        
        // First, check for exact match
        let exactFaq = null;
        for (const faq of faqData.faqs) {
            if (normalizeText(faq.pergunta) === normalizedQuestion) {
                exactFaq = faq;
                break;
            }
        }
        
        if (exactFaq) {
            // Increment uses
            exactFaq.usos++;
            fs.writeFileSync(faqPath, JSON.stringify(faqData, null, 2), 'utf8');
            
            return sock.sendMessage(fromJid, { 
                text: `✅ *Resposta encontrada!*\n\n` +
                      `❓ *Pergunta:* ${exactFaq.pergunta}\n` +
                      `💡 *Resposta:* ${exactFaq.response}\n\n` +
                      `📊 *Esta FAQ já ajudou ${exactFaq.usos} pessoa(s)*\n` +
                      `👤 *Criada por:* @${exactFaq.criador}\n` +
                      `💎 *Confiança:* 100% - CarsaiBot`
            }, { quoted: msg });
        }
        
        // If no exact match, search by similarity
        const userWords = normalizedQuestion.split(' ');
        const relevantFaqs = [];
        
        for (const faq of faqData.faqs) {
            const faqQuestion = normalizeText(faq.pergunta);
            const faqWords = faqQuestion.split(' ');
            
            // Calculate similarity
            let matches = 0;
            for (const word of userWords) {
                if (faqWords.includes(word)) {
                    matches++;
                }
            }
            
            const similarity = (matches / Math.max(faqWords.length, userWords.length)) * 100;
            
            if (similarity > 30) { // 30% similarity threshold
                relevantFaqs.push({
                    faq: faq,
                    similarity: similarity,
                    matchingWords: matches
                });
            }
        }
        
        // Sort by similarity
        relevantFaqs.sort((a, b) => b.similarity - a.similarity);
        
        if (relevantFaqs.length === 0) {
            // Show most used FAQ
            const mostUsedFaq = [...faqData.faqs].sort((a, b) => b.usos - a.usos)[0];
            
            // Increment uses
            mostUsedFaq.usos++;
            fs.writeFileSync(faqPath, JSON.stringify(faqData, null, 2), 'utf8');
            
            return sock.sendMessage(fromJid, { 
                text: `🤔 *Não encontrei uma response exata para sua pergunta*\n\n` +
                      `❓ *Você perguntou:* ${userQuestion}\n\n` +
                      `💡 *Talvez esta FAQ possa ajudar:*\n` +
                      `❓ *Pergunta:* ${mostUsedFaq.pergunta}\n` +
                      `💡 *Resposta:* ${mostUsedFaq.response}\n\n` +
                      `📊 *Esta FAQ já ajudou ${mostUsedFaq.usos} pessoa(s)*\n` +
                      `🔍 *Dica:* Tente reformular sua pergunta ou use:\n` +
                      `!faq buscar "${userWords[0]}" para mais resultados - CarsaiBot`
            }, { quoted: msg });
        }
        
        // Show top 3 results
        const topResults = relevantFaqs.slice(0, 3);
        
        // Increment uses of the best result
        topResults[0].faq.usos++;
        fs.writeFileSync(faqPath, JSON.stringify(faqData, null, 2), 'utf8');
        
        let responseText = `🔍 *Encontrei ${relevantFaqs.length} FAQ(s) relacionada(s):*\n\n`;
        responseText += `❓ *Sua pergunta:* ${userQuestion}\n\n`;
        
        // Melhor resultado
        responseText += `🥇 *Melhor resultado (${Math.round(topResults[0].similarity)}%):*\n`;
        responseText += `❓ ${topResults[0].faq.pergunta}\n`;
        responseText += `💡 ${topResults[0].faq.response}\n\n`;
        
        // Outros resultados relevantes
        if (topResults.length > 1) {
            responseText += `📋 *Outras FAQs que podem ajudar:*\n`;
            for (let i = 1; i < topResults.length; i++) {
                responseText += `${i === 1 ? '🥈' : '🥉'} *${Math.round(topResults[i].similarity)}%:* ${topResults[i].faq.pergunta}\n`;
            }
        }
        
        responseText += `\n💡 *Dica:* Use !faq ajuda "[pergunta completa]" para busca mais precisa - CarsaiBot`;
        
        await sock.sendMessage(fromJid, { text: responseText }, { quoted: msg });
    }
};
/* CarsaiBot - cbot - carsai */
