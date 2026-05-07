param(
  [int]$Port = 8000,
  [switch]$WithML
)

$env:APP_ENV = "dev"
if (-not $env:DATABASE_URL) { $env:DATABASE_URL = "sqlite:///./budget1-dev.db" }
if (-not $env:JWT_SECRET) { $env:JWT_SECRET = "dev-change-me" }
if (-not $env:JWT_ISSUER) { $env:JWT_ISSUER = "budget1" }
if (-not $env:CORS_ORIGINS) { $env:CORS_ORIGINS = "http://localhost:5173" }

$venvPath = ".venv-dev"

if (-not (Test-Path $venvPath)) {
  python -m venv $venvPath
}

& "$venvPath\\Scripts\\python" -m pip install --upgrade pip
& "$venvPath\\Scripts\\pip" install -r requirements.txt
if ($WithML) {
  & "$venvPath\\Scripts\\pip" install -r requirements-ml.txt
}
& "$venvPath\\Scripts\\uvicorn" app.main:app --host 0.0.0.0 --port $Port

