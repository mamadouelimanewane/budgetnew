import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM budget_plans ORDER BY year DESC`;
      return res.json({ success: true, data: rows });
    }
    if (req.method === "POST") {
      const { name, year, total_amount, status } = req.body;
      const rows = await sql`
        INSERT INTO budget_plans (name, year, total_amount, status)
        VALUES (${name}, ${year}, ${total_amount}, ${status||'Brouillon'})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: rows[0] });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
