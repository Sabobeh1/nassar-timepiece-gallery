/**
 * Vercel Cron endpoint — syncs product embeddings daily.
 *
 * Only embeds products that are NEW or UPDATED since their last embedding,
 * and removes embeddings for deleted products. This keeps token costs low.
 *
 * Schedule: runs once daily at 3:00 AM UTC (configured in vercel.json).
 * Can also be triggered manually: GET /api/cron/sync-embeddings
 *
 * Auth: protected by CRON_SECRET — Vercel injects the Authorization header
 * automatically for cron jobs. For manual triggers, pass ?secret=<CRON_SECRET>.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = "text-embedding-3-small";
const DIMENSIONS = 512;

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  updated_at: string;
  categories: { id: string; name: string; description: string | null } | null;
};

function formatContent(p: ProductRow): string {
  const cat = p.categories?.name ?? "unknown";
  const catDesc = p.categories?.description ?? "";
  const desc = p.description ?? "";
  return [
    `Product: ${p.name}`,
    `Category: ${cat}${catDesc ? ` — ${catDesc}` : ""}`,
    `Price: ${p.price}`,
    desc && `Description: ${desc}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth check: Vercel sends Authorization header for cron, or accept ?secret= for manual
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    const query = req.query.secret;
    if (auth !== `Bearer ${cronSecret}` && query !== cronSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const stats = await syncEmbeddings();
    console.log("sync-embeddings result:", stats);
    return res.status(200).json(stats);
  } catch (err: any) {
    console.error("sync-embeddings error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function syncEmbeddings() {
  // 1. Fetch all products with their category info
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, description, price, category_id, updated_at, categories(id, name, description)")
    .returns<ProductRow[]>();

  if (prodErr) throw prodErr;

  // 2. Fetch existing embeddings with their timestamps
  const { data: existing, error: embErr } = await supabase
    .from("product_embeddings")
    .select("product_id, created_at");

  if (embErr) throw embErr;

  const embeddingMap = new Map(
    (existing ?? []).map((e) => [e.product_id, e.created_at]),
  );
  const productIds = new Set((products ?? []).map((p) => p.id));

  // 3. Find products that need embedding (new or updated after last embed)
  const toEmbed = (products ?? []).filter((p) => {
    const existingTs = embeddingMap.get(p.id);
    if (!existingTs) return true; // new product, no embedding yet
    // Re-embed if product was updated after embedding was created
    return new Date(p.updated_at) > new Date(existingTs);
  });

  // 4. Find orphan embeddings (product was deleted)
  const toDelete = (existing ?? [])
    .filter((e) => !productIds.has(e.product_id))
    .map((e) => e.product_id);

  // 5. Delete orphan embeddings
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("product_embeddings")
      .delete()
      .in("product_id", toDelete);
    if (delErr) console.error("delete orphans error:", delErr);
  }

  // 6. Embed new/updated products in batches
  let embedded = 0;
  const BATCH = 50;

  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const chunk = toEmbed.slice(i, i + BATCH);
    const inputs = chunk.map(formatContent);

    const embRes = await openai.embeddings.create({
      model: MODEL,
      dimensions: DIMENSIONS,
      input: inputs,
    });

    const rows = chunk.map((p, idx) => ({
      product_id: p.id,
      content: inputs[idx],
      metadata: {
        product_id: p.id,
        name: p.name,
        price: p.price,
        category_id: p.category_id,
        category_name: p.categories?.name ?? null,
      },
      embedding: embRes.data[idx].embedding as unknown as number[],
    }));

    const { error: upErr } = await supabase
      .from("product_embeddings")
      .upsert(rows, { onConflict: "product_id" });
    if (upErr) throw upErr;

    embedded += chunk.length;
  }

  return {
    total_products: products?.length ?? 0,
    newly_embedded: embedded,
    orphans_deleted: toDelete.length,
    already_up_to_date: (products?.length ?? 0) - embedded,
  };
}
