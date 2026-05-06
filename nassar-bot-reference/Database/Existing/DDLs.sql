-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type USER-DEFINED NOT NULL DEFAULT 'text'::announcement_type,
  content text NOT NULL,
  images ARRAY NOT NULL DEFAULT '{}'::text[],
  announcement_order integer NOT NULL DEFAULT 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.business_profile (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  business_name text NOT NULL DEFAULT 'Storefront'::text,
  logo_url text,
  primary_mobile text,
  facebook_url text,
  instagram_url text,
  whatsapp_url text,
  tiktok_url text,
  snapchat_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_profile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent_id uuid,
  icon_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.discounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  discount_value numeric NOT NULL DEFAULT 0 CHECK (discount_value >= 0::numeric AND discount_value <= 100::numeric),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT discounts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.feedbacks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  feedback_text text NOT NULL,
  product_id uuid,
  product_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT feedbacks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  mobile_number text NOT NULL,
  secondary_mobile_number text,
  country text,
  city_region text NOT NULL,
  address text NOT NULL,
  shipping_fee numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method USER-DEFINED NOT NULL DEFAULT 'cash_on_delivery'::payment_method,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::order_status,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orders_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  unit_price numeric NOT NULL,
  discount_value numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total numeric NOT NULL,
  variant jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_items_pkey PRIMARY KEY (id),
  CONSTRAINT orders_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT orders_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0::numeric),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category_id uuid,
  brand_id uuid,
  discount_id uuid,
  images ARRAY NOT NULL DEFAULT '{}'::text[],
  filter_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  custom_discount_value numeric CHECK (custom_discount_value IS NULL OR custom_discount_value >= 0::numeric AND custom_discount_value <= 100::numeric),
  product_number integer NOT NULL DEFAULT nextval('products_number_seq'::regclass) UNIQUE,
  filter_attribute_images jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT products_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id)
);
CREATE TABLE public.shipping_regions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  fee numeric NOT NULL DEFAULT 0 CHECK (fee >= 0::numeric),
  free_shipping_threshold numeric,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shipping_regions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_configuration (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  active_layout USER-DEFINED NOT NULL DEFAULT 'classic'::layout_name,
  active_theme USER-DEFINED NOT NULL DEFAULT 'light'::theme_name,
  show_feedback_section boolean NOT NULL DEFAULT true,
  show_language_selector boolean NOT NULL DEFAULT true,
  enable_countdown_timers boolean NOT NULL DEFAULT true,
  new_arrivals_days integer NOT NULL DEFAULT 21,
  default_locale text NOT NULL DEFAULT 'ar'::text,
  default_currency text NOT NULL DEFAULT 'ILS'::text,
  schema_version integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  custom_color_primary text,
  custom_color_primary_foreground text,
  custom_color_accent text,
  custom_color_bg text,
  custom_color_surface text,
  custom_color_text text,
  custom_color_text_muted text,
  custom_color_border text,
  policy_delivery text,
  policy_exchange text,
  policy_refund text,
  CONSTRAINT site_configuration_pkey PRIMARY KEY (id)
);