Write-Host "Fix Vercel config" -ForegroundColor Cyan
function Write-B64 { param($p,$b)
  $full = Join-Path (Get-Location).Path $p
  $bytes = [Convert]::FromBase64String($b)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($full, $text, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "  -> $p" -ForegroundColor Gray
}
Write-B64 "frontend\vercel.json" "ewogICJidWlsZENvbW1hbmQiOiAibnBtIHJ1biBidWlsZCIsCiAgIm91dHB1dERpcmVjdG9yeSI6ICJkaXN0IiwKICAiaW5zdGFsbENvbW1hbmQiOiAibnBtIGluc3RhbGwiLAogICJmcmFtZXdvcmsiOiAidml0ZSIKfQo="
if (Test-Path "vercel.json") { Remove-Item "vercel.json" -Force; Write-Host "  Root vercel.json removed" -ForegroundColor Gray }
git add -A
$c = git commit -m "fix: vercel config frontend-only, remove root vercel.json" 2>&1
Write-Host "  $c" -ForegroundColor Gray
$p = git push origin main 2>&1
Write-Host "  $p" -ForegroundColor Gray
Write-Host "" 
Write-Host "MAINTENANT sur Vercel :" -ForegroundColor Yellow
Write-Host "1. Settings > General > Root Directory > taper: frontend" -ForegroundColor Yellow
Write-Host "2. Save puis Redeploy" -ForegroundColor Yellow