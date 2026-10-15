import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import styles from './Ouvidoria.module.css';

function Ouvidoria() {
  const [tipo, setTipo] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');

  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const [telaExportacao, setTelaExportacao] = useState(false);
  const [etapaExportacao, setEtapaExportacao] = useState('solicitar');

  const [codigoExportacao, setCodigoExportacao] = useState('');
  const [solicitandoCodigo, setSolicitandoCodigo] = useState(false);
  const [baixandoExportacao, setBaixandoExportacao] = useState(false);

  const [mensagemExportacao, setMensagemExportacao] = useState('');
  const [erroExportacao, setErroExportacao] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (descricao.trim().length < 30) {
      setErro('A descrição deve conter pelo menos 30 caracteres.');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      const resposta = await fetch(
        'http://localhost:5000/api/ouvidoria',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tipo,
            nome,
            email,
            telefone,
            descricao
          })
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            'Não foi possível registrar a manifestação.'
        );
      }

      setEnviado(true);

      setTimeout(() => {
        setTipo('');
        setNome('');
        setEmail('');
        setTelefone('');
        setDescricao('');
        setErro('');
        setEnviado(false);
      }, 10000);

    } catch (error) {
      console.error(
        'Erro ao enviar manifestação:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível enviar sua manifestação. Tente novamente.'
      );

    } finally {
      setEnviando(false);
    }
  };

  const abrirExportacao = () => {
    setTelaExportacao(true);
    setEtapaExportacao('solicitar');
    setCodigoExportacao('');
    setMensagemExportacao('');
    setErroExportacao('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const fecharExportacao = () => {
    setTelaExportacao(false);
    setEtapaExportacao('solicitar');
    setCodigoExportacao('');
    setMensagemExportacao('');
    setErroExportacao('');
  };

  const solicitarCodigoExportacao = async () => {
    setSolicitandoCodigo(true);
    setErroExportacao('');
    setMensagemExportacao('');

    try {
      const resposta = await fetch(
        'http://localhost:5000/api/ouvidoria/exportar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            'Não foi possível solicitar o código de exportação.'
        );
      }

      if (dados.pendente) {
        setMensagemExportacao(
          dados.message ||
            'Já existe um código válido pendente. Verifique o e-mail.'
        );
      } else {
        setMensagemExportacao(
          dados.message ||
            'Código de autorização enviado para o e-mail.'
        );
      }

      setEtapaExportacao('codigo');

    } catch (error) {
      console.error(
        'Erro ao solicitar código de exportação:',
        error
      );

      setErroExportacao(
        error.message ||
          'Não foi possível solicitar o código de exportação.'
      );

    } finally {
      setSolicitandoCodigo(false);
    }
  };

  const exportarXlsx = async () => {
    if (!codigoExportacao.trim()) {
      setErroExportacao(
        'Digite o código de autorização.'
      );
      return;
    }

    setBaixandoExportacao(true);
    setErroExportacao('');
    setMensagemExportacao('');

    try {
      const resposta = await fetch(
        'http://localhost:5000/api/ouvidoria/exportar/baixar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: codigoExportacao.trim()
          })
        }
      );

      const dadosResposta = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dadosResposta.message ||
            'Não foi possível realizar a exportação.'
        );
      }

      if (
        !dadosResposta.sucesso ||
        !Array.isArray(dadosResposta.dados)
      ) {
        throw new Error(
          'Nenhum dado válido foi retornado para a exportação.'
        );
      }

      const dadosPlanilha = dadosResposta.dados.map((item) => ({
        Protocolo: item.protocolo || '',
        'Data do Registro': item.data_registro
          ? new Date(item.data_registro).toLocaleString('pt-BR')
          : '',
        Tipo: item.tipo || '',
        Nome: item.nome || '',
        'E-mail': item.email || '',
        Telefone: item.telefone || '',
        Descrição: item.descricao || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(
        dadosPlanilha
      );

      worksheet['!cols'] = [
        { wch: 18 },
        { wch: 22 },
        { wch: 18 },
        { wch: 30 },
        { wch: 35 },
        { wch: 18 },
        { wch: 80 }
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Ouvidoria'
      );

      const arquivoXlsx = XLSX.write(
        workbook,
        {
          bookType: 'xlsx',
          type: 'array'
        }
      );

      const blob = new Blob(
        [arquivoXlsx],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      );

      saveAs(
        blob,
        `ouvidoria-${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      setMensagemExportacao(
        'Exportação realizada com sucesso.'
      );

      setCodigoExportacao('');

      setTimeout(() => {
        fecharExportacao();
      }, 2500);

    } catch (error) {
      console.error(
        'Erro ao exportar Ouvidoria:',
        error
      );

      setErroExportacao(
        error.message ||
          'Não foi possível realizar a exportação.'
      );

    } finally {
      setBaixandoExportacao(false);
    }
  };

  return (
    <main className={styles.container}>
      {enviado ? (
        <section className={styles.formularioSecao}>
          <div className={styles.confirmacao}>
            <h3>
              Manifestação registrada
            </h3>

            <p>
              Sua manifestação foi registrada
              com sucesso.
            </p>

            <p>
              A Ouvidoria analisará sua manifestação
              e poderá entrar em contato pelo e-mail
              informado.
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className={styles.header}>
            <h1>FALE CONOSCO</h1>
            <div className={styles.linha}></div>
          </div>

          <h2 className={styles.tituloPagina}>
            OUVIDORIA
          </h2>

          {!telaExportacao && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '20px'
              }}
            >
              <button
                type="button"
                onClick={abrirExportacao}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px',
                  border: '1px solid #188E5A',
                  background: '#ffffff',
                  color: '#188E5A',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Exportar XLSX
              </button>
            </div>
          )}

          {telaExportacao ? (
            <section className={styles.formularioSecao}>
              <div className={styles.formularioCabecalho}>
                <h2>
                  Exportação de manifestações
                </h2>

                {etapaExportacao === 'solicitar' && (
                  <p>
                    Para exportar os registros da Ouvidoria,
                    solicite um código de autorização.
                  </p>
                )}

                {etapaExportacao === 'codigo' && (
                  <p>
                    Digite abaixo o código de autorização
                    recebido no e-mail institucional.
                  </p>
                )}
              </div>

              <div className={styles.formulario}>
                {etapaExportacao === 'solicitar' && (
                  <>
                    <p
                      style={{
                        marginBottom: '20px',
                        lineHeight: '1.6'
                      }}
                    >
                      O código será enviado para o e-mail da Ouvidoria.
                    </p>

                    {mensagemExportacao && (
                      <p
                        style={{
                          color: '#188E5A',
                          marginBottom: '15px'
                        }}
                      >
                        {mensagemExportacao}
                      </p>
                    )}

                    {erroExportacao && (
                      <p
                        style={{
                          color: '#b42318',
                          marginBottom: '15px'
                        }}
                      >
                        {erroExportacao}
                      </p>
                    )}

                    <div className={styles.barraBotoes}>
                      <button
                        type="button"
                        onClick={solicitarCodigoExportacao}
                        className={styles.botao}
                        disabled={solicitandoCodigo}
                      >
                        {solicitandoCodigo
                          ? 'Solicitando...'
                          : 'Solicitar código'}
                      </button>

                      <button
                        type="button"
                        onClick={fecharExportacao}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          background: '#fff',
                          color: '#333',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}

                {etapaExportacao === 'codigo' && (
                  <>
                    <div className={styles.campo}>
                      <label htmlFor="codigoExportacao">
                        Código de autorização
                      </label>

                      <input
                        id="codigoExportacao"
                        type="text"
                        value={codigoExportacao}
                        onChange={(event) =>
                          setCodigoExportacao(event.target.value)
                        }
                        placeholder="Digite o código recebido"
                        autoComplete="off"
                      />
                    </div>

                    {mensagemExportacao && (
                      <p
                        style={{
                          color: '#188E5A',
                          marginTop: '10px',
                          marginBottom: '10px'
                        }}
                      >
                        {mensagemExportacao}
                      </p>
                    )}

                    {erroExportacao && (
                      <p
                        style={{
                          color: '#b42318',
                          marginTop: '10px',
                          marginBottom: '10px'
                        }}
                      >
                        {erroExportacao}
                      </p>
                    )}

                    <div className={styles.barraBotoes}>
                      <button
                        type="button"
                        onClick={exportarXlsx}
                        className={styles.botao}
                        disabled={baixandoExportacao}
                      >
                        {baixandoExportacao
                          ? 'Exportando...'
                          : 'Exportar XLSX'}
                      </button>

                      <button
                        type="button"
                        onClick={fecharExportacao}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          background: '#fff',
                          color: '#333',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          ) : (
            <>
              <section className={styles.secao}>
                <h2>
                  Sua voz contribui para transformar a nossa saúde.
                </h2>

                <p>
                  A Ouvidoria é um canal de escuta,
                  participação e diálogo entre o cidadão
                  e a instituição. Nosso objetivo é acolher
                  manifestações, sugestões, elogios,
                  reclamações, solicitações e demais
                  contribuições, fortalecendo a participação
                  do cidadão e contribuindo para a melhoria
                  contínua dos serviços de saúde.
                </p>

                <p>
                  Atuamos de forma ética, imparcial,
                  transparente e responsável, em parceria
                  com os gestores e áreas técnicas
                  competentes, buscando analisar cada
                  manifestação e contribuir para o
                  aprimoramento dos processos e da qualidade
                  da assistência.
                </p>

                <p>
                  Fale conosco. Sua manifestação é importante
                  para nós e pode contribuir para um
                  atendimento cada vez mais humanizado,
                  seguro e de qualidade.
                </p>
              </section>

              <section className={styles.secao}>
                <h2>
                  Tipos de manifestação
                </h2>

                <ul className={styles.lista}>
                  <li>
                    <strong>RECLAMAÇÃO:</strong>{' '}
                    Insatisfação com o serviço.
                  </li>

                  <li>
                    <strong>ELOGIO:</strong>{' '}
                    Satisfação com o atendimento ou serviço.
                  </li>

                  <li>
                    <strong>SUGESTÃO:</strong>{' '}
                    Propor ações de melhorias dos serviços.
                  </li>

                  <li>
                    <strong>SOLICITAÇÃO:</strong>{' '}
                    Requerimento de adoção de
                    providência por parte da administração
                    do órgão.
                  </li>

                  <li>
                    <strong>INFORMAÇÃO:</strong>{' '}
                    Para obter informações produzidas ou
                    custodiadas pela administração pública.
                  </li>
                </ul>
              </section>

              <section className={styles.formularioSecao}>
                <div className={styles.formularioCabecalho}>
                  <h2>
                    Registre sua manifestação
                  </h2>

                  <p>
                    Preencha os campos abaixo para registrar
                    sua manifestação junto à Ouvidoria do HMAA.
                  </p>
                </div>

                <form
                  className={styles.formulario}
                  onSubmit={handleSubmit}
                >
                  <div className={styles.campo}>
                    <label htmlFor="tipo">
                      Tipo de manifestação{' '}
                      <span>*</span>
                    </label>

                    <select
                      id="tipo"
                      value={tipo}
                      onChange={(event) =>
                        setTipo(event.target.value)
                      }
                      required
                    >
                      <option value="">
                        Selecione uma opção
                      </option>

                      <option value="Reclamação">
                        Reclamação
                      </option>

                      <option value="Elogio">
                        Elogio
                      </option>

                      <option value="Sugestão">
                        Sugestão
                      </option>

                      <option value="Solicitação">
                        Solicitação
                      </option>

                      <option value="Informação">
                        Informação
                      </option>
                    </select>
                  </div>

                  <div className={styles.linhaCampos}>
                    <div className={styles.campo}>
                      <label htmlFor="nome">
                        Nome <span>*</span>
                      </label>

                      <input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(event) =>
                          setNome(event.target.value)
                        }
                        placeholder="Digite seu nome"
                        required
                      />
                    </div>

                    <div className={styles.campo}>
                      <label htmlFor="telefone">
                        Telefone
                      </label>

                      <input
                        id="telefone"
                        type="tel"
                        value={telefone}
                        onChange={(event) =>
                          setTelefone(event.target.value)
                        }
                        placeholder="Digite seu telefone"
                      />
                    </div>
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="email">
                      E-mail <span>*</span>
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Digite seu e-mail"
                      required
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="descricao">
                      Descrição <span>*</span>
                    </label>

                    <textarea
                      id="descricao"
                      value={descricao}
                      onChange={(event) =>
                        setDescricao(event.target.value)
                      }
                      placeholder="Descreva sua manifestação com o máximo de detalhes possível."
                      rows="7"
                      minLength={30}
                      required
                    />

                    <small>
                      Mínimo de 30 caracteres.
                    </small>
                  </div>

                  <p className={styles.observacao}>
                    Os dados fornecidos serão utilizados
                    exclusivamente para o tratamento da
                    manifestação junto à Ouvidoria.
                  </p>

                  {erro && (
                    <p
                      style={{
                        color: '#b42318',
                        marginTop: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      {erro}
                    </p>
                  )}

                  <div className={styles.barraBotoes}>
                    <button
                      type="submit"
                      className={styles.botao}
                      disabled={enviando}
                    >
                      {enviando
                        ? 'Enviando...'
                        : 'Enviar'}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default Ouvidoria;