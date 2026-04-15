import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_shared/supabase.js";

/** Temporary diagnostic. Remove after the chatbot works. */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
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
    },
    inventory_check_sample: { data: inv, error: invErr?.message ?? null },
    product_embeddings_count: { count, error: cntErr?.message ?? null },
  });
}
