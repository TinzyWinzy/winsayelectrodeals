-- ============================================================
-- WINSAY ELECTRODEALS — Full CMS + CRM + Inventory Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PART 1: CMS — Content Management System
-- ============================================================

-- 1a. Hero Slides
CREATE TABLE IF NOT EXISTS cms_hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  overlay_color TEXT DEFAULT 'from-primary/95 via-primary/85 to-primary/70',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cms_hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active hero slides" ON cms_hero_slides;
CREATE POLICY "Public can view active hero slides" ON cms_hero_slides FOR SELECT USING (active = true OR current_setting('role') = 'authenticated');
DROP POLICY IF EXISTS "Admins can manage hero slides" ON cms_hero_slides;
CREATE POLICY "Admins can manage hero slides" ON cms_hero_slides FOR ALL USING (current_setting('role') = 'authenticated') WITH CHECK (current_setting('role') = 'authenticated');

-- 1b. Testimonials
CREATE TABLE IF NOT EXISTS cms_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  location TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active testimonials" ON cms_testimonials;
CREATE POLICY "Public can view active testimonials" ON cms_testimonials FOR SELECT USING (active = true OR current_setting('role') = 'authenticated');
DROP POLICY IF EXISTS "Admins can manage testimonials" ON cms_testimonials;
CREATE POLICY "Admins can manage testimonials" ON cms_testimonials FOR ALL USING (current_setting('role') = 'authenticated');

-- 1c. Site Content (About, How It Works, etc.)
CREATE TABLE IF NOT EXISTS cms_site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  body TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cms_site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view site content" ON cms_site_content;
CREATE POLICY "Public can view site content" ON cms_site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site content" ON cms_site_content;
CREATE POLICY "Admins can manage site content" ON cms_site_content FOR ALL USING (current_setting('role') = 'authenticated');

-- Seed default content
INSERT INTO cms_site_content (section_key, title, body) VALUES
  ('about', 'About Winsay Electrodeals', 'We are a Zimbabwean-owned solar energy company based in Harare, dedicated to making solar power accessible to every home and business.'),
  ('how-it-works', 'How It Works', 'From choice to installation in four simple steps.'),
  ('trust-bar-1', '25-Year Warranties', 'On all panels'),
  ('trust-bar-2', '500+ Installations', 'Across Zimbabwe'),
  ('trust-bar-3', '48-Hour Install', 'After deposit'),
  ('trust-bar-4', 'Fully Licensed', 'ZERA certified')
ON CONFLICT (section_key) DO NOTHING;

-- 1d. Brands / Partners
CREATE TABLE IF NOT EXISTS cms_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cms_brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active brands" ON cms_brands;
CREATE POLICY "Public can view active brands" ON cms_brands FOR SELECT USING (active = true OR current_setting('role') = 'authenticated');
DROP POLICY IF EXISTS "Admins can manage brands" ON cms_brands;
CREATE POLICY "Admins can manage brands" ON cms_brands FOR ALL USING (current_setting('role') = 'authenticated');

-- 1e. Site Settings (key-value store for contact, social, etc.)
CREATE TABLE IF NOT EXISTS cms_site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cms_site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view settings" ON cms_site_settings;
CREATE POLICY "Public can view settings" ON cms_site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage settings" ON cms_site_settings;
CREATE POLICY "Admins can manage settings" ON cms_site_settings FOR ALL USING (current_setting('role') = 'authenticated');

-- Seed settings
INSERT INTO cms_site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('business_phone', '+263 785 293 587', 'phone', 'Primary business phone number'),
  ('business_whatsapp', '263785293587', 'phone', 'WhatsApp number (digits only, no +)'),
  ('business_email', 'info@winsay.co.zw', 'email', 'Primary business email'),
  ('business_address', 'Shop 23B, Copacabbana Mall, 1st Entrance, Cameroon Street, Harare', 'text', 'Physical address'),
  ('social_facebook', '', 'url', 'Facebook page URL'),
  ('social_instagram', '', 'url', 'Instagram handle URL'),
  ('shipping_info', 'Free installation on all systems', 'text', 'Shipping/promotion info')
ON CONFLICT (setting_key) DO NOTHING;


-- ============================================================
-- PART 2: CRM — Customer Relationship Management
-- ============================================================

