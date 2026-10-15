import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

import {
  saveManifestacao,
  saveRelatoIntegridade,
  consultarRelato,
  solicitarExportacaoIntegridade,
  exportarRelatosIntegridade,
  solicitarExportacaoOuvidoria,
  exportarManifestacoesOuvidoria
} from "./db.js";

dotenv.config({ path: ".env.backend" });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("API do Hospital rodando 🚀");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const transporterIntegridade = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_INTEGRIDADE,
    pass: process.env.EMAIL_INTEGRIDADE_PASS
  }
});

app.post("/api/ouvidoria", async (req, res) => {

  try {
    const data = req.body;
    if (
      !data.tipo ||
      !data.nome ||
      !data.email ||
      !data.descricao
    ) {
      return res.status(400).json({
        message:
          "Preencha todos os campos obrigatórios."
      });
    }
    if (data.descricao.trim().length < 30) {
      return res.status(400).json({
        message:
          "A descrição deve conter pelo menos 30 caracteres."
      });
    }

    const manifestacao =
      await saveManifestacao(data);
    let emailEnviado = false;

    try {
      await transporterIntegridade.sendMail({
        from:
          process.env.EMAIL_INTEGRIDADE,
        to:
          process.env.EMAIL_INTEGRIDADE,
        replyTo:
          data.email,
        subject:
        `Nova manifestação de Ouvidoria - ${manifestacao.protocolo}`,
        html: `
          <div style="
            margin:0;
            padding:20px 12px;
            background:#f4f7fb;
            font-family:Arial,Helvetica,sans-serif;
            color:#333333;
          ">
            <div style="
              max-width:700px;
              margin:0 auto;
              background:#ffffff;
              border:1px solid #e2e8f0;
              border-radius:8px;
              overflow:hidden;
            ">
              <div style="
                background:#188e5a;
                color:#ffffff;
                padding:20px;
                text-align:center;
              ">
                <div style="
                  font-size:18px;
                  font-weight:bold;
                ">
                  HOSPITAL E MATERNIDADE
                </div>
                <div style="
                  font-size:22px;
                  font-weight:bold;
                  margin-top:2px;
                ">
                  AGENOR ARAÚJO
                </div>
                <div style="
                  margin-top:6px;
                  font-size:13px;
                  font-weight:bold;
                  letter-spacing:1px;
                ">
                  OUVIDORIA
                </div>
              </div>
              <div style="
                padding:24px;
              ">
                <h2 style="
                  margin:0 0 18px 0;
                  color:#188e5a;
                  font-size:20px;
                ">
                  Nova manifestação recebida
                </h2>
                <h3 style="
                  margin:0 0 10px 0;
                  color:#333333;
                  font-size:16px;
                ">
                  Dados da manifestação
                </h3>
                <table style="
                  width:100%;
                  border-collapse:collapse;
                  font-size:14px;
                  margin-bottom:20px;
                ">
                  <tr>
                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                      background:#f8fafc;
                      font-weight:bold;
                      width:140px;
                    ">
                      Tipo
                    </td>

                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                    ">
                      ${data.tipo}
                    </td>
                  </tr>
                  <tr>
                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                      background:#f8fafc;
                      font-weight:bold;
                    ">
                      Nome
                    </td>
                   <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                    ">
                      ${data.nome}
                    </td>
                  </tr>
                  <tr>
                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                      background:#f8fafc;
                      font-weight:bold;
                    ">
                      E-mail
                    </td>
                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                    ">
                      ${data.email}
                    </td>
                  </tr>
                  <tr>
                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                      background:#f8fafc;
                      font-weight:bold;
                    ">
                      Telefone
                    </td>
                    <td style="
                      padding:8px;
                      border:1px solid #e2e8f0;
                    ">
                      ${data.telefone || "Não informado"}
                    </td>
                  </tr>
                </table>
                <h3 style="
                  margin:24px 0 10px 0;
                  color:#333333;
                  font-size:16px;
                ">
                  Descrição
                </h3>
                <div style="
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  padding:15px;
                  color:#333333;
                  font-size:14px;
                  line-height:1.6;
                  text-align:justify;
                  word-break:break-word;
                  overflow-wrap:anywhere;
                ">
                  ${
                    String(data.descricao)
                      .trim()
                      .replace(/\r\n/g, "\n")
                      .replace(/\r/g, "\n")
                      .replace(/\n/g, "<br>")
                  }
                </div>
                <p style="
                  margin-top:20px;
                  color:#666666;
                  font-size:12px;
                  line-height:1.5;
                ">
                  Esta manifestação foi registrada através do
                  <strong>
                    Canal de Ouvidoria do HMAA
                  </strong>.
                </p>
              </div>
              <div style="
                padding:12px 24px;
                background:#f8fafc;
                border-top:1px solid #e5e7eb;
                text-align:center;
              ">
                <div style="
                  color:#666666;
                  font-size:11px;
                  line-height:1.4;
                ">
                  <strong>
                    Hospital e Maternidade Agenor Araújo
                  </strong>
                  <br>
                  Ouvidoria
                </div>
              </div>
            </div>
          </div>
        `
      });

      emailEnviado = true;
      console.log(
        "📧 E-mail da Ouvidoria enviado com sucesso"
      );
    } catch (emailError) {
      console.error(
        "⚠️ Manifestação salva, mas houve erro ao enviar o e-mail:",
        emailError
      );
    }
    res.status(201).json({
      message:
        "Manifestação registrada com sucesso!",
      protocolo:
        manifestacao.protocolo,
      emailEnviado
    });
  } catch (error) {
    console.error(
      "❌ Erro ao registrar manifestação:",
      error
    );
    res.status(500).json({
      message:
        "Erro ao registrar manifestação."
    });
  }

});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   cb(
      null,
      "uploads/"
    );
  },

  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
      "-" +
      file.originalname
    );
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(
      null,
      true
    );
  } else {
    cb(
      new Error(
        "Formato inválido. Apenas PDF ou DOCX."
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize:
      10 * 1024 * 1024
  },
  fileFilter

});

