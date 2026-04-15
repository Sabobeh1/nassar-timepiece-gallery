import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_shared/supabase.js";
import { runAgentDetailed } from "./_shared/agent.js";

/** Temporary diagnostic. Remove after the chatbot works. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // If ?ask=... is given, run the agent and return the full tool trace.
  const ask = (req.query.ask as string | undefined)?.trim();
  if (ask) {
    const session_id = (req.query.session_id as string) ?? `diag:${Date.now()}`;
    try {
      const result = await runAgentDetailed({
        sessionId: `web:${session_id}`,
        userMessage: ask,
        channel: "web",
      });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message, stack: err?.stack });
    }
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  let role: string | null = null;
  try {
    const parts = key.split(".");
    role = parts.length === 3 ? JSON.parse(Buffer.from(parts[1], "base64").toString()).role : null;
  } catch {
    role = "not-a-jwt";
  }

  const { data: inv, error: invErr } = await supabase
    .from("products_metadata")
    .select("id,name,price,stock_quantity")
    .ilike("name", "%Patek Philippe Nautilus%")
    .limit(3);

  const { count, error: cntErr } = await supabase
    .from("product_embeddings")
    .select("*", { count: "exact", head: true });

  res.status(200).json({
    env: {
      supabase_url_set: !!process.env.SUPABASE_URL,
      service_key_length: key.length,
      service_key_prefix: key.slice(0, 10),
      service_key_role: role,
      openai_key_set: !!process.env.OPENAI_API_KEY,
      openai_model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    },
    inventory_check_sample: { data: inv, error: invErr?.message ?? null },
    product_embeddings_count: { count, error: cntErr?.message ?? null },
    hint: "Append ?ask=Show%20me%20a%20Patek%20Philippe%20Nautilus to see the full agent trace.",
  });
}
