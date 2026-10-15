import React, { useEffect, useRef } from "react";
import styles from "./Especialidades.module.css";

function Especialidades() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.show);
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const especialidades = [
    
     {
      img: "/cirurgia_geral.jpeg",
      alt: "Cirurgia Geral",
      titulo: "Cirurgia Geral",
      texto:
        "A equipe de cirurgia geral do HMAA atua em procedimentos abdominais, hérnias, vesícula, entre outros, com estrutura moderna, anestesia segura e acompanhamento especializado antes, durante e após a cirurgia.",
    },
    {
      img: "/ortopedia.jpeg",
      alt: "Ortopedia",
      titulo: "Traumatologia",
      texto:
        "No Hospital Maternidade Agenor Araújo (HMAA), realizamos cirurgias ortopédicas e traumatológicas para correção de fraturas, lesões ligamentares e articulares, com foco na recuperação funcional e no retorno à qualidade de vida dos pacientes.",
    },
    {
      img: "/urologia.jpeg",
      alt: "Urologia",
      titulo: "Urologia",
      texto:
        "A equipe de Urologia do HMAA atua no diagnóstico e tratamento de doenças do sistema urinário e do aparelho reprodutor masculino, oferecendo procedimentos especializados, acompanhamento seguro e cuidado integral em todas as etapas do tratamento.",
    },
    {
      img: "/ginecologia.jpeg",
      alt: "Ginecologia",
      titulo: "Ginecologia",
      texto:
        "O HMAA realiza cirurgias ginecológicas com foco na saúde e qualidade de vida da mulher, incluindo procedimentos como histerectomias, laparoscopias e correções de patologias uterinas, sempre com tecnologia e cuidado integral.",
    }, 
    {
      img: "/proctologia.jpeg",
      alt: "Proctologia",
      titulo: "Proctologia",
      texto:
        "Na área de proctologia, o HMAA realiza cirurgias para tratar hemorroidas, fissuras, fístulas e outras doenças do reto e ânus, com sigilo, conforto e técnicas minimamente invasivas sempre que possível.",
    },
    {
      img: "/otorrinolaringologia.jpeg",
      alt: "Otorrinolaringologia",
      titulo: "Otorrinolaringologia",
      texto:
        "O serviço de otorrinolaringologia do HMAA realiza cirurgias como retirada das amígdalas, adenoides, correções do septo nasal e procedimentos auditivos, priorizando o alívio dos sintomas e o bem-estar dos pacientes.",
    },
     {
      img: "/ofta.jpeg",
      alt: "Oftalmologia",
      titulo: "Oftalmologia",
      texto:
        "No HMAA, a Oftalmologia oferece atendimento especializado para cuidar da saúde dos olhos, desde a avaliação da visão até o acompanhamento e tratamento de diferentes condições oculares, promovendo mais segurança, autonomia e qualidade de vida aos pacientes.",
    },
  ];

  return (
    <section
      className={styles.background}
    >
      <div className={styles.fundoTitulo}>
        <h2 className={styles.tituloCinza}>Conheça nossas</h2>
        <h1 className={styles.tituloVerde}>ESPECIALIDADES</h1>
      </div>

      {especialidades.map((item, index) => (
        <div
          key={index}
          ref={(el) => (cardsRef.current[index] = el)}
          className={styles.card}
        >
          <img src={item.img} alt={item.alt} className={styles.imagem} />
          <div className={styles.texto}>
            <h2 className={styles.tituloVerde}>{item.titulo}</h2>
            <p>{item.texto}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
export default Especialidades;
