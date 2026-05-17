import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingCart, X, Plus, Minus, Award, Clock, Check, Trash2, AlertCircle, Search, Star, MapPin, Phone, ChevronRight, Flame, Leaf, Info } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIG — ersetze mit deinen echten Credentials
// ═══════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://DEIN-PROJEKT.supabase.co";
const SUPABASE_ANON_KEY = "dein-anon-key-hier";

// Supabase Client (ohne SDK, native fetch)
const supabase = {
  from: (table) => ({
    select: (cols = "*") => ({
      eq: (col, val) => fetchSupabase(`${table}?${col}=eq.${val}&select=${cols}`),
      order: (col, { ascending = true } = {}) => ({
        eq: (col2, val2) => fetchSupabase(`${table}?${col2}=eq.${val2}&select=${cols}&order=${col}.${ascending ? "asc" : "desc"}`),
        execute: () => fetchSupabase(`${table}?select=${cols}&order=${col}.${ascending ? "asc" : "desc"}`),
      }),
      execute: () => fetchSupabase(`${table}?select=${cols}`),
    }),
    insert: (data) => fetchSupabase(table, "POST", data),
    update: (data) => ({
      eq: (col, val) => fetchSupabase(`${table}?${col}=eq.${val}`, "PATCH", data),
    }),
  }),
};

async function fetchSupabase(path, method = "GET", body = null) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": method === "POST" ? "return=representation" : "return=minimal",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    console.warn("Supabase fetch failed, using local data:", error.message);
    return { data: null, error };
  }
}

// ═══════════════════════════════════════════════════════════════
// LOKALE FALLBACK-DATEN (identisch zur Datenbank-Struktur)
// ═══════════════════════════════════════════════════════════════
const ALLERGEN_MAP = {
  A: "Gluten", C: "Eier", D: "Fisch", F: "Soja", G: "Milch/Laktose",
  H: "Schalenfrüchte", L: "Sellerie", M: "Senf", N: "Sesam",
  O: "Schwefeldioxid", R: "Weichtiere",
};

const LOCAL_CATEGORIES = [
  { id: "all", name: "Alle Gerichte", icon: "✦", slug: "alle" },
  { id: "cat1", name: "Döner & Wraps", icon: "🥙", slug: "doner-wraps" },
  { id: "cat2", name: "Vorspeisen", icon: "🫙", slug: "vorspeisen" },
  { id: "cat3", name: "Hauptgerichte", icon: "🍽", slug: "hauptgerichte" },
  { id: "cat4", name: "Beilagen", icon: "🌿", slug: "beilagen" },
  { id: "cat5", name: "Getränke", icon: "🫖", slug: "getraenke" },
  { id: "cat6", name: "Desserts", icon: "🍯", slug: "desserts" },
];

