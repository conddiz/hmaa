import React from "react";
import styles from "./Projetos.module.css";

function Projetos() {
  return (
    <div className={styles.transparencia}>
      <h1 className={styles.title}>Emendas Parlamentares</h1>

      <p className={styles.description}>
        Em atenção à ADPF nº 854 e LC 210/2024 – Liberação de Recursos Financeiros
        para convênios de emenda parlamentar, inserimos abaixo o link para baixar
        a tabela com emendas parlamentares recebidas desde 2020.
      </p>

      <a
        className={styles.downloadLink}
        href="emendas 2.xlsx" 
        download
      >
        Baixar tabela
      </a>
    </div>
  );
}
export default Projetos;
