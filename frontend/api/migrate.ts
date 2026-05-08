import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initDB, seedData } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { secret } = req.body || {};
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Invalid secret" });
  }
  try {
    const init = await initDB();
    const seed = await seedData();
    return res.json({ success: true, init, seed });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
