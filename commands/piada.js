const config = require('../configuration');
const axios = require('axios');

module.exports = {
    nome: "piada",
    descricao: "Conta uma piada aleatória",
    categoria: "diversao",
    executar: async (sock, msg, commandArgs) => {
        const fromJid = msg.key.remoteJid;
        
        const piadas = [
    {
        pergunta: "Por que o pinheiro não se perde na floresta?",
        response: "Porque ele tem uma pinha (pinha = mapa em espanhol)"
    },
    {
        pergunta: "O que o pato disse para a pata?",
        response: "Vem quá!"
    },
    {
        pergunta: "Por que o livro de matemática cometeu suicídio?",
        response: "Porque tinha muitos problemas."
    },
    {
        pergunta: "Qual é o café mais perigoso do mundo?",
        response: "O cappuccino, porque é um café puccino (café pulicento)"
    },
    {
        pergunta: "O que o zero disse para o oito?",
        response: "Que cinto bonito!"
    },
    {
        pergunta: "Por que o cachorro foi ao computador?",
        response: "Para procurar um cachorro-pé"
    },
    {
        pergunta: "O que é um pontinho amarelo no alto do prédio?",
        response: "Um minion suicida"
    },
    {
        pergunta: "Por que o Napoleão era sempre chamado para as festas?",
        response: "Porque ele era Bonaparte"
    },
    {
        pergunta: "Qual é a fórmula da água benta?",
        response: "H Deus O"
    },
    {
        pergunta: "O que um tijolo disse para o outro?",
        response: "Há um cimento entre nós"
    },
    {
        pergunta: "Por que a plantinha não respondeu à mensagem?",
        response: "Porque ela estava offline"
    },
    {
        pergunta: "Qual é a bebida preferida do astronauta?",
        response: "Nescaulíptico"
    },
    {
        pergunta: "Por que o esqueleto não brigou com ninguém?",
        response: "Porque ele não tinha estômago para isso"
    },
    {
        pergunta: "O que o lápis disse para o papel?",
        response: "Você está me desapontando"
    },
    {
        pergunta: "Por que o tomate virou ator?",
        response: "Porque viu o filme do Tom Cruise"
    },
    {
        pergunta: "Qual é o contrário de volátil?",
        response: "Vem cá sobrinho"
    },
    {
        pergunta: "O que a vaca disse para a outra vaca?",
        response: "Muuuuuuuito prazer!"
    },
    {
        pergunta: "Por que a aranha é o animal mais carente do mundo?",
        response: "Porque ela é um arac-needy-u"
    },
    {
        pergunta: "O que o pagodeiro foi fazer no hospital?",
        response: "Fazer um exame de sangue (para ver se tem samba no pé)"
    },
    {
        pergunta: "Por que a minhoca está falando sozinha?",
        response: "Porque ela é uma minhoca-louca"
    },
    {
        pergunta: "Qual é o doce preferido do esqueleto?",
        response: "Bró-colis"
    },
    {
        pergunta: "O que a uva disse quando a pisaram?",
        response: "Nada, só deu um grito de uva"
    },
    {
        pergunta: "Por que o jacaré tirou o jacarezinho da escola?",
        response: "Porque ele réptil de ano"
    },
    {
        pergunta: "Qual é o animal mais antigo do mundo?",
        response: "A zebra, porque está sempre listrada"
    },
    {
        pergunta: "O que o cadarço falou para o tênis?",
        response: "Vamos dar um nó?"
    },
    {
        pergunta: "Por que a galinha atravessou a rua?",
        response: "Para chegar do outro lado"
    },
    {
        pergunta: "Qual é o lugar onde a vaca vai no fim de semana?",
        response: "No muuuseu"
    },
    {
        pergunta: "O que o pastel disse para o outro pastel?",
        response: "Tá me achando com cara de trouxa?"
    },
    {
        pergunta: "Por que o piano não pode falar?",
        response: "Porque ele é mudo por natureza"
    },
    {
        pergunta: "Qual é a fruta que anda de trem?",
        response: "O kiwi, porque kiwi-lometro"
    },
    {
        pergunta: "O que o martelo foi fazer na igreja?",
        response: "Pregar"
    },
    {
        pergunta: "Por que o bombeiro não joga futebol?",
        response: "Porque ele já apaga o fogo todo dia"
    },
    {
        pergunta: "Qual é a cidade brasileira que não tem táxi?",
        response: "Uberlândia"
    },
    {
        pergunta: "O que o pintinho falou para a mãe dele?",
        response: "Oi, mãe!"
    },
    {
        pergunta: "Por que a matemática é tão estressada?",
        response: "Porque ela tem muitos problemas para resolver"
    },
    {
        pergunta: "Qual é o sanduíche favorito do vampiro?",
        response: "O sanduíche de alho"
    },
    {
        pergunta: "O que a impressora foi fazer no psicólogo?",
        response: "Porque ela estava com problemas de papel"
    },
    {
        pergunta: "Por que o frango atravessou o campo de futebol?",
        response: "Para chegar na outra pênalti"
    },
    {
        pergunta: "Qual é o animal mais legal do circo?",
        response: "O hipopótamo, porque é hippo-tamo"
    },
    {
        pergunta: "O que a porta foi fazer no médico?",
        response: "Porque ela estava com fechadura"
    },
    {
        pergunta: "Por que o dinossauro não consegue falar?",
        response: "Porque ele é extinto"
    },
    {
        pergunta: "Qual é o carro mais simpático?",
        response: "O carro-amigo"
    },
    {
        pergunta: "O que a formiga disse quando caiu no açúcar?",
        response: "Estou doce!"
    },
    {
        pergunta: "Por que o computador foi para a praia?",
        response: "Para pegar um bronze-windows"
    },
    {
        pergunta: "Qual é o peixe que canta?",
        response: "O tubarão-lata"
    },
    {
        pergunta: "O que o espelho disse para o outro espelho?",
        response: "Tô vendo você me copiando!"
    },
    {
        pergunta: "Por que o joelho não entra na faculdade?",
        response: "Porque ele só tem patela"
    },
    {
        pergunta: "Qual é a bebida favorita do bombeiro?",
        response: "Água, com um golê"
    },
    {
        pergunta: "O que o relógio disse para o outro relógio?",
        response: "Que horas você tem?"
    },
    {
        pergunta: "Por que o livro de história está sempre cansado?",
        response: "Porque ele tem muitas datas"
    },
    {
        pergunta: "Qual é o céu que não tem estrelas?",
        response: "O céu da boca"
    },
    {
        pergunta: "O que o feijão foi fazer no cinema?",
        response: "Para ver o filme do João"
    },
    {
        pergunta: "Por que o quadrado não tem amigos?",
        response: "Porque ele é muito quadrado"
    },
    {
        pergunta: "Qual é a teia mais divertida?",
        response: "A teia-rra"
    },
    {
        pergunta: "O que o morcego disse para o filhote?",
        response: "Vampiros são os pais!"
    },
    {
        pergunta: "Por que a laranja estava triste?",
        response: "Porque ela estava descascada"
    },
    {
        pergunta: "Qual é o inseto mais estudioso?",
        response: "O besouro, porque ele bes-ouro"
    },
    {
        pergunta: "O que o guarda-chuva disse para a chuva?",
        response: "Você pode parar agora, já estou aqui"
    },
    {
        pergunta: "Por que o elefante não usa computador?",
        response: "Porque ele tem medo do mouse"
    },
    {
        pergunta: "Qual é o doce preferido da abelha?",
        response: "O mel-ão"
    },
    {
        pergunta: "O que o lápis foi fazer no hospital?",
        response: "Porque ele estava com ponta seca"
    },
    {
        pergunta: "Por que a bicicleta não consegue ficar em pé?",
        response: "Porque ela está dois-pneus"
    },
    {
        pergunta: "Qual é o animal mais organizado?",
        response: "A joaninha, porque ela tem pontinhos"
    },
    {
        pergunta: "O que a caneta disse para o papel?",
        response: "Você está sempre me envolvendo"
    },
    {
        pergunta: "Por que o pão foi ao psicólogo?",
        response: "Porque ele estava com crises de ansiedade de ser pão"
    },
    {
        pergunta: "Qual é a planta mais fofoqueira?",
        response: "A samambaia, porque ela sempre está espalhando coisas"
    },
    {
        pergunta: "O que o chocolate disse para o outro chocolate?",
        response: "Somos doces, mas não somos bobos"
    },
    {
        pergunta: "Por que o sapo não lava o pé?",
        response: "Porque ele morre se lavar"
    },
    {
        pergunta: "Qual é o rei dos queijos?",
        response: "O reiqueijão"
    },
    {
        pergunta: "O que a estrada disse para o carro?",
        response: "Vamos dar uma volta?"
    },
    {
        pergunta: "Por que o celular foi ao médico?",
        response: "Porque ele estava com vírus"
    },
    {
        pergunta: "Qual é a fruta mais vaidosa?",
        response: "O caqui, porque sempre está caqui-da"
    },
    {
        pergunta: "O que o dinheiro disse para o banco?",
        response: "Estou depositando minhas esperanças em você"
    },
    {
        pergunta: "Por que a cenoura não consegue falar?",
        response: "Porque ela é muda-cenoura"
    },
    {
        pergunta: "Qual é o cachorro mais estudioso?",
        response: "O labradoratório"
    },
    {
        pergunta: "O que a tesoura foi fazer no salão?",
        response: "Cortar o cabelo do ar"
    },
    {
        pergunta: "Por que a cebola está sempre chorando?",
        response: "Porque ela tem muitas camadas emocionais"
    },
    {
        pergunta: "Qual é o inseto mais rico?",
        response: "A formiga, porque ela trabalha no formigueiro"
    },
    {
        pergunta: "O que a cadeira disse para a mesa?",
        response: "Podemos ser móveis juntos?"
    },
    {
        pergunta: "Por que o zíper foi ao psicólogo?",
        response: "Porque ele estava se sentindo fechado"
    },
    {
        pergunta: "Qual é a árvore mais tagarela?",
        response: "A árvore de natal, porque sempre tem luzes"
    },
    {
        pergunta: "O que a pizza disse para a outra pizza?",
        response: "Você é redonda como eu"
    },
    {
        pergunta: "Por que o espinafre está sempre feliz?",
        response: "Porque ele é pop-aye"
    },
    {
        pergunta: "Qual é o peixe mais romântico?",
        response: "O peixe-palhaço, porque ele sempre faz piadas"
    },
    {
        pergunta: "O que a janela disse para a porta?",
        response: "Você abre, eu fecho"
    },
    {
        pergunta: "Por que o macaco gosta de banana?",
        response: "Porque é a fruta que mais se parece com ele"
    },
    {
        pergunta: "Qual é o doce preferido do fantasma?",
        response: "O sus-pi-ro"
    },
    {
        pergunta: "O que a nuvem disse para a outra nuvem?",
        response: "Vamos chover juntas?"
    },
    {
        pergunta: "Por que o telefone está sempre ocupado?",
        response: "Porque ele tem muitas ligações emocionais"
    },
    {
        pergunta: "Qual é a fruta mais corajosa?",
        response: "O kiwi, porque ele tem coragem de ser peludo"
    },
    {
        pergunta: "O que o sapato disse para o pé?",
        response: "Estamos sempre juntos, não é mesmo?"
    },
    {
        pergunta: "Por que a borboleta não usa relógio?",
        response: "Porque ela sempre está no seu próprio tempo"
    },
    {
        pergunta: "Qual é o animal mais educado?",
        response: "O urso polar, porque ele sempre cumprimenta com um 'urso'"
    },
    {
        pergunta: "O que o livro de receitas disse para o chef?",
        response: "Siga-me para o sucesso!"
    },
    {
        pergunta: "Por que o sol não brinca com a lua?",
        response: "Porque eles nunca estão no mesmo lugar ao mesmo tempo"
    },
    {
        pergunta: "Qual é a estação do ano mais doce?",
        response: "O verão, porque tem muito 'verão' (verão = sorvete em algumas regiões)"
    },
    {
        pergunta: "O que a caneca disse para o café?",
        response: "Você sempre me aquece o coração"
    },
    {
        pergunta: "Por que o pássaro não usa óculos?",
        response: "Porque ele já enxerga longe naturalmente"
    },
    {
        pergunta: "Qual é a cidade que nunca dorme?",
        response: "A cidade que tem muito café"
    },
    {
        pergunta: "O que o robô disse para o humano?",
        response: "Você está me programando para gostar de você"
    }
];
        
        const piada = piadas[Math.floor(Math.random() * piadas.length)];
        
        await sock.sendMessage(fromJid, { 
            text: `😂 *Piada do Dia*\n\n` +
                  `❓ *${piada.pergunta}*\n` +
                  `(...aguarde 3 segundos...)`
        }, { quoted: msg });
        
        // Aguardar 3 segundos para mostrar a response
        setTimeout(async () => {
            await sock.sendMessage(fromJid, { 
                text: `🎭 *Resposta:* ${piada.response}\n\n😄 Espero que tenha gostado!\n\n*MEU DONO NÃO É BOM EM PIADAS 😂😂😂😂*`
            });
        }, 3000);
    }
};
/* CarsaiBot - cbot - carsai */
