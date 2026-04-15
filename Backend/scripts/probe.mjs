import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const o = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('--- inventory_check: Patek Philippe Nautilus ---');
const a = await s
  .from('products_metadata')
  .select('id,name,price,stock_quantity,category_name')
  .ilike('name', '%Patek Philippe Nautilus%')
  .limit(5);
console.log(a.error ?? a.data);

console.log('\n--- product_lookup: elegant wedding gift ---');
const emb = await o.embeddings.create({
  model: 'text-embedding-3-small',
  dimensions: 512,
  input: 'elegant wedding gift watch',
});
const vec = '[' + emb.data[0].embedding.join(',') + ']';
const b = await s.rpc('match_product_embeddings', {
  query_embedding: vec,
  match_count: 5,
  filter: {},
});
console.log(
  b.error ?? b.data?.map((r) => ({ name: r.metadata?.name, similarity: r.similarity.toFixed(3) })),
);
