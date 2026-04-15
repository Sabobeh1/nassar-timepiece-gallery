import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

export const placeOrderTool = tool(
  async ({ customer_name, phone, location, items, channel, channel_user_id }) => {
    if (!items?.length) return "Refuse: no items provided.";
    const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name,
        phone,
        location,
        items,
        total_price: total,
        status: "pending",
        channel,
        channel_user_id,
      })
      .select("id")
      .single();

    if (error) return `Error placing order: ${error.message}`;
    return JSON.stringify({ order_id: data.id, total });
  },
  {
    name: "place_order",
    description:
      "Finalize an order. Only call AFTER collecting customer name, phone, delivery location, and confirmed items with unit prices.",
    schema: z.object({
      customer_name: z.string().min(1),
      phone: z.string().min(4),
      location: z.string().min(1),
      items: z
        .array(
          z.object({
            product_id: z.string(),
            name: z.string(),
            quantity: z.number().int().min(1),
            unit_price: z.number().nonnegative(),
          }),
        )
        .min(1),
      channel: z.enum(["web", "telegram"]),
      channel_user_id: z.string().describe("session_id (web) or chat_id (telegram)"),
    }),
  },
);
