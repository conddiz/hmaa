import { useState, useRef } from "react";
import axios from "axios";
import styles from "./TrabalheConosco.module.css";

function TrabalheConosco() {

  const [arquivo, setArquivo] = useState("Nenhum arquivo selecionado");
  const [telefone, setTelefone] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const fileRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  function handleFile(e) {

    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Apenas arquivos PDF ou DOC/DOCX são permitidos.");
      e.target.value = "";
      setArquivo("Nenhum arquivo selecionado");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("O arquivo deve ter no máximo 10MB.");
      e.target.value = "";
      setArquivo("Nenhum arquivo selecionado");
      return;
    }

    setArquivo(file.name);
  }

  function handleTelefone(e) {

    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d+)/, "($1) $2");
    } else {
      value = value.replace(/(\d*)/, "($1");
    }

    setTelefone(value);
  }

  async function handleSubmit(e) {

    e.preventDefault();

    const form = e.currentTarget;

    setLoading(true);
    setProgresso(0);

    const formData = new FormData(form);

    try {

      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/trabalhe-conosco`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },

          onUploadProgress: (progressEvent) => {

            if (progressEvent.total) {

              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              setProgresso(percent);
            }

          }
        }
      );

      if (resp.status === 200) {

        setEnviado(true);

        form.reset();

        setTelefone("");
        setArquivo("Nenhum arquivo selecionado");

        if (fileRef.current) {
          fileRef.current.value = "";
        }

        setTimeout(() => {
          window.location.reload();
        }, 10000);

      }

    } catch (error) {

      console.error(error);
      alert("Erro ao enviar formulário.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className={styles.container}>

      <div className={styles.header}>
        <h1>TRABALHE CONOSCO</h1>
        <div className={styles.linha}></div>
      </div>

      <div className={styles.wrapper}>

        <div className={styles.left}>

          <p>
            Se você acredita que cuidar de pessoas é mais do que uma
            profissão, é uma missão, o Hospital e Maternidade
            Dr. Agenor Araújo abre as portas para talentos
            que desejam fazer a diferença todos os dias.
          </p>

          <p>
            Aqui você encontrará um ambiente de trabalho colaborativo,
            oportunidades de desenvolvimento e a chance de contribuir
            com uma instituição que tem como propósito promover saúde,
            cuidado e bem-estar à comunidade.
          </p>

          <p>
            Cadastre seu currículo em nosso banco de talentos e venha
            fazer parte da nossa equipe.
          </p>

          <p>
            Juntos, cuidamos de vidas.
          </p>

        </div>

        <div className={styles.right}>

          {enviado && (
            <div className={styles.sucesso}>
              Currículo enviado com sucesso ✔
            </div>
          )}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >

            <div className={styles.row}>

              <div className={styles.inputGroup}>

                <label>NOME *</label>

                <input
                  name="nome"
                  type="text"
                  required
                />

              </div>

              <div className={styles.inputGroup}>

                <label>EMAIL *</label>

                <input
                  name="email"
                  type="email"
                  required
                />

              </div>

            </div>

            <div className={styles.inputGroup}>

              <label>TELEFONE</label>

              <input
                name="telefone"
                type="text"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={handleTelefone}
              />

            </div>

            <div className={styles.inputGroup}>

              <label>ÁREA DE INTERESSE *</label>

              <textarea
                name="area"
                rows="4"
                required
              ></textarea>

            </div>

            <div className={styles.inputGroup}>

              <label>CURRÍCULO *</label>

              <div className={styles.fileUpload}>

                <label className={styles.fileButton}>

                  Escolher arquivo

                  <input
                    ref={fileRef}
                    type="file"
                    name="curriculo"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFile}
                    required
                  />

                </label>

                <span className={styles.fileName}>
                  {arquivo}
                </span>

              </div>

            </div>

            <button
              className={styles.botao}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>

          </form>

        </div>

      </div>

    </div>

  );

}

export default TrabalheConosco;