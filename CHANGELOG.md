
# CHANGELOG - CarsaiBot

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.


## [2.0.1] - 2026-01-19

### 🎉 **NOVOS COMANDOS DE DOWNLOAD**

#### 📥 **Sistema de Download Completo**
- **`!yt` / `!youtube`** - Baixa vídeos e músicas do YouTube
  - Suporte a pesquisa por nome
  - Download de áudio (MP3) ou vídeo (MP4)
  - Detecção automática de qualidade
  - Limite de 30 minutos por vídeo

- **`!tiktok` / `!tt`** - Download de vídeos do TikTok
  - Suporte a links diretos
  - Mantém informações do vídeo (curtidas, comentários)
  - Baixa em qualidade HD

- **`!instagram` / `!ig`** - Download de mídias do Instagram
  - Fotos e vídeos
  - Reels e posts do feed
  - Suporte a carrossel (múltiplas mídias)

- **`!facebook` / `!fb`** - Download de vídeos do Facebook
  - Vídeos públicos apenas
  - Métodos alternativos para contornar restrições

- **`!gdrive`** - Download do Google Drive
  - Arquivos públicos
  - Detecta tipo de arquivo automaticamente
  - Limite de 100MB

- **`!mediafire`** - Download do MediaFire
  - Extração automática de links
  - Informações do arquivo
  - Suporte a vários tipos de arquivo

- **`!mega`** - Download do MEGA.nz
  - Links públicos sem senha
  - Progresso de download
  - Timeout configurável

- **`!download`** - **Download Universal**
  - Detecta automaticamente a plataforma
  - Roteia para o comando correto
  - Suporte a links diretos de mídia

### 🎬 **Sistema de Pesquisa de Mídia (TMDB)**

#### 📺 **Pesquisa Multiplataforma**
- **`!filme`** - Informações completas de filmes
  - Sinopse em português
  - Avaliação, elenco, diretor
  - Posters em alta qualidade
  - Informações de bilheteria

- **`!serie`** - Detalhes de séries de TV
  - Temporadas e episódios
  - Status (em andamento/concluída)
  - Próximos episódios
  - Canais de transmissão

- **`!anime`** - Informações de animes
  - Detecta tipo (série ou filme)
  - Gêneros específicos de anime
  - Informações do estúdio
  - Dicas para sites especializados

- **`!ator`** - Perfil de atores/atrizes
  - Biografia em português
  - Filmografia completa
  - Prêmios e reconhecimentos
  - Trabalhos mais populares
  
  ### ⚙️ MELHORIAS E OUTROS COMANDOS
  - **Comandos para conversão stickers, imagens, vídeos e áudios**
  - **Melhorias no comando de tradução automática (implementadas alternativas)**
  - **Mais**

### 🔧 **Melhorias Técnicas**

#### 🏗️ **Arquitetura**
- Sistema modular por arquivos independentes
- Cada comando em seu próprio arquivo `.js`
- Configuração centralizada em `configuration.js`
- Reutilização de funções auxiliares

#### ⚡ **Performance**
- Timeouts configuráveis por plataforma
- Limites de tamanho de arquivo
- Validação de links antes do download
- Cache de informações quando possível

#### 🛡️ **Segurança**
- Verificação de tamanho de arquivos
- Sanitização de nomes de arquivos
- Validação de URLs
- Limites de requisições

#### 🌐 **Compatibilidade**
- Suporte a múltiplas APIs
- Fallbacks automáticos quando APIs falham
- User-Agents configuráveis
- Headers personalizados por plataforma

### 📊 **Estatísticas da Versão**
- ✅ **8 novos comandos** de download
- ✅ **4 novos comandos** de pesquisa
- ✅ **12 comandos totais** na categoria mídia
- ✅ **7 plataformas** suportadas para download
- ✅ **Dependências** otimizadas
- ✅ **100MB limite** por arquivo (limite WhatsApp)

### 🔄 **Mudanças de Comportamento**

#### Para Usuários:
- Comandos mais específicos (`!yt` em vez de `!download youtube`)
- Mensagens de erro mais descritivas
- Progresso de download para arquivos grandes
- Dicas de uso quando o download falha

#### Para Desenvolvedores:
- Estrutura de arquivos mais organizada
- Código mais modular e reutilizável
- Melhor tratamento de erros
- Logs mais detalhados

### 🐛 **Correções de Bugs**
- Corrigido timeout em downloads longos
- Resolvido problema com caracteres especiais em nomes
- Corrigida detecção de tipo de mídia
- Melhor tratamento de links quebrados

### 📋 **Requisitos do Sistema**
- Node.js 16 ou superior
- 512MB RAM mínimo
- Conexão estável com internet
- API Key do TMDB (gratuita)

### ⚠️ **Limitações Conhecidas**
- Instagram pode bloquear downloads frequentes
- Facebook tem proteções contra download
- MEGA requer biblioteca adicional para alguns links
- YouTube limita vídeos a 30 minutos
- WhatsApp limita arquivos a 100MB

### 🔮 **Próximas Atualizações Planejadas**
- [ ] Suporte a Twitter/X
- [ ] Download de playlists do YouTube
- [ ] Compressão de vídeos
- [ ] Sistema de fila de downloads
- [ ] Interface web para gerenciamento

---

## [2.0.0] - 2026-01-18

### ✨ **Funcionalidades Principais**
- ✅ **100+ comandos** organizados em 8 categorias
- ✅ **Sistema de diversão** com piadas, quizzes e jogos diários
- ✅ **Download avançado** de mídia (YouTube, áudio, vídeo)
- ✅ **Tradução automática** entre 100+ idiomas
- ✅ **Pesquisas online** (Wikipedia, Google, notícias em tempo real)
- ✅ **API Keys configuráveis** para funcionalidades premium
- ✅ **Sistema anti-link** inteligente com detecção automática
- ✅ **QR Code generator** integrado
- ✅ **Figurinhas personalizadas** com watermark
- ✅ **Sistema de categorias** automático no menu

### 📁 **Categorias Disponíveis**
1. **Administração** - Comandos para admins do grupo
2. **Diversão** - Jogos, piadas, memes
3. **Utilidades** - Ferramentas úteis do dia a dia
4. **Multimídia** - Edição de imagens e áudio
5. **Download** - Baixar mídias da internet
6. **Pesquisa** - Buscar informações online
7. **Educação** - Aprendizado e conhecimento
8. **Figurinhas** - Criar e editar figurinhas

### ⚙️ **Configuração**
- Sistema de configuração modular
- API Keys em arquivo separado
- Variáveis de ambiente suportadas
- Backup automático de configurações

### 🛡️ **Segurança**
- Sistema anti-flood
- Verificação de links maliciosos
- Controle de permissões por grupo
- Logs de atividades

---

**Nota:** Esta versão representa uma reconstrução completa do bot com foco em estabilidade e funcionalidades avançadas de mídia.

*Para ver versões anteriores, consulte o histórico do Git.*