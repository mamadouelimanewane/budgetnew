import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT d.*,
          ROUND((d.consumed::numeric / NULLIF(d.allocated, 0)) * 100, 1) as taux
        FROM directions d
        ORDER BY d.code
      `;
      return res.json({ success: true, data: rows });
    }
    if (req.method === "PUT") {
      const { code, consumed } = req.body;
      await sql`
        UPDATE directions SET consumed = ${consumed}, updated_at = NOW()
        WHERE code = ${code}
      `;
      return res.json({ success: true });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
