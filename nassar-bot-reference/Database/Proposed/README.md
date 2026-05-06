# Bot-SaaS Schema — Fresh Deployment

Ready-to-paste SQL for a fresh Supabase project. Targets the project documented in `../SUPABASE_PROJECT.md`.

## How to run

**Easy path — single paste:**

1. Open the Supabase SQL editor: https://supabase.com/dashboard/project/rropzppodfgzvhkbtlrl/sql/new
2. Paste the contents of `00_full_schema.sql`.
3. Run.

**Manual path — file by file (useful when reviewing):**

Run files in order, top to bottom:

| # | File | What it creates |
|---|---|---|
| 01 | `01_extensions_and_enums.sql` | `pgcrypto`, `vector`, `uuid-ossp` extensions; 5 enums |
| 02 | `02_clients.sql` | `clients` table (incl. `has_bot`, `bot_brief`, `bot_settings`) |
| 03 | `03_catalog.sql` | `brands`, `categories`, `discounts`, `shipping_regions`, `products` |
| 04 | `04_orders.sql` | `orders`, `orders_items` |
| 05 | `05_storefront_config.sql` | `business_profile`, `site_configuration`, `announcements`, `feedbacks` |
| 06 | `06_users_info.sql` | Returning-customer profile (per tenant) |
| 07 | `07_bot_tables.sql` | `chat_messages`, `session_bans`, `product_embeddings` |
| 08 | `08_triggers.sql` | `set_updated_at`, `set_product_number`, same-tenant FK guards |
| 09 | `09_functions.sql` | `normalize_phone`, `generate_order_number`, `get_orders_by_mobile`, `get_order_items`, `place_order`, `match_products` |
| 10 | `10_seed_example.sql` | (Optional) Commented-out example seeding a demo client |

Or use `00_full_schema.sql` (auto-generated concatenation of files 01–09).

## Idempotence

Every file uses `CREATE TABLE IF NOT EXISTS` and `CREATE OR REPLACE FUNCTION`, and enum creation is wrapped in `DO ... EXCEPTION WHEN duplicate_object`. **Re-running the schema is safe** and will not fail — though it will not undo schema drift either, so use a clean DB for the first apply.

## After applying

1. Insert at least one client (see `10_seed_example.sql`).
2. Set `has_bot = true` for any client who should get the chatbot.
3. Apply RLS policies for storefront access — see PRD §10.2 for the template.
4. Generate embeddings for that client's products via `Backend/scripts/embedProducts.ts`.

## Things you may need to customize before applying

- **Enum values** in `01_extensions_and_enums.sql` (`payment_method`, `order_status`, etc.) — defaults are reasonable but may differ from your actual storefront's existing values.
- **`bot_settings` defaults** in `02_clients.sql` — review the inline JSON-shape comment.
- **IVFFlat `lists` parameter** in `07_bot_tables.sql` — set to ≈ `sqrt(rows)` once you have real product data.

## Cross-references

- PRD: `../../BOT_SAAS_PRD.md`
- Existing single-tenant schema (for context only): `../Existing/DDLs.sql`, `../Existing/Functions.sql`
- Project credentials & deploy notes: `../SUPABASE_PROJECT.md`
