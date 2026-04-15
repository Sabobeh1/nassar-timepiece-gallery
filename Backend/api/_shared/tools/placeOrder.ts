import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

const BOT_USER_ID = process.env.BOT_SYSTEM_USER_ID ?? null;

export const placeOrderTool = tool(
  async (args) => {
    if (!args.items?.length) return "Refuse: no items provided.";

    // Verify stock + real prices server-side to prevent agent-side hallucination.
    const ids = args.items.map((i) => i.product_id);
    const { data: live, error: liveErr } = await supabase
      .from("products_metadata")
      .select("id, name, price, stock_quantity")
      .in("id", ids);
    if (liveErr) return `Error verifying products: ${liveErr.message}`;

    const byId = new Map(live?.map((p) => [p.id, p]) ?? []);
    const verified = args.items.map((it) => {
      const p = byId.get(it.product_id);
      if (!p) return { ok: false as const, msg: `Unknown product_id ${it.product_id}` };
      if (p.stock_quantity < it.quantity)
        return { ok: false as const, msg: `Insufficient stock for ${p.name}` };
      return {
        ok: true as const,
        row: { product_id: p.id, name: p.name, quantity: it.quantity, unit_price: p.price },
      };
    });
    const bad = verified.find((v) => !v.ok);
    if (bad && !bad.ok) return `Refuse: ${bad.msg}`;

    const items = verified.map((v) => (v.ok ? v.row : null)).filter(Boolean);
    const itemsTotal = items.reduce((s, i) => s + i!.unit_price * i!.quantity, 0);
    const total = itemsTotal + (args.shipping_fee ?? 0);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: args.user_id ?? BOT_USER_ID,
        first_name: args.first_name,
        last_name: args.last_name,
        phone: args.phone,
        country: args.country,
        region: args.region,
        city: args.city,
        address: args.address,
        postal_code: args.postal_code ?? null,
        notes: args.notes ?? `channel:${args.channel}; session:${args.channel_user_id}`,
        items,
        shipping_fee: args.shipping_fee ?? 0,
        total,
        status: "new",
      })
      .select("id, total")
      .single();

    if (error) return `Error placing order: ${error.message}`;
    return JSON.stringify({ order_id: data.id, total: data.total });
  },
  {
    name: "place_order",
    description:
      "Finalize an order. Only call after collecting first_name, last_name, phone, country, region, city, address, and at least one item with product_id + quantity. Prices and stock are verified server-side — do NOT pass unit_price.",
    schema: z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      phone: z.string().min(4),
      country: z.string().min(1),
      region: z.string().min(1),
      city: z.string().min(1),
      address: z.string().min(1),
      postal_code: z.string().optional(),
      notes: z.string().optional(),
      shipping_fee: z.number().nonnegative().optional(),
      items: z
        .array(
          z.object({
            product_id: z.string().describe("Actual UUID from inventory_check result"),
            quantity: z.number().int().min(1),
          }),
        )
        .min(1),
      channel: z.enum(["web", "telegram"]),
      channel_user_id: z.string(),
      user_id: z
        .string()
        .optional()
        .describe("Auth user UUID if signed in. OMIT otherwise — do not pass placeholders."),
    }),
  },
);
