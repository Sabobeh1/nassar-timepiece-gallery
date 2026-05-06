import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../supabase.js";
import { isNameMatch, isPhoneMatch } from "../similarity.js";

export interface RuntimeCtx {
  channel: "web" | "telegram";
  channel_user_id: string;
}

export function buildLookupCustomerTool(ctx: RuntimeCtx) {
  return tool(
    async ({ phone, first_name, last_name }) => {
      // If phone + name provided, do fuzzy-match verification
      if (phone && first_name && last_name) {
        // Fetch candidates with similar phone
        const { data, error } = await supabase
          .from("users_info")
          .select("*")
          .limit(20);

        if (error) return `Error: ${error.message}`;
        if (!data?.length) return "No saved customer found.";

        // Find the best match by phone + name similarity (>= 80%)
        const match = data.find(
          (u) =>
            isPhoneMatch(u.phone, phone) &&
            isNameMatch(u.first_name ?? "", u.last_name ?? "", first_name, last_name),
        );

        if (match) {
          return JSON.stringify({
            verified: true,
            message:
              "Customer verified! Name and phone match our records (80%+ similarity).",
            customer: match,
          });
        }

        return JSON.stringify({
          verified: false,
          message:
            "No matching customer found with that name and phone number. The name must match with at least 80% similarity. This appears to be a new customer — please collect their full details.",
        });
      }

      // Fallback: lookup by exact phone or by session channel
      let q = supabase.from("users_info").select("*").limit(1);
      if (phone) q = q.eq("phone", phone);
      else q = q.eq("channel", ctx.channel).eq("channel_user_id", ctx.channel_user_id);

      const { data, error } = await q;
      if (error) return `Error: ${error.message}`;
      if (!data?.length) return "No saved customer found.";
      return JSON.stringify({ verified: true, customer: data[0] });
    },
    {
      name: "lookup_customer",
      description:
        "Fetch a returning customer's saved delivery details. Provide phone + first_name + last_name to verify identity (80% name similarity required). If phone alone is given, does exact match. If nothing is given, looks up by current session. Use this when customer says they've ordered before — ask for their phone and full name first.",
      schema: z.object({
        phone: z
          .string()
          .optional()
          .describe("Customer phone. Omit to look up by current session."),
        first_name: z
          .string()
          .optional()
          .describe("Customer first name for verification. Provide with phone and last_name."),
        last_name: z
          .string()
          .optional()
          .describe("Customer last name for verification. Provide with phone and first_name."),
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