app.post(
  "/api/trabalhe-conosco",

  upload.single("curriculo"),
  async (req, res) => {
    try {
      const {
        nome,
        email,
        telefone,
        area
      } = req.body;
      if (!req.file) {
        return res.status(400).json({
          message:
            "Currículo não enviado"
        });
      }
      console.log(
        "Currículo recebido:",
        req.file.originalname
      );

      await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,

  replyTo: {
    name: nome,
    address: email
  },

  subject: "Novo currículo recebido - Trabalhe Conosco",


html: `
  <div style="
    margin:0;
    padding:24px 12px;
    background:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
    color:#333333;
  ">
    <div style="
      max-width:700px;
      margin:0 auto;
      background:#ffffff;
      border:1px solid #e2e8f0;
      border-radius:8px;
      overflow:hidden;
    ">
      <div style="padding:28px 24px;">
        <h2 style="
          margin:0 0 10px;
          color:#188e5a;
          font-size:22px;
          line-height:1.4;
        ">
          Novo currículo recebido
        </h2>

        <p style="
          margin:0 0 24px;
          color:#555555;
          font-size:14px;
          line-height:1.7;
        ">
          Uma nova candidatura foi recebida pelo formulário
          Trabalhe Conosco.
          Confira abaixo os dados informados pelo candidato.
        </p>

        <h3 style="
          margin:0 0 12px;
          color:#333333;
          font-size:16px;
        ">
          Dados do candidato
        </h3>

        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:14px;
          margin-bottom:24px;
        ">
          <tr>
            <td style="
              width:140px;
              padding:12px;
              border:1px solid #e2e8f0;
              background:#f8fafc;
              font-weight:bold;
              vertical-align:top;
            ">
              Nome
            </td>

            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              color:#444444;
              overflow-wrap:anywhere;
            ">
              ${nome}
            </td>
          </tr>

          <tr>
            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              background:#f8fafc;
              font-weight:bold;
              vertical-align:top;
            ">
              E-mail
            </td>

            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              overflow-wrap:anywhere;
            ">
              <a
                href="mailto:${email}"
                style="color:#188e5a;text-decoration:underline;"
              >
                ${email}
              </a>
            </td>
          </tr>

          <tr>
            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              background:#f8fafc;
              font-weight:bold;
              vertical-align:top;
            ">
              Telefone
            </td>

            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              color:#444444;
            ">
              ${telefone || "Não informado"}
            </td>
          </tr>

          <tr>
            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              background:#f8fafc;
              font-weight:bold;
              vertical-align:top;
            ">
              Área de interesse
            </td>

            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              color:#444444;
              line-height:1.7;
              white-space:pre-line;
              overflow-wrap:anywhere;
            ">
              ${area}
            </td>
          </tr>

          <tr>
            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              background:#f8fafc;
              font-weight:bold;
              vertical-align:top;
            ">
              Currículo
            </td>

            <td style="
              padding:12px;
              border:1px solid #e2e8f0;
              color:#444444;
              overflow-wrap:anywhere;
            ">
              ${req.file.originalname}
            </td>
          </tr>
        </table>

        <p style="
          margin:0;
          color:#666666;
          font-size:13px;
          line-height:1.6;
        ">
          O currículo está anexado a este e-mail para avaliação
          da equipe.
        </p>
      </div>

      <div style="
        padding:14px 24px;
        background:#f8fafc;
        border-top:1px solid #e5e7eb;
        text-align:center;
      ">
        <p style="
          margin:0;
          color:#666666;
          font-size:12px;
          line-height:1.6;
        ">
          <strong>Hospital e Maternidade Agenor Araújo</strong>
          <br>
          Trabalhe Conosco
        </p>
      </div>
    </div>
  </div>
`,

  attachments: [
    {
      filename: req.file.originalname,
      path: req.file.path
    }
  ]
});

      console.log(
        "Email enviado com sucesso"
      );
      fs.unlink(
        req.file.path,
        (err) => {
          if (err) {
            console.log(
              "Erro ao apagar arquivo:",
              err
            );
          } else {
            console.log(
              "Arquivo removido do servidor"
           );
          }
        }
      );

      res.json({
        message:
          "Currículo enviado com sucesso ✔"
      });
    } catch (error) {
      console.error(
        "Erro ao enviar currículo:",
        error
      );
      if (req.file) {

        fs.unlink(
          req.file.path,
          () => {}
        );
      }
      res.status(500).json({
        message:
          "Erro ao enviar currículo"
      });
    }
  }
);

