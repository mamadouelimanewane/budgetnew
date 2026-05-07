param(
  [int]$Port = 5173
)

if (-not $env:VITE_API_BASE_URL) { $env:VITE_API_BASE_URL = "http://localhost:8000" }

npm install
npm run dev -- --host 0.0.0.0 --port $Port

