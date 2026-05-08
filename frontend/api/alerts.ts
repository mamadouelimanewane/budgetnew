import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50`;
      const unread = rows.filter((r: any) => !r.read).length;
      return res.json({ success: true, data: rows, unread });
    }
    if (req.method === "PUT") {
      const { id } = req.body;
      if (id === 'all') {
        await sql`UPDATE alerts SET read = TRUE`;
      } else {
        await sql`UPDATE alerts SET read = TRUE WHERE id = ${id}`;
      }
      return res.json({ success: true });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
