import dotenv from "dotenv";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import {
  adicionarMensagemEmail
} from "./db.js";

dotenv.config({
  path: ".env.backend"
});

const EMAIL_INTEGRIDADE =
  process.env.EMAIL_INTEGRIDADE;

const IMAP_HOST =
  process.env.EMAIL_INTEGRIDADE_IMAP_HOST ||
  "imap.gmail.com";

const IMAP_PORT =
  Number(
    process.env.EMAIL_INTEGRIDADE_IMAP_PORT
  ) || 993;

const IMAP_TLS =
  String(
    process.env.EMAIL_INTEGRIDADE_IMAP_TLS
  ).toLowerCase() !== "false";

const SENT_MAILBOX =
  process.env.EMAIL_INTEGRIDADE_SENT_MAILBOX ||
  "[Gmail]/Correio enviado";

const INTERVALO =
  30 * 1000;

let verificando = false;

function criarCliente() {

  return new ImapFlow({

    host:
      IMAP_HOST,

    port:
      IMAP_PORT,

    secure:
      IMAP_TLS,

    auth: {

      user:
        EMAIL_INTEGRIDADE,

      pass:
        process.env.EMAIL_INTEGRIDADE_PASS

    },

    logger:
      false

  });

}

function extrairProtocolo(
  subject
) {

  if (!subject) {
    return null;
  }

  const resultado =
    String(subject).match(
      /\bINT-\d{4}-\d+\b/i
    );

  if (!resultado) {

    return null;

  }

  return resultado[0]
    .toUpperCase();

}

function limparResposta(texto) {

  if (!texto) {
    return "";
  }

  let resultado =
    String(texto)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

  const linhas =
    resultado.split("\n");

  const indiceCitacao =
    linhas.findIndex(
      (linha) => {

        const linhaLimpa =
          linha.trim();

        if (
          /\bescreveu\b/i.test(
            linhaLimpa
          )
        ) {

          return true;

        }

        if (
          /\bwrote\s*:/i.test(
            linhaLimpa
          )
        ) {

          return true;

        }

        return false;

      }
    );

  if (
    indiceCitacao !== -1
  ) {

    resultado =
      linhas
        .slice(
          0,
          indiceCitacao
        )
        .join("\n");

  }

  resultado =
    resultado
      .split("\n")
      .filter(
        (linha) => {

          return !linha
            .trim()
            .startsWith(">");

        }
      )
      .join("\n");

  resultado =
    resultado.split(
      /\n\s*-{2,}\s*(?:Mensagem encaminhada|Forwarded message|Original Message)\s*-{2,}/i
    )[0];

  resultado =
    resultado
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  return resultado;

}

