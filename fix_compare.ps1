Write-Host "Fix: ajout import useState dans ComparePage" -ForegroundColor Cyan

# Lire le fichier actuel
$file = "frontend\src\ui\pages\ComparePage.tsx"
$content = [System.IO.File]::ReadAllText((Join-Path (Get-Location).Path $file), [System.Text.Encoding]::UTF8)

# Ajouter l'import si absent
if (-not $content.StartsWith("import { useState }")) {
  $fixed = 'import { useState } from "react";' + "`n" + $content
  [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $file), $fixed, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "  import useState ajoute" -ForegroundColor Gray
} else {
  Write-Host "  deja present" -ForegroundColor Gray
}

git add -A
$c = git commit -m "fix: add useState import in ComparePage.tsx" 2>&1
Write-Host "  $c" -ForegroundColor Gray
$p = git push origin main 2>&1
Write-Host "  $p" -ForegroundColor Gray
Write-Host "DONE — Vercel va redeployer automatiquement." -ForegroundColor Green
Write-Host "https://budgetnew.vercel.app/users" -ForegroundColor Cyan
Write-Host "https://budgetnew.vercel.app/compare" -ForegroundColor Cyan