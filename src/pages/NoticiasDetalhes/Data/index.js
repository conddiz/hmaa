
import { Subtitles } from "lucide-react";

const noticias = [
  {
    id: 1,
    imagem: "/estado.jpg",
    titulo: "teste 1",
    data: "24/10/2024",
    texto: `Texto aqui.`,
    tags: ["Equipamentos", "Hospitalares", "Inovação"],
    autores: ["Equipe SC Medical"],
  },

  {
    id: 2,
    titulo:
      "UTI Pediátrica do Hospital e Maternidade Agenor Araújo é inaugurada com a participação da secretária estadual da Saúde Tânia Mara",
    data: "18 DE OUTUBRO DE 2025",
    conteudo: [
      {
        tipo: "imagem",
        valor: "/uti1.jpeg",
      },
      {
        tipo: "texto",
        valor: `O evento aconteceu no domingo, 12, com a presença da secretária da Saúde do Estado do Ceará, Tânia Mara. O novo equipamento conta
         com dez leitos, conforme apresentado. O espaço moderno passa a oferecer maior segurança para a saúde na região.`,
      },
      {
        tipo: "texto",
        valor: `A secretária da Saúde do Ceará, Tânia Mara, classificou como um momento histórico a instalação da UTI Pediátrica em Iguatu, como 
        referência e servirá de apoio à rede pública estadual de saúde. “Essa UTI vai ajudar a salvar muitas crianças, vai entregar qualidade para 
        nossa população, conforto e segurança para os pais e nossas crianças. O governador Elmano de Freitas assegurou o custeio dessa UTI, que são
         R$ 480 mil mensais.”, declarou a gestora, que na ocasião representou o governo do Estado. “Assim que recebemos essa proposta, nós conversamos
          e o governador Elmano de Freitas assegurou que a Secretaria da Saúde repasse mensalmente R$ 480 mil para custear, até que a UTI seja habilitada
           pelo Governo Federal, que vai passar a diminuir o custeio do Estado que cai para R$ 300 mil e o restante do Governo Federal. Mas é um 
           dinheiro que vai ficar para sempre, para manter esse unidade, essa estrutura que é fundamental para nossa população”, pontuou Tânia Mara.`,
      },
      {
        tipo: "texto",
        valor: `A Casa de Saúde foi fundada pelo médico Agenor Araújo. Seus familiares passam o legado a cada geração. O deputado Agenor Neto falou da importância
         desse momento. “Esse foi o maior prêmio que as crianças poderiam receber, essa UTI Pediátrica, essa unidade vai salvar muitas vidas. Era um sonho de muito
          tempo de meu pai (Dr. José Ilo Dantas), tem um significado muito grande. Estou feliz em ter unido forças, recursos e decisões políticas para que pudéssemos
           ter vivenciado esse momento, no dia das Crianças, vai ficar marcado e na história essa UTI Pediátrica do Hospital Agenor Araújo”, afirmou o parlamentar,
            que ao lado dos filhos integra a direção da unidade, Victor Oliveira, estudante de Medicina, e do engenheiro civil Ilo Neto.`,
      },
      {
        tipo: "texto",
        valor: `Logo após a inauguração, conforme anunciado, na segunda-feira, 13, a UTI Pediátrica passou a funcionar. Andrezza Saraiva, diretora do hospital, destacou
         a importância desse feito. “Momento muito importante essa inauguração da primeira UTI Pediátrica da Região Centro-Sul, que vai ser referência para quase meio 
         milhão de habitantes. A gente sabe o tamanho da importância para as famílias ter um equipamento pra possibilitar maior acesso e garantir essa assistência segura
          e de qualidade para nossas crianças. Então, é um momento de grande gratidão para todos que fazem parte da Casa de Saúde, todos os apoiadores também que estão juntos
           empenhados para essa entrega. A UTI tem dez leitos e está destinada ao atendimento de crianças a partir do vigésimo nono dia de nascida até os 14 anos. O acesso é 
           referenciado pela rede de regulação do Estado do Ceará, através do sistema e regulação estadual, que encaminha para a unidade. Passamos a ter mais essa oportunidade
            de acesso à saúde para nossas crianças”, disse.`,
      },
      {
        tipo: "texto",
        valor: `A diretoria da Casa de Saúde pontuou também que através do apoio do Governo do Estado, dos deputados estadual Agenor Neto, e federal Eunício Oliveira
        , foi primordial para a instalação da unidade.`,
      },
      {
        tipo: "texto",
        valor: `A solenidade contou também com as presenças do deputado estadual Felipe Aguiar, do federal Eunício Oliveira, autoridades estaduais, do município e convidados.`,
      },
      {
        tipo: "imagem",
        valor: "/uti2.jpeg",
      },
    ],
    tags: [
      "",
      "",
      "",
      "",
      "",
    ],
    autores: [
      "",
      "",
    ],
    fontes: [
      {
        nome: "Jornal A Praça",
        url: "https://www.jornalapraca.com.br/uti-pediatrica-do-hospital-e-maternidade-agenor-araujo-e-inaugurada-com-a-participacao-da-secretaria-estadual-da-saude-tania-mara/",
      },
    ],
  },

  {
    id: 3,
    imagem: "/image.jpg",
    titulo: "teste 3",
    data: "28 DE JULHO DE 2023 - 21:16",
    texto: `Texto aqui.`,
    tags: [
      "Ficouro-Sul",
      "Cirurgias Eletivas",
      "Compromisso",
      "Governo Do Estado",
      "Tratamento De Câncer",
    ],
    autores: [
      "Lorista Felido - Ascron Casa Civil - Foto",
      "Thiago Gaspar - Casa Civil - Foto",
    ],
  },

  {
    id: 4,
    titulo:
      "Governo do Ceará reforça compromisso com realização de cirurgias eletivas e tratamento do câncer na Região Centro-Sul",
    data: "28 DE JULHO DE 2023 - 21:16",
    conteudo: [
      {
        tipo: "imagem",
        valor: "/estado.jpg",
      },
      {
        tipo: "texto",
        valor: `Em Iguatu, no Centro-Sul cearense, o Hospital e Maternidade Agenor Araújo (HMAA) 
        está credenciado desde maio deste ano para atender pacientes dentro do Plano Estadual de Redução 
        das Filas de Cirurgias Eletivas, Exames Complementares e Consultas Especializadas. Até o momento, 
        110 procedimentos foram realizados na unidade. Na tarde desta terça-feira (25), o governador Elmano de 
        Freitas visitou o Hospital, acompanhado de autoridades, e reforçou a parceria para ampliar acesso ao tratamento do câncer.`,
      },
      {
        tipo: "imagem",
        valor: "/proadi.jpg",
      },
      {
        tipo: "texto",
        valor: `Lançado em abril de 2023, o Plano Estadual de Redução das Filas de Cirurgias Eletivas é desenvolvido 
        por meio da Sesa, que, além de realizar os procedimentos nos hospitais da rede estadual, convoca, via edital,
        clínicas, hospitais-polo e outros equipamentos de saúde para a realização de quase 29 mil cirurgias não urgentes.
        O investimento inicial na iniciativa é de R$ 135 milhões.`,
      },
      {
        tipo: "imagem",
        valor: "/victor.jpg",
      },
      {
        tipo: "texto",
        valor: `Durante a visita, o governador enfatizou que o Ceará tem dado celeridade para reduzir a espera por 
        cirurgias no Sistema Único de Saúde (SUS). “Queremos continuar intensificando esse trabalho para que a família
        cearense possa superar o sofrimento de ter alguém esperando uma cirurgia. Essa unidade tem tido destaque na
        realização de cirurgias. Nós acabamos de visitar pessoas de Cariús, Iguatu, Icó, da região inteira. Por isso,
        tenho muita clareza de que é importante ter um hospital-polo regional do Centro-Sul”, afirmou.`,
      },
      {
        tipo: "imagem",
        valor: "/solange.jpg",
      },
      {
        tipo: "texto",
        valor: `No que se refere ao plano estadual, entre as cirurgias já feitas na unidade hospitalar de Iguatu estão:
        cirurgia geral (96); ginecologia (07); ortopedia/traumatologia (04); otorrinolaringologia (02); pediátrica (01).
        Para atender à demanda, o equipamento reformou o Centro Cirurgico, renovou o parque tecnológico e ampliou a 
        estrutura da unidade com a criação de 20 leitos cirúrgicos, o que resultou em 70 leitos ao todo.`,
      },
      {
        tipo: "texto",
        valor: `A dona de casa Maria Célia Lima, de 47 anos, natural de Icó, já está no HMAA se preparando para uma cirurgia
         ginecológica. Ela, que descobriu a doença há cerca de sete anos, sentiu os sintomas se agravarem no último ano. 
         “Acredito e tenho esperança que [após a cirurgia] vai ficar bem melhor”, disse.`,
      },
      {
        tipo: "imagem",
        valor: "/agenor.jpg",
      },
      {
        tipo: "texto",
        valor: `Ainda segundo Elmano de Freitas, o Centro-Sul terá estrutura para receber pacientes em tratamento do câncer.
        “Tenho certeza que, para toda e qualquer pessoa com alguém que tem câncer na família, saber que essa pessoa não vai 
        ter que se deslocar para fazer o tratamento longe, podendo ser atendida em Iguatu, é uma situação de muito mais tranquilidade,
        paz para o coração dessa família e, especialmente, para a pessoa que vai fazer o tratamento. Eu me comprometi que levaremos o
       tratamento do câncer para todo o Ceará, para o Interior”.`,
      },
      {
        tipo: "imagem",
        valor: "/elmano.jpg",
      },
      {
        tipo: "texto",
        valor: `Além das cirurgias eletivas, a Sesa, por meio da Política de Incentivo Hospitalar (PIH), repassa cerca de R$ 460 mil 
        mensalmente ao HMAA para o custeio de dez leitos de Unidade de Terapia Intensiva (UTI), clínica médica e pediátrica. Há previsão
        para que a Comissão Intergestores Bipartite (CIB) delibere a ampliação em mais R$ 240 mil para abranger as clínicas de cirurgia,
        raumatologia e anestésica.`,
      },
      {
        subtitulo: "Mais investimento em saúde",
        tipo: "texto",
        valor: `O Ceará também é contemplado pelo Programa Nacional de Redução de Filas, do Governo Federal, contando com recurso de R$25,9 milhões
         e uma contrapartida estadual no valor de R$7,98 milhões, totalizando R$ 33,88 milhões para 15.900 cirurgias. Com os investimentos das iniciativas 
         federal e estadual, são quase R$ 170 milhões para realizar cerca de 45 mil procedimentos.`,
      },
    ],
    tags: [
      "Centro-Sul",
      "Cirurgias Eletivas",
      "Compromisso",
      "Governo Do Estado",
      "Tratamento De Câncer",
    ],
    autores: [
      "Larissa Falcão - Ascom Casa Civil - Texto",
      "Thiago Gaspar - Casa Civil - Foto",
    ],
    fontes: [
      {
        nome: "Governo do Estado do Ceará — Secretaria da Saúde",
        url: "https://www.ce.gov.br/saude/2023/07/26/governo-ceara-compromisso-cirurgias-eletivas-tratamento-do-cancer/",
      },
    ],
  },
];

export default noticias;