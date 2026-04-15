/**
 * Register the Telegram webhook so Telegram forwards updates to the backend.
 * Run AFTER deploying Backend to Vercel:
 *   BACKEND_URL=https://your-backend.vercel.app npx tsx scripts/setTelegramWebhook.ts
 */
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const backend = process.env.BACKEND_URL;
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
if (!backend) throw new Error("Missing BACKEND_URL (pass inline: BACKEND_URL=https://... npx tsx ...)");

const webhookUrl = `${backend.replace(/\/$/, "")}/api/telegram`;
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message"] }),
});
console.log(res.status, await res.text());
