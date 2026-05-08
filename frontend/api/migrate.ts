import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initDB, seedData } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { secret } = req.body;
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const initResult = await initDB();
    const seedResult = await seedData();
    return res.json({ success: true, init: initResult, seed: seedResult });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
