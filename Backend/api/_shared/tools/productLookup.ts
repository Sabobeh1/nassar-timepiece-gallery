import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenAIEmbeddings } from "@langchain/openai";
import { supabase } from "../supabase.js";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  dimensions: 512,
});

export const productLookupTool = tool(
  async ({ query, k, category_id }) => {
    const [embedding] = await embeddings.embedDocuments([query]);
    const filter: Record<string, unknown> = {};
    if (category_id) filter.category_id = category_id;

    // PostgREST needs the vector as a stringified literal, not a JS array.
    const queryEmbedding = `[${embedding.join(",")}]`;

    const { data, error } = await supabase.rpc("match_product_embeddings", {
      query_embedding: queryEmbedding,
      match_count: k ?? 5,
      filter,
    });
    if (error) {
      console.error("product_lookup RPC error:", error);
      return `Error: ${error.message}`;
    }
    if (!data?.length) return "No matching products found.";
    return JSON.stringify(
      data.map((r: any) => ({
        product_id: r.product_id,
        content: r.content,
        similarity: Number(r.similarity.toFixed(4)),
        category: r.metadata?.category_name,
        price: r.metadata?.price,
      })),
    );
  },
  {
    name: "product_lookup",
    description:
      "Semantic product search over the catalog. Use when the customer describes a need, style, or occasion rather than a specific product name. Optionally filter by category_id.",
    schema: z.object({
      query: z.string().describe("Natural-language description of what the customer wants"),
      k: z.number().int().min(1).max(10).optional().describe("How many results (default 5)"),
      category_id: z.string().uuid().optional().describe("Restrict to a single category"),
    }),
  },
);
