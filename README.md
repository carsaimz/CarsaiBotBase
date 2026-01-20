# 🚀 CarsaiBot - WhatsApp Bot Profissional & Modular

**🔗 Base de Código Original:** Esta implementação é 100% de autoria de CarsaiDev. Ao utilizá-la ou derivá-la, é fundamental manter os créditos ao autor original. O compartilhamento de conhecimento fortalece a comunidade de desenvolvimento.

Um bot para WhatsApp robusto, construído com foco em performance, facilidade de manutenção e escalabilidade. Agora com **100+ comandos** organizados em 8 categorias, sistema de economia, downloads avançados e muito mais. Desenvolvido seguindo as melhores práticas para 2026, é a solução ideal para quem precisa de um sistema automatizado poderoso e estruturado.

![Version](https://img.shields.io/badge/version-2.0.1-blue)
![Commands](https://img.shields.io/badge/comandos-100+-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-ISC-orange)
![CarsaiDev](https://img.shields.io/badge/Made%20by-CarsaiDev-red)

## ✨ Novidades da Versão 2.0.1

### 📥 **SISTEMA DE DOWNLOAD COMPLETO**
- ✅ **YouTube Downloader** - Vídeos e músicas com qualidade HD
- ✅ **TikTok Downloader** - Vídeos com informações completas
- ✅ **Instagram Downloader** - Fotos, vídeos e reels
- ✅ **Facebook Downloader** - Vídeos públicos automaticamente
- ✅ **Google Drive Downloader** - Arquivos públicos até 100MB
- ✅ **MediaFire Downloader** - Links diretos com extração automática
- ✅ **MEGA Downloader** - Suporte a links .nz públicos
- ✅ **Download Universal** - Detecta plataforma automaticamente

### 🎬 **SISTEMA DE PESQUISA DE MÍDIA**
- ✅ **Filmes** - Informações completas com TMDB
- ✅ **Séries** - Temporadas, episódios e status
- ✅ **Animes** - Detecta automaticamente tipo e gênero
- ✅ **Atores** - Perfil completo e filmografia

### 🔧 **MELHORIAS TÉCNICAS**
- ✅ **Arquitetura modular** - Cada comando em arquivo separado
- ✅ **Sistema de fallback** - Múltiplos métodos quando APIs falham
- ✅ **Limites inteligentes** - Verificação de tamanho antes do download
- ✅ **Progresso de download** - Feedback em tempo real
- ✅ **Erros descritivos** - Dicas de solução para problemas comuns

### 📊 **ESTATÍSTICAS**
- ✅ **12 comandos novos** de mídia e download
- ✅ **7 plataformas** suportadas para download
- ✅ **4 fontes** de pesquisa de mídia
- ✅ **100% compatível** com limites do WhatsApp
- ✅ **Sistema automático** de detecção de plataforma

### 🔄 **MUDANÇAS DA VERSÃO 2.0**
- ✅ **Comandos mais específicos** (ex: !yt, !tiktok)
- ✅ **Estrutura de arquivos reorganizada**
- ✅ **Código otimizado** para performance
- ✅ **Melhor documentação** e mensagens de ajuda
- ✅ **Sistema de tradução** em comandos de mídia

### ⚠️ **REQUISITOS**
- Node.js 16+
- API Key TMDB (gratuita)
- Dependências atualizadas (ver package.json)
- Conexão estável com internet

📖 **Ver todas as mudanças no [CHANGELOG.md](CHANGELOG.md)**

## 🚀 Começando Rápido

Siga estes passos para colocar o bot em funcionamento:

1.  **Clone e Instale:**
    ```bash
    git clone https://github.com/carsaimz/carsaibot.git
    cd carsaibot
    npm install
    ```

2.  **Gere a Chave de Ativação de Bot (se necessário, caso seja novo):**
- Entra no site do bot [carsaibot.linkpc.net](https://carsaibot.linkpc.net)
- Clique em "Chaves" ou "Começar Agora" (ou procure documentação)
- Na página de geração de chaves, clique em "Gerar Chave"
- Copie a chave e coloque no arquivo *configuration.js* no campo *activationKey = "chave"* (substituir palavra *chave* pela chave copiada)

3.  **Configure as APIs (opcional mas recomendado):**
    Edite `configuration.js` e adicione suas chaves gratuitas:
    - OpenWeatherMap (para `!clima`)
    - NewsAPI (para `!noticias`)
    - TMDB API (para `!filme`, `!serie`, `!anime` e `!ator`)

4.  **Inicie o Sistema:**
    ```bash
    npm start
    ```
ou
    ```bash
    sh start.sh
    ```

5.  **Realize o Pareamento:** No primeiro acesso, o bot solicitará o número do WhatsApp. Um código de pareamento será exibido no terminal. Basta inseri-lo no seu aplicativo WhatsApp em **Aparelhos Conectados > Conectar com número**.

## 🏗️ Arquitetura do Projeto

A estrutura modular facilita a expansão e organização do código.

*   `index.js`: O cérebro do bot. Gerencia o fluxo de mensagens e o sistema de comandos.
*   `connection.js`: Cuida de toda a comunicação com a biblioteca Baileys e do processo de Pairing Code.
*   `configuration.js`: Central de configurações (Nome do Bot, Prefixo, Números de Admin, Chave de Licença, API Keys).
*   `/commands`: Pasta modular com **100+ comandos** organizados automaticamente. Cada novo arquivo `.js` aqui é automaticamente reconhecido como um comando.
*   `/lib`: Bibliotecas internas com funções utilitárias e um sistema avançado de logs coloridos.
*   `/database`: Armazenamento local para persistência de dados.

## ✨ Funcionalidades Principais

### 🎯 **Núcleo Avançado**
*   **Sistema de Licenciamento:** Ativação segura via chave, configurável em `configuration.js`.
*   **Arquitetura Modular:** Adicione ou remova funcionalidades criando arquivos na pasta `/commands` sem tocar no núcleo.
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

A pasta `/commands` é o coração da expansibilidade do bot. Para criar um novo comando:

1.  Crie um novo arquivo `.js` dentro da pasta `/commands`.
2.  Exporte um objeto seguindo este modelo:

```javascript
const config = require('../configuration');

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

**Adicione as chaves em configuration.js:**

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

O CarsaiBot é um projeto desenvolvido pela CarsaiDev, parte do ecossistema digital CarsaiMz (ou Carsai Mozambique). A organização está sediada em Moçambique e tem como foco fornecer soluções acessíveis em desenvolvimento web, hospedagem e educação digital.

- Dono do Projeto: CarsaiDev
- Nome do Bot: CarsaiBot
- Versão: 2.0.1 
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

