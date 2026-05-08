import { neon } from "@neondatabase/serverless";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const sql = neon(process.env.POSTGRES_URL);
    if (req.method === "GET") {
      const rows = await sql`SELECT *, ROUND((consumed::numeric / NULLIF(allocated,0))*100,1) as taux FROM directions ORDER BY code`;
      return res.json({ success: true, data: rows });
    }
  } catch(err) { return res.status(500).json({ success: false, error: err.message }); }
}
