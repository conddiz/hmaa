<#
  Set-DnsHmaa.ps1
  Aponta hospitalagenoraraujo.com.br (raiz e www) para o Cloudflare Pages
  (projeto "hmaa") ou de volta para o VPS da Conddiz (rollback).
  Tokens e IP do VPS vem do cofre global (DPAPI), so em memoria; nada e impresso.

  Exemplos (Windows PowerShell 5.1):
    .\scripts\Set-DnsHmaa.ps1 -Simular          # mostra o plano, nao altera nada
    .\scripts\Set-DnsHmaa.ps1                   # troca para o Pages
    .\scripts\Set-DnsHmaa.ps1 -Destino vps      # rollback para o nginx do VPS
#>
[CmdletBinding()]
param(
  [ValidateSet('pages', 'vps')][string]$Destino = 'pages',
  [switch]$Simular,
  [string]$VaultRoot = 'C:\Projects\.global-vault'
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Zona    = 'hospitalagenoraraujo.com.br'
$Www     = "www.$Zona"
$Projeto = 'hmaa'
$Api     = 'https://api.cloudflare.com/client/v4'

# Mesmo formato do Protect-Vault.ps1 (ConvertFrom-SecureString, DPAPI CurrentUser).
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

$cf = Read-VaultProfile 'conddiz/cloudflare'
$zoneId = $cf['CF_ZONE_HOSPITALAGENORARAUJO_COM_BR']
if (-not $zoneId) { throw 'CF_ZONE_HOSPITALAGENORARAUJO_COM_BR ausente em conddiz/cloudflare.' }
# DNS desta zona so aceita o token de USUARIO; Pages aceita o de CONTA.
$hDns   = @{ Authorization = "Bearer $($cf['CF_USER_API_TOKEN'])";    'Content-Type' = 'application/json' }
$hPages = @{ Authorization = "Bearer $($cf['CF_ACCOUNT_API_TOKEN'])"; 'Content-Type' = 'application/json' }
$acct   = $cf['CF_ACCOUNT_ID']
$cf = $null

if ($Destino -eq 'pages') {
  $alvo = @(
    @{ type = 'CNAME'; name = $Zona; content = "$Projeto.pages.dev"; proxied = $true; ttl = 1; comment = 'Cloudflare Pages (hmaa)' },
    @{ type = 'CNAME'; name = $Www;  content = "$Projeto.pages.dev"; proxied = $true; ttl = 1; comment = 'Cloudflare Pages (hmaa)' }
  )
} else {
  $vpsHost = (Read-VaultProfile 'vps/conddiz')['VPS_HOST']
  if (-not $vpsHost) { throw 'VPS_HOST ausente em vps/conddiz.' }
  $alvo = @(
    @{ type = 'A';     name = $Zona; content = $vpsHost; proxied = $true; ttl = 1; comment = 'nginx VPS Conddiz' },
    @{ type = 'CNAME'; name = $Www;  content = $Zona;    proxied = $true; ttl = 1; comment = 'nginx VPS Conddiz' }
  )
}

# Registros atuais de raiz e www que conflitam com o alvo (A/AAAA/CNAME)
$atuais = @()
foreach ($n in $Zona, $Www) {
  $r = Invoke-RestMethod -Headers $hDns -Uri "$Api/zones/$zoneId/dns_records?name=$n&per_page=50"
  $atuais += @($r.result | Where-Object { $_.type -in 'A', 'AAAA', 'CNAME' })
}

$deletes = @(); $posts = @()
foreach ($a in $alvo) {
  $ex = @($atuais | Where-Object { $_.name -eq $a.name })
  $igual = ($ex.Count -eq 1) -and ($ex[0].type -eq $a.type) -and ($ex[0].content -eq $a.content) -and ($ex[0].proxied -eq $a.proxied)
  if ($igual) { Write-Host "ok (sem mudanca): $($a.name) $($a.type) -> $($a.content)"; continue }
  foreach ($e in $ex) { $deletes += @{ id = $e.id }; Write-Host "remover: $($e.name) $($e.type) -> $($e.content) proxied=$($e.proxied)" }
  $posts += $a; Write-Host "criar:   $($a.name) $($a.type) -> $($a.content) proxied=$($a.proxied)"
}

if ($Simular) { Write-Host "`n-Simular: nada foi alterado." -ForegroundColor Yellow; return }

if ($posts.Count) {
  # Lote atomico: a Cloudflare aplica os deletes antes dos posts, e tudo ou nada.
  $body = @{ deletes = $deletes; posts = $posts } | ConvertTo-Json -Depth 5
  $r = Invoke-RestMethod -Method Post -Headers $hDns -Body $body -Uri "$Api/zones/$zoneId/dns_records/batch"
  if (-not $r.success) { throw ($r.errors | ConvertTo-Json -Depth 5) }
  Write-Host "DNS atualizado para: $Destino" -ForegroundColor Green
}

# www -> raiz (301), como o nginx fazia. Nao derruba o script se faltar permissao.
try {
  $regra = @{
    ref = 'hmaa_www_para_raiz'; description = 'www -> raiz (hmaa)'; enabled = $true
    expression = "(http.host eq `"$Www`")"; action = 'redirect'
    action_parameters = @{ from_value = @{ status_code = 301; preserve_query_string = $true
      target_url = @{ expression = "concat(`"https://$Zona`", http.request.uri.path)" } } }
  }
  $fase = "$Api/zones/$zoneId/rulesets/phases/http_request_dynamic_redirect/entrypoint"
  $existentes = @()
  try { $existentes = @((Invoke-RestMethod -Headers $hDns -Uri $fase).result.rules | Where-Object { $_ }) } catch {}  # 404 = fase ainda sem regras
  if ($existentes | Where-Object { $_.ref -eq $regra.ref }) {
    Write-Host 'Redirect www -> raiz ja existe.'
  } else {
    $null = Invoke-RestMethod -Method Put -Headers $hDns -Uri $fase -Body (@{ rules = @($existentes + $regra) } | ConvertTo-Json -Depth 10)
    Write-Host 'Redirect www -> raiz criado.'
  }
} catch { Write-Warning "Redirect www -> raiz nao aplicado: $($_.Exception.Message)" }

if ($Destino -eq 'pages') {
  Write-Host 'Aguardando o Pages ativar os dominios (ate 5 min)...'
  foreach ($d in $Zona, $Www) {
    for ($i = 0; $i -lt 30; $i++) {
      $st = (Invoke-RestMethod -Headers $hPages -Uri "$Api/accounts/$acct/pages/projects/$Projeto/domains/$d").result.status
      if ($st -eq 'active') { break }
      Start-Sleep -Seconds 10
    }
    Write-Host "  $d : $st"
  }
}
