# 🚀 CarsaiBot - WhatsApp Bot Profissional & Modular

**🔗 Base de Código Original:** Esta implementação é 100% de autoria de CarsaiDev. Ao utilizá-la ou derivá-la, é fundamental manter os créditos ao autor original. O compartilhamento de conhecimento fortalece a comunidade de desenvolvimento.

Um bot para WhatsApp robusto, construído com foco em performance, facilidade de manutenção e escalabilidade. Agora com **100+ comandos** organizados em 8 categorias, sistema de economia, downloads avançados e muito mais. Desenvolvido seguindo as melhores práticas para 2026, é a solução ideal para quem precisa de um sistema automatizado poderoso e estruturado.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Commands](https://img.shields.io/badge/comandos-100+-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-ISC-orange)
![Moçambique](https://img.shields.io/badge/Made%20in-Moçambique-red)

## ✨ Novidades da Versão 2.0

- ✅ **100+ comandos** organizados em 8 categorias
- ✅ **Sistema de economia** com saldo e recompensas diárias
- ✅ **Download avançado** de mídia (YouTube, áudio, vídeo)
- ✅ **Tradução automática** entre 100+ idiomas
- ✅ **Pesquisas online** (Wikipedia, Google, notícias em tempo real)
- ✅ **API Keys configuráveis** para funcionalidades premium
- ✅ **Sistema anti-link** inteligente com detecção automática
- ✅ **QR Code generator** integrado
- ✅ **Figurinhas personalizadas** com watermark
- ✅ **Sistema de categorias** automático no menu

## 🚀 Começando Rápido

Siga estes passos para colocar o bot em funcionamento:

1.  **Clone e Instale:**
    ```bash
    git clone https://github.com/carsaimz/CarsaiBotBase.git
    cd CarsaiBotBase
    npm install
    ```

2.  **Crie os Comandos (se necessário):**
    ```bash
    bash criar_comandos.sh
    ```

3.  **Configure as APIs (opcional mas recomendado):**
    Edite `configuracao.js` e adicione suas chaves gratuitas:
    - OpenWeatherMap (para `!clima`)
    - NewsAPI (para `!noticias`)
    - OMDB API (para `!filme`)

4.  **Inicie o Sistema:**
    ```bash
    npm start
    ```

5.  **Realize o Pareamento:** No primeiro acesso, o bot solicitará o número do WhatsApp. Um código de pareamento será exibido no terminal. Basta inseri-lo no seu aplicativo WhatsApp em **Aparelhos Conectados > Conectar com número**.

## 📊 Categorias de Comandos (100+)

### 👥 **Administração** (15 comandos)
Gestão completa de grupos: `!ban`, `!promover`, `!rebaixar`, `!adicionar`, `!marcartodos`, `!antilink`, `!descricao`, `!foto`, `!listaradmins`, `!abrir`, `!fechar`, `!linkgrupo`, `!config`, `!mudarnome`, `!sair`

### 🛠️ **Utilidades** (15 comandos)
Ferramentas do dia a dia: `!ping`, `!info`, `!horario`, `!calc`, `!cep`, `!moedas`, `!clima`, `!traducao`, `!qrcode`, `!peso`, `!medidas`, `!calendario`, `!lembrete`, `!contador`, `!geradorsenha`

### 📸 **Mídia** (15 comandos)
Processamento de conteúdo: `!figurinha`, `!toimg`, `!audio`, `!tts`, `!youtube`, `!video`, `!musica`, `!baixarvideo`, `!baixaraudio`, `!comprimir`, `!converter`, `!cortar`, `!juntar`, `!efeitos`, `!watermark`

### 🎮 **Diversão** (15 comandos)
Entretenimento e jogos: `!jogodavelha`, `!dado`, `!caraoucoroa`, `!pergunta`, `!piada`, `!cpf`, `!cnpj`, `!quiz`, `!adivinhacao`, `!memes`, `!frases`, `!curiosidades`, `!horoscopo`, `!simsimi`, `!roletarussa`

### 🔍 **Pesquisa** (15 comandos)
Busca de informações: `!wikipedia`, `!google`, `!noticias`, `!filme`, `!series`, `!dicionario`, `!sinonimos`, `!receitas`, `!covid`, `!futebol`, `!cotações`, `!vagas`, `!tutorial`, `!mapa`, `!endereco`

### 👑 **Dono** (15 comandos)
Comandos exclusivos: `!eval`, `!exec`, `!broadcast`, `!sairgrupo`, `!bloquear`, `!desbloquear`, `!reload`, `!backup`, `!restart`, `!logs`, `!usuarios`, `!estatisticas`, `!manutencao`, `!limpar`, `!debug`

### ℹ️ **Informação** (5 comandos)
Status e ajuda: `!status`, `!ajuda`, `!menu`, `!sobre`, `!changelog`

### 💰 **Economia** (5 comandos)
Sistema de pontos: `!saldo`, `!diario`, `!apostar`, `!transferir`, `!top`

## 🏗️ Arquitetura do Projeto

A estrutura modular facilita a expansão e organização do código.

*   `index.js`: O cérebro do bot. Gerencia o fluxo de mensagens e o sistema de comandos.
*   `conexao.js`: Cuida de toda a comunicação com a biblioteca Baileys e do processo de Pairing Code.
*   `configuracao.js`: Central de configurações (Nome do Bot, Prefixo, Números de Admin, Chave de Licença, API Keys).
*   `/comandos`: Pasta modular com **100+ comandos** organizados automaticamente. Cada novo arquivo `.js` aqui é automaticamente reconhecido como um comando.
*   `/lib`: Bibliotecas internas com funções utilitárias e um sistema avançado de logs coloridos.
*   `/database`: Armazenamento local para persistência de dados.

## ✨ Funcionalidades Principais

### 🎯 **Núcleo Avançado**
*   **Sistema de Licenciamento:** Ativação segura via chave, configurável em `configuracao.js`.
*   **Arquitetura Modular:** Adicione ou remova funcionalidades criando arquivos na pasta `/comandos` sem tocar no núcleo.
*   **Logs Inteligentes:** Saída no console organizada de forma vertical e colorida para melhor depuração e monitoramento.
*   **Conexão via Pairing Code:** Conecte-se usando apenas o número de telefone, sem a necessidade de escanear QR Codes.

### 🎨 **Processamento de Mídia**
*   **Auto-Sticker:** Converta qualquer imagem em figurinha automaticamente ao enviá-la com a legenda **"s"**.
*   **Conversor de Mídia:** Converta entre formatos de áudio, vídeo e imagem.
*   **Download do YouTube:** Baixe vídeos e áudio do YouTube com qualidade configurável.
*   **Text-to-Speech:** Converta texto em áudio em múltiplos idiomas.

### 👥 **Gestão Inteligente**
*   **Gestão Completa de Grupos:** Comandos integrados para administração (banir, adicionar, promover, marcar todos).
*   **Sistema Anti-Link:** Detecta e remove automaticamente links não autorizados em grupos.
*   **Simulação de Presença:** O bot simula o status "digitando..." durante o processamento, proporcionando uma interação mais natural.

### 🌐 **Integrações Online**
*   **Tradução em Tempo Real:** Traduza entre 100+ idiomas usando Google Translate.
*   **Consultas Online:** Busque informações em Wikipedia, notícias, cotações, clima, filmes e séries.
*   **Geração de QR Codes:** Crie QR Codes personalizados para qualquer texto ou URL.

## 📜 Sistema de Comandos Modular

A pasta `/comandos` é o coração da expansibilidade do bot. Para criar um novo comando:

1.  Crie um novo arquivo `.js` dentro da pasta `/comandos`.
2.  Exporte um objeto seguindo este modelo:

```javascript
const config = require('../configuracao');

module.exports = {
    nome: "nomecomando", // Nome do comando (sem prefixo)
    descricao: "Descrição clara do que o comando faz.",
    categoria: "categoria", // Categoria para organização automática
    exemplo: "exemplo de uso", // Opcional: exemplo de uso
    executar: async (sock, msg, args) => {
        // Sua lógica aqui
        const from = msg.key.remoteJid;
        await sock.sendMessage(from, { text: "Resposta do comando!" });
    }
};
```

O sistema automaticamente:

- Registra o comando para ser acionado com ${config.prefixo}nomecomando.
- Organiza por categoria na listagem gerada pelo ${config.prefixo}menu.
- Inclui exemplo de uso no comando ${config.prefixo}ajuda.

### 📋 Exemplos de Uso

**Comandos Básicos**

```bash
!menu                    # Mostra todos os comandos organizados
!ajuda ping              # Ajuda específica sobre um comando
!ping                    # Testa a latência do bot
!status                  # Status completo do sistema
```

**Utilitários Práticos**

```bash
!clima Maputo            # Previsão do tempo atual
!calc 15 * 3             # Calculadora científica
!cep 01001000            # Consulta informações de CEP
!traducao pt en Olá      # Traduz "Olá" de português para inglês
!qrcode https://google.com # Gera QR Code para o Google
```

**Administração de Grupos**

```bash
!ban @usuário            # Remove um membro do grupo
!promover @usuário       # Torna um membro administrador
!marcartodos Atenção!    # Menciona todos os membros
!antilink                # Ativa/desativa sistema anti-link
!listaradmins            # Lista todos os administradores
```

**Entretenimento**

```bash
!dado 20                 # Rola um dado de 20 lados
!caraoucoroa             # Joga cara ou coroa
!piada                   # Conta uma piada aleatória
!quiz                    # Inicia um quiz interativo
!filme Titanic           # Informações sobre o filme
```

## 🔧 Configuração Avançada

### API Keys Gratuitas

Para funcionalidades completas, obtenha estas APIs gratuitas:

1. OpenWeatherMap (clima): https://openweathermap.org/api
2. NewsAPI (notícias): https://newsapi.org
3. OMDB API (filmes): http://www.omdbapi.com/apikey.aspx

**Adicione as chaves em configuracao.js:**

```javascript
module.exports = {
    // ... outras configurações
    openWeatherKey: "SUA_CHAVE_AQUI",
    newsApiKey: "SUA_CHAVE_AQUI",
    omdbApiKey: "SUA_CHAVE_AQUI",
    // ...
};
```

**Instalação do FFmpeg (Requerido para mídia)**

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg -y

# macOS
brew install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg
```


**Modo Debug**

```bash
npm run dev  # Modo desenvolvimento com recarga automática
```

### 👨‍💻 Sobre o Desenvolvedor & a Organização

O CarsaiBotBase 2.0 é um projeto desenvolvido pela CarsaiDev, parte do ecossistema digital CarsaiMz (ou Carsai Mozambique). A organização está sediada em Moçambique e tem como foco fornecer soluções acessíveis em desenvolvimento web, hospedagem e educação digital.

- Dono do Projeto: CarsaiDev
- Nome do Bot: CarsaiBot 2.0
- Versão: 2.0.0 (100+ Comandos)
- WhatsApp para Contato: +258 86 241 4345
- Email: suporte.carsaimz@gmail.com

### 🌐 Portfólio de Plataformas Carsai

A organização mantém um conjunto de plataformas que complementam sua missão de democratizar o acesso à tecnologia:

*   **[CarsaiDev](https://carsaidev.linkpc.net/):** Hub principal para desenvolvimento web sob encomenda e soluções personalizadas.
*   **[CarsaiMZ](https://carsaimz.site):** Site oficial da organização em Moçambique.
*   **[Carsai LMS](https://carsailms.linkpc.net):** Sistema de Gestão de Aprendizagem (LMS) para oferta de cursos online gratuitos e pagos. Segue a filosofia de sistemas abertos e focados na experiência educacional, similar a projetos de código aberto como o Sakai LMS.
*   **[Carsai Host](https://carsaihost.linkpc.net):** Serviço de hospedagem web acessível.
*   **[Carsai BMS](https://carsaibms.linkpc.net):** Sistema de Gestão de Negócios para empreendedores.

### 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (git checkout -b feature/AmazingFeature)
3. Commit suas mudanças (git commit -m 'Add: AmazingFeature')
4. Push para a Branch (git push origin feature/AmazingFeature)
5. Abra um Pull Request

### 📄 Licença

Distribuído sob licença ISC. Veja [LICENSE](LICENSE) para mais informações.

---

🇲🇿 Desenvolvido com ❤️ em Moçambique pela CarsaiMz
"Democratizando o acesso à tecnologia em Moçambique e além"

---

Nota: Este bot é fornecido como uma ferramenta para desenvolvimento e aprendizado. Utilize-o com responsabilidade e em conformidade com os Termos de Serviço do WhatsApp.

