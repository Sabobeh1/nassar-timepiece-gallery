import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runAgent } from "./_shared/agent.js";

const ALLOWED = process.env.ALLOWED_ORIGIN ?? "*";

function setCors(res: VercelResponse, origin: string | undefined) {
  const allow = ALLOWED === "*" ? "*" : origin === ALLOWED ? origin : ALLOWED;
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, session_id } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (typeof session_id !== "string" || !session_id.trim()) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const reply = await runAgent({
      sessionId: `web:${session_id}`,
      userMessage: message,
      channel: "web",
    });
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("chat error", err);
    return res.status(500).json({ error: "Agent failure", detail: err?.message });
  }
}
