Write-Host "=== Nettoyage disque + commit force ===" -ForegroundColor Cyan

# 1. Supprimer le lock git si present
if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force; Write-Host "Lock supprime" -ForegroundColor Gray }

# 2. Nettoyer npm cache pour liberer espace
Write-Host "Nettoyage cache npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Select-Object -Last 1 | Write-Host

# 3. Nettoyer git objects
git gc --prune=now 2>&1 | Select-Object -Last 2 | Write-Host

# 4. Verifier espace disque
$disk = Get-PSDrive C | Select-Object -ExpandProperty Free
Write-Host "Espace libre C: $([math]::Round($disk/1GB, 2)) GB" -ForegroundColor Cyan

# 5. Forcer le git add et commit
Write-Host "Git status..." -ForegroundColor Yellow
git status --short

git add frontend/api/migrate.js frontend/api/directions.js frontend/api/engagements.js frontend/api/alerts.js frontend/api/budget.js frontend/vercel.json 2>&1 | Write-Host
$c = git commit -m "fix: API routes JS pour Neon PostgreSQL" 2>&1
Write-Host "Commit: $c" -ForegroundColor Gray
$p = git push origin main 2>&1
Write-Host "Push: $p" -ForegroundColor Gray

Write-Host "Done!" -ForegroundColor Green