# Nassar Bot — Backend

LangChain ReAct agent serving both the website (`/api/chat`) and a Telegram bot (`/api/telegram`). Deployed as a standalone Vercel project with **Backend/** as the root.

## Endpoints
- `POST /api/chat` — body `{ message, session_id }` → `{ reply }`. CORS locked to `ALLOWED_ORIGIN`.
- `POST /api/telegram` — Telegram webhook. Register after deploy:
  ```
  curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://<backend>.vercel.app/api/telegram"
  ```

## Env vars (Vercel → Settings → Environment Variables)
See `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** key (never expose to the browser).

## Required Supabase schema (TODO — ask me for the SQL)
- `products_vector(id, name, description, embedding vector(1536))`
- `products_metadata(id, name, price, stock_quantity, currency)`
- `orders(id, customer_name, phone, location, items jsonb, total_price, status, channel, channel_user_id, created_at)`
- `chat_messages(session_id text, idx int, message jsonb, created_at timestamptz, primary key (session_id, idx))`
- RPC `match_products(query_embedding vector, match_count int)`

## Install / run locally
```
cd Backend
npm install
cp .env.example .env   # fill in real values
npx vercel dev
```

## Swap client persona
Edit `brief/nassar.md` or add another file and change the argument to `loadSystemPrompt()`.
