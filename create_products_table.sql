-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  original_price numeric NOT NULL,
  images text[] NOT NULL
);

-- Insert default product details
INSERT INTO public.products (id, name, price, original_price, images)
VALUES (
  'defender-2916', 
  'Defender 2916 Table Fan (16 Inch)', 
  4500, 
  5500, 
  ARRAY['/img/fan_1.png', '/img/fan_2.png', '/img/fan_3.png']
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    price = EXCLUDED.price, 
    original_price = EXCLUDED.original_price, 
    images = EXCLUDED.images;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
DROP POLICY IF EXISTS "Allow public select on products" ON public.products;
CREATE POLICY "Allow public select on products" ON public.products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Update RLS policies for orders to support Admin Panel (select and update)
DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE TO anon USING (true) WITH CHECK (true);
