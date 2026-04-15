import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

export const inventoryCheckTool = tool(
  async ({ product_id, name }) => {
    let q = supabase.from("products_metadata").select("id, name, price, stock_quantity, currency");
    if (product_id) q = q.eq("id", product_id);
    else if (name) q = q.ilike("name", `%${name}%`);
    else return "Provide product_id or name.";
    const { data, error } = await q.limit(5);
    if (error) return `Error: ${error.message}`;
    if (!data || data.length === 0) return "No such product.";
    return JSON.stringify(data);
  },
  {
    name: "inventory_check",
    description:
      "Exact price and stock lookup. Use this — not product_lookup — whenever the customer asks for price or availability.",
    schema: z.object({
      product_id: z.string().optional(),
      name: z.string().optional().describe("Partial product name (case-insensitive)"),
    }),
  },
);
