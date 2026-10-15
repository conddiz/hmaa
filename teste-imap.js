import dotenv from "dotenv";
import { ImapFlow } from "imapflow";

dotenv.config({ path: ".env.backend" });

const client = new ImapFlow({
  host:
    process.env.EMAIL_INTEGRIDADE_IMAP_HOST ||
    "imap.gmail.com",

  port:
    Number(
      process.env.EMAIL_INTEGRIDADE_IMAP_PORT ||
      993
    ),

  secure:
    process.env.EMAIL_INTEGRIDADE_IMAP_TLS !== "false",
  auth: {
    user:
      process.env.EMAIL_INTEGRIDADE,
    pass:
      process.env.EMAIL_INTEGRIDADE_PASS
  },
  logger: false
});

async function testarIMAP() {
  try {
    console.log("🔄 Conectando ao Gmail...");
    await client.connect();
    console.log("✅ Conectado ao Gmail!");
    console.log(
      "📧 Conta autenticada:",
      client.authenticated
    );

    const mailboxes =
      await client.list();
    console.log("\n📂 Caixas encontradas:");
    for (const mailbox of mailboxes) {
      console.log(
        "-",
        mailbox.path
      );
    }

    const lock =
      await client.getMailboxLock(
        "INBOX"
      );

    try {
      console.log(
        "\n📥 Caixa de entrada:"
      );
      const total =
        client.mailbox.exists;
      console.log(
        "Mensagens:",
        total
      );

      if (total > 0) {
        const inicio =
          Math.max(
            1,
            total - 4
          );
        const sequencia =
          `${inicio}:${total}`;

        console.log(
          "\n🔎 Lendo mensagens:",
          sequencia
        );
        const mensagens =
          await client.fetchAll(
            sequencia,
            {
              envelope: true
            }
          );
        console.log(
          "\n📨 Últimas mensagens:"
        );
        for (
          const mensagem
          of mensagens
        ) {
          console.log(
            "--------------------------------"
          );
          console.log(
            "UID:",
            mensagem.uid
          );
          console.log(
            "De:",
            mensagem.envelope.from?.[0]?.address ||
              "Não identificado"
          );
          console.log(
            "Para:",
            mensagem.envelope.to?.[0]?.address ||
              "Não identificado"
          );
          console.log(
            "Assunto:",
            mensagem.envelope.subject ||
              "(sem assunto)"
          );
          console.log(
            "Data:",
            mensagem.envelope.date
          );
        }
      } else {

        console.log(
          "📭 A caixa de entrada está vazia."
        );
     }
    } finally {

      lock.release();
    }

    await client.logout();
    console.log(
      "\n✅ Teste concluído com sucesso."
    );
  } catch (error) {

    console.error(
      "\n❌ Erro no IMAP:"
    );
    console.error(
      error
    );
    try {
      await client.logout();
    } catch {}
    process.exit(1);
  }
}

testarIMAP();