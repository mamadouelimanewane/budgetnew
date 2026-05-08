import { neon } from "@neondatabase/serverless";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const sql = neon(process.env.POSTGRES_URL);
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50`;
      return res.json({ success: true, data: rows, unread: rows.filter(r=>!r.read).length });
    }
    if (req.method === "PUT") {
      const { id } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (id === "all") { await sql`UPDATE alerts SET read=TRUE`; }
      else { await sql`UPDATE alerts SET read=TRUE WHERE id=${id}`; }
      return res.json({ success: true });
    }
  } catch(err) { return res.status(500).json({ success: false, error: err.message }); }
}
