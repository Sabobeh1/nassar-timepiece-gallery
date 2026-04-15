import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";

export interface RuntimeCtx {
  channel: "web" | "telegram";
  channel_user_id: string;
}

export function buildLookupCustomerTool(ctx: RuntimeCtx) {
  return tool(
    async ({ phone }) => {
      let q = supabase.from("users_info").select("*").limit(1);
      if (phone) q = q.eq("phone", phone);
      else q = q.eq("channel", ctx.channel).eq("channel_user_id", ctx.channel_user_id);

      const { data, error } = await q;
      if (error) return `Error: ${error.message}`;
      if (!data?.length) return "No saved customer found.";
      return JSON.stringify(data[0]);
    },
    {
      name: "lookup_customer",
      description:
        "Fetch a returning customer's saved delivery details. Call at the start of a conversation, or when the user says 'same address as before'. If phone is unknown, omit it — the server will look up by this session's channel identity.",
      schema: z.object({
        phone: z.string().optional().describe("Customer phone. Omit to look up by current session."),
      }),
    },
  );
}

export function buildSaveCustomerTool(ctx: RuntimeCtx) {
  return tool(
    async (args) => {
      const { data, error } = await supabase
        .from("users_info")
        .upsert(
          {
            phone: args.phone,
            first_name: args.first_name,
            last_name: args.last_name,
            country: args.country,
            region: args.region,
            city: args.city,
            address: args.address,
            postal_code: args.postal_code,
            channel: ctx.channel,
            channel_user_id: ctx.channel_user_id,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "phone" },
        )
        .select("id")
        .single();
      if (error) return `Error: ${error.message}`;
      return JSON.stringify({ user_info_id: data.id });
    },
    {
      name: "save_customer",
      description:
        "Upsert a customer's delivery details keyed by phone. Call this when the customer first gives their details or updates them. Always call before place_order so returning customers are recognized next time.",
      schema: z.object({
        phone: z.string().min(4),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        country: z.string().min(1),
        region: z.string().min(1),
        city: z.string().min(1),
        address: z.string().min(1),
        postal_code: z.string().optional(),
      }),
    },
  );
}