const LOCAL_PRODUCTS = [
  { id: "p1", cat: "cat1", name: "Döner Teller", desc: "Saftige Dönerfleisch-Scheiben auf Basmati-Reis mit buntem Salat, serviert mit hausgemachtem Joghurt-Knoblauch-Dip und frischer Petersiliengarnitur.", price: 13.90, allergens: ["A", "G", "L"], cal: 680, featured: false, is_halal: true, is_vegetarian: false, is_spicy: false },
  { id: "p2", cat: "cat1", name: "Sucuk Döner", desc: "Kräftig gewürztes Sucuk-Fleisch, langsam am Spiess geröstet. Nur an ausgewählten Tagen verfügbar — ein Geschmackserlebnis der besonderen Klasse.", price: 14.50, allergens: ["A", "G", "M", "N"], cal: 720, featured: true, is_halal: true, is_vegetarian: false, is_spicy: true },
  { id: "p3", cat: "cat1", name: "Chicken Döner", desc: "Zartes Hähnchenfleisch, mariniert in orientalischen Gewürzen, vom Holzkohlengrill, serviert mit frischem Gemüse und cremigem Hummus-Dip.", price: 12.90, allergens: ["A", "G", "L", "M"], cal: 580, featured: false, is_halal: true, is_vegetarian: false, is_spicy: false },
  { id: "p4", cat: "cat1", name: "Veggie Döner", desc: "Knusprig gebratene Gemüsemischung aus Paprika, Aubergine und Zucchini, angereichert mit Feta und frischen Kräutern im warmen Fladenbrot.", price: 11.90, allergens: ["A", "G", "N"], cal: 440, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p5", cat: "cat1", name: "Falafel Wrap", desc: "Goldbraun frittierte Falafel aus Kichererbsen und Kräutern, eingewickelt in ein warmes Fladenbrot mit Tahini, frischen Tomaten und Gurken.", price: 11.50, allergens: ["A", "F", "N", "G"], cal: 520, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p6", cat: "cat1", name: "Mixed Grill Teller", desc: "Auswahl unserer feinsten Grillkreationen: Adana, Shish Taouk, Chicken und Lamm, serviert mit Reis, Salat und gegrilltem Saisongemüse.", price: 18.90, allergens: ["A", "G", "L"], cal: 950, featured: true, is_halal: true, is_vegetarian: false, is_spicy: true },
  { id: "p7", cat: "cat2", name: "Hummus", desc: "Samtig-cremiger Kichererbsendip mit Tahini, frischem Zitronensaft und kaltgepresstem Olivenöl, garniert mit geröstetem Paprikapulver.", price: 6.50, allergens: ["F", "N", "G"], cal: 210, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p8", cat: "cat2", name: "Cacik", desc: "Erfrischender türkischer Joghurtdip mit fein geriebenem Gurke, Knoblauch, Minze und einem Hauch Olivenöl — klassisch und unverwechselbar.", price: 5.90, allergens: ["G"], cal: 140, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p9", cat: "cat2", name: "Mercimek Çorbasi", desc: "Traditionelle türkische rote Linsensuppe, langsam geköchelt mit Karotten, Zwiebeln und Kreuzkümmel, verfeinert mit brauner Butter und Zitrone.", price: 6.90, allergens: ["L", "G"], cal: 280, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p10", cat: "cat2", name: "Sigara Börek", desc: "Knusprig goldene Teigröllchen, gefüllt mit feinem Schafskäse und frischen Kräutern. Serviert mit pikanter Tomatensauce — vier Stück pro Portion.", price: 7.90, allergens: ["A", "C", "G", "N"], cal: 380, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p11", cat: "cat2", name: "Ezme", desc: "Pikant-würzige Tomaten-Chili-Paste nach türkischer Hausmannsküche mit Zwiebeln, Petersilie und Granatapfelmelasse.", price: 5.50, allergens: ["L", "M"], cal: 90, featured: false, is_halal: true, is_vegetarian: true, is_spicy: true },
  { id: "p12", cat: "cat3", name: "Adana Kebap", desc: "Handgeformtes Hackfleisch vom Holzkohlengrill, kräftig gewürzt mit Paprika und Kreuzkümmel. Serviert mit Bulgurpilav und gegrilltem Gemüse.", price: 17.90, allergens: ["A", "L", "M"], cal: 720, featured: true, is_halal: true, is_vegetarian: false, is_spicy: true },
  { id: "p13", cat: "cat3", name: "Shish Taouk", desc: "Zarte Hähnchenfiletwürfel, über Nacht in Zitrus-Knoblauch-Marinade eingelegt und auf dem Holzkohlengrill zur absoluten Perfektion gegart.", price: 16.90, allergens: ["G", "L", "M"], cal: 580, featured: false, is_halal: true, is_vegetarian: false, is_spicy: false },
  { id: "p14", cat: "cat3", name: "Lammkoteletten", desc: "Premium-Lammkoteletten aus dem Hochland, mit Rosmarin und Knoblauch mariniert, auf offenem Feuer gegrillt. Serviert mit Minz-Joghurt.", price: 24.90, allergens: ["G", "M"], cal: 810, featured: true, is_halal: true, is_vegetarian: false, is_spicy: false },
  { id: "p15", cat: "cat3", name: "Beyti Kebap", desc: "Zartes Hackfleisch-Kebap in hauchdünnem Lavash gerollt, in Tomatensauce pochiert und grosszügig mit Joghurt und Karamellbutter übergossen.", price: 18.90, allergens: ["A", "C", "G", "L"], cal: 760, featured: false, is_halal: true, is_vegetarian: false, is_spicy: false },
  { id: "p16", cat: "cat3", name: "Iskender Kebap", desc: "Dünn aufgeschnittenes Dönerfleisch auf Fladenbrot, übergossen mit heisser Tomatensauce, brauner Butter und hausgemachtem Joghurt.", price: 16.90, allergens: ["A", "G", "L"], cal: 840, featured: false, is_halal: true, is_vegetarian: false, is_spicy: false },
  { id: "p17", cat: "cat4", name: "Basmati Reis", desc: "Aromatischer Basmati-Reis, gedämpft mit Butter und einem Hauch Safran, garniert mit frischem Dill.", price: 3.90, allergens: ["G"], cal: 220, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p18", cat: "cat4", name: "Pommes Frites", desc: "Knusprige, goldbraune Kartoffelpommes, frisch frittiert und mit grobem Meersalz verfeinert.", price: 4.50, allergens: [], cal: 350, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p19", cat: "cat4", name: "Bulgurpilav", desc: "Fein gewürzter Bulgurweizen mit Tomaten, Zwiebeln und Paprika — nach türkischer Hausfrauenart zubereitet.", price: 3.90, allergens: ["A", "L"], cal: 240, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p20", cat: "cat4", name: "Frischer Salat", desc: "Saisonal zusammengestellter Beilagensalat mit Rucola, Gurke, Tomate, roten Zwiebeln und Granatapfelkernen.", price: 4.90, allergens: ["L", "M"], cal: 80, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p21", cat: "cat5", name: "Ayran", desc: "Erfrischendes türkisches Joghurtgetränk, klassisch gequirlt mit einer Prise Meersalz und fein geschnittenem Minzblatt.", price: 2.90, allergens: ["G"], cal: 80, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p22", cat: "cat5", name: "Türkischer Çay", desc: "Starker türkischer Schwarztee, in der traditionellen Tulpenglas-Form serviert — nachfüllbar.", price: 2.50, allergens: [], cal: 5, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p23", cat: "cat5", name: "Türkischer Kaffee", desc: "Fein gemahlener Mokka, traditionell im Kupfer-Cezve aufgebrüht. Serviert mit Glas Wasser und Würfelzucker.", price: 3.50, allergens: [], cal: 10, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p24", cat: "cat5", name: "Softdrink", desc: "Auswahl: Cola, Cola Zero, Fanta, Sprite. 0,33 l Dose.", price: 2.90, allergens: [], cal: 140, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p26", cat: "cat6", name: "Baklava (3 Stk.)", desc: "Hauchdünne Teigschichten, gefüllt mit gehackten Pistazien und getränkt in Blütenhonig-Sirup. Handgefertigt nach Originalrezept.", price: 7.90, allergens: ["A", "C", "G", "H", "N"], cal: 380, featured: true, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p27", cat: "cat6", name: "Künefe", desc: "Warmer Engelshaar-Teig mit geschmolzenem Ziegenmozzarella, in Zuckersirup gewendet und mit Pistazien bestreut.", price: 8.90, allergens: ["A", "C", "G", "H"], cal: 460, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
  { id: "p28", cat: "cat6", name: "Sütlaç", desc: "Cremiger türkischer Reispudding mit feiner Zimt- und Vanillenote, im Ofen leicht karamellisiert.", price: 6.50, allergens: ["C", "G"], cal: 290, featured: false, is_halal: true, is_vegetarian: true, is_spicy: false },
];

// ═══════════════════════════════════════════════════════════════
// SUPABASE SQL SETUP (für Konsole)
// ═══════════════════════════════════════════════════════════════
export const SUPABASE_SETUP_SQL = `
-- Führe dieses SQL in deiner Supabase SQL-Konsole aus:

create table if not exists categories (
  id text primary key,
  name text not null,
  icon text,
  slug text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  cat text references categories(id),
  name text not null,
  desc text,
  price decimal(10,2) not null,
  allergens jsonb default '[]',
  cal int,
  featured boolean default false,
  is_halal boolean default true,
  is_vegetarian boolean default false,
  is_spicy boolean default false,
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  items jsonb not null,
  subtotal decimal(10,2),
  total decimal(10,2),
  order_type text check (order_type in ('dine_in','takeaway','delivery')),
  pay_method text check (pay_method in ('card','paypal','cash')),
  customer_name text,
  customer_phone text,
  delivery_address text,
  notes text,
  status text default 'pending' check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  points_earned int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists loyalty_points (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  points_balance int default 0,
  total_earned int default 0,
  updated_at timestamptz default now()
);

-- RLS Policies (öffentlicher Lesezugriff)
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table loyalty_points enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public insert orders" on orders for insert with check (true);
create policy "Public read own orders" on orders for select using (true);
create policy "Public loyalty" on loyalty_points for all using (true);
`;

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, toast: add };
}

