
import React from "react";

import styles from "./Noticias.module.css";
import { Link } from "react-router-dom";

import noticias from "./Data/index.js";

function Referencias({ fontes }) {
  if (!Array.isArray(fontes) || fontes.length === 0) {
    return null;
  }

  return (
    <div className={styles.fontes}>
      <strong>Fonte: </strong>

      {fontes.map((fonte, index) => (
        <React.Fragment key={`${fonte.url}-${index}`}>
          {index > 0 && " · "}

          <a
            href={fonte.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fonte.nome}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
}

function Noticias() {
  const [noticiaPrincipal, ...outrasNoticias] = noticias;

  if (!noticiaPrincipal) {
    return (
      <div className={styles.container}>
        <h1 className={styles.tituloPagina}>NOTÍCIAS</h1>
        <p>Nenhuma notícia disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.tituloPagina}>NOTÍCIAS</h1>

      <div className={styles.noticiaPrincipal}>
        <div className={styles.cabecalhoPrincipal}>
          <h2 className={styles.tituloPrincipal}>
            {noticiaPrincipal.titulo}
          </h2>

          <div className={styles.autores}>
            {(noticiaPrincipal.autores ?? []).map(
              (autor, index) => (
                <p key={index} className={styles.autor}>
                  {autor}
                </p>
              )
            )}
          </div>

          <p className={styles.dataPrincipal}>
            {noticiaPrincipal.data}
          </p>

          <div className={styles.tags}>
            {(noticiaPrincipal.tags ?? []).map(
              (tag, index) => (
                <span key={index}>{tag}</span>
              )
            )}
          </div>
        </div>

        <div className={styles.conteudoPrincipal}>
          {noticiaPrincipal.imagem && (
            <img
              src={noticiaPrincipal.imagem}
              alt={noticiaPrincipal.titulo}
              className={styles.imagemPrincipal}
            />
          )}

          <div className={styles.textoContainer}>
            <p className={styles.textoPrincipal}>
              {noticiaPrincipal.texto}
            </p>

            <Referencias fontes={noticiaPrincipal.fontes} />

            <Link
              to={`/noticias/${noticiaPrincipal.id}`}
              className={styles.saibaMais}
            >
              Leia mais →
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.outrasNoticias}>
        <div className={styles.newsDivider1}>
          <h2 className={styles.tituloSecao}>
            ÚLTIMAS NOTÍCIAS
          </h2>
        </div>

        <div className={styles.gridCards}>
          {outrasNoticias.map((item) => (
            <div
              key={item.id}
              className={styles.cardNoticia}
            >
              {item.imagem && (
                <img
                  src={item.imagem}
                  alt={item.titulo}
                  className={styles.cardImagem}
                />
              )}

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitulo}>
                  {item.titulo}
                </h3>

                <p className={styles.cardData}>
                  {item.data}
                </p>

                <p className={styles.cardTexto}>
                  {item.texto}
                </p>

                <Referencias fontes={item.fontes} />

                <Link
                  to={`/noticias/${item.id}`}
                  className={styles.leiaMais}
                >
                  Leia mais →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Noticias;