const integridadeDir =
  "uploads/integridade";

if (
  !fs.existsSync(
    integridadeDir
  )
) {
  fs.mkdirSync(
    integridadeDir,
    {
      recursive: true
    }
  );
}

const storageIntegridade =
  multer.diskStorage({
    destination: function (
      req,
      file,
      cb
    ) {
      cb(
        null,
        integridadeDir
      );
    },
    filename: function (
      req,
      file,
      cb
    ) {
      const nomeSeguro =
        file.originalname
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );
      cb(
        null,
        Date.now() +
        "-" +
        nomeSeguro
      );
    }
  });

const uploadIntegridade =
  multer({
    storage:
      storageIntegridade,
    limits: {
      fileSize:
        100 * 1024 * 1024,
      files:
        20
    }
  });

app.post(
  "/api/canal-integridade",

  uploadIntegridade.array(
    "anexos",
    20
  ),
  async (req, res) => {
    try {
      const data =
        req.body;
      const arquivos =
        req.files || [];

      const tamanhoTotal =
        arquivos.reduce(
          (total, arquivo) =>
            total + arquivo.size,
          0
        );
      const limiteTotal =
        100 * 1024 * 1024;
      if (
        tamanhoTotal >
        limiteTotal
      ) {
        for (
          const arquivo
          of arquivos
        ) {
          fs.unlink(
            arquivo.path,
            () => {}
          );
        }
        return res.status(400).json({
          message:
            "O tamanho total dos arquivos não pode ultrapassar 100 MB."
        });
      }

      if (
        data.identificado === undefined ||
        !data.tipo ||
        !data.descricao
      ) {
        for (
          const arquivo
          of arquivos
        ) {
          fs.unlink(
            arquivo.path,
            () => {}
          );
        }
        return res.status(400).json({
          message:
            "Preencha os campos obrigatórios do relato."
        });
      }

      if (
        data.descricao.trim().length <
        30
      ) {
        for (
          const arquivo
          of arquivos
        ) {
          fs.unlink(
            arquivo.path,
            () => {}
          );
        }
        return res.status(400).json({
          message:
            "A descrição deve conter pelo menos 30 caracteres."
        });
      }
      const identificado =
        data.identificado === "true";

      if (identificado) {

        if (
          !data.nome ||
          !data.funcao ||
          (
            !data.email &&
            !data.telefone &&
            !data.celular
          )
        ) {
          for (
            const arquivo
            of arquivos
          ) {
          fs.unlink(
              arquivo.path,
              () => {}
            );
          }
          return res.status(400).json({
            message:
              "Para relatos identificados, informe nome, função/relação e pelo menos um contato."
          });
        }
      }

      const relato =
        await saveRelatoIntegridade(
          {
            ...data,
            identificado
          },
          arquivos
        );

      const descricaoFormatada =
        String(
          data.descricao || ""
        )
          .trim()
          .split(/\r?\n/)
          .map(
            (linha) =>
              linha.trim()
          )
          .filter(
            (
              linha,
              index,
              linhas
            ) => {
             return (
                linha !== "" ||
                linhas[index - 1] !== ""
              );
            }
          )
          .join("<br>");

      try {
        await transporterIntegridade.sendMail({
          from:
            process.env.EMAIL_INTEGRIDADE,
          to:
            process.env.EMAIL_INTEGRIDADE,
          subject:
            `Novo relato de Integridade - ${relato.protocolo}`,
          html: `
           <div style="
              font-family:Arial,Helvetica,sans-serif;
              color:#333;
              max-width:700px;
              margin:auto;
            ">
              <div style="
                background:#188e5a;
                color:#fff;
                padding:20px;
                text-align:center;
              ">
                <strong>
                  HOSPITAL E MATERNIDADE
                </strong>
                <br>
                <strong style="font-size:22px;">
                  AGENOR ARAÚJO
                </strong>
                <br>
                <span>
                  CANAL DE INTEGRIDADE
                </span>
              </div>
              <div style="
                padding:25px;
              ">
                <h2 style="
                  color:#188e5a;
                ">
                  Novo relato recebido
                </h2>
                <p>
                  <strong>
                    Protocolo:
                  </strong>
                  ${relato.protocolo}
                </p>
              <p>
                  <strong>
                    Identificado:
                  </strong>
                  ${
                    identificado
                      ? "Sim"
                      : "Não"
                  }
                </p>
                ${
                  identificado
                    ? `
                     <p>
                        <strong>
                          Nome:
                        </strong>
                        ${data.nome}
                      </p>
                      <p>
                        <strong>
                          Função/relação:
                        </strong>
                        ${data.funcao}
                      </p>
                    `
                    : `
                      <p>
                        <strong>
                          Relato anônimo.
                        </strong>
                      </p>
                   `
              }
                <p>
                  <strong>
                    Tipo:
                  </strong>
                  ${data.tipo}
                </p>
                <p>
                  <strong>
                    Local:
                  </strong>
                  ${
                    data.local ||
                    "Não informado"
                  }
                </p>
                <h3 style="
                  margin:24px 0 10px 0;
                  color:#333333;
                  font-size:16px;
                ">
                  Descrição
                </h3>
                <div style="
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  padding:15px;
                  color:#333333;
                  font-size:14px;
                  line-height:1.6;
                  text-align:justify;
                  word-break:break-word;
                  overflow-wrap:anywhere;
                ">
                  ${descricaoFormatada}
                </div>
                <p style="
                  margin-top:20px;
                  color:#666;
                  font-size:13px;
                ">
                  ${
                    arquivos.length
                  }
                  arquivo(s) anexado(s).
                </p>
              </div>
              <div style="
                color:#666666;
                font-size:11px;
                line-height:1.4;
              ">
                <strong>
                  Hospital e Maternidade Agenor Araújo
                </strong>
                <br>
                Canal de Integridade
              </div>
            </div>
          `,

          attachments:
            arquivos.map(
              (arquivo) => ({
                filename:
                  arquivo.originalname,
                path:
                  arquivo.path
              })
            )
        });

        console.log(
          "📧 E-mail do relato enviado"
        );
      } catch (emailError) {
        console.error(
          "⚠️ Relato salvo, mas houve erro ao enviar e-mail:",
          emailError
        );
      }

      res.status(201).json({
        message:
          "Relato registrado com sucesso.",
        protocolo:
          relato.protocolo,
        codigoAcesso:
          relato.codigoAcesso
      });
    } catch (error) {
      console.error(
        "❌ Erro ao registrar relato:",
        error
      );

      if (req.files) {
        for (
          const arquivo
          of req.files
        ) {

          fs.unlink(
            arquivo.path,
            () => {}
          );
        }
      }
      res.status(500).json({
        message:
          "Erro ao registrar relato."
      });
    }
  }
);