function useSupabaseData() {
  const [categories, setCategories] = useState(LOCAL_CATEGORIES);
  const [products, setProducts] = useState(LOCAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchSupabase("categories?select=*&order=display_order.asc"),
          fetchSupabase("products?select=*&is_available=eq.true&order=featured.desc"),
        ]);
        if (catRes.data && catRes.data.length > 0) {
          setCategories([{ id: "all", name: "Alle Gerichte", icon: "✦" }, ...catRes.data]);
          setDbConnected(true);
        }
        if (prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data);
          setDbConnected(true);
        }
      } catch {
        // use local fallback
      }
      setLoading(false);
    }
    load();
  }, []);

  return { categories, products, loading, dbConnected };
}

// ═══════════════════════════════════════════════════════════════
// CART CONTEXT + HELPERS
// ═══════════════════════════════════════════════════════════════
const fmt = (n) => `€\u00A0${n.toFixed(2)}`;
const SESSION_KEY = "siran_session_" + Math.random().toString(36).slice(2, 10);

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #0b0f1a;
  --bg2: #111827;
  --bg3: #1a2233;
  --surface: #1f2d42;
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.15);
  --gold: #c9974a;
  --gold2: #e8b96a;
  --gold-light: rgba(201,151,74,0.12);
  --red: #c0392b;
  --red2: #e74c3c;
  --teal: #2dd4bf;
  --teal2: rgba(45,212,191,0.12);
  --white: #f5f0e8;
  --muted: rgba(245,240,232,0.45);
  --ff: 'Cormorant Garamond', Georgia, serif;
  --fs: 'DM Sans', system-ui, sans-serif;
  --r: 12px;
  --r-lg: 20px;
  --trans: all 0.2s cubic-bezier(0.4,0,0.2,1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--fs);
  background: var(--bg);
  color: var(--white);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── NAV ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11,15,26,0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.brand {
  font-family: var(--ff);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gold2);
  text-transform: uppercase;
}
.brand-sub {
  font-family: var(--fs);
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  color: var(--muted);
  text-transform: uppercase;
  display: block;
  margin-top: -4px;
}
.nav-actions { display: flex; align-items: center; gap: 12px; }
.cart-btn {
  position: relative;
  background: var(--gold-light);
  border: 1px solid rgba(201,151,74,0.3);
  border-radius: var(--r);
  padding: 8px 16px;
  color: var(--gold2);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--fs);
  font-size: 0.85rem;
  font-weight: 500;
  transition: var(--trans);
}
.cart-btn:hover { background: rgba(201,151,74,0.2); }
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--red2);
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── HERO ── */
.hero {
  background: linear-gradient(135deg, #0b0f1a 0%, #1a1205 50%, #0b0f1a 100%);
  border-bottom: 1px solid var(--border);
  padding: 5rem 1.5rem 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,151,74,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gold-light);
  border: 1px solid rgba(201,151,74,0.25);
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}
.hero h1 {
  font-family: var(--ff);
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 300;
  line-height: 1.1;
  color: var(--white);
  margin-bottom: 1rem;
}
.hero h1 em {
  font-style: italic;
  color: var(--gold2);
}
.hero-desc {
  font-size: 1rem;
  color: var(--muted);
  max-width: 500px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}
