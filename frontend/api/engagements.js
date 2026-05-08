import { neon } from "@neondatabase/serverless";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const sql = neon(process.env.POSTGRES_URL);
    if (req.method === "GET") {
      const rows = await sql`SELECT e.*, d.name as direction_name FROM engagements e LEFT JOIN directions d ON d.code=e.direction_code ORDER BY e.created_at DESC LIMIT 50`;
      return res.json({ success: true, data: rows });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { vendor_name, vendor_ninea, amount, description, direction_code, type, region } = b;
      const cnt = await sql`SELECT COUNT(*) as c FROM engagements`;
      const ref = "BC-" + new Date().getFullYear() + "-" + String(Number(cnt[0].c)+1).padStart(3,"0");
      const score = amount > 500000000000 ? 0.65 : amount > 100000000000 ? 0.25 : 0.05;
      await sql`INSERT INTO engagements (reference,vendor_name,vendor_ninea,amount,description,direction_code,type,region,anomaly_score) VALUES (${ref},${vendor_name},${vendor_ninea||null},${amount},${description||null},${direction_code},${type||"Bien"},${region||"Dakar"},${score})`;
      await sql`UPDATE directions SET consumed=consumed+${amount},updated_at=NOW() WHERE code=${direction_code}`;
      return res.status(201).json({ success: true, reference: ref });
    }
    if (req.method === "PUT") {
      const { id, status } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      await sql`UPDATE engagements SET status=${status} WHERE id=${id}`;
      return res.json({ success: true });
    }
  } catch(err) { return res.status(500).json({ success: false, error: err.message }); }
}
