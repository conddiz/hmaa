
import React from "react";
import { useParams, Link } from "react-router-dom";

import styles from "./NoticiasDetalhes.module.css";
import noticias from "./Data";

function NoticiasDetalhe() {
  const { id } = useParams();

  const noticia = noticias.find(
    (n) => n.id === Number(id)
  );

  if (!noticia) {
    return (
      <div className={styles.container}>
        <h2>Notícia não encontrada</h2>

        <Link to="/noticias" className={styles.backButton}>
          ← Voltar para Notícias
        </Link>
      </div>
    );
  }

  const autores = noticia.autores ?? [];
  const tags = noticia.tags ?? [];
  const fontes = noticia.fontes ?? [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {noticia.titulo}
      </h1>

      <p className={styles.date}>
        {noticia.data}
      </p>

      {autores.length > 0 && (
        <div className={styles.authors}>
          {autores
            .filter((autor) => autor && autor.trim())
            .map((autor, index) => (
              <p key={index}>{autor}</p>
            ))}
        </div>
      )}

      {noticia.imagem && (
        <img
          src={noticia.imagem}
          alt={noticia.titulo}
          className={styles.image}
        />
      )}

      {noticia.texto && (
        <p className={styles.content}>
          {noticia.texto}
        </p>
      )}

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags
            .filter((tag) => tag && tag.trim())
            .map((tag, index) => (
              <span
                key={index}
                className={styles.tag}
              >
                {tag}
              </span>
            ))}
        </div>
      )}

      {noticia.conteudo &&
        noticia.conteudo.map((bloco, index) => (
          <div
            key={index}
            className={styles.block}
          >
            {bloco.subtitulo && (
              <h2>{bloco.subtitulo}</h2>
            )}

            {bloco.tipo === "texto" && (
              <p>{bloco.valor}</p>
            )}

            {bloco.tipo === "imagem" && (
              <img
                src={bloco.valor}
                alt={`Imagem ${index + 1} da notícia`}
                className={styles.image}
              />
            )}
          </div>
        ))}

      {fontes.length > 0 && (
        <section className={styles.fontes}>
          <h2>Fontes e referências</h2>

          <ul>
            {fontes.map((fonte, index) => (
              <li key={`${fonte.url}-${index}`}>
                <a
                  href={fonte.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {fonte.nome}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        to="/noticias"
        className={styles.backButton}
      >
        ← Voltar para Notícias
      </Link>
    </div>
  );
}

export default NoticiasDetalhe;