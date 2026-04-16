import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

export const listCategoriesTool = tool(
  async () => {
    // Fetch all categories with product count
    const { data: categories, error: catErr } = await supabase
      .from("categories")
      .select("id, name, description")
      .order("name");

    if (catErr) {
      console.error("list_categories error:", catErr);
      return `Error: ${catErr.message}`;
    }
    if (!categories?.length) return "No categories found in the store.";

    // Get product counts per category
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("category_id");

    if (prodErr) {
      console.error("list_categories product count error:", prodErr);
      // Return categories without counts
      return JSON.stringify(categories.map((c) => ({ ...c, product_count: "unknown" })));
    }

    const countMap = new Map<string, number>();
    for (const p of products ?? []) {
      if (p.category_id) {
        countMap.set(p.category_id, (countMap.get(p.category_id) ?? 0) + 1);
      }
    }

    const result = categories.map((c) => ({
      category_id: c.id,
      name: c.name,
      description: c.description,
      product_count: countMap.get(c.id) ?? 0,
    }));

    return JSON.stringify(result);
  },
  {
    name: "list_categories",
    description:
      "List all watch categories in the store with the number of products in each. Use this when the customer asks what categories are available, wants to browse, or asks 'what do you have?'. No arguments needed.",
    schema: z.object({}),
  },
);
