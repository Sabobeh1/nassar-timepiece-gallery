import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";
import { isNameMatch, isPhoneMatch } from "../similarity.js";

export const lookupOrdersTool = tool(
  async ({ phone, first_name, last_name }) => {
    // Fetch orders matching this phone (or close to it)
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, first_name, last_name, phone, items, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("lookup_orders error:", error);
      return `Error: ${error.message}`;
    }
    if (!orders?.length) return "No orders found.";

    // Filter by phone similarity + name similarity (>= 80%)
    const matched = orders.filter((o) => {
      const phoneOk = isPhoneMatch(o.phone, phone);
      if (!phoneOk) return false;
      return isNameMatch(o.first_name, o.last_name, first_name, last_name);
    });

    if (!matched.length) {
      return "No orders found matching that name and phone number. The name and phone must match our records with at least 80% similarity.";
    }

    // Return the most recent 5 orders
    const result = matched.slice(0, 5).map((o) => ({
      order_id: o.id,
      status: o.status,
      total: o.total,
      items: o.items,
      created_at: o.created_at,
    }));

    return JSON.stringify(result);
  },
  {
    name: "lookup_orders",
    description:
      "Look up a customer's previous orders by verifying their phone number and full name. Both must match our records with at least 80% similarity for security. Use when a returning customer wants to see their order history.",
    schema: z.object({
      phone: z.string().min(4).describe("Customer phone number"),
      first_name: z.string().min(1).describe("Customer first name"),
      last_name: z.string().min(1).describe("Customer last name"),
    }),
  },
);
