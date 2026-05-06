/**
 * Backfill embeddings for every product in products table.
 * Run: npx tsx scripts/embedProducts.ts
 *
 * Env needed: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import "dotenv/config";
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
  categories: { id: string; name: string; description: string | null } | null;
};

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, price, category_id, categories(id, name, description)")
    .returns<ProductRow[]>();

  if (error) throw error;
  if (!products?.length) {
    console.log("No products found.");
    return;
  }

  console.log(`Embedding ${products.length} products (dim=${DIMENSIONS})...`);

  const BATCH = 50;
  for (let i = 0; i < products.length; i += BATCH) {
    const chunk = products.slice(i, i + BATCH);
    const inputs = chunk.map(formatContent);

    const res = await openai.embeddings.create({
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
      embedding: res.data[idx].embedding as unknown as number[],
    }));

    const { error: upErr } = await supabase
      .from("product_embeddings")
      .upsert(rows, { onConflict: "product_id" });
    if (upErr) throw upErr;

    console.log(`  ${Math.min(i + BATCH, products.length)}/${products.length}`);
  }

  console.log("Done.");
}

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
