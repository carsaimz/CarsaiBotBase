# WXT-BOT - Profissional & Modular

** ESTA BASE É 100% DA MINHA AUTORIA POR FAVOR DEIXD OS DEVIDOS CRÉDITOS PORQUE ESTAMO TODOS SI AJUDANDO** 

Este bot foi desenvolvido seguindo as especificações de 2026 para ser escalável, rápido e fácil de manter.

## 🚀 Como Iniciar

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Inicie o bot:
   ```bash
   npm start
   ```

3. No primeiro acesso, o bot solicitará o número para pareamento. O código aparecerá no terminal para ser inserido no WhatsApp (Aparelhos Conectados > Conectar com número).

## 📁 Estrutura do Projeto

- `index.js`: Ponto de entrada, gerencia o recebimento de mensagens e o Command Handler.
- `conexao.js`: Gerencia a conexão com o Baileys e o sistema de Pairing Code.
- `configuracao.js`: Configurações globais (Nome, Prefixo, Números).
- `/comandos`: Adicione novos arquivos `.js` aqui para criar novos comandos automaticamente.
- `/lib`: Funções utilitárias e sistema de logs coloridos.
- `/database`: Armazenamento de dados persistentes.

## 🛠️ Funcionalidades Implementadas

- **Sistema de Licenciamento**: O bot requer uma chave de ativação válida no `configuracao.js`.
- **Modularidade**: Comandos separados por arquivos.
- **Logs Verticais**: Console organizado verticalmente para melhor leitura.
- **Pairing Code**: Conexão sem necessidade de QR Code.
- **Auto-Sticker**: Envie imagem com legenda 's'.
- **Gestão de Grupos**: Comandos de banir e marcar todos.
- **Presença Realista**: Simula "digitando" ao processar comandos.

## 👤 Desenvolvedor
- **Dono**: wilmo chang
- **Bot**: wxt-produtos
- **WhatsApp**: 258857270435

## Produtos disponíveis da organização 
- **SITE1**: https://wxt-isps.vercel.app/
- **SITES2**: https://produtov5.onrender.com