// Sincroniza o fork conddiz/hmaa com ssillva1413/Projeto-Hmaa a cada 5 minutos.
// O merge feito com o token de usuario gera um push na main, e esse push dispara o
// deploy do Pages (.github/workflows/deploy.yml). O cron do GitHub sozinho atrasa horas.
const REPO = "conddiz/hmaa";
const BRANCH = "main";

export async function syncFork(token) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/merge-upstream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "hmaa-fork-sync",
    },
    body: JSON.stringify({ branch: BRANCH }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`merge-upstream ${res.status}: ${body.message ?? "sem detalhes"}`);
  return body;
}

export default {
  async scheduled(controller, env) {
    if (!env.GITHUB_TOKEN) {
      console.warn("GITHUB_TOKEN nao configurado (scripts/Install-ForkSync.ps1)");
      return;
    }
    const r = await syncFork(env.GITHUB_TOKEN);
    if (r.merge_type !== "none") console.log(`fork sincronizado (${r.merge_type}): ${r.message}`);
  },
};
