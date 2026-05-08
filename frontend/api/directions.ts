import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT d.*,
          ROUND((d.consumed::numeric / NULLIF(d.allocated, 0)) * 100, 1) as taux,
          COUNT(e.id) as engagement_count,
          COALESCE(SUM(CASE WHEN e.status = 'En attente' THEN e.amount ELSE 0 END), 0) as pending_amount
        FROM directions d
        LEFT JOIN engagements e ON e.direction_code = d.code
        GROUP BY d.id
        ORDER BY d.code
      `;
      return res.json({ success: true, data: rows.rows });
    }

    if (req.method === "PUT") {
      const { code, consumed } = req.body;
      const taux = consumed / (await sql`SELECT allocated FROM directions WHERE code = ${code}`).rows[0]?.allocated || 0;
      const status = taux >= 0.995 ? 'Critique' : taux >= 0.90 ? 'Alerte' : taux >= 0.80 ? 'Attention' : 'Normal';
      const result = await sql`
        UPDATE directions 
        SET consumed = ${consumed}, status = ${status}, updated_at = NOW()
        WHERE code = ${code}
        RETURNING *
      `;
      return res.json({ success: true, data: result.rows[0] });
    }

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