.hero-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.hero-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--muted);
}
.hero-meta-item svg { color: var(--gold); }

/* ── DB STATUS BANNER ── */
.db-banner {
  background: var(--teal2);
  border-bottom: 1px solid rgba(45,212,191,0.2);
  padding: 8px 1.5rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--teal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ── SEARCH + FILTER ── */
.toolbar {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}
.search-wrap svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  width: 16px;
  height: 16px;
}
.search-input {
  width: 100%;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 10px 12px 10px 38px;
  color: var(--white);
  font-family: var(--fs);
  font-size: 0.9rem;
  outline: none;
  transition: var(--trans);
}
.search-input::placeholder { color: var(--muted); }
.search-input:focus { border-color: rgba(201,151,74,0.4); }

/* ── CATEGORY TABS ── */
.cats {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.cats::-webkit-scrollbar { display: none; }
.cat-btn {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 7px 16px;
  color: var(--muted);
  cursor: pointer;
  font-family: var(--fs);
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: var(--trans);
  white-space: nowrap;
}
.cat-btn:hover { color: var(--white); border-color: var(--border-strong); }
.cat-btn.active {
  background: var(--gold-light);
  border-color: rgba(201,151,74,0.4);
  color: var(--gold2);
}

/* ── PRODUCT GRID ── */
.grid-wrap {
  max-width: 1200px;
  margin: 2rem auto 4rem;
  padding: 0 1.5rem;
}
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.product-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: var(--trans);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}
.product-card:hover {
  border-color: rgba(201,151,74,0.3);
  transform: translateY(-2px);
}
.product-card.featured {
  border-color: rgba(201,151,74,0.25);
}

.card-img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  background: var(--bg3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.card-body {
  padding: 1.1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.card-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 100px;
  font-weight: 500;
  text-transform: uppercase;
}
.badge-halal { background: rgba(45,212,191,0.12); color: var(--teal); border: 1px solid rgba(45,212,191,0.2); }
.badge-veg { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
.badge-spicy { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
.badge-feat { background: var(--gold-light); color: var(--gold); border: 1px solid rgba(201,151,74,0.25); }

.card-name {
  font-family: var(--ff);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 6px;
  line-height: 1.3;
}
.card-desc {
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-price {
  font-family: var(--ff);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--gold2);
}
.card-cal {
  font-size: 0.72rem;
  color: var(--muted);
}
.add-btn {
  background: var(--gold-light);
  border: 1px solid rgba(201,151,74,0.3);
  border-radius: 8px;
  color: var(--gold);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--trans);
  flex-shrink: 0;
}
.add-btn:hover { background: rgba(201,151,74,0.22); color: var(--gold2); }

.in-cart-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qty-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--white);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--trans);
}
.qty-btn:hover { border-color: var(--gold); color: var(--gold); }
.qty-num {
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 18px;
  text-align: center;
}

/* ── CART SIDEBAR ── */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
}
.cart-overlay.open { opacity: 1; pointer-events: all; }
.cart-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 100vw);
  background: var(--bg2);
  border-left: 1px solid var(--border);
  z-index: 201;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.cart-panel.open { transform: translateX(0); }
.cart-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cart-title {
  font-family: var(--ff);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--white);
}
.close-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--trans);
}
.close-btn:hover { color: var(--white); }
.cart-body { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; }
.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: var(--muted);
}
.cart-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-item-price {
  font-size: 0.82rem;
  color: var(--gold);
  margin-top: 3px;
}
.cart-item-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.cart-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
}
.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}
.cart-total-label { font-size: 0.85rem; color: var(--muted); }
.cart-total-val {
  font-family: var(--ff);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gold2);
}

/* ── ORDER TYPE ── */
.order-type-row {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  margin-bottom: 1rem;
}
.ot-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
  cursor: pointer;
  transition: var(--trans);
  font-family: var(--fs);
  color: var(--muted);
  font-size: 0.75rem;
}
.ot-btn.active {
  border-color: rgba(201,151,74,0.4);
  background: var(--gold-light);
  color: var(--gold2);
}
.ot-icon { font-size: 1.2rem; display: block; margin-bottom: 4px; }

/* ── PRIMARY BUTTON ── */
.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, var(--gold), #a0722a);
  border: none;
  border-radius: var(--r);
  padding: 14px;
  color: #1a0f00;
  font-family: var(--fs);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: var(--trans);
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: var(--r);
  padding: 12px;
  color: var(--muted);
  font-family: var(--fs);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--trans);
  margin-top: 8px;
}
.btn-secondary:hover { color: var(--white); border-color: var(--white); }

/* ── MODAL ── */
.modal-wrap {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0,0,0,0.7);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
}
.modal-wrap.open { opacity: 1; pointer-events: all; }
.modal {
  background: var(--bg2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  width: min(500px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
}
.modal-title {
  font-family: var(--ff);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 1.5rem;
}

/* ── CHECKOUT FORM ── */
.form-group { margin-bottom: 1rem; }
.form-label {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 10px 14px;
  color: var(--white);
  font-family: var(--fs);
  font-size: 0.9rem;
  outline: none;
  transition: var(--trans);
}
.form-input:focus { border-color: rgba(201,151,74,0.4); }
.form-input::placeholder { color: var(--muted); }
.pay-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  margin-bottom: 1rem;
}
.pay-opt {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: var(--trans);
  font-size: 0.8rem;
  color: var(--muted);
}
.pay-opt:hover { border-color: var(--border-strong); color: var(--white); }
.pay-opt.active { border-color: rgba(201,151,74,0.4); background: var(--gold-light); color: var(--gold2); }
.divider { height: 1px; background: var(--border); margin: 1.25rem 0; }
.order-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 8px;
}
.order-summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.order-summary-total span:first-child { font-size: 0.9rem; }
.order-summary-total span:last-child {
  font-family: var(--ff);
  font-size: 1.4rem;
  color: var(--gold2);
}

