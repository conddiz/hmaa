import { useState } from "react";
import styles from "./Duvidas.module.css";

function Duvidas() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const duvidas = [
     {
      pergunta: "O HOSPITAL ATENDE PELO SUS?",
      resposta: (
         <>
        <p>Sim.
        </p>
        <p>
          Somos um hospital filantrópico e realizamos atendimentos através
           do Sistema Único de Saúde (SUS), garantindo assistência à 
           população com compromisso, cuidado e responsabilidade.
        </p>
        </>
      )
    },
    {
      pergunta: "QUAIS SÃO OS HORÁRIOS DE VISITAS?",
      resposta: (
        <>
          <p>
            As visitas aos pacientes internados acontecem nos seguintes horários,
            com permissão de entrada de um visitante por vez.
          </p>

          <p><strong>Setor Particular</strong> – 07h às 19h</p>
          <p><strong>Clínica Médica e Pediatria</strong> – 09h às 10h e 17h às 18h30</p>
          <p><strong>Clínica Cirúrgica SUS</strong> – 09h às 10h e 17h às 18h30</p>
          <p><strong>UTI Adulto</strong> – 10h e 14h</p>
          <p><strong>UTI Pediátrica</strong> – 14h às 15h</p>
        </>
      )
    },
    {
      pergunta: "HORÁRIOS DAS REFEIÇÕES NO HOSPITAL",
      resposta: (
        <>
          <p>
            <strong>Para garantir a organização do serviço de nutrição e o adequado atendimento
            aos pacientes internados, as refeições são distribuídas nos seguintes horários:</strong>
          </p>
          <p>
           Desjejum (Café da manhã): entre 06h30 e 07h30
          </p>
          <p>
          Lanche da manhã: entre 08h50 e 09h30
          </p>
          <p>
          Almoço: entre 11h00 e 12h30
          </p>
          <p>
           Lanche da tarde: entre 15h00 e 15h30
          </p>
          <p>
           Jantar: entre 18h00 e 19h00
          </p>
          <p>
            <strong>
           O hospital garante café da manhã, almoço e jantar para o
           acompanhante de pacientes que se enquadram nas seguintes situações:
           </strong>
          </p>
          <p>
           Pacientes com idade superior a 60 anos
          </p>
          <p>
           Pacientes menores de 18 anos
          </p>
          <p>
          Pacientes portadores de deficiência
          </p>
          <p>
           Para garantir a segurança alimentar e o controle sanitário, não é permitido 
           entrar com alimentos externos no hospital.
          </p>
        </>
      )
    },
    {
      pergunta: "SE EU QUISER REALIZAR PROCEDIMENTOS PARTICULARES NO HOSPITAL, COMO DEVO AGENDÁ-LOS E QUAIS SÃO OS VALORES?",
     resposta: (
    <>
      <p>Para marcar consultas e exames, assim como obter informações sobre valores, entre em contato pelo número:</p>
      <p>
        <a
          href="https://wa.me/5588921782441"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappLink}
        >
          (88) 9.2178-2441 – Clínica Casa de Saúde
        </a>
      </p>

      <p>Já para cirurgias e esclarecimentos sobre os valores dos procedimentos:</p>
      <p>
         <a
            href="https://wa.me/5588988724728"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappLink}
          >
            (88) 9.8872-4728 – Atendimento Hospital Agenor Araújo
          </a>
      </p>
    </>
  )
},
{
      pergunta: "EM QUAIS HORÁRIOS SÃO REALIZADAS AS TROCAS DE ACOMPANHANTE?",
      resposta: (
        <>
          <p>
            Manhã 06h ás 07h
          </p>
          <p>
            Noite 18h ás 18h30
         </p>

        </>
      )
    },
    {
      pergunta: "GOSTARIA DE FAZER UMA VISITA AO HOSPITAL PARA CONHECER A ESTRUTURA ANTES DE DECIDIR ONDE FAZER MINHA CIRURGIA E/OU TER MEU BEBÊ. COMO AGENDAR? ",
      resposta: (
        <>
          <p>
           Essa visita poderá ser agendada por meio do telefone:
          </p>
          <p>
            <a
            href="https://wa.me/5588988724728"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappLink}
          >
            (88) 9.8872-4728 – Atendimento Hospital Agenor Araújo
          </a>
         </p>

        </>
      )
    },
    {
      pergunta: "COMO CONSIGO INFORMAÇÕES SOBRE UM PACIENTE INTERNADO?",
      resposta: (
        <>
          <p>
           Todas as informações sobre o estado de saúde dos pacientes são 
           fornecidas ao familiar ou responsável legal durante a visita.
            Não repassamos informações por ligação ou WhatsApp.
          </p>
        </>
      )
    },
    {
      pergunta: "GOSTARIA DE TRABALHAR NO HOSPITAL. COMO FAZER PARTE DOS PROCESSOS SELETIVOS?",
      resposta: (
        <>
         Para participar dos processos seletivos é necessário 
         fazer o cadastro na aba Trabalhe Conosco. 
        </>
      )
    },  

  ];

  return (
    <div className={styles.container}>

      <div className={styles.titleRow}>
        <h1>DÚVIDAS FREQUENTES</h1>
        <div className={styles.line}></div>
      </div>

      <div className={styles.faqContainer}>
        {duvidas.map((item, index) => (
          <div key={index} className={styles.faqItem}>

            <button
              className={styles.question}
              onClick={() => toggle(index)}
            >
              <span className={styles.icon}>
                {openIndex === index ? "−" : "+"}
              </span>

              <span className={styles.text}>
                {item.pergunta}
              </span>
            </button>

            <div
              className={`${styles.answer} ${
                openIndex === index ? styles.open : ""
              }`}
            >
              {item.resposta}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Duvidas;