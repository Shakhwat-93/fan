-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  delivery_area text NOT NULL,
  shipping_charge numeric NOT NULL,
  total_price numeric NOT NULL,
  product_name text NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  status text DEFAULT 'pending' NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and create
DROP POLICY IF EXISTS "Allow public inserts" ON public.orders;
CREATE POLICY "Allow public inserts" ON public.orders FOR INSERT TO anon WITH CHECK (true);
