import { neon } from "@neondatabase/serverless";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const sql = neon(process.env.POSTGRES_URL);
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM budget_plans ORDER BY year DESC`;
      return res.json({ success: true, data: rows });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const rows = await sql`INSERT INTO budget_plans (name,year,total_amount,status) VALUES (${b.name},${b.year},${b.total_amount},${b.status||"Brouillon"}) RETURNING *`;
      return res.status(201).json({ success: true, data: rows[0] });
    }
  } catch(err) { return res.status(500).json({ success: false, error: err.message }); }
}
