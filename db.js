import dotenv from "dotenv";
import pkg from "pg";
import crypto from "crypto";

dotenv.config({ path: ".env.backend" });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "ouvidoria",
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

export async function saveManifestacao(data) {
  try {
    const protocolo = `OUV-${Date.now()}`;

    const query = `
      INSERT INTO ouvidoria_manifestacoes (
        protocolo,
        tipo,
        nome,
        email,
        telefone,
        descricao
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      protocolo,
      data.tipo,
      data.nome,
      data.email,
      data.telefone || null,
      data.descricao
    ];

    const result = await pool.query(
      query,
      values
    );

    console.log(
      "📌 Manifestação salva:",
      result.rows[0]
    );

    return result.rows[0];

  } catch (err) {

    console.error(
      "❌ Erro ao salvar manifestação:",
      err
    );

    throw err;
  }
}

function gerarProtocolo() {
  const ano = new Date().getFullYear();

  return `INT-${ano}-${Date.now()
    .toString()
    .slice(-8)}`;
}

function gerarCodigoAcesso() {

  return crypto
    .randomBytes(12)
    .toString("hex")
    .toUpperCase()
    .match(/.{1,4}/g)
    .join("-");
}

function gerarHashCodigo(codigo) {

  const secret =
    process.env.INTEGRIDADE_SECRET ||
    "chave-integridade-hmaa";

  return crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(
      String(codigo)
        .trim()
        .toUpperCase()
    )
    .digest("hex");
}

export async function saveRelatoIntegridade(
  data,
  arquivos = []
) {

  const client =
    await pool.connect();

  try {

    await client.query("BEGIN");

    const protocolo =
      gerarProtocolo();

    const codigoAcesso =
      gerarCodigoAcesso();

    const codigoHash =
      gerarHashCodigo(
        codigoAcesso
      );

    const relatoQuery = `
      INSERT INTO canal_integridade_relatos (
        protocolo,
        codigo_acesso_hash,
        identificado,
        nome,
        funcao,
        email,
        telefone,
        celular,
        tipo,
        local,
        descricao
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11
      )
      RETURNING
        id,
        protocolo,
        data_registro,
        status;
    `;

    const relatoValues = [
      protocolo,
      codigoHash,
      data.identificado,
      data.nome || null,
      data.funcao || null,
      data.email || null,
      data.telefone || null,
      data.celular || null,
      data.tipo,
      data.local || null,
      data.descricao
    ];

    const relatoResult =
      await client.query(
        relatoQuery,
        relatoValues
      );

    const relato =
      relatoResult.rows[0];

    for (const arquivo of arquivos) {

      await client.query(
        `
          INSERT INTO canal_integridade_anexos (
            relato_id,
            nome_original,
            nome_arquivo,
            caminho,
            tipo,
            tamanho
          )
          VALUES ($1, $2, $3, $4, $5, $6);
        `,
        [
          relato.id,
          arquivo.originalname,
          arquivo.filename,
          arquivo.path,
          arquivo.mimetype,
          arquivo.size
        ]
      );
    }

    await client.query("COMMIT");

    console.log(
      "📌 Relato de integridade salvo:",
      protocolo
    );

    return {
      ...relato,
      codigoAcesso
    };

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "❌ Erro ao salvar relato de integridade:",
      error
    );

    throw error;

  } finally {

    client.release();
  }
}

export async function consultarRelato(
  codigoAcesso
) {

  const codigoHash =
    gerarHashCodigo(
      codigoAcesso
    );

  const relatoResult =
    await pool.query(
      `
        SELECT
          id,
          protocolo,
          data_registro,
          status,
          identificado,
          nome,
          tipo,
          local,
          descricao
        FROM canal_integridade_relatos
        WHERE codigo_acesso_hash = $1
        LIMIT 1;
      `,
      [codigoHash]
    );

  if (
    relatoResult.rows.length === 0
  ) {

    return null;
  }

  const relato =
    relatoResult.rows[0];

  const mensagensResult =
    await pool.query(
      `
        SELECT
          id,
          origem,
          mensagem,
          data_envio
        FROM canal_integridade_mensagens
        WHERE relato_id = $1
        ORDER BY data_envio ASC;
      `,
      [relato.id]
    );

  return {
    ...relato,
    mensagens:
      mensagensResult.rows
  };
}

export async function adicionarMensagem(
  codigoAcesso,
  mensagem
) {

  const codigoHash =
    gerarHashCodigo(
      codigoAcesso
    );

  const relatoResult =
    await pool.query(
      `
        SELECT
          id,
          protocolo,
          identificado,
          email
        FROM canal_integridade_relatos
        WHERE codigo_acesso_hash = $1
        LIMIT 1;
      `,
      [codigoHash]
    );

  if (
    relatoResult.rows.length === 0
  ) {

    return null;

  }

  const relato =
    relatoResult.rows[0];

  const result =
    await pool.query(
      `
        INSERT INTO canal_integridade_mensagens (
          relato_id,
          origem,
          mensagem
        )
        VALUES (
          $1,
          'manifestante',
          $2
        )
        RETURNING *;
      `,
      [
        relato.id,
        String(mensagem).trim()
      ]
    );

  const ultimoEmailResult =
    await pool.query(
      `
        SELECT
          email_message_id
        FROM canal_integridade_mensagens
        WHERE
          relato_id = $1
          AND email_message_id IS NOT NULL
        ORDER BY data_envio DESC
        LIMIT 1;
      `,
      [
        relato.id
      ]
    );

  const ultimoEmailMessageId =
    ultimoEmailResult.rows[0]
      ?.email_message_id || null;

  return {

    ...result.rows[0],

    protocolo:
      relato.protocolo,

    identificado:
      relato.identificado,

    email:
      relato.email,

    ultimoEmailMessageId

  };

}

export async function adicionarMensagemHmaa(
  protocolo,
  mensagem
) {

  if (
    !protocolo ||
    !mensagem ||
    !String(protocolo).trim() ||
    !String(mensagem).trim()
  ) {

    return null;
  }

  const relatoResult =
    await pool.query(
      `
        SELECT
          id
        FROM canal_integridade_relatos
        WHERE protocolo = $1
        LIMIT 1;
      `,
      [
        String(protocolo).trim()
      ]
    );

  if (
    relatoResult.rows.length === 0
  ) {

    console.warn(
      "⚠️ Protocolo de integridade não encontrado:",
      protocolo
    );

    return null;
  }

  const relatoId =
    relatoResult.rows[0].id;

  const result =
    await pool.query(
      `
        INSERT INTO canal_integridade_mensagens (
          relato_id,
          origem,
          mensagem
        )
        VALUES (
          $1,
          'hmaa',
          $2
        )
        RETURNING *;
      `,
      [
        relatoId,
        String(mensagem).trim()
      ]
    );

  console.log(
    "📨 Mensagem do HMAA registrada no relato:",
    protocolo
  );

  return result.rows[0];
}

export async function adicionarMensagemEmail({
  protocolo,
  origem,
  mensagem,
  emailMessageId
}) {

  if (
    !protocolo ||
    !origem ||
    !mensagem ||
    !emailMessageId
  ) {
    return null;
  }

  const protocoloLimpo =
    String(protocolo).trim();

  const mensagemLimpa =
    String(mensagem).trim();

  const emailMessageIdLimpo =
    String(emailMessageId).trim();

  if (
    !protocoloLimpo ||
    !mensagemLimpa ||
    !emailMessageIdLimpo
  ) {
    return null;
  }

  const existente =
    await pool.query(
      `
        SELECT id
        FROM canal_integridade_mensagens
        WHERE email_message_id = $1
        LIMIT 1;
      `,
      [emailMessageIdLimpo]
    );

  if (
    existente.rows.length > 0
  ) {

    console.log(
      "↩️ E-mail já registrado:",
      emailMessageIdLimpo
    );

    return existente.rows[0];
  }

  const relatoResult =
    await pool.query(
      `
        SELECT id
        FROM canal_integridade_relatos
        WHERE protocolo = $1
        LIMIT 1;
      `,
      [protocoloLimpo]
    );

  if (
    relatoResult.rows.length === 0
  ) {

    console.warn(
      "⚠️ Protocolo não encontrado:",
      protocoloLimpo
    );

    return null;
  }

  const relatoId =
    relatoResult.rows[0].id;

  try {

    const result =
      await pool.query(
        `
          INSERT INTO canal_integridade_mensagens (
            relato_id,
            origem,
            mensagem,
            email_message_id
          )
          VALUES (
            $1,
            $2,
            $3,
            $4
          )
          RETURNING *;
        `,
        [
          relatoId,
          origem,
          mensagemLimpa,
          emailMessageIdLimpo
        ]
      );

    console.log(
      "📨 Mensagem de e-mail registrada:",
      protocoloLimpo,
      origem
    );

    return result.rows[0];

  } catch (error) {

    if (
      error.code === "23505"
    ) {

      console.log(
        "↩️ Mensagem já registrada:",
        emailMessageIdLimpo
      );

      const existenteDepois =
        await pool.query(
          `
            SELECT *
            FROM canal_integridade_mensagens
            WHERE email_message_id = $1
            LIMIT 1;
          `,
          [emailMessageIdLimpo]
        );

      return existenteDepois.rows[0] || null;
    }

    throw error;
  }
}

function gerarTokenExportacao() {

  return crypto
    .randomBytes(24)
    .toString("hex")
    .toUpperCase()
    .match(/.{1,6}/g)
    .join("-");
}

function gerarHashTokenExportacao(
  token
) {

  const secret =
    process.env.INTEGRIDADE_SECRET ||
    "chave-integridade-hmaa";

  return crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(
      String(token)
        .trim()
        .toUpperCase()
    )
    .digest("hex");
}

export async function solicitarExportacaoIntegridade(
  ipSolicitante = null
) {

  const pendenteResult =
    await pool.query(
      `
        SELECT
          id,
          expira_em
        FROM canal_integridade_export_tokens
        WHERE
          usado_em IS NULL
          AND expira_em > NOW()
        ORDER BY criado_em DESC
        LIMIT 1;
      `
    );

  if (
    pendenteResult.rows.length > 0
  ) {

    return {
      pendente: true,
      expiraEm:
        pendenteResult.rows[0].expira_em
    };
  }

  const token =
    gerarTokenExportacao();

  const tokenHash =
    gerarHashTokenExportacao(
      token
    );

    const expiraEm =
    new Date(
      Date.now() +
      30 * 60 * 1000
    );

  await pool.query(
    `
      INSERT INTO canal_integridade_export_tokens (
        token_hash,
        expira_em,
        ip_solicitante
      )
      VALUES (
        $1,
        $2,
        $3
      );
    `,
    [
      tokenHash,
      expiraEm,
      ipSolicitante
    ]
  );

  console.log(
    "🔐 Código de exportação de integridade gerado."
  );

  return {
    pendente: false,
    token,
    expiraEm
  };
}

export async function exportarRelatosIntegridade(
  token
) {

  if (
    !token ||
    !String(token).trim()
  ) {

    return {
      sucesso: false,
      motivo: "token_invalido"
    };
  }

  const tokenHash =
    gerarHashTokenExportacao(
      token
    );

  const client =
    await pool.connect();

  try {

    await client.query("BEGIN");

    const tokenResult =
      await client.query(
        `
          SELECT
            id,
            expira_em,
            usado_em
          FROM canal_integridade_export_tokens
          WHERE token_hash = $1
          FOR UPDATE;
        `,
        [
          tokenHash
        ]
      );

    if (
      tokenResult.rows.length === 0
    ) {

      await client.query("ROLLBACK");

      return {
        sucesso: false,
        motivo: "token_invalido"
      };
    }

    const tokenRegistro =
      tokenResult.rows[0];

    if (
      tokenRegistro.usado_em
    ) {

      await client.query("ROLLBACK");

      return {
        sucesso: false,
        motivo: "token_usado"
      };
    }

    if (
      new Date(tokenRegistro.expira_em)
      <= new Date()
    ) {

      await client.query("ROLLBACK");

      return {
        sucesso: false,
        motivo: "token_expirado"
      };
    }

    const relatosResult =
      await client.query(
        `
          SELECT
            r.protocolo,
            r.data_registro,
            r.status,
            r.identificado,
            r.nome,
            r.funcao,
            r.email,
            r.telefone,
            r.celular,
            r.tipo,
            r.local,
            r.descricao,
            COUNT(a.id)::int AS quantidade_anexos
          FROM canal_integridade_relatos r
          LEFT JOIN canal_integridade_anexos a
            ON a.relato_id = r.id
          GROUP BY
            r.id,
            r.protocolo,
            r.data_registro,
            r.status,
            r.identificado,
            r.nome,
            r.funcao,
            r.email,
            r.telefone,
            r.celular,
            r.tipo,
            r.local,
            r.descricao
          ORDER BY
            r.data_registro DESC;
        `
      );

    await client.query(
      `
        UPDATE canal_integridade_export_tokens
        SET usado_em = NOW()
        WHERE id = $1;
      `,
      [
        tokenRegistro.id
      ]
    );

    await client.query("COMMIT");

    console.log(
      "📊 Exportação de relatos realizada:",
      relatosResult.rows.length,
      "relatos."
    );

    return {
      sucesso: true,
      dados: relatosResult.rows
    };

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "❌ Erro ao exportar relatos:",
      error
    );

    throw error;

  } finally {

    client.release();
  }
}

function gerarTokenExportacaoOuvidoria() {

  return crypto
    .randomBytes(24)
    .toString("hex")
    .toUpperCase()
    .match(/.{1,6}/g)
    .join("-");
}

function gerarHashTokenExportacaoOuvidoria(
  token
) {

  const secret =
    process.env.INTEGRIDADE_SECRET ||
    "chave-integridade-hmaa";

  return crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(
      String(token)
        .trim()
        .toUpperCase()
    )
    .digest("hex");
}

export async function solicitarExportacaoOuvidoria(
  ipSolicitante = null
) {

  const pendenteResult =
    await pool.query(
      `
        SELECT
          id,
          expira_em
        FROM ouvidoria_export_tokens
        WHERE
          usado_em IS NULL
          AND expira_em > NOW()
        ORDER BY criado_em DESC
        LIMIT 1;
      `
    );

  if (
    pendenteResult.rows.length > 0
  ) {

    return {
      pendente: true,
      expiraEm:
        pendenteResult.rows[0].expira_em
    };
  }

   const token =
    gerarTokenExportacaoOuvidoria();

  const tokenHash =
    gerarHashTokenExportacaoOuvidoria(
      token
    );

  const expiraEm =
    new Date(
      Date.now() +
      30 * 60 * 1000
    );

  await pool.query(
    `
      INSERT INTO ouvidoria_export_tokens (
        token_hash,
        expira_em,
        ip_solicitante
      )
      VALUES (
        $1,
        $2,
        $3
      );
    `,
    [
      tokenHash,
      expiraEm,
      ipSolicitante
    ]
  );

  console.log(
    "🔐 Código de exportação da Ouvidoria gerado."
  );

  return {
    pendente: false,
    token,
    expiraEm
  };
}

export async function exportarManifestacoesOuvidoria(
  token
) {

  if (
    !token ||
    !String(token).trim()
  ) {

    return {
      sucesso: false,
      motivo: "token_invalido"
    };
  }

  const tokenHash =
    gerarHashTokenExportacaoOuvidoria(
      token
    );

  const client =
    await pool.connect();

  try {

    await client.query("BEGIN");

    const tokenResult =
      await client.query(
        `
          SELECT
            id,
            expira_em,
            usado_em
          FROM ouvidoria_export_tokens
          WHERE token_hash = $1
          FOR UPDATE;
        `,
        [
          tokenHash
        ]
      );

    if (
      tokenResult.rows.length === 0
    ) {

      await client.query("ROLLBACK");

      return {
        sucesso: false,
        motivo: "token_invalido"
      };
    }

    const tokenRegistro =
      tokenResult.rows[0];

    if (
      tokenRegistro.usado_em
    ) {

      await client.query("ROLLBACK");

      return {
        sucesso: false,
        motivo: "token_usado"
      };
    }

    if (
      new Date(tokenRegistro.expira_em)
      <= new Date()
    ) {

      await client.query("ROLLBACK");

      return {
        sucesso: false,
        motivo: "token_expirado"
      };
    }

    const manifestacoesResult =
      await client.query(
        `
          SELECT
            protocolo,
            data_registro,
            tipo,
            nome,
            email,
            telefone,
            descricao
          FROM ouvidoria_manifestacoes
          ORDER BY
            data_registro DESC;
        `
      );

    await client.query(
      `
        UPDATE ouvidoria_export_tokens
        SET usado_em = NOW()
        WHERE id = $1;
      `,
      [
        tokenRegistro.id
      ]
    );

    await client.query("COMMIT");

    console.log(
      "📊 Exportação da Ouvidoria realizada:",
      manifestacoesResult.rows.length,
      "manifestações."
    );

    return {
      sucesso: true,
      dados: manifestacoesResult.rows
    };

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "❌ Erro ao exportar manifestações da Ouvidoria:",
      error
    );

    throw error;

  } finally {

    client.release();
  }
}

export {
  gerarHashCodigo
};