const { neon } = require("@neondatabase/serverless");
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const sql = neon(process.env.POSTGRES_URL);
  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50`;
      return res.json({ success:true, data:rows, unread:rows.filter(r=>!r.read).length });
    }
    if (req.method === "PUT") {
      const { id } = req.body;
      if (id === "all") { await sql`UPDATE alerts SET read=TRUE`; }
      else { await sql`UPDATE alerts SET read=TRUE WHERE id=${id}`; }
      return res.json({ success:true });
    }
  } catch(err) { return res.status(500).json({ success:false, error:err.message }); }
};
