import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

function generateRef(existing: number): string {
  const year = new Date().getFullYear();
  const num = String(existing + 1).padStart(3, '0');
  return `BC-${year}-${num}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { direction, status, limit = 50 } = req.query;
      let query = sql`SELECT * FROM engagements WHERE 1=1`;
      if (direction) query = sql`SELECT * FROM engagements WHERE direction_code = ${direction as string}`;
      if (status) query = sql`SELECT * FROM engagements WHERE status = ${status as string}`;
      const rows = await sql`
        SELECT e.*, d.name as direction_name
        FROM engagements e
        LEFT JOIN directions d ON d.code = e.direction_code
        ORDER BY e.created_at DESC
        LIMIT ${Number(limit)}
      `;
      return res.json({ success: true, data: rows.rows, total: rows.rowCount });
    }

    if (req.method === "POST") {
      const { vendor_name, vendor_ninea, amount, description, direction_code, type, region } = req.body;
      const count = await sql`SELECT COUNT(*) as c FROM engagements`;
      const reference = generateRef(Number(count.rows[0].c));
      const score = amount > 500000000000 ? 0.65 : amount > 100000000000 ? 0.25 : 0.05;
      const result = await sql`
        INSERT INTO engagements (reference, vendor_name, vendor_ninea, amount, description, direction_code, type, region, anomaly_score)
        VALUES (${reference}, ${vendor_name}, ${vendor_ninea || null}, ${amount}, ${description || null}, ${direction_code}, ${type || 'Bien'}, ${region || 'Dakar'}, ${score})
        RETURNING *
      `;
      await sql`
        UPDATE directions SET consumed = consumed + ${amount}, updated_at = NOW()
        WHERE code = ${direction_code}
      `;
      await sql`
        INSERT INTO alerts (type, title, body, direction_code, severity)
        VALUES ('engagement', ${reference + ' cree'}, ${'Engagement ' + vendor_name + ' - ' + (amount/1000000000).toFixed(0) + ' M FCFA'}, ${direction_code}, ${score > 0.5 ? 'danger' : 'info'})
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    if (req.method === "PUT") {
      const { id, status } = req.body;
      const result = await sql`
        UPDATE engagements SET status = ${status},
        validated_at = CASE WHEN ${status} = 'Valide' THEN NOW() ELSE validated_at END,
        paid_at = CASE WHEN ${status} = 'Liquide' THEN NOW() ELSE paid_at END
        WHERE id = ${id} RETURNING *
      `;
      return res.json({ success: true, data: result.rows[0] });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      const eng = await sql`SELECT * FROM engagements WHERE id = ${id}`;
      if (eng.rows[0] && eng.rows[0].status === 'En attente') {
        await sql`UPDATE directions SET consumed = consumed - ${eng.rows[0].amount} WHERE code = ${eng.rows[0].direction_code}`;
      }
      await sql`DELETE FROM engagements WHERE id = ${id}`;
      return res.json({ success: true });
    }

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
