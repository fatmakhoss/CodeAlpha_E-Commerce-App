/*
# E-Commerce Store Schema

## Summary
Creates the full schema for a CodeAlpha internship e-commerce store with:
- Products table (publicly readable, admin-writable)
- Cart items table (per authenticated user)
- Orders and order items tables (per authenticated user)
- User profiles table (extended user data)
- Admin role via app_metadata

## Tables
1. `profiles` - Extended user info (name, role: user/admin)
2. `products` - Store catalog (name, description, price, category, image, stock, ratings)
3. `cart_items` - Per-user cart (product_id, quantity)
4. `orders` - Order header (user_id, status, total, shipping address)
5. `order_items` - Order line items (order_id, product_id, qty, price_at_purchase)

## Security
- RLS enabled on all tables
- Products: public read, admin-only write
- Cart/orders: owner-scoped CRUD
- Profiles: owner-scoped read/update
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL DEFAULT 'General',
  image_url text NOT NULL DEFAULT '',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating numeric(3,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "products_select_all" ON products;
CREATE POLICY "products_select_all" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Admin-only write
DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_select_own" ON cart_items;
CREATE POLICY "cart_select_own" ON cart_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_insert_own" ON cart_items;
CREATE POLICY "cart_insert_own" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_update_own" ON cart_items;
CREATE POLICY "cart_update_own" ON cart_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_delete_own" ON cart_items;
CREATE POLICY "cart_delete_own" ON cart_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  shipping_name text NOT NULL DEFAULT '',
  shipping_address text NOT NULL DEFAULT '',
  shipping_city text NOT NULL DEFAULT '',
  shipping_zip text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_delete_own" ON orders;
CREATE POLICY "orders_delete_own" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text NOT NULL DEFAULT '',
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_delete_own" ON order_items;
CREATE POLICY "order_items_delete_own" ON order_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Admin can view all orders
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_admin" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "order_items_select_admin" ON order_items;
CREATE POLICY "order_items_select_admin" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sample products seed data
INSERT INTO products (name, description, price, category, image_url, stock, rating, review_count) VALUES
  ('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with 30-hour battery life and active noise cancellation for immersive audio.', 299.99, 'Electronics', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', 45, 4.8, 312),
  ('Minimalist Leather Watch', 'Slim genuine leather strap watch with sapphire crystal glass and Japanese quartz movement.', 189.00, 'Accessories', 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800', 28, 4.6, 198),
  ('Running Shoes Pro', 'Lightweight mesh running shoes with responsive cushioning and breathable upper for all-day comfort.', 124.95, 'Footwear', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 60, 4.5, 421),
  ('4K Mirrorless Camera', 'Compact mirrorless camera with 24MP sensor, 4K video, and in-body image stabilization.', 1299.00, 'Electronics', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800', 15, 4.9, 87),
  ('Cotton Hoodie Classic', 'Ultra-soft 100% organic cotton hoodie in a relaxed fit. Perfect for layering.', 59.99, 'Clothing', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800', 120, 4.4, 567),
  ('Portable Bluetooth Speaker', 'Waterproof portable speaker with 360° sound, 20-hour playtime, and built-in mic.', 79.95, 'Electronics', 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=800', 75, 4.7, 245),
  ('Ergonomic Office Chair', 'Fully adjustable lumbar support chair with breathable mesh back. Built for long work sessions.', 449.00, 'Furniture', 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=800', 18, 4.6, 134),
  ('Stainless Steel Water Bottle', 'Vacuum insulated 32oz bottle keeps drinks cold 24hrs / hot 12hrs. BPA-free.', 34.99, 'Accessories', 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=800', 200, 4.8, 892),
  ('Mechanical Keyboard', 'TKL layout with Cherry MX switches, RGB backlight, and aluminum frame.', 169.00, 'Electronics', 'https://images.pexels.com/photos/1714205/pexels-photo-1714205.jpeg?auto=compress&cs=tinysrgb&w=800', 35, 4.7, 156),
  ('Yoga Mat Premium', '6mm thick non-slip yoga mat with alignment lines. Eco-friendly natural rubber.', 49.99, 'Sports', 'https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=800', 88, 4.5, 303),
  ('Sunglasses Aviator', 'Classic aviator sunglasses with polarized UV400 lenses and lightweight titanium frame.', 145.00, 'Accessories', 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800', 42, 4.3, 178),
  ('Smart Fitness Tracker', 'Slim fitness band with heart rate, SpO2, sleep tracking, and 7-day battery life.', 89.95, 'Electronics', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', 65, 4.4, 412)
ON CONFLICT DO NOTHING;
