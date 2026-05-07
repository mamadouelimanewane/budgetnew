Write-Host "=== Fix Vercel Frontend ===" -ForegroundColor Cyan
function Write-B64 { param($p,$b)
  $full = Join-Path (Get-Location).Path $p
  $dir = Split-Path $full -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bytes = [Convert]::FromBase64String($b)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($full, $text, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "  -> $p" -ForegroundColor Gray
}

Write-B64 "frontend\vercel.json" "ewogICJ2ZXJzaW9uIjogMiwKICAiYnVpbGRDb21tYW5kIjogIm5wbSBydW4gYnVpbGQiLAogICJvdXRwdXREaXJlY3RvcnkiOiAiZGlzdCIsCiAgImluc3RhbGxDb21tYW5kIjogIm5wbSBpbnN0YWxsIiwKICAiZnJhbWV3b3JrIjogInZpdGUiCn0K"
Write-B64 "frontend\src\ui\pages\LoginPage.tsx" "aW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAicmVhY3QiOwppbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gInJlYWN0LXJvdXRlci1kb20iOwoKZXhwb3J0IGZ1bmN0aW9uIExvZ2luUGFnZSgpIHsKICBjb25zdCBuYXYgPSB1c2VOYXZpZ2F0ZSgpOwogIHVzZUVmZmVjdCgoKSA9PiB7CiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgiYnVkZ2V0MV9hdXRoIiwgSlNPTi5zdHJpbmdpZnkoeyB0b2tlbjogImRlbW8iLCBlbWFpbDogImRlbW9AYnVkZ2V0bmV3LnNuIiB9KSk7CiAgICBuYXYoIi9kYXNoYm9hcmQiLCB7IHJlcGxhY2U6IHRydWUgfSk7CiAgfSwgW10pOwogIHJldHVybiAoCiAgICA8ZGl2IHN0eWxlPXt7IG1pbkhlaWdodDoiMTAwdmgiLCBkaXNwbGF5OiJmbGV4IiwgYWxpZ25JdGVtczoiY2VudGVyIiwganVzdGlmeUNvbnRlbnQ6ImNlbnRlciIgfX0+CiAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOjE2LCBjb2xvcjoiIzVGNUU1QSIgfX0+Q2hhcmdlbWVudCBkw6ltby4uLjwvcD4KICAgIDwvZGl2PgogICk7Cn0K"

# Supprimer le vercel.json racine qui cause le conflit
if (Test-Path "vercel.json") { Remove-Item "vercel.json" -Force; Write-Host "  vercel.json racine supprime" -ForegroundColor Gray }

git add -A
$c = git commit -m "fix: vercel frontend-only deploy, remove root vercel.json" 2>&1
Write-Host "  $c" -ForegroundColor Gray
$p = git push origin main 2>&1
Write-Host "  $p" -ForegroundColor Gray
Write-Host "" 
Write-Host "DONE. Maintenant sur Vercel :" -ForegroundColor Green
Write-Host "  Settings > General > Root Directory > changer en: frontend" -ForegroundColor Yellow
Write-Host "  Puis cliquer Save et Redeploy" -ForegroundColor Yellow