/* ── SUCCESS ── */
.success-icon {
  width: 64px;
  height: 64px;
  background: rgba(45,212,191,0.1);
  border: 1px solid rgba(45,212,191,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--teal);
}
.success-title {
  font-family: var(--ff);
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
}
.success-sub {
  text-align: center;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.info-box {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 14px;
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 1rem;
}
.info-box .gold { color: var(--gold2); font-weight: 500; }

/* ── TOASTS ── */
.toast-stack {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r);
  padding: 10px 16px;
  font-size: 0.85rem;
  animation: slideIn 0.2s ease;
  max-width: 280px;
}
.toast.success { border-color: rgba(45,212,191,0.4); color: var(--teal); }
.toast.error { border-color: rgba(239,68,68,0.4); color: #f87171; }
@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

/* ── PRODUCT DETAIL MODAL ── */
.detail-allergens {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.allergen-tag {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.7rem;
  color: var(--muted);
}

/* ── LOYALTY BAR ── */
.loyalty-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}
.loyalty-chip {
  background: var(--gold-light);
  border: 1px solid rgba(201,151,74,0.25);
  border-radius: 100px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--gold);
}

/* ── SETUP PANEL ── */
.setup-panel {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}
.setup-card {
  background: var(--bg2);
  border: 1px solid rgba(45,212,191,0.2);
  border-radius: var(--r-lg);
  padding: 1.5rem;
}
.setup-card h2 {
  font-family: var(--ff);
  font-size: 1.3rem;
  color: var(--teal);
  margin-bottom: 0.5rem;
}
.setup-card p { font-size: 0.85rem; color: var(--muted); line-height: 1.6; margin-bottom: 1rem; }
.sql-block {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: #7dd3fc;
  overflow-x: auto;
  white-space: pre;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.5;
  cursor: text;
}
.copy-btn {
  background: rgba(45,212,191,0.1);
  border: 1px solid rgba(45,212,191,0.3);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--teal);
  font-family: var(--fs);
  font-size: 0.82rem;
  cursor: pointer;
  transition: var(--trans);
  margin-top: 10px;
}
.copy-btn:hover { background: rgba(45,212,191,0.18); }