-- 2z. Team Members / RBAC
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM (
      'SUPER_ADMIN',
      'MANAGER',
      'SALES_AGENT',
      'MARKETING',
      'TECHNICIAN',
      'VIEWER'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'VIEWER',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(active);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can view team members" ON team_members;
CREATE POLICY "Authenticated can view team members" ON team_members FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Super admins can manage team members" ON team_members;
CREATE POLICY "Super admins can manage team members" ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.active = true
        AND tm.role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.active = true
        AND tm.role = 'SUPER_ADMIN'
    )
  );

-- 2a. Enhanced customers (extends existing customers table)
-- Note: The existing `customers` table already exists.
-- We add additional columns here. Run with IF NOT EXISTS.

ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'whatsapp';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);

-- 2a2. Unified Lead Pipeline
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  city TEXT,
  suburb TEXT,
  source TEXT NOT NULL DEFAULT 'other',
  campaign TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  landing_page TEXT,
  selected_appliances JSONB DEFAULT '[]',
  property_type TEXT,
  backup_duration TEXT,
  usage_pattern TEXT,
  budget TEXT,
  recommended_package_id TEXT,
  recommended_package_name TEXT,
  alternative_package_id TEXT,
  alternative_package_name TEXT,
  estimated_continuous_load INTEGER DEFAULT 0,
  estimated_surge_load INTEGER DEFAULT 0,
  confidence_score INTEGER,
  expert_review_required BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  pipeline_status TEXT NOT NULL DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  lead_temperature TEXT DEFAULT 'cold' CHECK (lead_temperature IN ('hot', 'warm', 'cold')),
  installation_urgency TEXT,
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date TIMESTAMPTZ,
  lost_reason TEXT,
  notes TEXT,
  duplicate_of UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage leads" ON leads;
CREATE POLICY "Authenticated can manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 2a3. Solar Finder submissions, kept as raw recommendation context.
CREATE TABLE IF NOT EXISTS solar_finder_leads (
  id TEXT PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  city TEXT,
  suburb TEXT,
  appliances JSONB DEFAULT '[]',
  property_type TEXT,
  backup_duration TEXT,
  usage_pattern TEXT,
  budget TEXT,
  installation_timeline TEXT DEFAULT 'researching',
  recommended_package_id TEXT NOT NULL,
  recommended_package_name TEXT NOT NULL,
  upgrade_package_id TEXT,
  upgrade_package_name TEXT,
  estimated_continuous_load INTEGER DEFAULT 0,
  estimated_surge_load INTEGER DEFAULT 0,
  expert_review_required BOOLEAN DEFAULT false,
  lead_source TEXT DEFAULT 'Solar System Finder',
  status TEXT DEFAULT 'new',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solar_finder_leads_lead ON solar_finder_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_solar_finder_leads_whatsapp ON solar_finder_leads(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_solar_finder_leads_timestamp ON solar_finder_leads(timestamp DESC);

ALTER TABLE solar_finder_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create solar finder leads" ON solar_finder_leads;
CREATE POLICY "Public can create solar finder leads" ON solar_finder_leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can view solar finder leads" ON solar_finder_leads;
CREATE POLICY "Authenticated can view solar finder leads" ON solar_finder_leads FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated can update solar finder leads" ON solar_finder_leads;
CREATE POLICY "Authenticated can update solar finder leads" ON solar_finder_leads FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 2a4. Follow-Ups
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  follow_up_type TEXT NOT NULL CHECK (follow_up_type IN ('whatsapp', 'phone_call', 'email', 'physical_meeting', 'site_assessment', 'quote_follow_up', 'installation_follow_up', 'after_sales_follow_up')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON follow_ups(due_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned ON follow_ups(assigned_to);

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage follow ups" ON follow_ups;
CREATE POLICY "Authenticated can manage follow ups" ON follow_ups FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 2a5. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at DESC);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Managers can view audit events" ON audit_events;
CREATE POLICY "Managers can view audit events" ON audit_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.active = true
      AND tm.role IN ('SUPER_ADMIN', 'MANAGER')
  )
);
DROP POLICY IF EXISTS "Authenticated can create audit events" ON audit_events;
CREATE POLICY "Authenticated can create audit events" ON audit_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2b. Customer Notes (interaction log)
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_notes(customer_id);

ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage customer notes" ON customer_notes;
CREATE POLICY "Authenticated can manage customer notes" ON customer_notes FOR ALL USING (current_setting('role') = 'authenticated');

-- 2c. Communication Log
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'phone', 'email', 'sms', 'in-person', 'other')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'completed',
  log_metadata JSONB DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_logs_customer ON communication_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_created ON communication_logs(created_at DESC);

ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage comm logs" ON communication_logs;
CREATE POLICY "Authenticated can manage comm logs" ON communication_logs FOR ALL USING (current_setting('role') = 'authenticated');


