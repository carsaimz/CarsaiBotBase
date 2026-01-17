# CarsaiBot - WhatsApp Bot Profissional & Modular

**🔗 Base de Código Original:** Esta implementação é 100% de autoria de CarsaiDev. Ao utilizá-la ou derivá-la, é fundamental manter os créditos ao autor original. O compartilhamento de conhecimento fortalece a comunidade de desenvolvimento.

Um bot para WhatsApp robusto, construído com foco em performance, facilidade de manutenção e escalabilidade. Desenvolvido seguindo as melhores práticas para 2026, é a solução ideal para quem precisa de um sistema automatizado poderoso e estruturado.

## 🚀 Começando Rápido

Siga estes passos para colocar o bot em funcionamento:

1.  **Instale as Dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o Sistema:**
    ```bash
    npm start
    ```

3.  **Realize o Pareamento:** No primeiro acesso, o bot solicitará o número do WhatsApp. Um código de pareamento será exibido no terminal. Basta inseri-lo no seu aplicativo WhatsApp em **Aparelhos Conectados > Conectar com número**.

## 🏗️ Arquitetura do Projeto

A estrutura modular facilita a expansão e organização do código.

*   `index.js`: O cérebro do bot. Gerencia o fluxo de mensagens e o sistema de comandos.
*   `conexao.js`: Cuida de toda a comunicação com a biblioteca Baileys e do processo de Pairing Code.
*   `configuracao.js`: Central de configurações (Nome do Bot, Prefixo, Números de Admin, Chave de Licença).
*   `/comandos`: Pasta modular. Cada novo arquivo `.js` aqui é automaticamente reconhecido como um comando.
*   `/lib`: Bibliotecas internas com funções utilitárias e um sistema avançado de logs coloridos.
*   `/database`: Armazenamento local para persistência de dados.

## ✨ Funcionalidades Principais

*   **Sistema de Licenciamento:** Ativação segura via chave, configurável em `configuracao.js`.
*   **Arquitetura Modular:** Adicione ou remova funcionalidades criando arquivos na pasta `/comandos` sem tocar no núcleo.
*   **Logs Inteligentes:** Saída no console organizada de forma vertical e colorida para melhor depuração e monitoramento.
*   **Conexão via Pairing Code:** Conecte-se usando apenas o número de telefone, sem a necessidade de escanear QR Codes.
*   **Auto-Sticker:** Converta qualquer imagem em figurinho automaticamente ao enviá-la com a legenda **"s"**.
*   **Gestão Completa de Grupos:** Comandos integrados para administração (banir, adicionar, promover, marcar todos).
*   **Simulação de Presença:** O bot simula o status "digitando..." durante o processamento, proporcionando uma interação mais natural.

## 📜 Sistema de Comandos Modular

A pasta `/comandos` é o coração da expansibilidade do bot. Para criar um novo comando:

1.  Crie um novo arquivo `.js` dentro da pasta `/comandos`.
2.  Exporte um objeto seguindo este modelo:

```javascript
const config = require('../configuracao');

module.exports = {
    nome: "nomecomando", // Nome do comando (sem prefixo)
    descricao: "Descrição clara do que o comando faz.",
    executar: async (sock, msg, args) => {
        // Sua lógica aqui
        const from = msg.key.remoteJid;
        await sock.sendMessage(from, { text: "Resposta do comando!" });
    }
};
```
O sistema automaticamente:

- Registra o comando para ser acionado com ${config.prefixo}nomecomando.
- Inclui o comando e sua descrição na listagem gerada pelo *${config.prefixo}menu*.


## 👨‍💻 Sobre o Desenvolvedor & a Organização

O ***CarsaiBot*** é um projeto desenvolvido pela **CarsaiDev**, parte do ecossistema digital **CarsaiMz** (ou **Carsai Mozambique**). A organização está sediada em Moçambique e tem como foco fornecer soluções acessíveis em desenvolvimento web, hospedagem e educação digital.

*   **Dono do Projeto:** CarsaiDev
*   **Nome do Bot:** CarsaiBot
*   **WhatsApp para Contato:** [+258 86 241 4345](https://wa.me/258862414345)

### 🌐 Portfólio de Plataformas Carsai

A organização mantém um conjunto de plataformas que complementam sua missão de democratizar o acesso à tecnologia:

*   **[CarsaiDev](https://carsaidev.linkpc.net/):** Hub principal para desenvolvimento web sob encomenda e soluções personalizadas.
*   **[CarsaiMZ](https://carsaimz.site):** Site oficial da organização em Moçambique.
*   **[Carsai LMS](https://carsailms.linkpc.net):** Sistema de Gestão de Aprendizagem (LMS) para oferta de cursos online gratuitos e pagos. Segue a filosofia de sistemas abertos e focados na experiência educacional, similar a projetos de código aberto como o Sakai LMS.
*   **[Carsai Host](https://carsaihost.linkpc.net):** Serviço de hospedagem web acessível.
*   **[Carsai BMS](https://carsaibms.linkpc.net):** Sistema de Gestão de Negócios para empreendedores.


---
*Nota: Este bot é fornecido como uma ferramenta para desenvolvimento e aprendizado. Utilize-o com responsabilidade e em conformidade com os Termos de Serviço do WhatsApp.*