app.post(
  "/api/canal-integridade/consultar",

  async (req, res) => {
   try {
      const {
        codigoAcesso
      } = req.body;
      if (
        !codigoAcesso ||
        !codigoAcesso.trim()
      ) {
        return res.status(400).json({
          message:
            "Informe o código de acesso."
        });
      }
      const relato =
        await consultarRelato(
          codigoAcesso.trim()
        );
      if (!relato) {
        return res.status(404).json({
          message:
            "Código de acesso inválido."
        });
      }
      res.json({
        relato
      });
    } catch (error) {
     console.error(
        "❌ Erro ao consultar relato:",
        error
      );
      res.status(500).json({
        message:
          "Erro ao consultar relato."
      });
    }
  }
);

app.post(
  "/api/canal-integridade/exportar",

  async (req, res) => {
    try {
      const ipSolicitante =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        null;

      const resultado =
        await solicitarExportacaoIntegridade(
          String(ipSolicitante || "")
        );

      if (
        resultado.pendente
      ) {
        return res.json({
          enviado: false,
          pendente: true,
          message:
            "Já existe um código de autorização válido. Verifique o e-mail institucional."
        });
      }

      try {
        await transporterIntegridade.sendMail({

          from:
            process.env.EMAIL_INTEGRIDADE,
          to:
            process.env.EMAIL_INTEGRIDADE,
          subject:
            "Código de autorização para exportação - Canal de Integridade",
          html: `
            <div style="
              margin:0;
              padding:20px 12px;
              background:#f4f7fb;
              font-family:Arial,Helvetica,sans-serif;
              color:#333333;
            ">
              <div style="
                max-width:650px;
                margin:0 auto;
                background:#ffffff;
                border:1px solid #e2e8f0;
                border-radius:8px;
                overflow:hidden;
              ">
                <div style="
                  background:#188e5a;
                  color:#ffffff;
                  padding:20px;
                  text-align:center;
                ">
                  <div style="
                    font-size:18px;
                    font-weight:bold;
                  ">
                    HOSPITAL E MATERNIDADE
                  </div>
                  <div style="
                    font-size:22px;
                    font-weight:bold;
                    margin-top:2px;
                  ">
                    AGENOR ARAÚJO
                  </div>
                  <div style="
                    margin-top:6px;
                    font-size:13px;
                    font-weight:bold;
                    letter-spacing:1px;
                  ">
                    CANAL DE INTEGRIDADE
                  </div>
                </div>
                <div style="
                  padding:25px;
                ">
                  <h2 style="
                    margin:0 0 16px 0;
                    color:#188e5a;
                    font-size:20px;
                  ">
                    Código de autorização
                  </h2>
                  <p style="
                    font-size:14px;
                    line-height:1.6;
                  ">
                    Foi solicitada uma exportação dos relatos
                    registrados no Canal de Integridade.
                  </p>
                  <p style="
                    font-size:14px;
                    line-height:1.6;
                  ">
                    Utilize o código abaixo para autorizar
                    o download da exportação.
                  </p>
                  <div style="
                    margin:24px 0;
                    padding:18px;
                    background:#f4faf7;
                    border:1px solid #d7eee3;
                    border-radius:6px;
                    text-align:center;
                  ">
                    <div style="
                      color:#666666;
                      font-size:12px;
                      margin-bottom:8px;
                    ">
                      CÓDIGO DE AUTORIZAÇÃO
                    </div>
                    <div style="
                      color:#188e5a;
                      font-size:22px;
                      font-weight:bold;
                      letter-spacing:2px;
                      word-break:break-word;
                    ">
                      ${resultado.token}
                    </div>
                  </div>
                  <p style="
                    font-size:13px;
                    line-height:1.6;
                    color:#555555;
                  ">
                    Este código é válido por
                    <strong>30 minutos</strong>
                    e pode ser utilizado apenas uma vez.
                  </p>
                  <p style="
                    font-size:13px;
                    line-height:1.6;
                    color:#555555;
                  ">
                    Se você não solicitou esta exportação,
                    ignore este e-mail.
                  </p>
                </div>
                <div style="
                  padding:12px 24px;
                  background:#f8fafc;
                  border-top:1px solid #e5e7eb;
                  text-align:center;
                ">
                  <div style="
                    color:#666666;
                    font-size:11px;
                    line-height:1.4;
                  ">
                    <strong>
                      Hospital e Maternidade Agenor Araújo
                    </strong>
                    <br>
                    Canal de Integridade
                  </div>
                </div>
              </div>
            </div>
          `
        });
        console.log(
          "📧 Código de exportação enviado para o e-mail institucional."
        );
      } catch (emailError) {
        console.error(
          "❌ Erro ao enviar código de exportação:",
          emailError
        );
        res.status(500).json({
          message:
            "Não foi possível enviar o código de autorização."
        });
        return;
      }
      res.json({
        enviado: true,
        pendente: false,
        message:
          "Código de autorização enviado para o e-mail institucional.",
        expiraEm:
          resultado.expiraEm
      });
    } catch (error) {
      console.error(
        "❌ Erro ao solicitar exportação:",
        error
      );
      res.status(500).json({
        message:
          "Erro ao solicitar código de exportação."
      });
    }
  }
);

