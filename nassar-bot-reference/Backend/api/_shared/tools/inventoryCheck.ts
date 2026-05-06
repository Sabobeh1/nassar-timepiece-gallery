import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

export const inventoryCheckTool = tool(
  async ({ product_id, name, category_id, category_name, list_all_in_category }) => {
    let q = supabase
      .from("products_metadata")
      .select("id, name, price, stock_quantity, category_id, category_name");

    if (product_id) q = q.eq("id", product_id);
    else if (name) q = q.ilike("name", `%${name}%`);

    if (category_id) q = q.eq("category_id", category_id);
    else if (category_name) q = q.ilike("category_name", `%${category_name}%`);

    // If listing all products in a category, allow no product filter
    if (list_all_in_category && (category_id || category_name)) {
      // category filter already applied above, just let it through
    } else if (!product_id && !name && !category_id && !category_name) {
      return "Refuse: provide product_id, name, category_id, or category_name.";
    }

    const { data, error } = await q.limit(20);
    if (error) {
      console.error("inventory_check error:", error);
      return `Error: ${error.message}`;
    }
    if (!data?.length) return "No products found matching that criteria.";

    return JSON.stringify(
      data.map((p) => ({
        product_id: p.id,
        name: p.name,
        price: p.price,
        stock_quantity: p.stock_quantity,
        category_id: p.category_id,
        category_name: p.category_name,
      })),
    );
  },
  {
    name: "inventory_check",
    description:
      "Exact price, stock, and product details lookup via SQL. Use this when the customer asks for price, availability, or wants to see all products in a specific category (e.g. 'show me Rolex watches'). Can filter by product name, category name, or IDs. Set list_all_in_category=true with a category_name to list all products in that category.",
    schema: z.object({
      name: z
        .string()
        .optional()
        .describe("Partial product name (case-insensitive). OMIT if unknown."),
      product_id: z
        .string()
        .optional()
        .describe("Actual UUID only. OMIT unless you already have one from a previous tool result."),
      category_id: z
        .string()
        .optional()
        .describe("Actual UUID only. OMIT unless you already have one from a previous tool result."),
      category_name: z
        .string()
        .optional()
        .describe(
          "Category name to filter by (case-insensitive partial match). Use this when the customer asks about a specific brand/category like 'Rolex' or 'Casio'.",
        ),
      list_all_in_category: z
        .boolean()
        .optional()
        .describe(
          "Set to true to list ALL products in a category. Must be combined with category_id or category_name.",
        ),
    }),
  },
);
