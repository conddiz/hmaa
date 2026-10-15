
import React from "react";

import styles from "./Convenios.module.css";

function Convenios() {
  return (
    <div className={styles.transparencia}>
        <h2 className={styles.subtitle}>
       Transparência Salarial - 2026
      </h2>

      <p className={styles.description}>
        Nosso hospital reafirma seu compromisso com a transparência e a igualdade
        por meio da divulgação do Relatório de Transparência e Igualdade Salarial
        entre Mulheres e Homens, conforme a legislação vigente.
      </p>

      <p className={styles.description}>
        Seguimos atentos e sempre procurando melhorar a promoção de um ambiente
        de trabalho justo, respeitoso e igualitário para todos os colaboradores.
      </p>

      <p className={styles.description}>
        Este relatório reforça o compromisso do HMAA com a equidade, promovendo
        transparência, responsabilidade social e valorização das pessoas.
      </p>

      <a
        href="/2 semestre.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.downloadLink}
      >
        2º Semestre 2026
      </a>

       <a
        href="/1 semestre.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.downloadLink}
      >
        1º Semestre 2026
      </a>
          
    </div>
  );
}

export default Convenios;