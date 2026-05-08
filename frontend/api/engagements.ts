import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT e.*, d.name as direction_name
        FROM engagements e
        LEFT JOIN directions d ON d.code = e.direction_code
        ORDER BY e.created_at DESC
        LIMIT 50
      `;
      return res.json({ success: true, data: rows, total: rows.length });
    }

    if (req.method === "POST") {
      const { vendor_name, vendor_ninea, amount, description, direction_code, type, region } = req.body;
      const count = await sql`SELECT COUNT(*) as c FROM engagements`;
      const num = String(Number(count[0].c) + 1).padStart(3, '0');
      const reference = `BC-${new Date().getFullYear()}-${num}`;
      const score = amount > 500000000000 ? 0.65 : amount > 100000000000 ? 0.25 : 0.05;
      await sql`
        INSERT INTO engagements (reference, vendor_name, vendor_ninea, amount, description, direction_code, type, region, anomaly_score)
        VALUES (${reference}, ${vendor_name}, ${vendor_ninea||null}, ${amount}, ${description||null}, ${direction_code}, ${type||'Bien'}, ${region||'Dakar'}, ${score})
      `;
      await sql`
        UPDATE directions SET consumed = consumed + ${amount}, updated_at = NOW()
        WHERE code = ${direction_code}
      `;
      return res.status(201).json({ success: true, reference });
    }

    if (req.method === "PUT") {
      const { id, status } = req.body;
      await sql`UPDATE engagements SET status = ${status} WHERE id = ${id}`;
      return res.json({ success: true });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      await sql`DELETE FROM engagements WHERE id = ${id}`;
      return res.json({ success: true });
    }

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
