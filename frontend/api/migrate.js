const { neon } = require("@neondatabase/serverless");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.json({ status: "ok", pg: !!process.env.POSTGRES_URL });

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const body = req.body || {};
  if (body.secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Invalid secret. Check MIGRATE_SECRET env var." });
  }

  const url = process.env.POSTGRES_URL;
  if (!url) return res.status(500).json({ error: "POSTGRES_URL not set" });

  const sql = neon(url);

  try {
    await sql`CREATE TABLE IF NOT EXISTS budget_plans (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, year INTEGER NOT NULL, total_amount BIGINT NOT NULL, status VARCHAR(50) DEFAULT 'Actif', created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS directions (id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, budget_plan_id INTEGER, allocated BIGINT NOT NULL DEFAULT 0, consumed BIGINT NOT NULL DEFAULT 0, status VARCHAR(50) DEFAULT 'Normal', updated_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS engagements (id SERIAL PRIMARY KEY, reference VARCHAR(50) UNIQUE NOT NULL, vendor_name VARCHAR(255) NOT NULL, vendor_ninea VARCHAR(50), amount BIGINT NOT NULL, description TEXT, direction_code VARCHAR(20), type VARCHAR(50) DEFAULT 'Bien', region VARCHAR(100) DEFAULT 'Dakar', status VARCHAR(50) DEFAULT 'En attente', anomaly_score DECIMAL(4,2) DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS marches (id SERIAL PRIMARY KEY, reference VARCHAR(50) UNIQUE NOT NULL, objet TEXT NOT NULL, direction_code VARCHAR(20), montant_estime BIGINT NOT NULL, type_marche VARCHAR(50) DEFAULT 'AO ouvert', statut VARCHAR(50) DEFAULT 'Publie', beneficiaire VARCHAR(255), created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS alerts (id SERIAL PRIMARY KEY, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, body TEXT, direction_code VARCHAR(20), severity VARCHAR(20) DEFAULT 'info', read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

    await sql`INSERT INTO budget_plans (name, year, total_amount, status) VALUES ('Budget General 2026', 2026, 4500000000000, 'Actif') ON CONFLICT DO NOTHING`;

    const dirs = [
      ['DGID',  'Direction Generale Impots et Domaines',      1200000000000, 748000000000,  'Normal'  ],
      ['DGCPT', 'Direction Generale Comptabilite Publique',    980000000000,  921000000000,  'Alerte'  ],
      ['DPEE',  'Direction Prevision Etudes Economiques',      650000000000,  310000000000,  'Normal'  ],
      ['DAGE',  'Direction Administration Gestion Entretien',  420000000000,  418000000000,  'Critique'],
      ['PRIM',  'Primature',                                   350000000000,  180000000000,  'Normal'  ],
      ['DSI',   'Direction Systemes Information',              280000000000,  140000000000,  'Normal'  ],
      ['DAF',   'Direction Affaires Financieres',              320000000000,  196000000000,  'Normal'  ],
      ['DCMP',  'Direction Centrale Marches Publics',          200000000000,  88000000000,   'Normal'  ],
      ['DGTCP', 'Direction Generale Tresor',                   100000000000,  56000000000,   'Normal'  ],
    ];
    for (const [code, name, alloc, cons, status] of dirs) {
      await sql`INSERT INTO directions (code, name, budget_plan_id, allocated, consumed, status) VALUES (${code}, ${name}, 1, ${alloc}, ${cons}, ${status}) ON CONFLICT (code) DO UPDATE SET consumed = EXCLUDED.consumed, status = EXCLUDED.status`;
    }

    const engs = [
      ['BC-2026-001','SENELEC',        '001001234-2026-A-1', 45000000000,  'Electricite bureaux', 'DAF',  'Liquide',   0.02],
      ['BC-2026-002','SONES',          '001005678-2026-A-1', 28500000000,  'Eau potable',         'DAF',  'Liquide',   0.03],
      ['BC-2026-003','SONATEL',        '001009012-2026-B-2', 12750000000,  'Telephonie',          'DSI',  'En cours',  0.08],
      ['BC-2026-004','GIE GAINDE 2000','001003456-2024-A-1', 95000000000,  'Archives numeriques', 'DSI',  'En attente',0.31],
      ['BC-2026-005','SAGAM Securite', '001007890-2025-B-1', 850000000000, 'Gardiennage',         'DAGE', 'Suspendu',  0.87],
      ['BC-2025-089','Prestataire X',  '001002222-2025-C-3', 420000000000, 'Conseil strategie',   'DPEE', 'En cours',  0.62],
      ['BC-2026-006','Bureau Veritas', '001002345-2026-A-1', 22000000000,  'Audit technique',     'DAF',  'Liquide',   0.04],
    ];
    for (const [ref, vendor, ninea, amount, desc, dir, status, score] of engs) {
      await sql`INSERT INTO engagements (reference, vendor_name, vendor_ninea, amount, description, direction_code, status, anomaly_score) VALUES (${ref}, ${vendor}, ${ninea}, ${amount}, ${desc}, ${dir}, ${status}, ${score}) ON CONFLICT (reference) DO NOTHING`;
    }

    await sql`INSERT INTO alerts (type, title, body, direction_code, severity) VALUES ('alerte','DGCPT a 94pct','Risque depassement juin.','DGCPT','warning'),('anomalie','Anomalie BC-2026-005','SAGAM 850M score 0.87.','DAGE','danger'),('alerte','DAGE 99.5pct','Engagements bloques.',  'DAGE','danger'),('info','Rapport avril 2026','Disponible dans Exports.',null,'info') ON CONFLICT DO NOTHING`;

    return res.json({ success: true, message: "5 tables + 9 directions + 7 engagements + 4 alertes" });
  } catch (err) {
    console.error("Migration error:", err);
    return res.status(500).json({ success: false, error: err.message, stack: err.stack?.slice(0,300) });
  }
};
