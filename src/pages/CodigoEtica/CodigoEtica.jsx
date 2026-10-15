
import React from "react";

import styles from "./CodigoEtica.module.css";

function CodigoEtica() {
  return (
    <div className={styles.transparencia}>
      <h1 className={styles.title}>
        Código de Ética e Conduta
      </h1>

      <p className={styles.description}>
        O HMAA reafirma seu compromisso com a ética, a integridade,
        o respeito e a transparência em todas as suas relações e
        atividades institucionais.
      </p>

      <p className={styles.description}>
        Nosso Código de Ética e Conduta estabelece princípios,
        diretrizes e responsabilidades que orientam a atuação de
        nossos colaboradores, gestores e demais públicos relacionados
        à instituição, contribuindo para um ambiente de trabalho
        respeitoso, seguro, íntegro e alinhado aos nossos valores.
      </p>

      <p className={styles.description}>
        O documento está disponível para consulta e tem como objetivo
        fortalecer a cultura ética, prevenir condutas inadequadas e
        promover o cumprimento das normas e dos princípios institucionais.
      </p>

      <p className={styles.description}>
        Consulte o Código de Ética e Conduta do HMAA no documento anexo.
      </p>

      <a
        className={styles.downloadLink}
        href="/codigo de etica.pdf"
        download
      >
        Baixar documento
      </a>
    </div>
  );
}

export default CodigoEtica;