-- ============================================================
-- PART 3: INVENTORY MANAGEMENT
-- ============================================================

-- 3a. Product Catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('panel', 'battery', 'inverter', 'accessory', 'mounting', 'cable', 'other')),
  brand TEXT,
  model TEXT,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  unit TEXT DEFAULT 'piece',
  unit_price_usd DECIMAL(10,2),
  unit_price_zig DECIMAL(10,2),
  supplier TEXT,
  min_stock_level INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage products" ON products;
CREATE POLICY "Authenticated can manage products" ON products FOR ALL USING (current_setting('role') = 'authenticated');

-- Seed common products
INSERT INTO products (name, sku, category, brand, specifications, unit_price_usd, min_stock_level) VALUES
  ('700W Solar Panel', 'PNL-700', 'panel', 'SUMRY', '{"wattage": 700, "type": "monocrystalline"}', 200, 10),
  ('150Ah Lithium Battery', 'BAT-150-LI', 'battery', 'SUMRY', '{"voltage": 25.5, "capacity_ah": 150, "chemistry": "LiFePO4"}', 500, 5),
  ('200Ah Lithium Battery', 'BAT-200-LI', 'battery', 'SUMRY', '{"voltage": 24, "capacity_ah": 200, "chemistry": "LiFePO4"}', 600, 5),
  ('52.2V Promax Battery', 'BAT-PROMAX', 'battery', 'Promax', '{"voltage": 52.2, "capacity_ah": 200, "chemistry": "Lithium"}', 700, 3),
  ('48V 200Ah Battery', 'BAT-48-200', 'battery', 'SUMRY', '{"voltage": 48, "capacity_ah": 200, "chemistry": "LiFePO4"}', 650, 3),
  ('3.2kVA Hybrid Inverter', 'INV-3.2', 'inverter', 'Deye', '{"power_kva": 3.2, "type": "hybrid", "mppt": true}', 400, 5),
  ('3.5kVA Hybrid Inverter', 'INV-3.5', 'inverter', 'Deye', '{"power_kva": 3.5, "type": "hybrid", "mppt": true}', 450, 5),
  ('8.2kVA Hybrid Inverter', 'INV-8.2', 'inverter', 'Deye', '{"power_kva": 8.2, "type": "hybrid", "mppt": true}', 800, 3),
  ('10.2kVA Hybrid Inverter', 'INV-10.2', 'inverter', 'Deye', '{"power_kva": 10.2, "type": "hybrid", "mppt": true}', 1000, 3),
  ('12kVA Hybrid Inverter', 'INV-12', 'inverter', 'Deye', '{"power_kva": 12, "type": "hybrid", "mppt": true}', 1200, 2),
  ('Protection Kit', 'ACC-PROTECT', 'accessory', 'Winsay', '{"includes": ["surge protector", "circuit breaker", "fuse"]}', 50, 20),
  ('Mounting Kit', 'ACC-MOUNT', 'mounting', 'Winsay', '{"includes": ["rails", "clamps", "bolts"]}', 80, 20),
  ('Voltage Switch', 'ACC-VOLT-SW', 'accessory', 'Winsay', '{"type": "automatic voltage switch"}', 30, 20)
ON CONFLICT (sku) DO NOTHING;

-- 3b. Inventory Stock (current stock per product/location)
CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location TEXT DEFAULT 'main',
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_stock_product_location ON inventory_stock(product_id, location);

ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage inventory" ON inventory_stock;
CREATE POLICY "Authenticated can manage inventory" ON inventory_stock FOR ALL USING (current_setting('role') = 'authenticated');

