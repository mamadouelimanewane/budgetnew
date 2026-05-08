import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

export { sql };

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS budget_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      year INTEGER NOT NULL,
      total_amount BIGINT NOT NULL,
      status VARCHAR(50) DEFAULT 'Actif',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS directions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      budget_plan_id INTEGER,
      allocated BIGINT NOT NULL DEFAULT 0,
      consumed BIGINT NOT NULL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Normal',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS engagements (
      id SERIAL PRIMARY KEY,
      reference VARCHAR(50) UNIQUE NOT NULL,
      vendor_name VARCHAR(255) NOT NULL,
      vendor_ninea VARCHAR(50),
      amount BIGINT NOT NULL,
      description TEXT,
      direction_code VARCHAR(20),
      type VARCHAR(50) DEFAULT 'Bien',
      region VARCHAR(100) DEFAULT 'Dakar',
      status VARCHAR(50) DEFAULT 'En attente',
      anomaly_score DECIMAL(4,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS marches (
      id SERIAL PRIMARY KEY,
      reference VARCHAR(50) UNIQUE NOT NULL,
      objet TEXT NOT NULL,
      direction_code VARCHAR(20),
      montant_estime BIGINT NOT NULL,
      type_marche VARCHAR(50) DEFAULT 'AO ouvert',
      statut VARCHAR(50) DEFAULT 'Publie',
      beneficiaire VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT,
      direction_code VARCHAR(20),
      severity VARCHAR(20) DEFAULT 'info',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  return { success: true, message: "6 tables creees" };
}

export async function seedData() {
  await sql`
    INSERT INTO budget_plans (name, year, total_amount, status)
    VALUES ('Budget General 2026', 2026, 4500000000000, 'Actif')
    ON CONFLICT DO NOTHING
  `;

  const dirs = [
    { code: 'DGID',  name: 'Direction Generale Impots et Domaines',      alloc: 1200000000000, cons: 748000000000,  status: 'Normal'   },
    { code: 'DGCPT', name: 'Direction Generale Comptabilite Publique',    alloc: 980000000000,  cons: 921000000000,  status: 'Alerte'   },
    { code: 'DPEE',  name: 'Direction Prevision Etudes Economiques',      alloc: 650000000000,  cons: 310000000000,  status: 'Normal'   },
    { code: 'DAGE',  name: 'Direction Administration Gestion Entretien',  alloc: 420000000000,  cons: 418000000000,  status: 'Critique' },
    { code: 'PRIM',  name: 'Primature',                                   alloc: 350000000000,  cons: 180000000000,  status: 'Normal'   },
    { code: 'DSI',   name: 'Direction Systemes Information',              alloc: 280000000000,  cons: 140000000000,  status: 'Normal'   },
    { code: 'DAF',   name: 'Direction Affaires Financieres',              alloc: 320000000000,  cons: 196000000000,  status: 'Normal'   },
    { code: 'DCMP',  name: 'Direction Centrale Marches Publics',          alloc: 200000000000,  cons: 88000000000,   status: 'Normal'   },
    { code: 'DGTCP', name: 'Direction Generale Tresor',                   alloc: 100000000000,  cons: 56000000000,   status: 'Normal'   },
  ];

  for (const d of dirs) {
    await sql`
      INSERT INTO directions (code, name, budget_plan_id, allocated, consumed, status)
      VALUES (${d.code}, ${d.name}, 1, ${d.alloc}, ${d.cons}, ${d.status})
      ON CONFLICT (code) DO UPDATE SET consumed = EXCLUDED.consumed, status = EXCLUDED.status
    `;
  }

  const engs = [
    { ref: 'BC-2026-001', vendor: 'SENELEC',         ninea: '001001234-2026-A-1', amount: 45000000000,  desc: 'Fourniture electricite', dir: 'DAF',  status: 'Liquide',   score: 0.02 },
    { ref: 'BC-2026-002', vendor: 'SONES',            ninea: '001005678-2026-A-1', amount: 28500000000,  desc: 'Fourniture eau potable', dir: 'DAF',  status: 'Liquide',   score: 0.03 },
    { ref: 'BC-2026-003', vendor: 'SONATEL',          ninea: '001009012-2026-B-2', amount: 12750000000,  desc: 'Telephonie fixe mobile', dir: 'DSI',  status: 'En cours',  score: 0.08 },
    { ref: 'BC-2026-004', vendor: 'GIE GAINDE 2000',  ninea: '001003456-2024-A-1', amount: 95000000000,  desc: 'Systeme archives',       dir: 'DSI',  status: 'En attente',score: 0.31 },
    { ref: 'BC-2026-005', vendor: 'SAGAM Securite',   ninea: '001007890-2025-B-1', amount: 850000000000, desc: 'Gardiennage securite',   dir: 'DAGE', status: 'Suspendu',  score: 0.87 },
    { ref: 'BC-2025-089', vendor: 'Prestataire X',    ninea: '001002222-2025-C-3', amount: 420000000000, desc: 'Conseil strategie',      dir: 'DPEE', status: 'En cours',  score: 0.62 },
    { ref: 'BC-2026-006', vendor: 'Bureau Veritas',   ninea: '001002345-2026-A-1', amount: 22000000000,  desc: 'Audit technique',        dir: 'DAF',  status: 'Liquide',   score: 0.04 },
  ];

  for (const e of engs) {
    await sql`
      INSERT INTO engagements (reference, vendor_name, vendor_ninea, amount, description, direction_code, status, anomaly_score)
      VALUES (${e.ref}, ${e.vendor}, ${e.ninea}, ${e.amount}, ${e.desc}, ${e.dir}, ${e.status}, ${e.score})
      ON CONFLICT (reference) DO NOTHING
    `;
  }

  await sql`
    INSERT INTO alerts (type, title, body, direction_code, severity) VALUES
    ('alerte',  'DGCPT a 94pct de consommation',  'Risque depassement avant fin juin.',        'DGCPT', 'warning'),
    ('anomalie','Anomalie BC-2026-005 detectee',   'SAGAM 850M score 0.87. A verifier.',         'DAGE',  'danger'),
    ('alerte',  'DAGE quasi epuisee 99.5pct',      'Seulement 2M restants. Engagements bloques.','DAGE',  'danger'),
    ('info',    'Rapport avril 2026 genere',        'Disponible dans Exports.',                   null,    'info')
    ON CONFLICT DO NOTHING
  `;

  return { success: true, message: "9 directions + 7 engagements + 4 alertes inseres" };
}
