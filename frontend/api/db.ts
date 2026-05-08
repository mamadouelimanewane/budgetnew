import { sql } from "@vercel/postgres";

export { sql };

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS budget_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      year INTEGER NOT NULL,
      total_amount BIGINT NOT NULL,
      status VARCHAR(50) DEFAULT 'Actif',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS directions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      budget_plan_id INTEGER REFERENCES budget_plans(id),
      allocated BIGINT NOT NULL DEFAULT 0,
      consumed BIGINT NOT NULL DEFAULT 0,
      available BIGINT GENERATED ALWAYS AS (allocated - consumed) STORED,
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
      direction_code VARCHAR(20) REFERENCES directions(code),
      type VARCHAR(50) DEFAULT 'Bien',
      region VARCHAR(100) DEFAULT 'Dakar',
      status VARCHAR(50) DEFAULT 'En attente',
      anomaly_score DECIMAL(4,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      validated_at TIMESTAMP,
      paid_at TIMESTAMP
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
      date_publication DATE DEFAULT CURRENT_DATE,
      date_limite_depot DATE,
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

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Viewer',
      direction_code VARCHAR(20),
      active BOOLEAN DEFAULT TRUE,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  return { success: true, message: "Tables created" };
}

export async function seedData() {
  const planResult = await sql`
    INSERT INTO budget_plans (name, year, total_amount, status)
    VALUES ('Budget General 2026', 2026, 4500000000000, 'Actif')
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  const planId = planResult.rows[0]?.id || 1;

  const directions = [
    { code: 'DGID',     name: 'Direction Generale Impots et Domaines',      allocated: 1200000000000, consumed: 748000000000  },
    { code: 'DGCPT',    name: 'Direction Generale Comptabilite Publique',    allocated: 980000000000,  consumed: 921000000000  },
    { code: 'DPEE',     name: 'Direction Prevision Etudes Economiques',      allocated: 650000000000,  consumed: 310000000000  },
    { code: 'DAGE',     name: 'Direction Administration Gestion Entretien',  allocated: 420000000000,  consumed: 418000000000  },
    { code: 'PRIM',     name: 'Primature',                                   allocated: 350000000000,  consumed: 180000000000  },
    { code: 'DSI',      name: 'Direction Systemes Information',              allocated: 280000000000,  consumed: 140000000000  },
    { code: 'DAF',      name: 'Direction Affaires Financieres',              allocated: 320000000000,  consumed: 196000000000  },
    { code: 'DCMP',     name: 'Direction Centrale Marches Publics',          allocated: 200000000000,  consumed: 88000000000   },
    { code: 'DGTCP',    name: 'Direction Generale Tresor Comptabilite',      allocated: 100000000000,  consumed: 56000000000   },
  ];

  for (const d of directions) {
    const taux = d.consumed / d.allocated;
    const status = taux >= 0.95 ? 'Critique' : taux >= 0.85 ? 'Alerte' : 'Normal';
    await sql`
      INSERT INTO directions (code, name, budget_plan_id, allocated, consumed, status)
      VALUES (${d.code}, ${d.name}, ${planId}, ${d.allocated}, ${d.consumed}, ${status})
      ON CONFLICT (code) DO UPDATE SET consumed = EXCLUDED.consumed, status = EXCLUDED.status
    `;
  }

  const engagements_data = [
    { ref: 'BC-2026-001', vendor: 'SENELEC', ninea: '001001234-2026-A-1', amount: 45000000000,  desc: 'Fourniture electricite bureaux',      dir: 'DAF',  type: 'Service', status: 'Liquide',   score: 0.02 },
    { ref: 'BC-2026-002', vendor: 'SONES',   ninea: '001005678-2026-A-1', amount: 28500000000,  desc: 'Fourniture eau potable',              dir: 'DAF',  type: 'Service', status: 'Liquide',   score: 0.03 },
    { ref: 'BC-2026-003', vendor: 'SONATEL', ninea: '001009012-2026-B-2', amount: 12750000000,  desc: 'Telephonie fixe et mobile',           dir: 'DSI',  type: 'Service', status: 'En cours',  score: 0.08 },
    { ref: 'BC-2026-004', vendor: 'GIE GAINDE 2000', ninea: '001003456-2024-A-1', amount: 95000000000,  desc: 'Systeme gestion archives', dir: 'DSI',  type: 'Service', status: 'En attente', score: 0.31 },
    { ref: 'BC-2026-005', vendor: 'SAGAM Securite', ninea: '001007890-2025-B-1', amount: 850000000000, desc: 'Gardiennage et securite', dir: 'DAGE', type: 'Service', status: 'Suspendu',  score: 0.87 },
    { ref: 'BC-2025-089', vendor: 'Prestataire X', ninea: '001002222-2025-C-3', amount: 420000000000, desc: 'Conseil en strategie', dir: 'DPEE', type: 'Service', status: 'En cours',  score: 0.62 },
    { ref: 'BC-2026-006', vendor: 'Bureau Veritas', ninea: '001002345-2026-A-1', amount: 22000000000,  desc: 'Audit technique equipements',  dir: 'DAF',  type: 'Service', status: 'Liquide',   score: 0.04 },
  ];

  for (const e of engagements_data) {
    await sql`
      INSERT INTO engagements (reference, vendor_name, vendor_ninea, amount, description, direction_code, type, status, anomaly_score)
      VALUES (${e.ref}, ${e.vendor}, ${e.ninea}, ${e.amount}, ${e.desc}, ${e.dir}, ${e.type}, ${e.status}, ${e.score})
      ON CONFLICT (reference) DO NOTHING
    `;
  }

  return { success: true, message: "Data seeded successfully" };
}