-- Seed initial stock
INSERT INTO inventory_stock (product_id, location, quantity)
  SELECT id, 'main', 20 FROM products WHERE sku = 'PNL-700'
  UNION ALL SELECT id, 'main', 10 FROM products WHERE sku = 'BAT-150-LI'
  UNION ALL SELECT id, 'main', 8 FROM products WHERE sku = 'BAT-200-LI'
  UNION ALL SELECT id, 'main', 5 FROM products WHERE sku = 'BAT-PROMAX'
  UNION ALL SELECT id, 'main', 5 FROM products WHERE sku = 'BAT-48-200'
  UNION ALL SELECT id, 'main', 8 FROM products WHERE sku = 'INV-3.2'
  UNION ALL SELECT id, 'main', 8 FROM products WHERE sku = 'INV-3.5'
  UNION ALL SELECT id, 'main', 5 FROM products WHERE sku = 'INV-8.2'
  UNION ALL SELECT id, 'main', 3 FROM products WHERE sku = 'INV-10.2'
  UNION ALL SELECT id, 'main', 2 FROM products WHERE sku = 'INV-12'
  UNION ALL SELECT id, 'main', 30 FROM products WHERE sku = 'ACC-PROTECT'
  UNION ALL SELECT id, 'main', 25 FROM products WHERE sku = 'ACC-MOUNT'
  UNION ALL SELECT id, 'main', 25 FROM products WHERE sku = 'ACC-VOLT-SW'
ON CONFLICT (product_id, location) DO NOTHING;

-- 3c. Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'damaged', 'return')),
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  unit_price_usd DECIMAL(10,2),
  batch_number TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage stock movements" ON stock_movements;
CREATE POLICY "Authenticated can manage stock movements" ON stock_movements FOR ALL USING (current_setting('role') = 'authenticated');

-- 3d. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled')),
  order_date DATE DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date DATE,
  total_amount_usd DECIMAL(12,2),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage purchase orders" ON purchase_orders;
CREATE POLICY "Authenticated can manage purchase orders" ON purchase_orders FOR ALL USING (current_setting('role') = 'authenticated');

-- 3e. Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price_usd DECIMAL(10,2),
  received_quantity INTEGER DEFAULT 0,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage PO items" ON purchase_order_items;
CREATE POLICY "Authenticated can manage PO items" ON purchase_order_items FOR ALL USING (current_setting('role') = 'authenticated');


-- ============================================================
-- PART 4: INDEXES & PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_quote ON payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_install_schedules_date ON install_schedules(install_date);

-- ============================================================
-- PART 5: AUTO-UPDATE TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cms_hero_slides_updated_at ON cms_hero_slides;
CREATE TRIGGER set_cms_hero_slides_updated_at
  BEFORE UPDATE ON cms_hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_cms_testimonials_updated_at ON cms_testimonials;
CREATE TRIGGER set_cms_testimonials_updated_at
  BEFORE UPDATE ON cms_testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_cms_site_content_updated_at ON cms_site_content;
CREATE TRIGGER set_cms_site_content_updated_at
  BEFORE UPDATE ON cms_site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_cms_brands_updated_at ON cms_brands;
CREATE TRIGGER set_cms_brands_updated_at
  BEFORE UPDATE ON cms_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_cms_site_settings_updated_at ON cms_site_settings;
CREATE TRIGGER set_cms_site_settings_updated_at
  BEFORE UPDATE ON cms_site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_team_members_updated_at ON team_members;
CREATE TRIGGER set_team_members_updated_at
  BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_customers_updated_at ON customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_solar_finder_leads_updated_at ON solar_finder_leads;
CREATE TRIGGER set_solar_finder_leads_updated_at
  BEFORE UPDATE ON solar_finder_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_follow_ups_updated_at ON follow_ups;
CREATE TRIGGER set_follow_ups_updated_at
  BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER set_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- PART 6: STOCK MOVEMENT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION process_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  SELECT COALESCE(quantity, 0) INTO current_qty
  FROM inventory_stock
  WHERE product_id = NEW.product_id AND location = 'main';

  IF NOT FOUND THEN
    INSERT INTO inventory_stock (product_id, quantity) VALUES (NEW.product_id, 0);
    current_qty := 0;
  END IF;

  IF NEW.movement_type = 'in' OR NEW.movement_type = 'return' THEN
    UPDATE inventory_stock
    SET quantity = quantity + NEW.quantity, updated_at = now()
    WHERE product_id = NEW.product_id AND location = 'main';
  ELSIF NEW.movement_type IN ('out', 'damaged') THEN
    UPDATE inventory_stock
    SET quantity = GREATEST(0, quantity - NEW.quantity), updated_at = now()
    WHERE product_id = NEW.product_id AND location = 'main';
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE inventory_stock
    SET quantity = GREATEST(0, quantity + NEW.quantity), updated_at = now()
    WHERE product_id = NEW.product_id AND location = 'main';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_stock_movement ON stock_movements;
CREATE TRIGGER trg_process_stock_movement
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION process_stock_movement();
