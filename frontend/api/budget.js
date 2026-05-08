const { neon } = require("@neondatabase/serverless");
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const sql = neon(process.env.POSTGRES_URL);
  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM budget_plans ORDER BY year DESC`;
      return res.json({ success:true, data:rows });
    }
    if (req.method === "POST") {
      const { name, year, total_amount, status } = req.body;
      const rows = await sql`INSERT INTO budget_plans (name,year,total_amount,status) VALUES (${name},${year},${total_amount},${status||"Brouillon"}) RETURNING *`;
      return res.status(201).json({ success:true, data:rows[0] });
    }
  } catch(err) { return res.status(500).json({ success:false, error:err.message }); }
};
