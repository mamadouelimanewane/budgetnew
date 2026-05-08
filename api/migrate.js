import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.json({
      status: "ok",
      pg: !!process.env.POSTGRES_URL,
      node: process.version
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

  if (body.secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Invalid secret", has_secret: !!process.env.MIGRATE_SECRET });
  }

  const pgUrl = process.env.POSTGRES_URL;
  if (!pgUrl) return res.status(500).json({ error: "POSTGRES_URL not set" });

  const sql = neon(pgUrl);

  try {
    await sql`CREATE TABLE IF NOT EXISTS budget_plans (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, year INTEGER NOT NULL, total_amount BIGINT NOT NULL, status VARCHAR(50) DEFAULT 'Actif', created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS directions (id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, budget_plan_id INTEGER, allocated BIGINT NOT NULL DEFAULT 0, consumed BIGINT NOT NULL DEFAULT 0, status VARCHAR(50) DEFAULT 'Normal', updated_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS engagements (id SERIAL PRIMARY KEY, reference VARCHAR(50) UNIQUE NOT NULL, vendor_name VARCHAR(255) NOT NULL, vendor_ninea VARCHAR(50), amount BIGINT NOT NULL, description TEXT, direction_code VARCHAR(20), type VARCHAR(50) DEFAULT 'Bien', region VARCHAR(100) DEFAULT 'Dakar', status VARCHAR(50) DEFAULT 'En attente', anomaly_score DECIMAL(4,2) DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS alerts (id SERIAL PRIMARY KEY, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, body TEXT, direction_code VARCHAR(20), severity VARCHAR(20) DEFAULT 'info', read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

    await sql`INSERT INTO budget_plans (name, year, total_amount, status) VALUES ('Budget General 2026', 2026, 4500000000000, 'Actif') ON CONFLICT DO NOTHING`;

    for (const [code, name, alloc, cons, status] of [
      ['DGID',  'Direction Generale Impots et Domaines',     1200000000000, 748000000000,  'Normal'  ],
      ['DGCPT', 'Direction Generale Comptabilite Publique',   980000000000, 921000000000,  'Alerte'  ],
      ['DPEE',  'Direction Prevision Etudes Economiques',     650000000000, 310000000000,  'Normal'  ],
      ['DAGE',  'Direction Administration Gestion Entretien', 420000000000, 418000000000,  'Critique'],
      ['PRIM',  'Primature',                                  350000000000, 180000000000,  'Normal'  ],
      ['DSI',   'Direction Systemes Information',             280000000000, 140000000000,  'Normal'  ],
      ['DAF',   'Direction Affaires Financieres',             320000000000, 196000000000,  'Normal'  ],
    ]) {
      await sql`INSERT INTO directions (code, name, budget_plan_id, allocated, consumed, status) VALUES (${code}, ${name}, 1, ${alloc}, ${cons}, ${status}) ON CONFLICT (code) DO UPDATE SET consumed = EXCLUDED.consumed, status = EXCLUDED.status`;
    }

    for (const [ref, vendor, amount, dir, status, score] of [
      ['BC-2026-001','SENELEC',        45000000000,  'DAF',  'Liquide',   0.02],
      ['BC-2026-002','SONES',          28500000000,  'DAF',  'Liquide',   0.03],
      ['BC-2026-005','SAGAM Securite', 850000000000, 'DAGE', 'Suspendu',  0.87],
      ['BC-2025-089','Prestataire X',  420000000000, 'DPEE', 'En cours',  0.62],
    ]) {
      await sql`INSERT INTO engagements (reference, vendor_name, amount, direction_code, status, anomaly_score) VALUES (${ref}, ${vendor}, ${amount}, ${dir}, ${status}, ${score}) ON CONFLICT (reference) DO NOTHING`;
    }

    return res.json({ success: true, message: "Migration complete: 4 tables + 7 directions + 4 engagements" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, stack: err.stack?.slice(0, 500) });
  }
}
