import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM marches ORDER BY created_at DESC`;
      return res.json({ success: true, data: rows.rows });
    }
    if (req.method === "POST") {
      const { objet, direction_code, montant_estime, type_marche, date_limite_depot } = req.body;
      const count = await sql`SELECT COUNT(*) as c FROM marches`;
      const ref = "AO-2026-" + String(Number(count.rows[0].c) + 1).padStart(4, '0');
      const result = await sql`
        INSERT INTO marches (reference, objet, direction_code, montant_estime, type_marche, date_limite_depot)
        VALUES (${ref}, ${objet}, ${direction_code}, ${montant_estime}, ${type_marche || 'AO ouvert'}, ${date_limite_depot || null})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }
    if (req.method === "PUT") {
      const { id, statut, beneficiaire } = req.body;
      const result = await sql`
        UPDATE marches SET statut = ${statut}, beneficiaire = ${beneficiaire || null}
        WHERE id = ${id} RETURNING *
      `;
      return res.json({ success: true, data: result.rows[0] });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
