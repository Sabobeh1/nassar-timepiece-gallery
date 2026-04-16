import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Bot, webhookCallback } from "grammy";
import { runAgent } from "./_shared/agent.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  const chatId = String(ctx.chat.id);
  const text = ctx.message.text;
  try {
    // Quick length check before invoking the agent (saves tokens)
    const { checkMessageLength } = await import("./_shared/guard.js");
    const lenCheck = checkMessageLength(text);
    if (!lenCheck.allowed) {
      await ctx.reply(lenCheck.userMessage!);
      return;
    }

    const reply = await runAgent({
      sessionId: `tg:${chatId}`,
      userMessage: text,
      channel: "telegram",
    });
    await ctx.reply(reply);
  } catch (err: any) {
    console.error("telegram agent error", err);
    await ctx.reply("Sorry — I hit an error. Please try again in a moment.");
  }
});

const handleUpdate = webhookCallback(bot, "std/http");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  try {
    // Adapt Vercel's req/res to the Fetch-style handler grammy expects.
    const url = `https://${req.headers.host}${req.url}`;
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    const fetchReq = new Request(url, {
      method: "POST",
      headers: req.headers as any,
      body,
    });
    const fetchRes = await handleUpdate(fetchReq);
    res.status(fetchRes.status);
    fetchRes.headers.forEach((v, k) => res.setHeader(k, v));
    const text = await fetchRes.text();
    return res.send(text);
  } catch (err: any) {
    console.error("telegram webhook error", err);
    return res.status(500).send("error");
  }
}
