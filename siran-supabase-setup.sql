-- =====================================================
-- SIRAN RESTAURANT — SUPABASE DATABASE SETUP
-- Führe dieses Script in der Supabase SQL-Konsole aus
-- Projekt: siran-restaurant.supabase.co
-- Version: 2.0 (Mai 2026)
-- =====================================================

-- ── TABELLEN ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT,
  slug        TEXT UNIQUE,
  display_order INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id             TEXT PRIMARY KEY,
  cat            TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  desc           TEXT,
  price          DECIMAL(10,2) NOT NULL,
  allergens      JSONB DEFAULT '[]',
  cal            INT,
  featured       BOOLEAN DEFAULT FALSE,
  is_halal       BOOLEAN DEFAULT TRUE,
  is_vegetarian  BOOLEAN DEFAULT FALSE,
  is_spicy       BOOLEAN DEFAULT FALSE,
  is_available   BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT UNIQUE,
  items            JSONB NOT NULL,
  subtotal         DECIMAL(10,2),
  total            DECIMAL(10,2),
  order_type       TEXT CHECK (order_type IN ('dine_in','takeaway','delivery')),
  pay_method       TEXT CHECK (pay_method IN ('card','paypal','cash')),
  customer_name    TEXT,
  customer_phone   TEXT,
  delivery_address TEXT,
  notes            TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  points_earned    INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     TEXT NOT NULL UNIQUE,
  points_balance INT DEFAULT 0,
  total_earned   INT DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUTO-UPDATE TRIGGER ───────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ORDER NUMBER GENERATOR ────────────────────────────

CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'SIRAN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ── ROW LEVEL SECURITY ────────────────────────────────

ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Public read: Kategorien & Produkte
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (TRUE);

CREATE POLICY "Public read products"
  ON products FOR SELECT USING (is_available = TRUE);

-- Public insert orders (Gäste dürfen bestellen)
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT WITH CHECK (TRUE);

-- Public select own orders (vereinfacht für Demo — in Prod: auth.uid() prüfen)
CREATE POLICY "Public read orders"
  ON orders FOR SELECT USING (TRUE);

-- Loyalty points: voll öffentlich (in Prod mit session_id einschränken)
CREATE POLICY "Public loyalty all"
  ON loyalty_points FOR ALL USING (TRUE);

-- ── FULL-TEXT SEARCH INDEX ────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_fts
  ON products USING GIN (to_tsvector('german', name || ' ' || COALESCE(desc, '')));

CREATE INDEX IF NOT EXISTS idx_products_cat
  ON products(cat, is_available, featured);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status, created_at DESC);

-- ── SEED DATA: KATEGORIEN ─────────────────────────────

INSERT INTO categories (id, name, icon, slug, display_order) VALUES
  ('cat1', 'Döner & Wraps',  '🥙', 'doner-wraps',    1),
  ('cat2', 'Vorspeisen',     '🫙', 'vorspeisen',      2),
  ('cat3', 'Hauptgerichte',  '🍽', 'hauptgerichte',   3),
  ('cat4', 'Beilagen',       '🌿', 'beilagen',        4),
  ('cat5', 'Getränke',       '🫖', 'getraenke',       5),
  ('cat6', 'Desserts',       '🍯', 'desserts',        6)
ON CONFLICT (id) DO NOTHING;

-- ── SEED DATA: PRODUKTE ───────────────────────────────