app.post(
  "/api/canal-integridade/exportar/baixar",

  async (req, res) => {
    try {
      const {
        token
      } = req.body;
      if (
        !token ||
        !String(token).trim()
      ) {
        return res.status(400).json({
          message:
            "Informe o código de autorização."
        });
      }
      const resultado =
        await exportarRelatosIntegridade(
          String(token).trim()
        );

      if (
        !resultado.sucesso
      ) {
        if (
          resultado.motivo ===
          "token_usado"
        ) {
          return res.status(410).json({
            message:
              "Este código de autorização já foi utilizado."
          });
        }
        if (
          resultado.motivo ===
          "token_expirado"
        ) {
          return res.status(410).json({
            message:
              "Este código de autorização expirou."
          });
        }
        return res.status(401).json({
          message:
            "Código de autorização inválido."
        });
      }
      res.json({
        sucesso: true,
        dados:
          resultado.dados
      });
    } catch (error) {
      console.error(
        "❌ Erro ao realizar exportação:",
        error
      );
      res.status(500).json({
        message:
          "Erro ao realizar exportação dos relatos."
      });
    }
  }
);

app.post(
  "/api/ouvidoria/exportar",

  async (req, res) => {
    try {
      const ipSolicitante =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        null;

      const resultado =
        await solicitarExportacaoOuvidoria(
          String(ipSolicitante || "")
        );

      if (
        resultado.pendente
      ) {
        return res.json({
          enviado: false,
          pendente: true,
          message:
            "Já existe um código de autorização válido. Verifique o e-mail institucional."
        });
      }

      try {
        await transporterIntegridade.sendMail({
          from:
            process.env.EMAIL_INTEGRIDADE,
          to:
            process.env.EMAIL_INTEGRIDADE,
          subject:
            "Código de autorização para exportação - Ouvidoria",
          html: `
            <div style="
              margin:0;
              padding:20px 12px;
              background:#f4f7fb;
              font-family:Arial,Helvetica,sans-serif;
              color:#333333;
            ">
              <div style="
                max-width:650px;
                margin:0 auto;
                background:#ffffff;
                border:1px solid #e2e8f0;
                border-radius:8px;
                overflow:hidden;
              ">
                <div style="
                  background:#188e5a;
                  color:#ffffff;
                  padding:20px;
                  text-align:center;
                ">
                  <div style="
                    font-size:18px;
                    font-weight:bold;
                  ">
                    HOSPITAL E MATERNIDADE
                  </div>
                  <div style="
                    font-size:22px;
                    font-weight:bold;
                    margin-top:2px;
                  ">
                    AGENOR ARAÚJO
                  </div>
                  <div style="
                    margin-top:6px;
                    font-size:13px;
                    font-weight:bold;
                    letter-spacing:1px;
                  ">
                    OUVIDORIA
                  </div>
                </div>
                <div style="
                  padding:25px;
                ">
                  <h2 style="
                    margin:0 0 16px 0;
                    color:#188e5a;
                    font-size:20px;
                  ">
                    Código de autorização
                  </h2>
                  <p style="
                    font-size:14px;
                    line-height:1.6;
                  ">
                    Foi solicitada uma exportação das
                    manifestações registradas na Ouvidoria.
                  </p>
                  <p style="
                    font-size:14px;
                    line-height:1.6;
                  ">
                    Utilize o código abaixo para autorizar
                    o download da exportação.
                  </p>
                  <div style="
                    margin:24px 0;
                    padding:18px;
                    background:#f4faf7;
                    border:1px solid #d7eee3;
                    border-radius:6px;
                    text-align:center;
                  ">
                    <div style="
                      color:#666666;
                      font-size:12px;
                      margin-bottom:8px;
                    ">
                      CÓDIGO DE AUTORIZAÇÃO
                    </div>
                    <div style="
                      color:#188e5a;
                      font-size:22px;
                      font-weight:bold;
                      letter-spacing:2px;
                      word-break:break-word;
                      user-select:all;
                      cursor:text;
                    ">
                      ${resultado.token}
                    </div>
                    <div style="
                      margin-top:10px;
                      color:#777777;
                      font-size:11px;
                    ">
                      Clique e selecione o código para copiar.
                    </div>
                  </div>
                  <p style="
                    font-size:13px;
                    line-height:1.6;
                    color:#555555;
                  ">
                    Este código é válido por
                    <strong>30 minutos</strong>
                    e pode ser utilizado apenas uma vez.
                  </p>
                  <p style="
                    font-size:13px;
                    line-height:1.6;
                    color:#555555;
                  ">
                    Se você não solicitou esta exportação,
                    ignore este e-mail.
                  </p>
                </div>
                <div style="
                  padding:12px 24px;
                  background:#f8fafc;
                  border-top:1px solid #e5e7eb;
                  text-align:center;
                ">
                  <div style="
                    color:#666666;
                    font-size:11px;
                    line-height:1.4;
                  ">
                    <strong>
                      Hospital e Maternidade Agenor Araújo
                    </strong>
                    <br>
                    Ouvidoria
                  </div>
                </div>
              </div>
            </div>
          `
        });
        console.log(
          "📧 Código de exportação da Ouvidoria enviado."
        );
      } catch (emailError) {
        console.error(
          "❌ Erro ao enviar código de exportação da Ouvidoria:",
          emailError
        );
        return res.status(500).json({
          message:
            "Não foi possível enviar o código de autorização."
        });
      }
      res.json({
        enviado: true,
        pendente: false,
        message:
          "Código de autorização enviado para o e-mail institucional.",
        expiraEm:
          resultado.expiraEm
      });
    } catch (error) {
      console.error(
        "❌ Erro ao solicitar exportação da Ouvidoria:",
        error
      );
      res.status(500).json({
        message:
          "Erro ao solicitar código de exportação."
      });
    }
  }
);

app.post(
  "/api/ouvidoria/exportar/baixar",

  async (req, res) => {
    try {
      const {
        token
      } = req.body
      if (
        !token ||
        !String(token).trim()
      ) {
        return res.status(400).json({
          message:
            "Informe o código de autorização."
        });
      }
      const resultado =
        await exportarManifestacoesOuvidoria(
          String(token).trim()
        );

      if (
        !resultado.sucesso
      ) {
        if (
          resultado.motivo ===
          "token_usado"
        ) {
          return res.status(410).json({
            message:
              "Este código de autorização já foi utilizado."
          });
        }
        if (
          resultado.motivo ===
          "token_expirado"
        ) {
          return res.status(410).json({
            message:
              "Este código de autorização expirou."
          });
        }
        return res.status(401).json({
          message:
            "Código de autorização inválido."
        });
      }

      res.json({
        sucesso: true,
        dados:
          resultado.dados
      });

    } catch (error) {
     console.error(
        "❌ Erro ao realizar exportação da Ouvidoria:",
        error
      );
      res.status(500).json({
        message:
          "Erro ao realizar exportação das manifestações."
      });
    }
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      `✅ Servidor rodando na porta ${PORT}`
    );
  }
);