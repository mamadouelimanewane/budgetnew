import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initDB, seedData } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.json({ status: "ok", message: "Use POST with secret to migrate" });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { secret } = req.body || {};
  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Invalid or missing MIGRATE_SECRET" });
  }

  try {
    const init = await initDB();
    const seed = await seedData();
    return res.json({ success: true, init, seed });
  } catch (err: any) {
    console.error("Migration error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      hint: "Check POSTGRES_URL env variable is set"
    });
  }
}