INSERT INTO products (id, cat, name, desc, price, allergens, cal, featured, is_halal, is_vegetarian, is_spicy) VALUES
  ('p1',  'cat1', 'Döner Teller',      'Saftige Dönerfleisch-Scheiben auf Basmati-Reis mit buntem Salat, serviert mit hausgemachtem Joghurt-Knoblauch-Dip und frischer Petersiliengarnitur.',           13.90, '["A","G","L"]',       680, FALSE, TRUE, FALSE, FALSE),
  ('p2',  'cat1', 'Sucuk Döner',       'Kräftig gewürztes Sucuk-Fleisch, langsam am Spiess geröstet. Nur an ausgewählten Tagen verfügbar — ein Geschmackserlebnis der besonderen Klasse.',           14.50, '["A","G","M","N"]',   720, TRUE,  TRUE, FALSE, TRUE),
  ('p3',  'cat1', 'Chicken Döner',     'Zartes Hähnchenfleisch, mariniert in orientalischen Gewürzen, vom Holzkohlengrill, serviert mit frischem Gemüse und cremigem Hummus-Dip.',                   12.90, '["A","G","L","M"]',   580, FALSE, TRUE, FALSE, FALSE),
  ('p4',  'cat1', 'Veggie Döner',      'Knusprig gebratene Gemüsemischung aus Paprika, Aubergine und Zucchini, angereichert mit Feta und frischen Kräutern im warmen Fladenbrot.',                   11.90, '["A","G","N"]',       440, FALSE, TRUE, TRUE,  FALSE),
  ('p5',  'cat1', 'Falafel Wrap',      'Goldbraun frittierte Falafel aus Kichererbsen und Kräutern, eingewickelt in ein warmes Fladenbrot mit Tahini, frischen Tomaten und Gurken.',                 11.50, '["A","F","N","G"]',   520, FALSE, TRUE, TRUE,  FALSE),
  ('p6',  'cat1', 'Mixed Grill Teller','Auswahl unserer feinsten Grillkreationen: Adana, Shish Taouk, Chicken und Lamm, serviert mit Reis, Salat und gegrilltem Saisongemüse.',                      18.90, '["A","G","L"]',       950, TRUE,  TRUE, FALSE, TRUE),
  ('p7',  'cat2', 'Hummus',            'Samtig-cremiger Kichererbsendip mit Tahini, frischem Zitronensaft und kaltgepresstem Olivenöl, garniert mit geröstetem Paprikapulver.',                      6.50,  '["F","N","G"]',       210, FALSE, TRUE, TRUE,  FALSE),
  ('p8',  'cat2', 'Cacik',             'Erfrischender türkischer Joghurtdip mit fein geriebenem Gurke, Knoblauch, Minze und einem Hauch Olivenöl — klassisch und unverwechselbar.',                  5.90,  '["G"]',               140, FALSE, TRUE, TRUE,  FALSE),
  ('p9',  'cat2', 'Mercimek Çorbasi',  'Traditionelle türkische rote Linsensuppe, langsam geköchelt mit Karotten, Zwiebeln und Kreuzkümmel, verfeinert mit brauner Butter und Zitrone.',             6.90,  '["L","G"]',           280, FALSE, TRUE, TRUE,  FALSE),
  ('p10', 'cat2', 'Sigara Börek',      'Knusprig goldene Teigröllchen, gefüllt mit feinem Schafskäse und frischen Kräutern. Serviert mit pikanter Tomatensauce — vier Stück pro Portion.',           7.90,  '["A","C","G","N"]',   380, FALSE, TRUE, TRUE,  FALSE),
  ('p11', 'cat2', 'Ezme',              'Pikant-würzige Tomaten-Chili-Paste nach türkischer Hausmannsküche mit Zwiebeln, Petersilie und Granatapfelmelasse. Intensiv im Charakter.',                   5.50,  '["L","M"]',           90,  FALSE, TRUE, TRUE,  TRUE),
  ('p12', 'cat3', 'Adana Kebap',       'Handgeformtes Hackfleisch vom Holzkohlengrill, kräftig gewürzt mit Paprika und Kreuzkümmel. Serviert mit Bulgurpilav und gegrilltem Gemüse.',                17.90, '["A","L","M"]',       720, TRUE,  TRUE, FALSE, TRUE),
  ('p13', 'cat3', 'Shish Taouk',       'Zarte Hähnchenfiletwürfel, über Nacht in Zitrus-Knoblauch-Marinade eingelegt und auf dem Holzkohlengrill zur absoluten Perfektion gegart.',                  16.90, '["G","L","M"]',       580, FALSE, TRUE, FALSE, FALSE),
  ('p14', 'cat3', 'Lammkoteletten',    'Premium-Lammkoteletten aus dem Hochland, mit Rosmarin und Knoblauch mariniert, auf offenem Feuer gegrillt. Serviert mit Minz-Joghurt.',                     24.90, '["G","M"]',           810, TRUE,  TRUE, FALSE, FALSE),
  ('p15', 'cat3', 'Beyti Kebap',       'Zartes Hackfleisch-Kebap in hauchdünnem Lavash gerollt, in Tomatensauce pochiert und grosszügig mit Joghurt und Karamellbutter übergossen.',                18.90, '["A","C","G","L"]',   760, FALSE, TRUE, FALSE, FALSE),
  ('p16', 'cat3', 'Iskender Kebap',    'Dünn aufgeschnittenes Dönerfleisch auf Fladenbrot, übergossen mit heisser Tomatensauce, brauner Butter und hausgemachtem Joghurt.',                         16.90, '["A","G","L"]',       840, FALSE, TRUE, FALSE, FALSE),
  ('p17', 'cat4', 'Basmati Reis',      'Aromatischer Basmati-Reis, gedämpft mit Butter und einem Hauch Safran, garniert mit frischem Dill.',                                                          3.90,  '["G"]',               220, FALSE, TRUE, TRUE,  FALSE),
  ('p18', 'cat4', 'Pommes Frites',     'Knusprige, goldbraune Kartoffelpommes, frisch frittiert und mit grobem Meersalz verfeinert.',                                                                 4.50,  '[]',                  350, FALSE, TRUE, TRUE,  FALSE),
  ('p19', 'cat4', 'Bulgurpilav',       'Fein gewürzter Bulgurweizen mit Tomaten, Zwiebeln und Paprika — nach türkischer Hausfrauenart zubereitet.',                                                   3.90,  '["A","L"]',           240, FALSE, TRUE, TRUE,  FALSE),
  ('p20', 'cat4', 'Frischer Salat',    'Saisonal zusammengestellter Beilagensalat mit Rucola, Gurke, Tomate, roten Zwiebeln und Granatapfelkernen, angemacht mit Olivenöldressing.',                  4.90,  '["L","M"]',           80,  FALSE, TRUE, TRUE,  FALSE),
  ('p21', 'cat5', 'Ayran',             'Erfrischendes türkisches Joghurtgetränk, klassisch gequirlt mit einer Prise Meersalz und fein geschnittenem Minzblatt.',                                      2.90,  '["G"]',               80,  FALSE, TRUE, TRUE,  FALSE),
  ('p22', 'cat5', 'Türkischer Çay',    'Starker türkischer Schwarztee, in der traditionellen Tulpenglas-Form serviert — nachfüllbar.',                                                                2.50,  '[]',                  5,   FALSE, TRUE, TRUE,  FALSE),
  ('p23', 'cat5', 'Türkischer Kaffee', 'Fein gemahlener Mokka, traditionell im Kupfer-Cezve aufgebrüht. Serviert mit Glas kaltem Wasser und einem Würfelzucker.',                                   3.50,  '[]',                  10,  FALSE, TRUE, TRUE,  FALSE),
  ('p24', 'cat5', 'Softdrink',         'Auswahl: Cola, Cola Zero, Fanta, Sprite. 0,33 l Dose, gut gekühlt.',                                                                                         2.90,  '[]',                  140, FALSE, TRUE, TRUE,  FALSE),
  ('p26', 'cat6', 'Baklava (3 Stk.)',  'Hauchdünne Teigschichten, gefüllt mit gehackten Pistazien und getränkt in Blütenhonig-Sirup. Handgefertigt nach dem Originalrezept der Familie.',           7.90,  '["A","C","G","H","N"]',380, TRUE,  TRUE, TRUE,  FALSE),
  ('p27', 'cat6', 'Künefe',            'Warmer Engelshaar-Teig mit geschmolzenem Ziegenmozzarella, in Zuckersirup gewendet und mit frisch gemahlenen Pistazien bestreut.',                          8.90,  '["A","C","G","H"]',   460, FALSE, TRUE, TRUE,  FALSE),
  ('p28', 'cat6', 'Sütlaç',            'Cremiger türkischer Reispudding mit feiner Zimt- und Vanillenote, im Ofen leicht karamellisiert — ein stiller, eleganter Abschluss.',                       6.50,  '["C","G"]',           290, FALSE, TRUE, TRUE,  FALSE)
ON CONFLICT (id) DO NOTHING;

-- ── FERTIG ────────────────────────────────────────────
-- Tabellen erstellt: categories, products, orders, loyalty_points
-- RLS aktiviert mit öffentlichen Policies
-- Seed-Daten eingefügt: 6 Kategorien, 27 Produkte
-- =====================================================
