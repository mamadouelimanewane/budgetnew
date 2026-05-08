const { neon } = require("@neondatabase/serverless");
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const sql = neon(process.env.POSTGRES_URL);
  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT *, ROUND((consumed::numeric / NULLIF(allocated,0))*100,1) as taux
        FROM directions ORDER BY code
      `;
      return res.json({ success: true, data: rows });
    }
    if (req.method === "PUT") {
      const { code, consumed } = req.body;
      await sql`UPDATE directions SET consumed=${consumed}, updated_at=NOW() WHERE code=${code}`;
      return res.json({ success: true });
    }
  } catch(err) { return res.status(500).json({ success:false, error:err.message }); }
};