@media (max-width: 640px) {
  .product-grid { grid-template-columns: 1fr; }
  .hero { padding: 3rem 1rem 2.5rem; }
  .hero h1 { font-size: 2.2rem; }
}
`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Badge({ type, label }) {
  const cls = { halal: "badge-halal", veg: "badge-veg", spicy: "badge-spicy", feat: "badge-feat" }[type] || "";
  return <span className={`badge ${cls}`}>{label}</span>;
}

function ProductCard({ product, qty, onAdd, onRemove, onClick }) {
  return (
    <div className={`product-card${product.featured ? " featured" : ""}`} onClick={onClick}>
      <div className="card-img">
        {product.cat === "cat1" ? "🥙" : product.cat === "cat2" ? "🫙" : product.cat === "cat3" ? "🍽" :
         product.cat === "cat4" ? "🌿" : product.cat === "cat5" ? "🫖" : product.cat === "cat6" ? "🍯" : "🍴"}
      </div>
      <div className="card-body">
        <div className="card-badges">
          {product.featured && <Badge type="feat" label="Chef's Pick" />}
          {product.is_halal && <Badge type="halal" label="Halal" />}
          {product.is_vegetarian && <Badge type="veg" label="Veggie" />}
          {product.is_spicy && <Badge type="spicy" label="Scharf" />}
        </div>
        <div className="card-name">{product.name}</div>
        <div className="card-desc">{product.desc}</div>
        <div className="card-footer">
          <div>
            <div className="card-price">{fmt(product.price)}</div>
            {product.cal > 0 && <div className="card-cal">{product.cal} kcal</div>}
          </div>
          {qty > 0 ? (
            <div className="in-cart-ctrl" onClick={(e) => e.stopPropagation()}>
              <button className="qty-btn" onClick={onRemove}><Minus size={12} /></button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={onAdd}><Plus size={12} /></button>
            </div>
          ) : (
            <button className="add-btn" onClick={(e) => { e.stopPropagation(); onAdd(); }}>
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product, qty, onAdd, onRemove, onClose }) {
  if (!product) return null;
  const catIcon = product.cat === "cat1" ? "🥙" : product.cat === "cat2" ? "🫙" : product.cat === "cat3" ? "🍽" :
                  product.cat === "cat4" ? "🌿" : product.cat === "cat5" ? "🫖" : product.cat === "cat6" ? "🍯" : "🍴";
  return (
    <div className={`modal-wrap open`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", textAlign: "center" }}>{catIcon}</div>
        <div className="card-badges" style={{ marginBottom: "0.75rem" }}>
          {product.featured && <Badge type="feat" label="Chef's Pick" />}
          {product.is_halal && <Badge type="halal" label="Halal" />}
          {product.is_vegetarian && <Badge type="veg" label="Vegetarisch" />}
          {product.is_spicy && <Badge type="spicy" label="Scharf" />}
        </div>
        <div style={{ fontFamily: "var(--ff)", fontSize: "1.6rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--white)" }}>{product.name}</div>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{product.desc}</p>
        {product.allergens?.length > 0 && (
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>Allergene</div>
            <div className="detail-allergens">
              {product.allergens.map((a) => (
                <span key={a} className="allergen-tag">{a} – {ALLERGEN_MAP[a] || a}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <div style={{ fontFamily: "var(--ff)", fontSize: "1.6rem", fontWeight: 600, color: "var(--gold2)" }}>{fmt(product.price)}</div>
          {qty > 0 ? (
            <div className="in-cart-ctrl">
              <button className="qty-btn" onClick={onRemove}><Minus size={14} /></button>
              <span className="qty-num" style={{ fontSize: "1rem" }}>{qty}</span>
              <button className="qty-btn" onClick={onAdd}><Plus size={14} /></button>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: "auto", padding: "10px 24px" }} onClick={onAdd}>
              In den Warenkorb
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPanel({ open, cart, products, onClose, onAdd, onRemove, orderType, setOrderType, onCheckout }) {
  const items = Object.entries(cart);
  const total = items.reduce((s, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return s + (p ? p.price * qty : 0);
  }, 0);
  const count = items.reduce((s, [, q]) => s + q, 0);

  return (
    <>
      <div className={`cart-overlay${open ? " open" : ""}`} onClick={onClose} />
      <div className={`cart-panel${open ? " open" : ""}`}>
        <div className="cart-header">
          <div className="cart-title">Warenkorb {count > 0 && <span style={{ color: "var(--gold)", fontSize: "1rem" }}>({count})</span>}</div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={32} strokeWidth={1} />
              <span style={{ fontSize: "0.85rem" }}>Noch nichts im Warenkorb</span>
            </div>
          ) : (
            items.map(([id, qty]) => {
              const p = products.find((x) => x.id === id);
              if (!p) return null;
              return (
                <div key={id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{p.name}</div>
                    <div className="cart-item-price">{fmt(p.price * qty)}</div>
                  </div>
                  <div className="cart-item-ctrl">
                    <button className="qty-btn" onClick={() => onRemove(id)}><Minus size={12} /></button>
                    <span className="qty-num">{qty}</span>
                    <button className="qty-btn" onClick={() => onAdd(id)}><Plus size={12} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="order-type-row" style={{ marginBottom: "1rem" }}>
              {[["dine_in", "🍽", "Vor Ort"], ["takeaway", "🛍", "Mitnehmen"], ["delivery", "🛵", "Lieferung"]].map(([v, icon, label]) => (
                <div key={v} className={`ot-btn${orderType === v ? " active" : ""}`} onClick={() => setOrderType(v)}>
                  <span className="ot-icon">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span className="cart-total-label">Gesamt</span>
              <span className="cart-total-val">{fmt(total)}</span>
            </div>
            <button className="btn-primary" onClick={onCheckout}>Zur Kasse</button>
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutModal({ open, cart, products, orderType, onClose, onSuccess, toast }) {
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("card");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);

  const items = Object.entries(cart);
  const total = items.reduce((s, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return s + (p ? p.price * qty : 0);
  }, 0);
  const pointsEarned = Math.floor(total * 5);

  const cartPayload = items.map(([id, qty]) => {
    const p = products.find((x) => x.id === id);
    return { id, name: p?.name, qty, price: p?.price, subtotal: (p?.price || 0) * qty };
  });

  async function confirm() {
    setProcessing(true);
    const orderData = {
      items: cartPayload,
      subtotal: total,
      total,
      order_type: orderType,
      pay_method: payMethod,
      customer_name: name || "Gast",
      customer_phone: phone,
      delivery_address: orderType === "delivery" ? address : null,
      points_earned: pointsEarned,
      status: "pending",
    };

    const { data, error } = await fetchSupabase("orders", "POST", orderData);

    if (error) {
      // Fallback: generate local order ID
      const localId = "SIRAN-" + Date.now();
      onSuccess({ id: localId, pointsEarned, localFallback: true });
    } else {
      onSuccess({ id: data?.[0]?.order_number || data?.[0]?.id || "SIRAN-" + Date.now(), pointsEarned });
    }
    setProcessing(false);
  }

  if (!open) return null;
  return (
    <div className="modal-wrap open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div className="modal-title">
            {step === 1 ? "Bestellung" : step === 2 ? "Zahlung" : "Bestätigung"}
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Name (optional)</label>
              <input className="form-input" placeholder="Ihr Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon (optional)</label>
              <input className="form-input" placeholder="+43 …" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {orderType === "delivery" && (
              <div className="form-group">
                <label className="form-label">Lieferadresse *</label>
                <input className="form-input" placeholder="Straße, Hausnummer, PLZ Wien" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            )}
            <div className="divider" />
            {cartPayload.map((i) => (
              <div key={i.id} className="order-summary-row">
                <span>{i.qty}× {i.name}</span>
                <span>{fmt(i.subtotal)}</span>
              </div>
            ))}
            <div className="divider" />
            <div className="order-summary-total">
              <span>Gesamt</span>
              <span>{fmt(total)}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--teal)", textAlign: "right", marginTop: "4px" }}>+ {pointsEarned} Treuepunkte</div>
            <button className="btn-primary" style={{ marginTop: "1.5rem" }}
              onClick={() => { if (orderType === "delivery" && !address) { toast("Bitte Lieferadresse angeben", "error"); return; } setStep(2); }}>
              Weiter zur Zahlung →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-label" style={{ marginBottom: "10px" }}>Zahlungsart wählen</div>
            <div className="pay-grid">
              {[["card", "💳", "Kreditkarte"], ["paypal", "🅿️", "PayPal"], ["cash", "💵", "Bar"]].map(([v, icon, label]) => (
                <div key={v} className={`pay-opt${payMethod === v ? " active" : ""}`} onClick={() => setPayMethod(v)}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{icon}</div>
                  {label}
                </div>
              ))}
            </div>
            {payMethod === "card" && (
              <div className="form-group">
                <label className="form-label">Kartennummer</label>
                <input className="form-input" placeholder="•••• •••• •••• ••••" maxLength={19} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                  <input className="form-input" placeholder="MM/JJ" />
                  <input className="form-input" placeholder="CVV" maxLength={3} />
                </div>
              </div>
            )}
            {payMethod === "paypal" && <div className="info-box">Sie werden nach Bestätigung zu PayPal weitergeleitet.</div>}
            {payMethod === "cash" && <div className="info-box">Barzahlung bei Abholung / Lieferung. Bitte passend halten.</div>}
            <div className="divider" />
            <div className="order-summary-total">
              <span>Zu zahlen</span>
              <span>{fmt(total)}</span>
            </div>
            <button className="btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => setStep(3)}>Weiter →</button>
            <button className="btn-secondary" onClick={() => setStep(1)}>Zurück</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="info-box">
              <div className="order-summary-row"><span>Bestellart</span><span>{orderType === "dine_in" ? "Vor Ort" : orderType === "takeaway" ? "Mitnehmen" : "Lieferung"}</span></div>
              <div className="order-summary-row"><span>Zahlung</span><span>{payMethod === "card" ? "Kreditkarte" : payMethod === "paypal" ? "PayPal" : "Bar"}</span></div>
              {name && <div className="order-summary-row"><span>Name</span><span>{name}</span></div>}
              <div className="order-summary-row" style={{ marginBottom: 0 }}><span>Gesamt</span><span className="gold">{fmt(total)}</span></div>
            </div>
            <div className="info-box">
              <Award size={13} style={{ display: "inline", marginRight: 6, color: "var(--gold)" }} />
              Sie erhalten <strong style={{ color: "var(--gold2)" }}>{pointsEarned} Treuepunkte</strong> für diese Bestellung.
            </div>
            <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={confirm} disabled={processing}>
              {processing ? "Wird verarbeitet…" : "Bestellung aufgeben"}
            </button>
            <button className="btn-secondary" onClick={() => setStep(2)} disabled={processing}>Zurück</button>
          </>
        )}
      </div>
    </div>
  );
}

function SuccessModal({ open, order, onClose }) {
  if (!open || !order) return null;
  return (
    <div className="modal-wrap open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
        <div className="success-icon"><Check size={28} /></div>
        <div className="success-title">Vielen Dank!</div>
        <div className="success-sub">
          Ihre Bestellung wurde erfolgreich aufgegeben.<br />
          <span style={{ color: "var(--gold)", fontWeight: 500 }}>#{String(order.id).slice(0, 12)}</span><br />
          Wir bereiten Ihre Speisen mit grösster Sorgfalt zu.
        </div>
        <div className="info-box">
          <Award size={13} style={{ display: "inline", marginRight: 6, color: "var(--gold)" }} />
          <span className="gold">{order.pointsEarned} Treuepunkte</span> wurden Ihrem Konto gutgeschrieben.
        </div>
        <div className="info-box">
          <Clock size={13} style={{ display: "inline", marginRight: 6 }} />
          Geschätzte Wartezeit: <strong>15–25 Minuten</strong>
        </div>
        {order.localFallback && (
          <div className="info-box" style={{ borderColor: "rgba(251,191,36,0.3)", color: "rgba(251,191,36,0.8)" }}>
            <AlertCircle size={13} style={{ display: "inline", marginRight: 6 }} />
            Hinweis: Supabase nicht verbunden. Bestellung lokal gespeichert.
          </div>
        )}
        <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={onClose}>Zur Speisekarte</button>
      </div>
    </div>
  );
}

function SetupPanel({ onCopy }) {
  return (
    <div className="setup-panel">
      <div className="setup-card">
        <h2>🔌 Supabase-Datenbank einrichten</h2>
        <p>
          Führe das folgende SQL in deiner <strong style={{ color: "var(--teal)" }}>Supabase SQL-Konsole</strong> aus, 
          um alle Tabellen, Policies und die Datenstruktur zu erstellen. Ersetze danach 
          <code style={{ background: "var(--bg)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>SUPABASE_URL</code> und 
          <code style={{ background: "var(--bg)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>SUPABASE_ANON_KEY</code> oben im Code.
        </p>
        <div className="sql-block">{SUPABASE_SETUP_SQL}</div>
        <button className="copy-btn" onClick={onCopy}>📋 SQL kopieren</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function SiranRestaurant() {
  const { categories, products, loading, dbConnected } = useSupabaseData();
  const { toasts, toast } = useToast();

  const [activecat, setActivecat] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderType, setOrderType] = useState("dine_in");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [points, setPoints] = useState(0);
  const [showSetup, setShowSetup] = useState(false);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const filtered = products.filter((p) => {
    const matchCat = activecat === "all" || p.cat === activecat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredProducts = filtered.filter((p) => p.featured);
  const regularProducts = filtered.filter((p) => !p.featured);

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    const p = products.find((x) => x.id === id);
    if (p) toast(`${p.name} hinzugefügt`, "success");
  }
  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id]--;
      return next;
    });
  }

  function handleSuccess(order) {
    const earned = order.pointsEarned || 0;
    setPoints((p) => p + earned);
    setSuccessOrder(order);
    setCart({});
    setCheckoutOpen(false);
    setCartOpen(false);
    setSuccessOpen(true);
  }

  function copySQL() {
    navigator.clipboard?.writeText(SUPABASE_SETUP_SQL);
    toast("SQL in Zwischenablage kopiert!", "success");
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div>
            <div className="brand">SIRAN</div>
            <span className="brand-sub">Authentische Türkische Küche</span>
          </div>
          <div className="nav-actions">
            {!dbConnected && (
              <button
                style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: "var(--r)", padding: "7px 12px", color: "var(--teal)", fontSize: "0.78rem", cursor: "pointer" }}
                onClick={() => setShowSetup(!showSetup)}
              >
                {showSetup ? "Setup schließen" : "⚡ Supabase Setup"}
              </button>
            )}
            {points > 0 && (
              <div className="loyalty-chip">
                <Award size={14} />
                {points} Punkte
              </div>
            )}
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={16} />
              Warenkorb
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* DB STATUS */}
      {dbConnected ? (
        <div className="db-banner">
          <Check size={12} />
          Supabase verbunden — Live-Daten aktiv
        </div>
      ) : (
        <div className="db-banner" style={{ background: "rgba(251,191,36,0.05)", borderColor: "rgba(251,191,36,0.15)", color: "rgba(251,191,36,0.8)" }}>
          <AlertCircle size={12} />
          Lokale Demo-Daten — Supabase nicht konfiguriert
          <button onClick={() => setShowSetup(!showSetup)} style={{ background: "none", border: "none", color: "inherit", textDecoration: "underline", cursor: "pointer", fontSize: "inherit", marginLeft: 4 }}>
            Setup ansehen →
          </button>
        </div>
      )}

      {/* SUPABASE SETUP PANEL */}
      {showSetup && <SetupPanel onCopy={copySQL} />}

      {/* HERO */}
      <section className="hero">
        <div className="hero-tag">
          <Star size={10} />
          Hetzendorferstrasse 59, 1120 Wien
        </div>
        <h1>
          Authentische<br />
          <em>Türkische Küche</em>
        </h1>
        <p className="hero-desc">
          Handgefertigte Spezialitäten aus frischen Zutaten — täglich zubereitet nach überlieferten Familienrezepten.
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item"><MapPin size={14} />Wien 1120</div>
          <div className="hero-meta-item"><Clock size={14} />Mo–Fr 11–23 · Sa–So 12–00</div>
          <div className="hero-meta-item"><Phone size={14} />+43 1 XXX XXXX</div>
        </div>
      </section>

      {/* SEARCH + CATEGORIES */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input
            className="search-input"
            placeholder="Gerichte suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="cats">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`cat-btn${activecat === c.id ? " active" : ""}`}
            onClick={() => setActivecat(c.id)}
          >
            <span>{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid-wrap">
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🍽</div>
            Speisekarte wird geladen…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
            <AlertCircle size={32} strokeWidth={1} style={{ marginBottom: "1rem" }} />
            <div>Keine Gerichte gefunden</div>
          </div>
        ) : (
          <>
            {featuredProducts.length > 0 && (
              <>
                <div className="section-label">Chef's Empfehlungen</div>
                <div className="product-grid" style={{ marginBottom: "2.5rem" }}>
                  {featuredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      qty={cart[p.id] || 0}
                      onAdd={() => addToCart(p.id)}
                      onRemove={() => removeFromCart(p.id)}
                      onClick={() => setDetailProduct(p)}
                    />
                  ))}
                </div>
              </>
            )}
            {regularProducts.length > 0 && (
              <>
                {featuredProducts.length > 0 && <div className="section-label">Gesamte Auswahl</div>}
                <div className="product-grid">
                  {regularProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      qty={cart[p.id] || 0}
                      onAdd={() => addToCart(p.id)}
                      onRemove={() => removeFromCart(p.id)}
                      onClick={() => setDetailProduct(p)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* CART SIDEBAR */}
      <CartPanel
        open={cartOpen}
        cart={cart}
        products={products}
        onClose={() => setCartOpen(false)}
        onAdd={addToCart}
        onRemove={removeFromCart}
        orderType={orderType}
        setOrderType={setOrderType}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      {/* DETAIL MODAL */}
      {detailProduct && (
        <ProductDetail
          product={detailProduct}
          qty={cart[detailProduct.id] || 0}
          onAdd={() => addToCart(detailProduct.id)}
          onRemove={() => removeFromCart(detailProduct.id)}
          onClose={() => setDetailProduct(null)}
        />
      )}

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        products={products}
        orderType={orderType}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleSuccess}
        toast={toast}
      />

      {/* SUCCESS MODAL */}
      <SuccessModal
        open={successOpen}
        order={successOrder}
        onClose={() => setSuccessOpen(false)}
      />

      {/* TOASTS */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}
