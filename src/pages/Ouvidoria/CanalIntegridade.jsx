import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import styles from "./CanalIntegridade.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function CanalIntegridade() {
  const [pagina, setPagina] = useState("inicio");
  const [etapa, setEtapa] = useState(1);
  const [concordou, setConcordou] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  const [resultado, setResultado] = useState({
    protocolo: "",
    codigoAcesso: "",
  });

  const [codigoConsulta, setCodigoConsulta] = useState("");
  const [consultaResultado, setConsultaResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const [erroConsulta, setErroConsulta] = useState("");

  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [solicitandoExportacao, setSolicitandoExportacao] =
    useState(false);

  const [baixandoExportacao, setBaixandoExportacao] =
    useState(false);

  const [codigoExportacao, setCodigoExportacao] =
    useState("");

  const [exportacaoSolicitada, setExportacaoSolicitada] =
    useState(false);

  const [erroExportacao, setErroExportacao] =
    useState("");

  const [formulario, setFormulario] = useState({
    identificado: null,
    nome: "",
    funcao: "",
    email: "",
    telefone: "",
    celular: "",
    tipo: "",
    local: "",
    descricao: "",
    anexos: [],
  });

  const limparFormulario = () => {
    setFormulario({
      identificado: null,
      nome: "",
      funcao: "",
      email: "",
      telefone: "",
      celular: "",
      tipo: "",
      local: "",
      descricao: "",
      anexos: [],
    });
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pagina, etapa]);

  const iniciarRelato = () => {
    limparFormulario();

    setPagina("relato");
    setEtapa(1);
    setConcordou(false);
    setErroEnvio("");
    setCodigoCopiado(false);
  };

  const iniciarAcompanhamento = () => {
    setPagina("acompanhar");
    setCodigoConsulta("");
    setConsultaResultado(null);
    setErroConsulta("");
  };

  const iniciarExportacao = () => {
    setPagina("exportar");

    setSolicitandoExportacao(false);
    setBaixandoExportacao(false);
    setCodigoExportacao("");
    setExportacaoSolicitada(false);
    setErroExportacao("");
  };

  const voltarInicio = () => {
    setPagina("inicio");
    setEtapa(1);
    setConcordou(false);
    setErroEnvio("");

    setResultado({
      protocolo: "",
      codigoAcesso: "",
    });

    setCodigoConsulta("");
    setConsultaResultado(null);
    setErroConsulta("");
    setCodigoCopiado(false);

    setSolicitandoExportacao(false);
    setBaixandoExportacao(false);
    setCodigoExportacao("");
    setExportacaoSolicitada(false);
    setErroExportacao("");
  };

  const continuar = () => {
    setErroEnvio("");
    setEtapa((atual) => atual + 1);
  };

  const voltarEtapa = () => {
    setErroEnvio("");

    if (etapa > 1) {
      setEtapa((atual) => atual - 1);
    }
  };

  const selecionarIdentificacao = (valor) => {
    setFormulario((atual) => ({
      ...atual,
      identificado: valor,
      nome: valor ? atual.nome : "",
      funcao: valor ? atual.funcao : "",
      telefone: valor ? atual.telefone : "",
      celular: valor ? atual.celular : "",
      email: "",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));
  };

  const handleArquivos = (event) => {
    const arquivos = Array.from(event.target.files);

    const limiteTotal = 100 * 1024 * 1024;

    const tamanhoTotal = arquivos.reduce(
      (total, arquivo) => total + arquivo.size,
      0
    );

    if (tamanhoTotal > limiteTotal) {
      alert(
        "O tamanho total dos arquivos não pode ultrapassar 100 MB."
      );

      event.target.value = "";

      setFormulario((atual) => ({
        ...atual,
        anexos: [],
      }));

      return;
    }

    setFormulario((atual) => ({
      ...atual,
      anexos: arquivos,
    }));
  };

  const identificacaoValida = () => {
    if (formulario.identificado === null) {
      return false;
    }

    if (formulario.identificado === false) {
      return true;
    }

    const possuiNome =
      formulario.nome.trim() !== "";

    const possuiFuncao =
      formulario.funcao.trim() !== "";

    const possuiContato =
      formulario.email.trim() !== "" ||
      formulario.telefone.trim() !== "" ||
      formulario.celular.trim() !== "";

    return (
      possuiNome &&
      possuiFuncao &&
      possuiContato
    );
  };

  const incidenteValido = () => {
    return (
      formulario.tipo.trim() !== "" &&
      formulario.descricao.trim().length >= 30
    );
  };

  const finalizarRelato = async () => {
    if (enviando) {
      return;
    }

    if (!identificacaoValida()) {
      setErroEnvio(
        "Verifique os dados de identificação antes de continuar."
      );
      return;
    }

    if (formulario.tipo.trim() === "") {
      setErroEnvio("Selecione o tipo do relato.");
      return;
    }

    if (formulario.descricao.trim().length < 30) {
      setErroEnvio(
        "A descrição deve conter pelo menos 30 caracteres."
      );
      return;
    }

    setEnviando(true);
    setErroEnvio("");

    try {
      const dados = new FormData();

      dados.append(
        "identificado",
        formulario.identificado ? "true" : "false"
      );

      dados.append(
        "nome",
        formulario.nome.trim()
      );

      dados.append(
        "funcao",
        formulario.funcao.trim()
      );

      dados.append(
        "email",
        formulario.email.trim()
      );

      dados.append(
        "telefone",
        formulario.telefone.trim()
      );

      dados.append(
        "celular",
        formulario.celular.trim()
      );

      dados.append(
        "tipo",
        formulario.tipo.trim()
      );

      dados.append(
        "local",
        formulario.local.trim()
      );

      dados.append(
        "descricao",
        formulario.descricao.trim()
      );

      formulario.anexos.forEach((arquivo) => {
        dados.append("anexos", arquivo);
      });

      const resposta = await fetch(
        `${API_URL}/api/canal-integridade`,
        {
          method: "POST",
          body: dados,
        }
      );

      let resultadoApi;

      try {
        resultadoApi = await resposta.json();
      } catch {
        resultadoApi = {};
      }

      if (!resposta.ok) {
        throw new Error(
          resultadoApi?.erro ||
            resultadoApi?.message ||
            "Não foi possível registrar o relato."
        );
      }

      setResultado({
        protocolo: resultadoApi.protocolo || "",
        codigoAcesso: resultadoApi.codigoAcesso || "",
      });

      setCodigoCopiado(false);

      limparFormulario();

      setEtapa(5);
    } catch (error) {
      console.error(
        "Erro ao enviar relato:",
        error
      );

      setErroEnvio(
        error.message ||
          "Não foi possível registrar o relato. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const copiarCodigoAcesso = async () => {
    if (!resultado.codigoAcesso) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        resultado.codigoAcesso
      );

      setCodigoCopiado(true);

      setTimeout(() => {
        setCodigoCopiado(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Erro ao copiar código:",
        error
      );

      setErroEnvio(
        "Não foi possível copiar automaticamente. Selecione e copie o código manualmente."
      );
    }
  };

  const consultarRelato = async () => {
    if (consultando) {
      return;
    }

    if (!codigoConsulta.trim()) {
      setErroConsulta(
        "Informe o código de acesso."
      );
      return;
    }

    setConsultando(true);
    setErroConsulta("");
    setConsultaResultado(null);

    try {
      const resposta = await fetch(
        `${API_URL}/api/canal-integridade/consultar`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            codigoAcesso:
              codigoConsulta.trim(),
          }),
        }
      );

      let dados;

      try {
        dados = await resposta.json();
      } catch {
        dados = {};
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            "Não foi possível consultar o relato."
        );
      }

      setConsultaResultado(
        dados.relato
      );
    } catch (error) {
      console.error(
        "Erro ao consultar relato:",
        error
      );

      setErroConsulta(
        error.message ||
          "Não foi possível consultar o relato."
      );
    } finally {
      setConsultando(false);
    }
  };

  const solicitarCodigoExportacao = async () => {
    if (solicitandoExportacao) {
      return;
    }

    setSolicitandoExportacao(true);
    setErroExportacao("");

    try {
      const resposta = await fetch(
        `${API_URL}/api/canal-integridade/exportar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let dados;

      try {
        dados = await resposta.json();
      } catch {
        dados = {};
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.erro ||
            "Não foi possível solicitar o código de autorização."
        );
      }

      setExportacaoSolicitada(true);

      if (dados.pendente) {
        setErroExportacao(
          "Já existe um código de autorização válido. Verifique o e-mail institucional."
        );
      }
    } catch (error) {
      console.error(
        "Erro ao solicitar código de exportação:",
        error
      );

      setErroExportacao(
        error.message ||
          "Não foi possível solicitar o código de autorização."
      );
    } finally {
      setSolicitandoExportacao(false);
    }
  };

  const baixarExportacao = async () => {
    if (baixandoExportacao) {
      return;
    }

    if (!codigoExportacao.trim()) {
      setErroExportacao(
        "Informe o código de autorização recebido por e-mail."
      );
      return;
    }

    setBaixandoExportacao(true);
    setErroExportacao("");

    try {
      const resposta = await fetch(
        `${API_URL}/api/canal-integridade/exportar/baixar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: codigoExportacao.trim(),
          }),
        }
      );

      let dados;

      try {
        dados = await resposta.json();
      } catch {
        dados = {};
      }

      if (!resposta.ok) {
        if (resposta.status === 410) {
          throw new Error(
            dados?.message ||
              "O código de autorização expirou ou já foi utilizado."
          );
        }

        if (resposta.status === 401) {
          throw new Error(
            dados?.message ||
              "Código de autorização inválido."
          );
        }

        throw new Error(
          dados?.message ||
            "Não foi possível realizar a exportação."
        );
      }

      if (
        !dados.sucesso ||
        !Array.isArray(dados.dados)
      ) {
        throw new Error(
          "O servidor não retornou os dados para exportação."
        );
      }

      const dadosExcel = dados.dados.map(
        (relato) => ({
          "Protocolo":
            relato.protocolo || "",

          "Data do registro":
            relato.data_registro
              ? new Date(
                  relato.data_registro
                ).toLocaleString("pt-BR")
              : "",

          "Status":
            relato.status || "",

          "Identificação":
            relato.identificado
              ? "Identificado"
              : "Anônimo",

          "Nome":
            relato.nome || "",

          "Função/Relação":
            relato.funcao || "",

          "E-mail":
            relato.email || "",

          "Telefone":
            relato.telefone || "",

          "Celular":
            relato.celular || "",

          "Tipo do relato":
            relato.tipo || "",

          "Local":
            relato.local || "",

          "Descrição":
            relato.descricao || "",

          "Quantidade de anexos":
            relato.quantidade_anexos ?? 0,
        })
      );

      const worksheet =
        XLSX.utils.json_to_sheet(
          dadosExcel
        );
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 22 },
        { wch: 16 },
        { wch: 15 },
        { wch: 30 },
        { wch: 32 },
        { wch: 32 },
        { wch: 18 },
        { wch: 18 },
        { wch: 42 },
        { wch: 30 },
        { wch: 70 },
        { wch: 20 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Relatos"
      );

      const excelBuffer = XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

      const fileData = new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }
      );

      const dataAtual = new Date();

      const ano =
        dataAtual.getFullYear();

      const mes = String(
        dataAtual.getMonth() + 1
      ).padStart(2, "0");

      const dia = String(
        dataAtual.getDate()
      ).padStart(2, "0");

      saveAs(
        fileData,
        `relatos-integridade-${ano}-${mes}-${dia}.xlsx`
      );

      setCodigoExportacao("");
      setExportacaoSolicitada(false);

    } catch (error) {
      console.error(
        "Erro ao baixar exportação:",
        error
      );

      setErroExportacao(
        error.message ||
          "Não foi possível realizar a exportação."
      );
    } finally {
      setBaixandoExportacao(false);
    }
  };

  if (pagina === "inicio") {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>FALE CONOSCO</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.secao}>

          <h2>Canal de Integridade</h2>

          <p>
            <strong>
              Um canal seguro para falar. Um compromisso permanente
              com a ética.
            </strong>
          </p>

          <p>
            O Canal de Integridade é um espaço exclusivo e seguro
            para o registro de relatos sobre situações que possam
            representar condutas antiéticas, descumprimento das
            normas e padrões de conduta, violações dos princípios
            institucionais ou da legislação vigente.
          </p>

          <p>
            O canal permite que a manifestação seja realizada de
            forma confidencial e, se desejado, anônima, proporcionando
            um ambiente seguro para que colaboradores, pacientes,
            familiares, fornecedores, parceiros e demais públicos
            possam relatar situações que mereçam atenção.
          </p>

          <p>
            Nosso compromisso é promover uma cultura baseada em
            ética, integridade, respeito, transparência e
            responsabilidade, fortalecendo relações de confiança
            e contribuindo para um ambiente cada vez mais íntegro
            e seguro.
          </p>

          <p>
            Se você identificou uma situação que precisa ser
            comunicada, utilize este canal. Sua manifestação é
            importante para fortalecer a nossa cultura de integridade.
          </p>

        </section>

        <section className={styles.secao}>

          <div className={styles.botoes}>

            <button
              type="button"
              className={styles.botao}
              onClick={iniciarRelato}
            >
              Realizar relato
            </button>

            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={iniciarAcompanhamento}
            >
              Acompanhar relato
            </button>

            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={iniciarExportacao}
            >
              Exportar relatos
            </button>

          </div>

        </section>

      </div>
    );
  }

  if (pagina === "exportar") {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.acompanhar}>

          {!exportacaoSolicitada ? (
            <>
              <h2>Exportar relatos</h2>

              <p>
                Esta função permite exportar os relatos registrados
                no Canal de Integridade para uma planilha Excel.
              </p>

              <p>
                Por segurança, é necessário solicitar um código de
                autorização. Esse código será enviado para o
                e-mail do Canal de Integridade.
              </p>

              <p>
                O código possui validade limitada e pode ser utilizado
                uma única vez.
              </p>

              {erroExportacao && (
                <div className={styles.erro}>
                  {erroExportacao}
                </div>
              )}

              <div className={styles.botoes}>

                <button
                  type="button"
                  className={styles.botao}
                  onClick={solicitarCodigoExportacao}
                  disabled={solicitandoExportacao}
                >
                  {solicitandoExportacao
                    ? "Solicitando..."
                    : "Solicitar código de autorização"}
                </button>

                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={voltarInicio}
                  disabled={solicitandoExportacao}
                >
                  Cancelar
                </button>

              </div>
            </>
          ) : (
            <>
              <h2>Autorizar exportação</h2>

              <p>
                Um código de autorização foi enviado para o
                e-mail do Canal de Integridade.
              </p>

              <p>
                Informe abaixo o código recebido para liberar
                a exportação dos relatos.
              </p>

              <div className={styles.formulario}>

                <div className={styles.campo}>

                  <label htmlFor="codigoExportacao">
                    Código de autorização
                  </label>

                  <input
                    id="codigoExportacao"
                    type="text"
                    value={codigoExportacao}
                    onChange={(event) => {
                      setCodigoExportacao(
                        event.target.value
                      );

                      setErroExportacao("");
                    }}
                    placeholder="Digite o código recebido por e-mail"
                    autoComplete="off"
                    spellCheck="false"
                  />

                </div>

              </div>

              {erroExportacao && (
                <div className={styles.erro}>
                  {erroExportacao}
                </div>
              )}

              <div className={styles.botoes}>

                <button
                  type="button"
                  className={styles.botao}
                  onClick={baixarExportacao}
                  disabled={baixandoExportacao}
                >
                  {baixandoExportacao
                    ? "Gerando Excel..."
                    : "Autorizar e baixar Excel"}
                </button>

                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={voltarInicio}
                  disabled={baixandoExportacao}
                >
                  Cancelar
                </button>

              </div>

            </>
          )}

        </section>

      </div>
    );
  }

  if (pagina === "acompanhar") {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.acompanhar}>

          {!consultaResultado ? (
            <>
              <h2>Acompanhar relato</h2>

              <p>
                Para acompanhar o andamento do seu relato,
                informe o código de acesso fornecido após
                o registro da manifestação.
              </p>

              <p>
                O código de acesso é necessário para consultar
                as informações do seu relato.
              </p>

              <div className={styles.formulario}>

                <div className={styles.campo}>

                  <label htmlFor="codigoAcessoConsulta">
                    Código de acesso
                  </label>

                  <input
                    id="codigoAcessoConsulta"
                    type="text"
                    value={codigoConsulta}
                    onChange={(event) => {
                      setCodigoConsulta(
                        event.target.value
                      );

                      setErroConsulta("");
                    }}
                    placeholder="Digite o código de acesso"
                    autoComplete="off"
                  />

                </div>

              </div>

              {erroConsulta && (
                <div className={styles.erro}>
                  {erroConsulta}
                </div>
              )}

              <div className={styles.botoes}>

                <button
                  type="button"
                  className={styles.botao}
                  onClick={consultarRelato}
                  disabled={consultando}
                >
                  {consultando
                    ? "Consultando..."
                    : "Consultar relato"}
                </button>

                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={voltarInicio}
                  disabled={consultando}
                >
                  Cancelar
                </button>

              </div>
            </>
          ) : (
            <>
              <h2>Acompanhamento do relato</h2>

              <p>
                Confira abaixo as informações disponíveis
                sobre o andamento do seu relato.
              </p>

              <div className={styles.resumo}>

                <p>
                  <strong>Protocolo:</strong>{" "}
                  {consultaResultado.protocolo}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {consultaResultado.status}
                </p>

                <p>
                  <strong>Data do registro:</strong>{" "}
                  {consultaResultado.data_registro
                    ? new Date(
                        consultaResultado.data_registro
                      ).toLocaleString("pt-BR")
                    : "Não informado"}
                </p>

                <p>
                  <strong>Tipo do relato:</strong>{" "}
                  {consultaResultado.tipo}
                </p>

                <p>
                  <strong>Local do ocorrido:</strong>{" "}
                  {consultaResultado.local ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Descrição:</strong>
                </p>

                <div
                  className={
                    styles.descricaoResumo
                  }
                >
                  {consultaResultado.descricao}
                </div>

              </div>

              <h3>Mensagens</h3>

              {consultaResultado.mensagens &&
              consultaResultado.mensagens.length > 0 ? (
                <div className={styles.resumo}>

                  {consultaResultado.mensagens.map(
                    (item) => (
                      <div
                        key={item.id}
                        className={
                          styles.descricaoResumo
                        }
                      >

                        <p>
                          <strong>
                            HMAA
                          </strong>
                        </p>

                        <p>
                          {item.mensagem}
                        </p>

                        <small>
                          {item.data_envio
                            ? new Date(
                                item.data_envio
                              ).toLocaleString(
                                "pt-BR"
                              )
                            : ""}
                        </small>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p>
                  Ainda não há mensagens relacionadas
                  a este relato.
                </p>
              )}

              <div className={styles.botoes}>

                <button
                  type="button"
                  className={
                    styles.botaoSecundario
                  }
                  onClick={() => {
                    setConsultaResultado(null);
                    setErroConsulta("");
                    setCodigoConsulta("");
                  }}
                >
                  Nova consulta
                </button>

                <button
                  type="button"
                  className={
                    styles.botaoSecundario
                  }
                  onClick={voltarInicio}
                >
                  Voltar
                </button>

              </div>

            </>
          )}

        </section>

      </div>
    );
  }

  if (
    pagina === "relato" &&
    etapa === 1
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.relato}>

          <h2>
            Antes de realizar seu relato
          </h2>

          <p>
            A veracidade das informações providas é uma
            responsabilidade do relator. Todas as informações serão
            verificadas durante o processo de averiguação, e as ações
            decorrentes serão tomadas a critério exclusivo do HMAA.
          </p>

          <h2>Proteção de Dados</h2>

          <p>
            Todas as informações aqui registradas serão tratadas
            de forma confidencial.
          </p>

          <p>
            A captação dessas informações tem por finalidade a
            apuração de possíveis condutas consideradas antiéticas
            ou que violem os princípios éticos e padrões de conduta
            e/ou a legislação vigente.
          </p>

          <p>
            Todos os relatos serão armazenados por tempo
            indeterminado para realização do processo de apuração
            e deliberação sobre o caso, observando-se as exigências
            legais específicas. Além disso, informações consolidadas
            serão utilizadas para geração de estatísticas da operação,
            mas nenhum nome envolvido ou dado pessoal será exposto.
          </p>

          <p>
            Eventuais dados pessoais informados serão tratados
            conforme as normativas estabelecidas pela legislação
            vigente no que diz respeito à proteção de dados pessoais,
            e serão seguidas no processo de captação e pela sua
            organização no processo de apuração dos relatados aqui
            registrados.
          </p>

          <p>
            Ao clicar em "Concordo" você indica ciência e
            concordância com o fornecimento de informações que serão
            única e exclusivamente utilizadas para esta finalidade.
          </p>

          <div className={styles.declaracao}>

            <label>

              <input
                type="checkbox"
                checked={concordou}
                onChange={(event) =>
                  setConcordou(
                    event.target.checked
                  )
                }
              />

              <span>
                Declaro que li e compreendi as informações acima,
                e desejo prosseguir com a manifestação.
              </span>

            </label>

          </div>

          <div className={styles.barraBotoes}>

            <button
              type="button"
              className={
                styles.botaoSecundario
              }
              onClick={voltarInicio}
            >
              Voltar
            </button>

            <button
              type="button"
              className={styles.botao}
              onClick={continuar}
              disabled={!concordou}
            >
              Concordo e continuar
            </button>

          </div>

        </section>

      </div>
    );
  }

  if (
    pagina === "relato" &&
    etapa === 2
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.relato}>

          <h2>
            Você deseja se identificar?
          </h2>

          <p>
            Você pode optar por realizar seu relato de forma
            anônima ou identificada.
          </p>

          <p>
            Ao escolher a opção identificada, você poderá ser
            contatado caso sejam necessários esclarecimentos ou
            informações adicionais para a adequada análise do relato.
          </p>

          <p>
            Os relatos identificados podem contribuir para o
            esclarecimento dos fatos e para uma apuração mais completa.
            Reforçamos que este é um canal seguro e confiável, que
            preserva a confidencialidade das informações fornecidas.
          </p>

          <h3>
            Como você deseja realizar seu relato?
          </h3>

          <div className={styles.opcoes}>

            <button
              type="button"
              className={
                formulario.identificado === true
                  ? styles.opcaoSelecionada
                  : styles.opcao
              }
              onClick={() =>
                selecionarIdentificacao(true)
              }
            >
              Sim, quero me identificar
            </button>

            <button
              type="button"
              className={
                formulario.identificado === false
                  ? styles.opcaoSelecionada
                  : styles.opcao
              }
              onClick={() =>
                selecionarIdentificacao(false)
              }
            >
              Não, prefiro permanecer anônimo
            </button>

          </div>

          {formulario.identificado === true && (
            <div className={styles.formulario}>

              <div className={styles.campo}>

                <label htmlFor="nome">
                  Nome *
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                />

              </div>

              <div className={styles.campo}>

                <label htmlFor="funcao">
                  Função ou sua relação com a empresa *
                </label>

                <input
                  id="funcao"
                  name="funcao"
                  type="text"
                  value={formulario.funcao}
                  onChange={handleChange}
                  placeholder="Informe sua função ou relação"
                />

              </div>

              <p className={styles.observacao}>
                É necessário preencher pelo menos um dos campos
                abaixo:
              </p>

              <div className={styles.campo}>

                <label htmlFor="email">
                  E-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formulario.email}
                  onChange={handleChange}
                  placeholder="Digite seu e-mail"
                />

              </div>

              <div className={styles.campo}>

                <label htmlFor="telefone">
                  Celular
                </label>

                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formulario.telefone}
                  onChange={handleChange}
                  placeholder="Digite seu celular"
                />

              </div>

              <div className={styles.campo}>

                <label htmlFor="celular">
                  Telefone
                </label>

                <input
                  id="celular"
                  name="celular"
                  type="tel"
                  value={formulario.celular}
                  onChange={handleChange}
                  placeholder="Digite seu telefone"
                />

              </div>

            </div>
          )}

          {formulario.identificado === false && (
            <div className={styles.formulario}>

              <div className={styles.campo}>

                <label htmlFor="emailAnonimo">
                  E-mail
                </label>

                <input
                  id="emailAnonimo"
                  name="email"
                  type="email"
                  value={formulario.email}
                  onChange={handleChange}
                  placeholder="Digite um e-mail que não permita sua identificação"
                />

                <small>
                  Se seu relato for anônimo, utilize endereço de
                  e-mail que não permita a sua identificação
                  (ex.: anonimo123@gmail.com).
                </small>

              </div>

            </div>
          )}

          <div className={styles.barraBotoes}>

            <button
              type="button"
              className={
                styles.botaoSecundario
              }
              onClick={voltarEtapa}
            >
              Voltar
            </button>

            <button
              type="button"
              className={styles.botao}
              onClick={continuar}
              disabled={!identificacaoValida()}
            >
              Continuar
            </button>

          </div>

        </section>

      </div>
    );
  }

  if (
    pagina === "relato" &&
    etapa === 3
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.relato}>

          <h2>Dados do incidente</h2>

          <p>
            Por favor, descreva a situação que o motiva a procurar
            este canal. É importante que seu relato seja completo
            e detalhado. Não se esqueça de incluir na descrição:
          </p>

          <div className={styles.destaque}>

            <p>
              <strong>O quê:</strong> descrição da situação;
            </p>

            <p>
              <strong>Quem:</strong> nome das pessoas envolvidas,
              inclusive testemunhas;
            </p>

            <p>
              <strong>Quando:</strong> data em que aconteceu,
              acontece ou acontecerá a situação;
            </p>

            <p>
              <strong>Onde:</strong> local do ocorrido;
            </p>

            <p>
              <strong>Por que:</strong> a causa ou motivo;
            </p>

            <p>
              <strong>Quanto:</strong> se for possível medir;
            </p>

            <p>
              <strong>Provas:</strong> se elas existem e onde
              podem ser encontradas.
            </p>

          </div>

          <p>
            Para acompanhar o andamento de seu relato, você
            receberá um código de acesso que será fornecido
            após o registro do relato.
          </p>

          <p>
            Agradecemos sua iniciativa e confiança.
          </p>

          <div className={styles.formulario}>

            <div className={styles.campo}>

              <label htmlFor="tipo">
                Tipo do relato *
              </label>

              <select
                id="tipo"
                name="tipo"
                value={formulario.tipo}
                onChange={handleChange}
                required
              >

                <option value="">
                  Selecione...
                </option>

                <option value="Ambiente de trabalho digno e harmonioso">
                  Ambiente de trabalho digno e harmonioso
                </option>

                <option value="Diversidade">
                  Diversidade
                </option>

                <option value="Cordialidade no ambiente de trabalho">
                  Cordialidade no ambiente de trabalho
                </option>

                <option value="Saúde e segurança no ambiente de trabalho">
                  Saúde e segurança no ambiente de trabalho
                </option>

                <option value="Privacidade e proteção de dados pessoais">
                  Privacidade e proteção de dados pessoais
                </option>

                <option value="Uso de álcool, drogas ou medicamentos">
                  Uso de álcool, drogas ou medicamentos
                </option>

                <option value="Brindes, entretenimento ou hospitalidade">
                  Brindes, entretenimento ou hospitalidade
                </option>

                <option value="Conduta profissional e corpo clínico">
                  Conduta profissional e corpo clínico
                </option>

                <option value="Bens do HMAA">
                  Bens do HMAA
                </option>

                <option value="Uso adequado de recursos e preservação dos materiais">
                  Uso adequado de recursos e preservação dos materiais
                </option>

                <option value="Senhas e acessos">
                  Senhas e acessos
                </option>

                <option value="Registros e precisão das informações">
                  Registros e precisão das informações
                </option>

                <option value="Propriedade intelectual">
                  Propriedade intelectual
                </option>

                <option value="Confidencialidade das informações">
                  Confidencialidade das informações
                </option>

                <option value="Mídias sociais e publicidade">
                  Mídias sociais e publicidade
                </option>

                <option value="Conflito de interesses">
                  Conflito de interesses
                </option>

                <option value="Contratação de parentes">
                  Contratação de parentes
                </option>

                <option value="Fofoca no ambiente de trabalho">
                  Fofoca no ambiente de trabalho
                </option>

                <option value="Assédio moral">
                  Assédio moral
                </option>

                <option value="Assédio sexual">
                  Assédio sexual
                </option>

                <option value="Pacientes e seus familiares">
                  Pacientes e seus familiares
                </option>

                <option value="Fotografias e vídeos">
                  Fotografias e vídeos
                </option>

                <option value="Direitos humanos e trabalho infantil ou degradante">
                  Direitos humanos e trabalho infantil ou degradante
                </option>

                <option value="Discriminação">
                  Discriminação
                </option>

                <option value="Meio ambiente">
                  Meio ambiente
                </option>

                <option value="Fornecedores">
                  Fornecedores
                </option>

                <option value="Operadoras, planos e seguros de saúde">
                  Operadoras, planos e seguros de saúde
                </option>

                <option value="Corrupção e suborno">
                  Corrupção e suborno
                </option>

                <option value="Contribuições políticas">
                  Contribuições políticas
                </option>

                <option value="Doações e patrocínios">
                  Doações e patrocínios
                </option>

                <option value="Atividades políticas, associativas e comunitárias">
                  Atividades políticas, associativas e comunitárias
                </option>

                <option value="Concorrência">
                  Concorrência
                </option>

                <option value="Preceptores, residentes e alunos">
                  Preceptores, residentes e alunos
                </option>

                <option value="Conformidade legal">
                  Conformidade legal
                </option>

                <option value="Lei Geral de Proteção de Dados – LGPD">
                  Lei Geral de Proteção de Dados – LGPD
                </option>

                <option value="Violação das diretrizes do Código de Ética e Conduta">
                  Violação das diretrizes do Código de Ética e Conduta
                </option>

                <option value="Outro">
                  Outro
                </option>

              </select>

            </div>

            <div className={styles.campo}>

              <label htmlFor="local">
                Local do ocorrido
              </label>

              <input
                id="local"
                name="local"
                type="text"
                value={formulario.local}
                onChange={handleChange}
                placeholder="Informe o local do ocorrido"
              />

            </div>

            <div className={styles.campo}>

              <label htmlFor="descricao">
                Descrição *
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={formulario.descricao}
                onChange={handleChange}
                minLength={30}
                placeholder="Descreva a situação com o máximo de detalhes possível"
              />

              <small>
                Mínimo de 30 caracteres.
              </small>

            </div>

            <div className={styles.campo}>

              <label htmlFor="anexos">
                Anexar arquivo
              </label>

              <input
                id="anexos"
                type="file"
                multiple
                onChange={handleArquivos}
              />

              <small>
                Se você quiser anexar arquivos como fotos e documentos,
                adicione-os aqui. O tamanho máximo do conjunto de
                arquivos é de 100 MB.
              </small>

              {formulario.anexos.length > 0 && (
                <small>
                  {formulario.anexos.length} arquivo(s)
                  selecionado(s).
                </small>
              )}

            </div>

          </div>

          <div className={styles.barraBotoes}>

            <button
              type="button"
              className={
                styles.botaoSecundario
              }
              onClick={voltarEtapa}
            >
              Voltar
            </button>

            <button
              type="button"
              className={styles.botao}
              onClick={continuar}
              disabled={!incidenteValido()}
            >
              Continuar
            </button>

          </div>

        </section>

      </div>
    );
  }

  if (
    pagina === "relato" &&
    etapa === 4
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.relato}>

          <h2>Revisar relato</h2>

          <p>
            Confira as informações antes de registrar seu relato.
          </p>

          <div className={styles.resumo}>

            <p>
              <strong>Tipo do relato:</strong>{" "}
              {formulario.tipo}
            </p>

            <p>
              <strong>Local do ocorrido:</strong>{" "}
              {formulario.local ||
                "Não informado"}
            </p>

            <p>
              <strong>Identificação:</strong>{" "}
              {formulario.identificado
                ? "Identificado"
                : "Anônimo"}
            </p>

            {formulario.identificado && (
              <>
                <p>
                  <strong>Nome:</strong>{" "}
                  {formulario.nome}
                </p>

                <p>
                  <strong>Função ou relação:</strong>{" "}
                  {formulario.funcao}
                </p>

                {formulario.email && (
                  <p>
                    <strong>E-mail:</strong>{" "}
                    {formulario.email}
                  </p>
                )}

                {formulario.telefone && (
                  <p>
                    <strong>Telefone:</strong>{" "}
                    {formulario.telefone}
                  </p>
                )}

                {formulario.celular && (
                  <p>
                    <strong>Celular:</strong>{" "}
                    {formulario.celular}
                  </p>
                )}
              </>
            )}

            {!formulario.identificado &&
              formulario.email && (
                <p>
                  <strong>E-mail:</strong>{" "}
                  {formulario.email}
                </p>
              )}

            <p>
              <strong>Descrição:</strong>
            </p>

            <div
              className={
                styles.descricaoResumo
              }
            >
              {formulario.descricao}
            </div>

            <p>
              <strong>Anexos:</strong>{" "}
              {formulario.anexos.length} arquivo(s)
            </p>

          </div>

          {erroEnvio && (
            <div className={styles.erro}>
              {erroEnvio}
            </div>
          )}

          <div className={styles.barraBotoes}>

            <button
              type="button"
              className={
                styles.botaoSecundario
              }
              onClick={voltarEtapa}
              disabled={enviando}
            >
              Voltar
            </button>

            <button
              type="button"
              className={styles.botao}
              onClick={finalizarRelato}
              disabled={enviando}
            >
              {enviando
                ? "Enviando..."
                : "Gravar"}
            </button>

          </div>

        </section>

      </div>
    );
  }

  if (
    pagina === "relato" &&
    etapa === 5
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>CANAL DE INTEGRIDADE</h1>
          <div className={styles.linha}></div>
        </div>

        <section className={styles.confirmacao}>

          <h2>
            Relato registrado
          </h2>

          <p>
            Agradecemos sua iniciativa e confiança.
          </p>

          <p>
            Seu relato foi registrado com sucesso.
            Para acompanhar posteriormente o andamento
            da manifestação, utilize o código de acesso
            abaixo.
          </p>

          <div
            className={styles.protocolo}
            onClick={copiarCodigoAcesso}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                copiarCodigoAcesso();
              }
            }}
            role="button"
            tabIndex={0}
            title="Clique para copiar o código de acesso"
            style={{
              cursor: "pointer",
              userSelect: "none",
            }}
          >

            <strong>
              Código de acesso
            </strong>

            <br />

            <span>
              {resultado.codigoAcesso}
            </span>

            <br />

            <small>
              {codigoCopiado
                ? "Código copiado!"
                : "Clique para copiar"}
            </small>

          </div>

          <p>
            <strong>Importante:</strong> guarde este
            código em local seguro. Ele será necessário
            para consultar posteriormente o andamento
            do seu relato.
          </p>

          <p>
            Por segurança, o código de acesso não poderá
            ser recuperado caso seja perdido.
          </p>

          <div className={styles.botoes}>

            <button
              type="button"
              className={styles.botao}
              onClick={copiarCodigoAcesso}
            >
              {codigoCopiado
                ? "Código copiado!"
                : "Copiar código de acesso"}
            </button>

            <button
              type="button"
              className={
                styles.botaoSecundario
              }
              onClick={voltarInicio}
            >
              Voltar para o Canal de Integridade
            </button>

          </div>

        </section>

      </div>
    );
  }
  return null;
}
export default CanalIntegridade;