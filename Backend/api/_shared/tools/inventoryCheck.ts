import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

export const inventoryCheckTool = tool(
  async ({ product_id, name, category_id }) => {
    let q = supabase
      .from("products_metadata")
      .select("id, name, price, stock_quantity, category_id, category_name");

    if (product_id) q = q.eq("id", product_id);
    else if (name) q = q.ilike("name", `%${name}%`);
    if (category_id) q = q.eq("category_id", category_id);

    if (!product_id && !name && !category_id)
      return "Refuse: provide product_id, name, or category_id.";

    const { data, error } = await q.limit(10);
    if (error) {
      console.error("inventory_check error:", error);
      return `Error: ${error.message}`;
    }
    if (!data?.length) return "No such product.";
    return JSON.stringify(data);
  },
  {
    name: "inventory_check",
    description:
      "Exact price and stock lookup via SQL view products_metadata. Use this — NOT product_lookup — whenever the customer asks for price or availability. Returns id, name, price, stock_quantity, category.",
    schema: z.object({
      name: z
        .string()
        .optional()
        .describe("Partial product name (case-insensitive). Prefer this. OMIT if unknown."),
      product_id: z
        .string()
        .optional()
        .describe("Actual UUID only. OMIT unless you already have one from a previous tool result."),
      category_id: z
        .string()
        .optional()
        .describe("Actual UUID only. OMIT unless you already have one from a previous tool result."),
    }),
  },
);
