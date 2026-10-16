<#
  Install-ForkSync.ps1
  Publica o Worker "hmaa-fork-sync" (Cloudflare, conta Conddiz), que a cada 5 min
  sincroniza o fork conddiz/hmaa com ssillva1413/Projeto-Hmaa. O push gerado dispara
  o deploy do site no Pages.

  O Worker precisa de um token do GitHub. Use um fine-grained, NAO o do cofre conddiz/github:
    github.com/settings/personal-access-tokens/new
      Resource owner: conddiz | Only select repositories: conddiz/hmaa
      Repository permissions > Contents: Read and write
  O token e pedido com entrada mascarada, testado no GitHub, guardado no cofre
  (perfil conddiz/hmaa-sync) e gravado como secret do Worker. Nada e impresso.

  Exemplos (Windows PowerShell 5.1):
    .\scripts\Install-ForkSync.ps1 -Simular     # valida cofre e bundle, nao publica nada
    .\scripts\Install-ForkSync.ps1              # pede o token, publica o Worker e o secret
    .\scripts\Install-ForkSync.ps1 -DoCofre     # republica usando o token ja guardado
#>
[CmdletBinding()]
param(
  [switch]$Simular,
  [switch]$DoCofre,
  [securestring]$Token,
  [string]$VaultRoot = 'C:\Projects\.global-vault'
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Worker    = 'hmaa-fork-sync'
$Wrangler  = 'wrangler@4.151.1'
$WorkerDir = Join-Path $PSScriptRoot '..\workers\fork-sync'
$PerfilTok = 'conddiz/hmaa-sync'

function Read-VaultProfile([string]$profileName) {
  $encPath = Join-Path $VaultRoot (($profileName -replace '/', '\') + '.env.enc')
  if (-not (Test-Path $encPath)) { throw "Perfil '$profileName' nao encontrado ($encPath)." }
  $secure = ConvertTo-SecureString -String (Get-Content -Raw -LiteralPath $encPath).Trim()
  $bstr   = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try   { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
  $vals = @{}
  foreach ($ln in ($plain -split "`r?`n")) {
    if ($ln -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') { $vals[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'") }
  }
  return $vals
}

function ConvertFrom-Secure([securestring]$s) {
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try   { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$cf   = Read-VaultProfile 'conddiz/cloudflare'
$acct = $cf['CF_ACCOUNT_ID']
$hCf  = @{ Authorization = "Bearer $($cf['CF_ACCOUNT_API_TOKEN'])"; 'Content-Type' = 'application/json' }

# 1) Token do GitHub
if ($DoCofre) {
  $gh = (Read-VaultProfile $PerfilTok)['GITHUB_SYNC_TOKEN']
  if (-not $gh) { throw "GITHUB_SYNC_TOKEN ausente em $PerfilTok." }
} elseif (-not $Simular -or $Token) {
  if (-not $Token) { $Token = Read-Host -AsSecureString 'Cole o token fine-grained do GitHub (conddiz/hmaa, Contents: Read and write)' }
  $gh = (ConvertFrom-Secure $Token).Trim()
  if (-not $gh) { throw 'Token vazio.' }
}

# 2) Testa o token fazendo a propria sincronizacao (no-op se o fork ja esta em dia)
if ($gh) {
  try {
    $r = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/repos/conddiz/hmaa/merge-upstream' `
         -Headers @{ Authorization = "Bearer $gh"; Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28' } `
         -Body '{"branch":"main"}' -ContentType 'application/json'
    Write-Host "Token OK no GitHub ($($r.merge_type)): $($r.message)" -ForegroundColor Green
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    throw ("Token recusado pelo GitHub (HTTP $code). 401 = token invalido; 403 = falta Contents: Read and write; " +
           "404 = sem acesso ao conddiz/hmaa ou aguardando aprovacao em github.com/organizations/conddiz/settings/personal-access-token-requests")
  }
}

if ($Simular) {
  Push-Location $WorkerDir
  try {
    & npx -y $Wrangler deploy --dry-run --outdir "$env:TEMP\hmaa-fork-sync-dryrun"
    if ($LASTEXITCODE -ne 0) { throw "wrangler deploy --dry-run falhou ($LASTEXITCODE)." }
  } finally { Pop-Location }
  Write-Host "`n-Simular: cofre e bundle OK; nada foi publicado." -ForegroundColor Yellow
  return
}

# 3) Guarda no cofre (mesmo formato do Protect-Vault.ps1)
if (-not $DoCofre) {
  $enc = ConvertFrom-SecureString -SecureString (ConvertTo-SecureString -String "GITHUB_SYNC_TOKEN=$gh`n" -AsPlainText -Force)
  Set-Content -LiteralPath (Join-Path $VaultRoot 'conddiz\hmaa-sync.env.enc') -Value $enc -Encoding ascii -NoNewline
  Write-Host "Token guardado no cofre ($PerfilTok)."
}

# 4) Publica o Worker e o secret
$env:CLOUDFLARE_API_TOKEN  = $cf['CF_ACCOUNT_API_TOKEN']
$env:CLOUDFLARE_ACCOUNT_ID = $acct
$env:WRANGLER_SEND_METRICS = 'false'
Push-Location $WorkerDir
try {
  & npx -y $Wrangler deploy
  if ($LASTEXITCODE -ne 0) { throw "wrangler deploy falhou ($LASTEXITCODE)." }
} finally {
  Pop-Location
  Remove-Item Env:CLOUDFLARE_API_TOKEN, Env:CLOUDFLARE_ACCOUNT_ID -ErrorAction SilentlyContinue
}

$body = @{ name = 'GITHUB_TOKEN'; text = $gh; type = 'secret_text' } | ConvertTo-Json
$r = Invoke-RestMethod -Method Put -Headers $hCf -Body $body `
     -Uri "https://api.cloudflare.com/client/v4/accounts/$acct/workers/scripts/$Worker/secrets"
$gh = $null; $body = $null
if (-not $r.success) { throw ($r.errors | ConvertTo-Json -Depth 5) }
Write-Host 'Secret GITHUB_TOKEN gravado no Worker.' -ForegroundColor Green

$s = Invoke-RestMethod -Headers $hCf -Uri "https://api.cloudflare.com/client/v4/accounts/$acct/workers/scripts/$Worker/schedules"
Write-Host ("Cron ativo: " + (($s.result.schedules | ForEach-Object { $_.cron }) -join ', ')) -ForegroundColor Green
