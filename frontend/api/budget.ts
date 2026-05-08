import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const plans = await sql`
        SELECT bp.*, 
          COUNT(d.id) as direction_count,
          SUM(d.allocated) as total_allocated,
          SUM(d.consumed) as total_consumed
        FROM budget_plans bp
        LEFT JOIN directions d ON d.budget_plan_id = bp.id
        GROUP BY bp.id
        ORDER BY bp.year DESC
      `;
      return res.json({ success: true, data: plans.rows });
    }

    if (req.method === "POST") {
      const { name, year, total_amount, status } = req.body;
      const result = await sql`
        INSERT INTO budget_plans (name, year, total_amount, status)
        VALUES (${name}, ${year}, ${total_amount}, ${status || 'Brouillon'})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    if (req.method === "PUT") {
      const { id, ...updates } = req.body;
      const result = await sql`
        UPDATE budget_plans 
        SET name = ${updates.name}, status = ${updates.status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return res.json({ success: true, data: result.rows[0] });
    }

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