async function processarMensagem({

  source,

  mailbox,

  envelope

}) {

  if (
    !source ||
    !envelope
  ) {

    return;

  }

  const subject =
    envelope.subject || "";

  const protocolo =
    extrairProtocolo(
      subject
    );

  if (!protocolo) {

    return;

  }

  const parsed =
    await simpleParser(
      source
    );

  const messageId =
    parsed.messageId ||
    envelope.messageId;

  if (!messageId) {

    console.warn(
      "⚠️ E-mail sem Message-ID:",
      subject
    );

    return;

  }

  const remetente =
    parsed.from
      ?.value
      ?.[0]
      ?.address
      ?.toLowerCase() ||
    "";

  if (!remetente) {

    return;

  }

  const meuEmail =
    String(
      EMAIL_INTEGRIDADE
    ).toLowerCase();

  if (
    mailbox === "INBOX"
  ) {

    if (
      remetente === meuEmail
    ) {

      return;

    }

    const texto =
      limparResposta(
        parsed.text || ""
      );

    console.log("");
    console.log(
      "=============================================="
    );
    console.log(
      "🔎 DEBUG - E-MAIL RECEBIDO"
    );
    console.log(
      "=============================================="
    );

    console.log(
      "Assunto:",
      subject
    );

    console.log(
      "Remetente:",
      remetente
    );

    console.log(
      "Message-ID:",
      messageId
    );

    console.log("");
    console.log(
      "---------- TEXTO ORIGINAL ----------"
    );

    console.log(
      parsed.text || ""
    );

    console.log("");
    console.log(
      "---------- TEXTO LIMPO ----------"
    );

    console.log(
      texto
    );

    console.log(
      "=============================================="
    );
    console.log("");

    if (!texto) {

      console.log(
        "⚠️ E-mail sem conteúdo útil:",
        subject
      );

      return;

    }

    console.log(
      "📨 MENSAGEM DO CIDADÃO"
    );

    console.log(
      "Caixa:",
      mailbox
    );

    console.log(
      "Protocolo:",
      protocolo
    );

    console.log(
      "De:",
      remetente
    );

    console.log(
      "Message-ID:",
      messageId
    );

    const resultado =
      await adicionarMensagemEmail({

        protocolo,

        origem:
          "cidadao",

        mensagem:
          texto,

        emailMessageId:
          messageId

      });

    if (resultado) {

      console.log(
        "✅ Mensagem do cidadão registrada no histórico."
      );

    }

    return;

  }

  if (
    mailbox === SENT_MAILBOX
  ) {


    if (
      remetente !== meuEmail
    ) {

      return;

    }

    if (
      !/^re\s*:/i.test(
        subject
      )
    ) {

      return;

    }

    const texto =
      limparResposta(
        parsed.text || ""
      );

    console.log("");
    console.log(
      "=============================================="
    );
    console.log(
      "🔎 DEBUG - RESPOSTA DO HMAA"
    );
    console.log(
      "=============================================="
    );

    console.log(
      "Assunto:",
      subject
    );

    console.log(
      "Message-ID:",
      messageId
    );

    console.log("");
    console.log(
      "---------- TEXTO ORIGINAL ----------"
    );

    console.log(
      parsed.text || ""
    );

    console.log("");
    console.log(
      "---------- TEXTO LIMPO ----------"
    );

    console.log(
      texto
    );

    console.log(
      "=============================================="
    );
    console.log("");

    if (!texto) {

      console.log(
        "⚠️ Resposta do HMAA sem conteúdo útil:",
        subject
      );

      return;

    }

    console.log(
      "📤 RESPOSTA DO HMAA"
    );

    console.log(
      "Caixa:",
      mailbox
    );

    console.log(
      "Protocolo:",
      protocolo
    );

    console.log(
      "Message-ID:",
      messageId
    );

    const resultado =
      await adicionarMensagemEmail({

        protocolo,

        origem:
          "hmaa",

        mensagem:
          texto,

        emailMessageId:
          messageId

      });

    if (resultado) {

      console.log(
        "✅ Resposta do HMAA registrada no histórico."
      );

    }

    return;

  }

}

async function verificarCaixa(

  client,

  mailbox

) {

  const lock =
    await client.getMailboxLock(
      mailbox
    );

  try {

    const total =
      client.mailbox.exists ||
      0;

    if (
      total === 0
    ) {

      console.log(
        `📭 ${mailbox}: nenhuma mensagem.`
      );

      return;

    }

    const inicio =
      Math.max(
        1,
        total - 19
      );

    const sequencia =
      `${inicio}:${total}`;

    console.log(
      `📥 ${mailbox}: verificando mensagens ${sequencia}...`
    );

    const mensagens =
      await client.fetchAll(

        sequencia,

        {

          uid:
            true,

          envelope:
            true,

          source:
            true

        }

      );

    for (
      const mensagem
      of mensagens
    ) {

      try {

        await processarMensagem({

          source:
            mensagem.source,

          mailbox,

          envelope:
            mensagem.envelope

        });

      } catch (error) {

        console.error(
          "❌ Erro ao processar mensagem:",
          error
        );

      }

    }

  } finally {

    lock.release();

  }

}

async function verificarEmails() {

  if (
    verificando
  ) {

    return;

  }

  verificando =
    true;

  const client =
    criarCliente();

  try {

    console.log("");

    console.log(
      "🔄 Verificando Canal de Integridade..."
    );

    console.log(
      `📧 Conta: ${EMAIL_INTEGRIDADE}`
    );

    await client.connect();

    console.log(
      "✅ Conectado ao Gmail!"
    );

    await verificarCaixa(

      client,

      "INBOX"

    );

    await verificarCaixa(
      client,
      SENT_MAILBOX
    );

    await client.logout();

    console.log(
      "✅ Verificação concluída."
    );

  } catch (error) {

    console.error("");

    console.error(
      "❌ ERRO NO MONITOR IMAP:"
    );

    console.error(
      error
    );

    try {

      await client.logout();

    } catch {}

  } finally {

    verificando =
      false;

  }

}

console.log("");

console.log(
  "======================================"
);

console.log(
  " MONITOR DO CANAL DE INTEGRIDADE"
);

console.log(
  "======================================"
);

console.log(
  "📧 Conta:",
  EMAIL_INTEGRIDADE
);

console.log(
  "📡 IMAP:",
  `${IMAP_HOST}:${IMAP_PORT}`
);

console.log(
  "📤 Enviados:",
  SENT_MAILBOX
);

console.log(
  "⏱️ Intervalo: 30 segundos"
);

console.log(
  "======================================"
);

verificarEmails();

setInterval(
  verificarEmails,
  INTERVALO
);