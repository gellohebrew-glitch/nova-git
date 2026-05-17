import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingCart, User, X, Plus, Minus, Award, Clock, Check, Gift, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
const ALLERGEN_MAP = {
  A:"Gluten",C:"Eier",D:"Fisch",F:"Soja",G:"Milch/Laktose",
  H:"Schalenfrüchte",L:"Sellerie",M:"Senf",N:"Sesam",
  O:"Schwefeldioxid",R:"Weichtiere"
};
const CATEGORIES = [
  {id:"all",name:"Alle Gerichte"},
  {id:"cat1",name:"Döner & Wraps"},
  {id:"cat2",name:"Vorspeisen"},
  {id:"cat3",name:"Hauptgerichte"},
  {id:"cat4",name:"Beilagen"},
  {id:"cat5",name:"Getränke"},
  {id:"cat6",name:"Desserts"},
];
const PRODUCTS = [
  {id:"p1",cat:"cat1",name:"Döner Teller",desc:"Saftige Dönerfleisch-Scheiben auf Basmati-Reis mit buntem Salat, serviert mit hausgemachtem Joghurt-Knoblauch-Dip und frischer Petersiliengarnitur.",price:13.90,allergens:["A","G","L"],cal:680,featured:false},
  {id:"p2",cat:"cat1",name:"Sucuk Döner",desc:"Kräftig gewürztes Sucuk-Fleisch, langsam am Spiess geröstet. Nur an ausgewählten Tagen verfügbar — ein Geschmackserlebnis der besonderen Klasse.",price:14.50,allergens:["A","G","M","N"],cal:720,featured:true,special:true},
  {id:"p3",cat:"cat1",name:"Chicken Döner",desc:"Zartes Hähnchenfleisch, mariniert in orientalischen Gewürzen, vom Holzkohlengrill, serviert mit frischem Gemüse und cremigem Hummus-Dip.",price:12.90,allergens:["A","G","L","M"],cal:580,featured:false},
  {id:"p4",cat:"cat1",name:"Veggie Döner",desc:"Knusprig gebratene Gemüsemischung aus Paprika, Aubergine und Zucchini, angereichert mit Feta und frischen Kräutern im warmen Fladenbrot.",price:11.90,allergens:["A","G","N"],cal:440,featured:false},
  {id:"p5",cat:"cat1",name:"Falafel Wrap",desc:"Goldbraun frittierte Falafel aus Kichererbsen und Kräutern, eingewickelt in ein warmes Fladenbrot mit Tahini, frischen Tomaten und Gurken.",price:11.50,allergens:["A","F","N","G"],cal:520,featured:false},
  {id:"p6",cat:"cat1",name:"Mixed Grill Teller",desc:"Auswahl unserer feinsten Grillkreationen: Adana, Shish Taouk, Chicken und Lamm, serviert mit Reis, Salat und gegrilltem Saisongemüse.",price:18.90,allergens:["A","G","L"],cal:950,featured:true},
  {id:"p7",cat:"cat2",name:"Hummus",desc:"Samtig-cremiger Kichererbsendip mit Tahini, frischem Zitronensaft und kaltgepresstem Olivenöl, garniert mit geröstetem Paprikapulver.",price:6.50,allergens:["F","N","G"],cal:210,featured:false},
  {id:"p8",cat:"cat2",name:"Cacik",desc:"Erfrischender türkischer Joghurtdip mit fein geriebenem Gurke, Knoblauch, Minze und einem Hauch Olivenöl — klassisch und unverwechselbar.",price:5.90,allergens:["G"],cal:140,featured:false},
  {id:"p9",cat:"cat2",name:"Mercimek Corbasi",desc:"Traditionelle türkische rote Linsensuppe, langsam geköchelt mit Karotten, Zwiebeln und Kreuzkümmel, verfeinert mit brauner Butter und Zitrone.",price:6.90,allergens:["L","G"],cal:280,featured:false},
  {id:"p10",cat:"cat2",name:"Sigara Börek",desc:"Knusprig goldene Teigröllchen, gefüllt mit feinem Schafskäse und frischen Kräutern. Serviert mit pikanter Tomatensauce — vier Stück pro Portion.",price:7.90,allergens:["A","C","G","N"],cal:380,featured:false},
  {id:"p11",cat:"cat2",name:"Ezme",desc:"Pikant-würzige Tomaten-Chili-Paste nach türkischer Hausmannsküche mit Zwiebeln, Petersilie und Granatapfelmelasse. Intensiv im Charakter.",price:5.50,allergens:["L","M"],cal:90,featured:false},
  {id:"p12",cat:"cat3",name:"Adana Kebap",desc:"Handgeformtes Hackfleisch vom Holzkohlengrill, kräftig gewürzt mit Paprika und Kreuzkümmel. Serviert mit Bulgurpilav und gegrilltem Gemüse.",price:17.90,allergens:["A","L","M"],cal:720,featured:true},
  {id:"p13",cat:"cat3",name:"Shish Taouk",desc:"Zarte Hähnchenfiletwürfel, über Nacht in Zitrus-Knoblauch-Marinade eingelegt und auf dem Holzkohlengrill zur absoluten Perfektion gegart.",price:16.90,allergens:["G","L","M"],cal:580,featured:false},
  {id:"p14",cat:"cat3",name:"Lammkoteletten",desc:"Premium-Lammkoteletten aus dem Hochland, mit Rosmarin und Knoblauch mariniert, auf offenem Feuer gegrillt. Serviert mit Minz-Joghurt.",price:24.90,allergens:["G","M"],cal:810,featured:true},
  {id:"p15",cat:"cat3",name:"Beyti Kebap",desc:"Zartes Hackfleisch-Kebap in hauchdünnem Lavash gerollt, in Tomatensauce pochiert und grosszügig mit Joghurt und Karamellbutter übergossen.",price:18.90,allergens:["A","C","G","L"],cal:760,featured:false},
  {id:"p16",cat:"cat3",name:"Iskender Kebap",desc:"Dünn aufgeschnittenes Dönerfleisch auf Fladenbrot, übergossen mit heisser Tomatensauce, brauner Butter und hausgemachtem Joghurt.",price:16.90,allergens:["A","G","L"],cal:840,featured:false},
  {id:"p17",cat:"cat4",name:"Basmati Reis",desc:"Aromatischer Basmati-Reis, gedämpft mit Butter und einem Hauch Safran, garniert mit frischem Dill.",price:3.90,allergens:["G"],cal:220,featured:false},
  {id:"p18",cat:"cat4",name:"Pommes Frites",desc:"Knusprige, goldbraune Kartoffelpommes, frisch frittiert und mit grobem Meersalz verfeinert.",price:4.50,allergens:[],cal:350,featured:false},
  {id:"p19",cat:"cat4",name:"Bulgurpilav",desc:"Fein gewürzter Bulgurweizen mit Tomaten, Zwiebeln und Paprika — nach türkischer Hausfrauenart zubereitet und sanft geschmort.",price:3.90,allergens:["A","L"],cal:240,featured:false},
  {id:"p20",cat:"cat4",name:"Frischer Salat",desc:"Saisonal zusammengestellter Beilagensalat mit Rucola, Gurke, Tomate, roten Zwiebeln und Granatapfelkernen, angemacht mit Olivenöldressing.",price:4.90,allergens:["L","M"],cal:80,featured:false},
  {id:"p21",cat:"cat5",name:"Ayran",desc:"Erfrischendes türkisches Joghurtgetränk, klassisch gequirlt mit einer Prise Meersalz und fein geschnittenem Minzblatt.",price:2.90,allergens:["G"],cal:80,featured:false},
  {id:"p22",cat:"cat5",name:"Türkischer Cay",desc:"Starker türkischer Schwarztee, in der traditionellen Tulpenglas-Form serviert. Symbol der türkischen Gastfreundschaft — nachfüllbar.",price:2.50,allergens:[],cal:5,featured:false},
  {id:"p23",cat:"cat5",name:"Türkischer Kaffee",desc:"Fein gemahlener Mokka, traditionell im Kupfer-Cezve aufgebrüht. Serviert mit einem Glas kaltem Wasser und einem Würfelzucker.",price:3.50,allergens:[],cal:10,featured:false},
  {id:"p24",cat:"cat5",name:"Softdrink",desc:"Auswahl: Cola, Cola Zero, Fanta, Sprite. 0,33 l Dose, gut gekühlt serviert nach Ihrer Wahl.",price:2.90,allergens:[],cal:140,featured:false},
  {id:"p25",cat:"cat5",name:"Mineralwasser",desc:"Stilles oder sprudelndes Mineralwasser, 0,5 l Flasche, immer frisch und bei angenehmer Temperatur serviert.",price:2.50,allergens:[],cal:0,featured:false},
  {id:"p26",cat:"cat6",name:"Baklava (3 Stk.)",desc:"Hauchdünne Teigschichten, gefüllt mit gehackten Pistazien und getränkt in Blütenhonig-Sirup. Handgefertigt nach dem Originalrezept der Familie.",price:7.90,allergens:["A","C","G","H","N"],cal:380,featured:true},
  {id:"p27",cat:"cat6",name:"Kunefe",desc:"Warmer Engelshaar-Teig mit geschmolzenem Ziegenmozzarella, in knappendem Zuckersirup gewendet und mit frisch gemahlenen Pistazien bestreut.",price:8.90,allergens:["A","C","G","H"],cal:460,featured:false},
  {id:"p28",cat:"cat6",name:"Sutlac",desc:"Cremiger türkischer Reispudding mit feiner Zimt- und Vanillenote, im Ofen leicht karamellisiert — ein stiller, eleganter Abschluss.",price:6.50,allergens:["C","G"],cal:290,featured:false},
];
const SPECIAL_OFFER = {
  id:"so1",productId:"p2",title:"SUCUK DÖNER SPECIAL",
  regularPrice:14.50,specialPrice:10.90,
  endsAt:new Date("2026-06-01T23:59:00").getTime(),
  banner:"SUCUK DÖNER — NUR AM 01.06.2026 ZUM SONDERPREIS",
};
const REWARDS = [
  {id:"r1",name:"Gratis Ayran",desc:"Ein Ayran Ihrer Wahl als Dankeschön",pts:50,type:"free_item"},
  {id:"r2",name:"10 % Rabatt",desc:"Zehn Prozent auf Ihre nächste Bestellung",pts:100,type:"discount",value:10},
  {id:"r3",name:"Gratis Dessert",desc:"Ein Dessert Ihrer Wahl — kostenlos",pts:200,type:"free_item"},
  {id:"r4",name:"20 % Stammgast-Rabatt",desc:"Exklusiver Vorteil für besonders treue Gäste",pts:500,type:"discount",value:20},
];
const TIERS=[
  {name:"bronze",min:0,max:199},
  {name:"silver",min:200,max:499},
  {name:"gold",min:500,max:999},
  {name:"platinum",min:1000,max:Infinity},
];
const getTier=(pts)=>TIERS.find(t=>pts>=t.min&&pts<=t.max)?.name||"bronze";

// ────────────────────────────────────────────────────────────
// STORAGE
// ────────────────────────────────────────────────────────────
const LS={
  get:(k,fb=[])=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};

// ────────────────────────────────────────────────────────────
// HOOKS
// ────────────────────────────────────────────────────────────
function useCountdown(targetTs){
  const calc=()=>{
    const diff=Math.max(0,targetTs-Date.now());
    return{d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)};
  };
  const [t,setT]=useState(calc);
  useEffect(()=>{const id=setInterval(()=>setT(calc()),1000);return()=>clearInterval(id);},[targetTs]);
  return t;
}
function useToast(){
  const [toasts,setToasts]=useState([]);
  const add=useCallback((msg,type="info")=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  },[]);
  return{toasts,toast:add};
}

// ────────────────────────────────────────────────────────────
// CSS
// ────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@200;300;400;500;600;700&display=swap');
:root{
  --bg:#060f1a;--bg2:#0a1828;--bg3:#0f2238;--bg4:#162d48;
  --tq:#2ec4b6;--tq2:#20a89c;--tq3:#155f5a;--tq4:rgba(46,196,182,0.08);
  --tq-b:rgba(46,196,182,0.18);--tq-glow:0 4px 24px rgba(46,196,182,0.15);
  --gold:#c9a96e;--gold2:#e8c97e;--gold3:rgba(201,169,110,0.12);
  --text:#d6eae8;--text2:#7aacaa;--text3:#3d7070;
  --white:#f0f8f7;--red:#d95f5f;--green:#3dbf92;
  --shadow:0 8px 40px rgba(0,0,0,0.55);--r:12px;--r2:8px;
  --ff:'Cormorant Garamond',serif;--fb:'Jost',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-weight:300;line-height:1.6;min-height:100vh;overflow-x:hidden}
h1,h2,h3,h4{font-family:var(--ff);font-weight:400;line-height:1.2}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--tq3);border-radius:3px}
.wrap{max-width:1400px;margin:0 auto;padding:0 24px}

/* HEADER */
.hdr{position:fixed;top:0;left:0;right:0;z-index:100;height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;background:rgba(6,15,26,0.94);backdrop-filter:blur(18px);border-bottom:1px solid var(--tq-b)}
.logo{font-family:var(--ff);font-size:2rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--tq)}
.logo span{color:var(--gold)}
.hdr-right{display:flex;align-items:center;gap:10px}
.icon-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--tq-b);background:var(--tq4);color:var(--tq);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;position:relative}
.icon-btn:hover{background:rgba(46,196,182,.18);border-color:var(--tq)}
.badge{position:absolute;top:-4px;right:-4px;background:var(--gold);color:var(--bg);border-radius:50%;width:20px;height:20px;font-size:.68rem;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:var(--fb)}
.user-name{font-size:.78rem;color:var(--text2);letter-spacing:.05em}

/* HERO */
.hero{padding-top:72px;min-height:72vh;display:flex;align-items:center;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 75% 50%,rgba(46,196,182,.07) 0%,transparent 65%),radial-gradient(ellipse 35% 50% at 15% 80%,rgba(201,169,110,.05) 0%,transparent 60%),linear-gradient(180deg,var(--bg) 0%,var(--bg2) 100%)}
.hero-grid{position:absolute;inset:0;opacity:.035;background-image:linear-gradient(var(--tq) 1px,transparent 1px),linear-gradient(90deg,var(--tq) 1px,transparent 1px);background-size:64px 64px}
.hero-inner{position:relative;z-index:1;padding:80px 0 60px}
.eyebrow{font-family:var(--fb);font-size:.72rem;letter-spacing:.38em;color:var(--gold);text-transform:uppercase;margin-bottom:22px}
.hero-h1{font-size:clamp(2.6rem,6vw,5.2rem);color:var(--white);margin-bottom:18px}
.hero-h1 em{font-style:italic;color:var(--tq)}
.hero-sub{font-size:1.05rem;color:var(--text2);max-width:500px;margin-bottom:40px;line-height:1.85}
.hero-stats{display:flex;gap:36px;flex-wrap:wrap}
.stat{border-left:2px solid var(--tq3);padding-left:14px}
.stat-n{font-family:var(--ff);font-size:2rem;color:var(--gold);line-height:1}
.stat-l{font-size:.7rem;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-top:2px}

/* OFFER BANNER */
.offer{background:linear-gradient(135deg,rgba(201,169,110,.09) 0%,rgba(46,196,182,.06) 100%);border:1px solid rgba(201,169,110,.28);border-radius:var(--r);padding:24px 32px;margin:32px 0;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;position:relative;overflow:hidden}
.offer::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.offer-tag{font-size:.62rem;letter-spacing:.32em;color:var(--gold);text-transform:uppercase;margin-bottom:5px}
.offer-title{font-family:var(--ff);font-size:1.7rem;color:var(--white);margin-bottom:4px}
.offer-price{font-family:var(--ff);font-size:1.1rem;color:var(--text2)}
.offer-price s{margin-right:6px;text-decoration:line-through}
.offer-price strong{color:var(--tq);font-size:1.5rem}
.cd{display:flex;align-items:flex-start;gap:6px}
.cd-unit{text-align:center}
.cd-n{font-family:var(--ff);font-size:2.3rem;color:var(--tq);line-height:1;display:block;min-width:52px;background:var(--bg3);border:1px solid var(--tq-b);border-radius:var(--r2);padding:8px 10px}
.cd-l{font-size:.58rem;letter-spacing:.18em;color:var(--text3);text-transform:uppercase;margin-top:4px}
.cd-sep{font-family:var(--ff);font-size:2rem;color:var(--tq3);padding-top:8px}

/* SECTION */
.sec{padding:60px 0}
.sec-ey{font-size:.68rem;letter-spacing:.3em;color:var(--tq);text-transform:uppercase;margin-bottom:8px}
.sec-h{font-size:clamp(1.8rem,3.5vw,2.8rem);color:var(--white);margin-bottom:14px}
.sec-line{width:56px;height:2px;background:linear-gradient(90deg,var(--tq),transparent);margin-bottom:36px}

/* CAT FILTER */
.cat-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px;padding-bottom:18px;border-bottom:1px solid var(--tq-b)}
.cat-btn{padding:7px 20px;border-radius:100px;border:1px solid var(--tq-b);background:transparent;color:var(--text2);font-family:var(--fb);font-size:.82rem;cursor:pointer;transition:all .2s;letter-spacing:.04em}
.cat-btn:hover{border-color:var(--tq);color:var(--tq)}
.cat-btn.on{background:var(--tq);border-color:var(--tq);color:var(--bg);font-weight:600}

/* PRODUCT GRID */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px}
.card{background:var(--bg2);border:1px solid var(--tq-b);border-radius:var(--r);overflow:visible;display:flex;flex-direction:column;transition:all .3s;position:relative}
.card:hover{border-color:var(--tq2);box-shadow:var(--tq-glow);transform:translateY(-3px)}
.card.feat{border-color:rgba(201,169,110,.32)}
.tag{position:absolute;top:12px;right:12px;font-size:.58rem;letter-spacing:.18em;padding:3px 9px;border-radius:100px;text-transform:uppercase;font-family:var(--fb);font-weight:600;z-index:2}
.tag-feat{background:var(--gold3);border:1px solid rgba(201,169,110,.38);color:var(--gold)}
.tag-special{background:rgba(46,196,182,.1);border:1px solid var(--tq3);color:var(--tq)}
.card-body{padding:20px;flex:1;display:flex;flex-direction:column}
.card-cat{font-size:.62rem;letter-spacing:.24em;color:var(--tq);text-transform:uppercase;margin-bottom:8px}
.card-name{font-family:var(--ff);font-size:1.35rem;color:var(--white);margin-bottom:10px;line-height:1.3}
.card-desc{font-size:.82rem;color:var(--text2);line-height:1.75;flex:1;margin-bottom:14px}
.card-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.chip{font-size:.68rem;color:var(--text3);padding:2px 9px;border:1px solid rgba(255,255,255,.07);border-radius:100px}
.alg-btn{font-size:.68rem;color:var(--text3);background:transparent;border:1px solid rgba(255,255,255,.07);border-radius:100px;padding:2px 9px;cursor:pointer;font-family:var(--fb);transition:all .2s;display:flex;align-items:center;gap:3px}
.alg-btn:hover{border-color:var(--tq3);color:var(--tq)}
.alg-popup{position:absolute;bottom:calc(100% - 60px);left:16px;right:16px;background:var(--bg4);border:1px solid var(--tq-b);border-radius:var(--r2);padding:14px 16px;z-index:20;box-shadow:var(--shadow)}
.alg-popup strong{display:block;color:var(--tq);font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:8px;font-family:var(--fb);font-weight:600}
.alg-list{display:flex;flex-wrap:wrap;gap:5px}
.alg-item{background:rgba(46,196,182,.07);border:1px solid var(--tq3);border-radius:4px;padding:3px 7px;font-size:.72rem;color:var(--tq)}
.card-foot{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--tq-b);background:rgba(0,0,0,.18)}
.price{font-family:var(--ff);font-size:1.65rem;color:var(--gold2);font-weight:500;line-height:1}
.price s{font-size:1rem;color:var(--text3);margin-right:5px;text-decoration:line-through}
.price-sp{color:var(--tq)}
.add-btn{padding:9px 18px;background:var(--tq);border:none;border-radius:var(--r2);color:var(--bg);font-family:var(--fb);font-size:.78rem;font-weight:700;letter-spacing:.05em;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}
.add-btn:hover{background:var(--tq2)}
.add-btn.in{background:var(--gold)}
.qty-ctrl{display:flex;align-items:center;gap:8px}
.qty-b{width:30px;height:30px;border-radius:50%;border:1px solid var(--tq3);background:transparent;color:var(--tq);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.qty-b:hover{background:var(--tq3)}
.qty-n{font-family:var(--ff);font-size:1.2rem;color:var(--white);min-width:20px;text-align:center}

/* CART */
.overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.65);backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:opacity .3s}
.overlay.on{opacity:1;pointer-events:all}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(480px,100vw);background:var(--bg2);border-left:1px solid var(--tq-b);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);z-index:201}
.drawer.on{transform:translateX(0)}
.dr-hdr{padding:22px 24px;border-bottom:1px solid var(--tq-b);display:flex;align-items:center;justify-content:space-between}
.dr-title{font-family:var(--ff);font-size:1.7rem;color:var(--white)}
.close-btn{width:36px;height:36px;border-radius:50%;border:1px solid var(--tq-b);background:transparent;color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.close-btn:hover{border-color:var(--tq);color:var(--tq)}
.dr-items{flex:1;overflow-y:auto;padding:14px 24px}
.ci{display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.ci-info{flex:1}
.ci-name{font-size:.92rem;color:var(--white);margin-bottom:3px}
.ci-note{font-size:.75rem;color:var(--text3)}
.ci-price{font-family:var(--ff);font-size:1.15rem;color:var(--gold)}
.ci-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.empty{text-align:center;padding:56px 24px;color:var(--text3)}
.dr-foot{padding:20px 24px;border-top:1px solid var(--tq-b)}
.sum-row{display:flex;justify-content:space-between;margin-bottom:7px;font-size:.84rem;color:var(--text2)}
.sum-row.tot{font-family:var(--ff);font-size:1.55rem;color:var(--white);border-top:1px solid var(--tq-b);padding-top:12px;margin-top:6px}
.sum-row.tot span:last-child{color:var(--gold2)}
.sum-pts{font-size:.75rem;color:var(--tq);text-align:right;margin-bottom:14px}
.checkout-btn{width:100%;padding:15px;background:linear-gradient(135deg,var(--tq),var(--tq2));border:none;border-radius:var(--r);color:var(--bg);font-family:var(--fb);font-size:.95rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s}
.checkout-btn:hover{opacity:.88;box-shadow:var(--tq-glow)}
.checkout-btn:disabled{opacity:.35;cursor:not-allowed}

/* MODAL */
.modal-wrap{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .3s}
.modal-wrap.on{opacity:1;pointer-events:all}
.modal{background:var(--bg2);border:1px solid var(--tq-b);border-radius:var(--r);width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow);transform:scale(.96) translateY(16px);transition:transform .3s}
.modal-wrap.on .modal{transform:scale(1) translateY(0)}
.modal.wide{max-width:640px}
.m-hdr{padding:26px 26px 0;margin-bottom:22px}
.m-title{font-family:var(--ff);font-size:2rem;color:var(--white)}
.m-sub{font-size:.83rem;color:var(--text2);margin-top:5px}
.m-body{padding:0 26px 26px}
.tabs{display:flex;border-bottom:1px solid var(--tq-b);margin-bottom:22px}
.tab{padding:10px 18px;cursor:pointer;font-size:.82rem;color:var(--text2);border:none;border-bottom:2px solid transparent;background:none;font-family:var(--fb);transition:all .2s}
.tab:hover{color:var(--tq)}
.tab.on{color:var(--tq);border-bottom-color:var(--tq)}
.fg{margin-bottom:16px}
.fl{display:block;font-size:.7rem;letter-spacing:.16em;color:var(--tq);text-transform:uppercase;margin-bottom:7px;font-family:var(--fb)}
.fi{width:100%;padding:12px 15px;background:var(--bg3);border:1px solid var(--tq-b);border-radius:var(--r2);color:var(--white);font-family:var(--fb);font-size:.92rem;outline:none;transition:border-color .2s}
.fi:focus{border-color:var(--tq)}
.fi::placeholder{color:var(--text3)}
.fe{font-size:.75rem;color:var(--red);margin-top:5px}

/* CHECKOUT STEPS */
.steps{display:flex;align-items:center;gap:6px;margin-bottom:26px}
.s-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--tq-b);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;color:var(--text3);font-family:var(--fb);transition:all .3s;flex-shrink:0}
.s-dot.cur{border-color:var(--tq);color:var(--tq);background:rgba(46,196,182,.1)}
.s-dot.done{border-color:var(--tq2);background:var(--tq2);color:var(--bg)}
.s-line{flex:1;height:1px;background:var(--tq-b)}
.pay-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.pay-opt{padding:14px 8px;border:1px solid var(--tq-b);border-radius:var(--r2);background:var(--bg3);text-align:center;cursor:pointer;transition:all .2s;color:var(--text2);font-family:var(--fb)}
.pay-opt:hover{border-color:var(--tq);color:var(--tq)}
.pay-opt.on{border-color:var(--tq);background:rgba(46,196,182,.07);color:var(--tq)}
.pay-icon{font-size:.9rem;display:block;margin-bottom:5px;font-weight:700;letter-spacing:.04em}
.pay-label{font-size:.72rem;letter-spacing:.05em}
.type-opts{display:flex;gap:10px;margin:12px 0}
.type-opt{flex:1;padding:12px;border:1px solid var(--tq-b);border-radius:var(--r2);background:var(--bg3);text-align:center;cursor:pointer;transition:all .2s;color:var(--text2);font-family:var(--fb);font-size:.82rem}
.type-opt.on{border-color:var(--gold);color:var(--gold);background:rgba(201,169,110,.07)}

/* POINTS */
.pts-hero{background:linear-gradient(135deg,rgba(46,196,182,.07),rgba(201,169,110,.07));border:1px solid var(--tq-b);border-radius:var(--r);padding:22px;text-align:center;margin-bottom:22px}
.pts-n{font-family:var(--ff);font-size:3.5rem;color:var(--gold2);line-height:1}
.pts-l{font-size:.72rem;color:var(--text2);letter-spacing:.16em;text-transform:uppercase;margin-top:4px}
.tier-badge{display:inline-block;padding:3px 11px;border-radius:100px;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;font-weight:700;font-family:var(--fb);margin-top:10px}
.t-bronze{background:rgba(205,127,50,.12);border:1px solid rgba(205,127,50,.3);color:#cd9b64}
.t-silver{background:rgba(192,192,192,.1);border:1px solid rgba(192,192,192,.25);color:#b8c8c8}
.t-gold{background:var(--gold3);border:1px solid rgba(201,169,110,.3);color:var(--gold2)}
.t-platinum{background:rgba(46,196,182,.1);border:1px solid var(--tq3);color:var(--tq)}
.pts-bar-bg{background:var(--bg3);border-radius:100px;height:5px;margin:14px 0 6px}
.pts-bar{height:5px;border-radius:100px;background:linear-gradient(90deg,var(--tq),var(--gold));transition:width .5s}
.rwd-card{background:var(--bg3);border:1px solid rgba(255,255,255,.06);border-radius:var(--r2);padding:14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.rwd-info{flex:1}
.rwd-name{font-size:.92rem;color:var(--white);margin-bottom:3px}
.rwd-desc{font-size:.75rem;color:var(--text2)}
.rwd-pts{font-family:var(--ff);font-size:1.2rem;color:var(--gold);white-space:nowrap}
.redeem-btn{padding:6px 13px;background:transparent;border:1px solid var(--tq);color:var(--tq);border-radius:var(--r2);font-family:var(--fb);font-size:.76rem;font-weight:500;cursor:pointer;transition:all .2s}
.redeem-btn:hover:not(:disabled){background:var(--tq);color:var(--bg)}
.redeem-btn:disabled{opacity:.3;cursor:not-allowed}

/* ORDER HISTORY */
.ord-card{background:var(--bg3);border:1px solid rgba(255,255,255,.05);border-radius:var(--r2);padding:14px;margin-bottom:10px}
.ord-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.ord-id{font-size:.72rem;color:var(--text3);letter-spacing:.1em}
.ord-date{font-size:.72rem;color:var(--text3)}
.ord-items{font-size:.8rem;color:var(--text2);margin-bottom:8px}
.ord-bot{display:flex;justify-content:space-between;align-items:center}
.ord-status{font-size:.67rem;letter-spacing:.14em;text-transform:uppercase;padding:3px 10px;border-radius:100px;font-family:var(--fb);font-weight:600}
.s-pending{background:rgba(201,169,110,.1);color:var(--gold);border:1px solid rgba(201,169,110,.22)}
.s-confirmed{background:rgba(46,196,182,.1);color:var(--tq);border:1px solid var(--tq3)}
.s-delivered{background:rgba(61,191,146,.1);color:var(--green);border:1px solid rgba(61,191,146,.25)}
.ord-total{font-family:var(--ff);font-size:1.2rem;color:var(--gold2)}

/* SUCCESS */
.succ-icon{width:76px;height:76px;border-radius:50%;background:rgba(46,196,182,.1);border:2px solid var(--tq);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--tq)}
.succ-title{font-family:var(--ff);font-size:2.4rem;color:var(--white);text-align:center;margin-bottom:8px}
.succ-sub{color:var(--text2);text-align:center;margin-bottom:22px;font-size:.88rem;line-height:1.7}
.succ-pts{font-family:var(--ff);font-size:1.5rem;color:var(--gold);text-align:center;margin-bottom:22px}

/* BUTTONS */
.btn{padding:11px 22px;border-radius:var(--r2);border:none;font-family:var(--fb);font-size:.88rem;font-weight:500;cursor:pointer;transition:all .2s;letter-spacing:.05em}
.btn-p{background:var(--tq);color:var(--bg)}
.btn-p:hover{background:var(--tq2)}
.btn-s{background:transparent;border:1px solid var(--tq-b);color:var(--text2)}
.btn-s:hover{border-color:var(--tq);color:var(--tq)}
.btn-g{background:var(--gold);color:var(--bg)}
.btn-g:hover{background:var(--gold2)}
.btn-block{width:100%;padding:15px;font-size:.92rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.btn-row{display:flex;gap:10px;margin-top:18px}
.divider{height:1px;background:var(--tq-b);margin:18px 0}
.link-btn{background:none;border:none;color:var(--tq);cursor:pointer;font-family:var(--fb);font-size:inherit;padding:0;text-decoration:underline}
.tc{text-align:center}
.muted{color:var(--text2)}
.small{font-size:.8rem}
.mt-3{margin-top:12px}
.mt-4{margin-top:16px}
.mb-3{margin-bottom:12px}
.gold{color:var(--gold2)}
.green{color:var(--green)}
.red{color:var(--red)}
.flex-bet{display:flex;justify-content:space-between;align-items:center}
.pts-check{display:flex;align-items:center;gap:10px;background:var(--bg3);border:1px solid var(--tq-b);border-radius:var(--r2);padding:12px 15px;margin:14px 0;cursor:pointer;transition:border-color .2s}
.pts-check:hover{border-color:var(--tq)}
.pts-check.on{border-color:var(--tq)}
.chk-box{width:20px;height:20px;border-radius:4px;border:2px solid var(--tq3);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.chk-box.on{background:var(--tq);border-color:var(--tq)}
.info-box{background:rgba(46,196,182,.06);border:1px solid var(--tq-b);border-radius:var(--r2);padding:12px 14px;font-size:.8rem;color:var(--text2);margin:12px 0}
.disc-badge{background:rgba(61,191,146,.1);border:1px solid rgba(61,191,146,.25);border-radius:var(--r2);padding:10px 14px;font-size:.82rem;color:var(--green);margin:8px 0;display:flex;align-items:center;justify-content:space-between}

/* TOAST */
.toast-wrap{position:fixed;bottom:24px;right:24px;z-index:400;display:flex;flex-direction:column;gap:8px}
.toast{background:var(--bg4);border:1px solid var(--tq-b);border-radius:var(--r2);padding:12px 18px;font-size:.84rem;color:var(--text);max-width:320px;box-shadow:var(--shadow);animation:ti .3s ease}
.toast.ok{border-color:var(--green)}
.toast.err{border-color:var(--red)}
@keyframes ti{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}

/* FOOTER */
.footer{border-top:1px solid var(--tq-b);padding:40px 0;margin-top:60px}
.footer-inner{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:start}
.f-logo{font-family:var(--ff);font-size:1.7rem;color:var(--tq);letter-spacing:.16em;text-transform:uppercase;margin-bottom:8px}
.f-logo span{color:var(--gold)}
.f-text{font-size:.78rem;color:var(--text3);line-height:1.8}
.f-info{font-size:.78rem;color:var(--text3);text-align:right;line-height:1.8}
.f-info strong{color:var(--text2);display:block;font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:4px;font-weight:500}

@media(max-width:650px){.grid{grid-template-columns:1fr}.pay-opts{grid-template-columns:1fr}.hero-stats{gap:20px}.offer{flex-direction:column}.footer-inner{grid-template-columns:1fr}.f-info{text-align:left}}
`;

// ────────────────────────────────────────────────────────────
// UTILS
// ────────────────────────────────────────────────────────────
const pad=(n)=>String(n).padStart(2,"0");
const fmt=(n)=>n.toFixed(2).replace(".",",")+" €";
const genId=()=>Math.random().toString(36).substr(2,8).toUpperCase();

// ────────────────────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────────────────────
export default function App(){
  const [cart,setCart]=useState({});
  const [cat,setCat]=useState("all");
  const [cartOpen,setCartOpen]=useState(false);
  const [authOpen,setAuthOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [checkoutOpen,setCheckoutOpen]=useState(false);
  const [successOpen,setSuccessOpen]=useState(false);
  const [lastOrder,setLastOrder]=useState(null);
  const [algOpen,setAlgOpen]=useState(null);
  const [user,setUser]=useState(null);
  const {toasts,toast}=useToast();
  const cd=useCountdown(SPECIAL_OFFER.endsAt);

  // Load user from localStorage
  useEffect(()=>{
    const uid=LS.get("tzq_uid",null);
    if(uid){
      const customers=LS.get("tzq_customers",[]);
      const found=customers.find(c=>c.id===uid);
      if(found) setUser(found);
    }
  },[]);

  // Save user changes
  const saveUser=(updated)=>{
    setUser(updated);
    const customers=LS.get("tzq_customers",[]);
    const idx=customers.findIndex(c=>c.id===updated.id);
    if(idx>=0) customers[idx]=updated;
    LS.set("tzq_customers",customers);
  };

  const cartItems=Object.entries(cart).map(([id,qty])=>({...PRODUCTS.find(p=>p.id===id),qty})).filter(Boolean);
  const cartQty=cartItems.reduce((a,i)=>a+i.qty,0);
  const cartSubtotal=cartItems.reduce((a,i)=>a+i.price*i.qty,0);

  const isSpecialActive=Date.now()<SPECIAL_OFFER.endsAt;
  const specialProduct=PRODUCTS.find(p=>p.id===SPECIAL_OFFER.productId);

  const addToCart=(id)=>{
    setCart(p=>({...p,[id]:(p[id]||0)+1}));
    const prod=PRODUCTS.find(p=>p.id===id);
    toast(`${prod.name} zum Warenkorb hinzugefügt`,"ok");
  };
  const remFromCart=(id)=>{
    setCart(p=>{
      if(!p[id]) return p;
      const n={...p};
      if(n[id]<=1) delete n[id];
      else n[id]--;
      return n;
    });
  };
  const delFromCart=(id)=>setCart(p=>{const n={...p};delete n[id];return n;});

  const logout=()=>{
    setUser(null);
    LS.set("tzq_uid",null);
    toast("Abgemeldet","ok");
  };

  const filteredProducts=cat==="all"?PRODUCTS:PRODUCTS.filter(p=>p.cat===cat);

  return(
    <>
      <style>{CSS}</style>

      {/* HEADER */}
      <header className="hdr">
        <div className="logo">TURQU<span>AZ</span></div>
        <nav className="hdr-right">
          {user&&<span className="user-name" style={{marginRight:4}}>Willkommen, {user.name.split(" ")[0]}</span>}
          <button className="icon-btn" onClick={()=>user?setProfileOpen(true):setAuthOpen(true)} title="Profil">
            <User size={18}/>
          </button>
          <button className="icon-btn" onClick={()=>setCartOpen(true)} title="Warenkorb">
            <ShoppingCart size={18}/>
            {cartQty>0&&<span className="badge">{cartQty}</span>}
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/><div className="hero-grid"/>
        <div className="wrap hero-inner">
          <p className="eyebrow">Restaurant Turquaz — Türkische Haute Cuisine</p>
          <h1 className="hero-h1">Wo Tradition auf<br/><em>Eleganz</em> trifft</h1>
          <p className="hero-sub">Authentische türkische Küche, mit grösster Sorgfalt und den feinsten Zutaten zubereitet. Jeder Gang erzählt eine Geschichte.</p>
          <div className="hero-stats">
            <div className="stat"><div className="stat-n">28</div><div className="stat-l">Gerichte</div></div>
            <div className="stat"><div className="stat-n">12</div><div className="stat-l">Jahre Erfahrung</div></div>
            <div className="stat"><div className="stat-n">100%</div><div className="stat-l">Frische Zutaten</div></div>
          </div>
        </div>
      </section>

      <main className="wrap">
        {/* SPECIAL OFFER */}
        {isSpecialActive&&(
          <div className="offer">
            <div>
              <div className="offer-tag">Limitiertes Angebot</div>
              <div className="offer-title">{SPECIAL_OFFER.title}</div>
              <div className="offer-price">
                <s>{fmt(SPECIAL_OFFER.regularPrice)}</s>
                <strong>{fmt(SPECIAL_OFFER.specialPrice)}</strong>
              </div>
              <div style={{fontSize:".78rem",color:"var(--text3)",marginTop:8}}>{SPECIAL_OFFER.banner}</div>
            </div>
            <div className="cd">
              <div className="cd-unit"><span className="cd-n">{pad(cd.d)}</span><div className="cd-l">Tage</div></div>
              <span className="cd-sep">:</span>
              <div className="cd-unit"><span className="cd-n">{pad(cd.h)}</span><div className="cd-l">Std</div></div>
              <span className="cd-sep">:</span>
              <div className="cd-unit"><span className="cd-n">{pad(cd.m)}</span><div className="cd-l">Min</div></div>
              <span className="cd-sep">:</span>
              <div className="cd-unit"><span className="cd-n">{pad(cd.s)}</span><div className="cd-l">Sek</div></div>
            </div>
            <button className="add-btn" style={{padding:"12px 24px",fontSize:".85rem"}} onClick={()=>addToCart(SPECIAL_OFFER.productId)}>
              Zum Sonderpreis bestellen
            </button>
          </div>
        )}

        {/* MENU */}
        <section className="sec">
          <div className="sec-ey">Unsere Speisekarte</div>
          <h2 className="sec-h">Ausgewählte Gerichte</h2>
          <div className="sec-line"/>
          <div className="cat-row">
            {CATEGORIES.map(c=>(
              <button key={c.id} className={`cat-btn${cat===c.id?" on":""}`} onClick={()=>setCat(c.id)}>{c.name}</button>
            ))}
          </div>
          <div className="grid">
            {filteredProducts.map(p=>(
              <ProductCard
                key={p.id} product={p}
                qty={cart[p.id]||0}
                isSpecial={isSpecialActive&&p.special}
                specialPrice={SPECIAL_OFFER.specialPrice}
                onAdd={()=>addToCart(p.id)}
                onInc={()=>addToCart(p.id)}
                onDec={()=>remFromCart(p.id)}
                algOpen={algOpen===p.id}
                onAlgToggle={()=>setAlgOpen(algOpen===p.id?null:p.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap footer-inner">
          <div>
            <div className="f-logo">TURQU<span>AZ</span></div>
            <p className="f-text">Authentische türkische Küche seit 2013.<br/>Jedes Gericht ist ein Ausdruck unserer Leidenschaft<br/>und des tiefen Respekts vor der Tradition.</p>
          </div>
          <div className="f-info">
            <strong>Kontakt</strong>
            Musterstrasse 12, 10115 Berlin<br/>
            +49 30 1234 5678<br/>
            info@turquaz-restaurant.de<br/><br/>
            <strong>Öffnungszeiten</strong>
            Mo–Sa: 11:00 – 23:00 Uhr<br/>
            So: 12:00 – 22:00 Uhr
          </div>
        </div>
      </footer>

      {/* CART */}
      <div className={`overlay${cartOpen?" on":""}`} onClick={()=>setCartOpen(false)}/>
      <div className={`drawer${cartOpen?" on":""}`}>
        <div className="dr-hdr">
          <span className="dr-title">Warenkorb</span>
          <button className="close-btn" onClick={()=>setCartOpen(false)}><X size={16}/></button>
        </div>
        <div className="dr-items">
          {cartItems.length===0?(
            <div className="empty">
              <ShoppingCart size={40} style={{margin:"0 auto 14px",display:"block",opacity:.3}}/>
              <p>Ihr Warenkorb ist leer</p>
              <p className="small mt-3 muted">Wählen Sie Gerichte aus unserer Speisekarte</p>
            </div>
          ):cartItems.map(item=>(
            <div key={item.id} className="ci">
              <div className="ci-info">
                <div className="ci-name">{item.name}</div>
                <div className="ci-note">{fmt(item.price)} pro Stück</div>
              </div>
              <div className="ci-right">
                <div className="ci-price">{fmt(item.price*item.qty)}</div>
                <div className="qty-ctrl">
                  <button className="qty-b" onClick={()=>remFromCart(item.id)}><Minus size={12}/></button>
                  <span className="qty-n">{item.qty}</span>
                  <button className="qty-b" onClick={()=>addToCart(item.id)}><Plus size={12}/></button>
                  <button className="qty-b" onClick={()=>delFromCart(item.id)} style={{borderColor:"var(--red)",color:"var(--red)"}}><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="dr-foot">
          <div>
            <div className="sum-row"><span>Zwischensumme</span><span>{fmt(cartSubtotal)}</span></div>
            <div className="sum-row"><span>Steuer (19%)</span><span>{fmt(cartSubtotal*0.19/1.19)}</span></div>
            <div className="sum-row tot"><span>Gesamt</span><span>{fmt(cartSubtotal)}</span></div>
            {user&&<div className="sum-pts">+ {Math.floor(cartSubtotal)} Punkte bei Bestellung</div>}
          </div>
          <button className="checkout-btn" disabled={cartItems.length===0} onClick={()=>{
            if(!user){setAuthOpen(true);toast("Bitte zuerst anmelden","");return;}
            setCartOpen(false);setCheckoutOpen(true);
          }}>Zur Kasse</button>
          {!user&&cartItems.length>0&&(
            <p className="small muted tc mt-3">
              <button className="link-btn" onClick={()=>{setAuthOpen(true);}}>Anmelden</button>{" "}für Punkte &amp; schnellere Bestellung
            </p>
          )}
        </div>
      </div>

      {/* AUTH MODAL */}
      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onLogin={(u)=>{setUser(u);setAuthOpen(false);toast(`Willkommen zurück, ${u.name.split(" ")[0]}!`,"ok");}} toast={toast}/>

      {/* PROFILE MODAL */}
      {user&&(
        <ProfileModal open={profileOpen} onClose={()=>setProfileOpen(false)} user={user} onLogout={()=>{logout();setProfileOpen(false);}} onUserUpdate={saveUser} toast={toast}/>
      )}

      {/* CHECKOUT MODAL */}
      {user&&(
        <CheckoutModal open={checkoutOpen} onClose={()=>setCheckoutOpen(false)}
          cartItems={cartItems} cartSubtotal={cartSubtotal}
          user={user} onUserUpdate={saveUser}
          onSuccess={(order)=>{
            setCart({});setCheckoutOpen(false);
            setLastOrder(order);setSuccessOpen(true);
          }}
          toast={toast}
        />
      )}

      {/* SUCCESS MODAL */}
      <SuccessModal open={successOpen} order={lastOrder} onClose={()=>setSuccessOpen(false)}/>

      {/* TOASTS */}
      <div className="toast-wrap">
        {toasts.map(t=>(
          <div key={t.id} className={`toast ${t.type==="ok"?"ok":t.type==="err"?"err":""}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// PRODUCT CARD
// ────────────────────────────────────────────────────────────
function ProductCard({product,qty,isSpecial,specialPrice,onAdd,onInc,onDec,algOpen,onAlgToggle}){
  const catName=CATEGORIES.find(c=>c.id===product.cat)?.name||"";
  const effPrice=isSpecial?specialPrice:product.price;
  return(
    <div className={`card${product.featured?" feat":""}`} onClick={()=>{if(algOpen)return;}}>
      {product.featured&&!product.special&&<span className="tag tag-feat">Empfehlung</span>}
      {product.special&&<span className="tag tag-special">Special</span>}
      <div className="card-body">
        <div className="card-cat">{catName}</div>
        <div className="card-name">{product.name}</div>
        <div className="card-desc">{product.desc}</div>
        <div className="card-meta">
          {product.cal>0&&<span className="chip">{product.cal} kcal</span>}
          {product.allergens.length>0?(
            <button className="alg-btn" onClick={(e)=>{e.stopPropagation();onAlgToggle();}}>
              <AlertCircle size={11}/> Allergene {algOpen?<ChevronUp size={11}/>:<ChevronDown size={11}/>}
            </button>
          ):<span className="chip">Keine Allergene</span>}
        </div>
        {algOpen&&(
          <div className="alg-popup" onClick={e=>e.stopPropagation()}>
            <strong>Deklarationspflichtige Zutaten</strong>
            <div className="alg-list">
              {product.allergens.map(a=>(
                <span key={a} className="alg-item">{a} — {ALLERGEN_MAP[a]||a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="card-foot">
        <div className="price">
          {isSpecial&&<s>{fmt(product.price)}</s>}
          <span className={isSpecial?"price-sp":""}>{fmt(effPrice)}</span>
        </div>
        {qty===0?(
          <button className="add-btn" onClick={onAdd}><Plus size={14}/> Hinzufügen</button>
        ):(
          <div className="qty-ctrl">
            <button className="qty-b" onClick={onDec}><Minus size={12}/></button>
            <span className="qty-n">{qty}</span>
            <button className="qty-b" onClick={onInc}><Plus size={12}/></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// AUTH MODAL
// ────────────────────────────────────────────────────────────
function AuthModal({open,onClose,onLogin,toast}){
  const [tab,setTab]=useState("login");
  const [form,setForm]=useState({email:"",name:"",password:""});
  const [err,setErr]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const submit=()=>{
    setErr("");
    const customers=LS.get("tzq_customers",[]);
    if(tab==="login"){
      const found=customers.find(c=>c.email===form.email.toLowerCase());
      if(!found||found.password!==btoa(form.password)){setErr("E-Mail oder Passwort falsch.");return;}
      found.lastVisit=new Date().toISOString();
      found.visitCount=(found.visitCount||0)+1;
      const idx=customers.findIndex(c=>c.id===found.id);
      customers[idx]=found;
      LS.set("tzq_customers",customers);
      LS.set("tzq_uid",found.id);
      onLogin(found);
    } else {
      if(!form.name.trim()||!form.email.trim()||!form.password){setErr("Bitte alle Felder ausfüllen.");return;}
      if(customers.find(c=>c.email===form.email.toLowerCase())){setErr("Diese E-Mail ist bereits registriert.");return;}
      const newC={id:genId(),email:form.email.toLowerCase(),name:form.name.trim(),password:btoa(form.password),points:0,total_spent:0,tier:"bronze",visit_count:1,created_at:new Date().toISOString()};
      LS.set("tzq_customers",[...customers,newC]);
      LS.set("tzq_uid",newC.id);
      toast("Willkommen bei Turquaz! 50 Willkommenspunkte gutgeschrieben.","ok");
      newC.points=50;
      const updated=[...customers,newC];
      const idx=updated.findIndex(c=>c.id===newC.id);
      updated[idx]=newC;
      LS.set("tzq_customers",updated);
      onLogin(newC);
    }
  };
  return(
    <div className={`modal-wrap${open?" on":""}`} onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="m-hdr">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div className="m-title">{tab==="login"?"Anmelden":"Registrieren"}</div>
              <div className="m-sub">{tab==="login"?"Ihr persönliches Turquaz-Erlebnis wartet":"Werden Sie Teil der Turquaz-Familie"}</div>
            </div>
            <button className="close-btn" onClick={onClose}><X size={16}/></button>
          </div>
        </div>
        <div className="m-body">
          <div className="tabs">
            <button className={`tab${tab==="login"?" on":""}`} onClick={()=>{setTab("login");setErr("");}}>Anmelden</button>
            <button className={`tab${tab==="reg"?" on":""}`} onClick={()=>{setTab("reg");setErr("");}}>Registrieren</button>
          </div>
          {tab==="reg"&&(
            <div className="fg">
              <label className="fl">Vollständiger Name</label>
              <input className="fi" placeholder="Max Mustermann" value={form.name} onChange={e=>set("name",e.target.value)}/>
            </div>
          )}
          <div className="fg">
            <label className="fl">E-Mail-Adresse</label>
            <input className="fi" type="email" placeholder="max@example.de" value={form.email} onChange={e=>set("email",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="fl">Passwort</label>
            <input className="fi" type="password" placeholder="••••••••" value={form.password} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
          {err&&<div className="fe">{err}</div>}
          {tab==="reg"&&(
            <div className="info-box" style={{marginBottom:14}}>
              <Award size={13} style={{display:"inline",marginRight:6,color:"var(--gold)"}}/>
              Als neues Mitglied erhalten Sie 50 Willkommenspunkte — sofort einlösbar.
            </div>
          )}
          <button className="btn btn-p btn-block" onClick={submit}>{tab==="login"?"Anmelden":"Konto erstellen"}</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PROFILE MODAL
// ────────────────────────────────────────────────────────────
function ProfileModal({open,onClose,user,onLogout,onUserUpdate,toast}){
  const [tab,setTab]=useState("pts");
  const orders=LS.get("tzq_orders",[]).filter(o=>o.customerId===user.id).reverse();
  const tierNext=TIERS.find(t=>t.min>user.points);
  const tierPct=tierNext?Math.min(100,((user.points-TIERS.find(t=>t.name===user.tier)?.min||0)/(tierNext.min-(TIERS.find(t=>t.name===user.tier)?.min||0)))*100):100;

  const redeem=(reward)=>{
    if(user.points<reward.pts){toast("Nicht genügend Punkte","err");return;}
    const updated={...user,points:user.points-reward.pts};
    updated.tier=getTier(updated.points);
    onUserUpdate(updated);
    toast(`${reward.name} eingelöst — viel Freude!`,"ok");
  };

  return(
    <div className={`modal-wrap${open?" on":""}`} onClick={onClose}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="m-hdr">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div className="m-title">{user.name}</div>
              <div className="m-sub" style={{display:"flex",alignItems:"center",gap:10}}>
                <span>{user.email}</span>
                <span className={`tier-badge t-${user.tier}`}>{user.tier.charAt(0).toUpperCase()+user.tier.slice(1)}</span>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}><X size={16}/></button>
          </div>
        </div>
        <div className="m-body">
          <div className="tabs">
            <button className={`tab${tab==="pts"?" on":""}`} onClick={()=>setTab("pts")}><Award size={13} style={{marginRight:5}}/>Punkte</button>
            <button className={`tab${tab==="hist"?" on":""}`} onClick={()=>setTab("hist")}>Bestellungen</button>
            <button className={`tab${tab==="rwd"?" on":""}`} onClick={()=>setTab("rwd")}><Gift size={13} style={{marginRight:5}}/>Prämien</button>
          </div>

          {tab==="pts"&&(
            <>
              <div className="pts-hero">
                <div className="pts-n">{user.points}</div>
                <div className="pts-l">Punkte verfügbar</div>
                <span className={`tier-badge t-${user.tier}`}>{user.tier.charAt(0).toUpperCase()+user.tier.slice(1)} Status</span>
                <div className="pts-bar-bg mt-3"><div className="pts-bar" style={{width:`${tierPct}%`}}/></div>
                {tierNext&&<div className="small muted">{tierNext.min-user.points} Punkte bis {tierNext.name.charAt(0).toUpperCase()+tierNext.name.slice(1)}</div>}
              </div>
              <div className="info-box">
                <strong style={{color:"var(--tq)",fontSize:".7rem",letterSpacing:".15em",textTransform:"uppercase",display:"block",marginBottom:6}}>Wie Punkte funktionieren</strong>
                Pro Euro Bestellwert erhalten Sie 1 Punkt. Ab 100 Punkten können Sie Prämien einlösen. Mit steigendem Status warten exklusive Vorteile.
              </div>
              <div style={{marginTop:16}}>
                <div style={{fontSize:".7rem",letterSpacing:".2em",color:"var(--tq)",textTransform:"uppercase",marginBottom:10}}>Status-Stufen</div>
                {TIERS.map(t=>(
                  <div key={t.name} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span className={`tier-badge t-${t.name}`}>{t.name.charAt(0).toUpperCase()+t.name.slice(1)}</span>
                    <span className="small muted">{t.max===Infinity?`ab ${t.min}`:`${t.min}–${t.max}`} Punkte</span>
                  </div>
                ))}
              </div>
              <div className="btn-row">
                <button className="btn btn-s" onClick={onLogout}>Abmelden</button>
              </div>
            </>
          )}

          {tab==="hist"&&(
            <>
              {orders.length===0?(
                <div className="empty tc" style={{padding:"30px 0"}}>
                  <p className="muted">Noch keine Bestellungen vorhanden.</p>
                  <p className="small muted mt-3">Ihre Bestellhistorie erscheint hier.</p>
                </div>
              ):orders.map(o=>(
                <div key={o.id} className="ord-card">
                  <div className="ord-top">
                    <div><div className="ord-id">#{o.id}</div><div className="ord-date">{new Date(o.createdAt).toLocaleString("de-DE")}</div></div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span className={`ord-status s-${o.status}`}>{o.status==="pending"?"Ausstehend":o.status==="confirmed"?"Bestätigt":"Geliefert"}</span>
                    </div>
                  </div>
                  <div className="ord-items">{o.items.map(i=>`${i.qty}x ${i.name}`).join(", ")}</div>
                  <div className="ord-bot">
                    <span className="small muted">+{o.pointsEarned} Punkte erhalten</span>
                    <span className="ord-total">{fmt(o.total)}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab==="rwd"&&(
            <>
              <div className="info-box mb-3">Ihre Punkte: <strong className="gold">{user.points}</strong></div>
              {REWARDS.map(r=>(
                <div key={r.id} className="rwd-card">
                  <div className="rwd-info">
                    <div className="rwd-name">{r.name}</div>
                    <div className="rwd-desc">{r.desc}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="rwd-pts">{r.pts} Pts</div>
                    <button className="redeem-btn mt-3" disabled={user.points<r.pts} onClick={()=>redeem(r)}>Einlösen</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// CHECKOUT MODAL
// ────────────────────────────────────────────────────────────
function CheckoutModal({open,onClose,cartItems,cartSubtotal,user,onUserUpdate,onSuccess,toast}){
  const [step,setStep]=useState(1);
  const [payMethod,setPayMethod]=useState("card");
  const [orderType,setOrderType]=useState("dine_in");
  const [usePoints,setUsePoints]=useState(false);
  const [notes,setNotes]=useState("");
  const [cardNum,setCardNum]=useState("");
  const [processing,setProcessing]=useState(false);

  const maxPointsDisc=Math.min(user.points,Math.floor(cartSubtotal*10))/10;
  const discount=usePoints?Math.min(maxPointsDisc,cartSubtotal*0.3):0;
  const finalTotal=Math.max(0,cartSubtotal-discount);
  const pointsEarned=Math.floor(finalTotal);
  const pointsSpent=usePoints?Math.floor(discount*10):0;

  const confirm=()=>{
    setProcessing(true);
    setTimeout(()=>{
      const order={
        id:genId(),customerId:user.id,customerName:user.name,
        items:cartItems.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price})),
        total:finalTotal,discount,payMethod,orderType,notes,
        status:"confirmed",pointsEarned,pointsSpent,
        createdAt:new Date().toISOString(),
      };
      const orders=LS.get("tzq_orders",[]);
      LS.set("tzq_orders",[...orders,order]);
      const updated={...user,
        points:user.points+pointsEarned-pointsSpent,
        total_spent:(user.total_spent||0)+finalTotal,
        visit_count:(user.visit_count||0)+1,
      };
      updated.tier=getTier(updated.points);
      onUserUpdate(updated);
      setProcessing(false);
      setStep(1);setNotes("");setCardNum("");setUsePoints(false);
      onSuccess(order);
    },1800);
  };

  return(
    <div className={`modal-wrap${open?" on":""}`} onClick={onClose}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="m-hdr">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div className="m-title">{step===1?"Bestellung prüfen":step===2?"Zahlung":"Zusammenfassung"}</div>
              <div className="m-sub">{step===1?"Überprüfen Sie Ihre Auswahl":step===2?"Zahlungsmethode wählen":"Fast geschafft — Bestellung bestätigen"}</div>
            </div>
            <button className="close-btn" onClick={onClose}><X size={16}/></button>
          </div>
        </div>
        <div className="m-body">
          <div className="steps">
            {[1,2,3].map((s,i)=>(
              <>
                <div key={s} className={`s-dot${step===s?" cur":step>s?" done":""}`}>
                  {step>s?<Check size={13}/>:s}
                </div>
                {i<2&&<div key={`l${s}`} className="s-line"/>}
              </>
            ))}
          </div>

          {step===1&&(
            <>
              {cartItems.map(i=>(
                <div key={i.id} className="flex-bet" style={{padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <span className="muted small">{i.qty}x {i.name}</span>
                  <span className="gold">{fmt(i.price*i.qty)}</span>
                </div>
              ))}
              <div className="divider"/>
              <div style={{fontSize:".7rem",letterSpacing:".2em",color:"var(--tq)",textTransform:"uppercase",marginBottom:10}}>Art der Bestellung</div>
              <div className="type-opts">
                {[{v:"dine_in",l:"Vor Ort"},{v:"takeaway",l:"Mitnehmen"},{v:"delivery",l:"Lieferung"}].map(t=>(
                  <div key={t.v} className={`type-opt${orderType===t.v?" on":""}`} onClick={()=>setOrderType(t.v)}>{t.l}</div>
                ))}
              </div>
              {user.points>=10&&(
                <>
                  <div style={{fontSize:".7rem",letterSpacing:".2em",color:"var(--tq)",textTransform:"uppercase",margin:"16px 0 8px"}}>Punkte einlösen</div>
                  <div className={`pts-check${usePoints?" on":""}`} onClick={()=>setUsePoints(p=>!p)}>
                    <div className={`chk-box${usePoints?" on":""}`}>{usePoints&&<Check size={12} color="var(--bg)"/>}</div>
                    <div>
                      <div style={{fontSize:".88rem",color:"var(--white)"}}>Punkte einlösen ({user.points} verfügbar)</div>
                      <div style={{fontSize:".76rem",color:"var(--text2)"}}>Ersparniss bis zu {fmt(maxPointsDisc)}</div>
                    </div>
                  </div>
                  {usePoints&&<div className="disc-badge"><span>Rabatt durch Punkte</span><strong>- {fmt(discount)}</strong></div>}
                </>
              )}
              <div className="fg mt-4">
                <label className="fl">Anmerkungen (optional)</label>
                <input className="fi" placeholder="z.B. Ohne Zwiebeln, schärfer..." value={notes} onChange={e=>setNotes(e.target.value)}/>
              </div>
              <div className="divider"/>
              <div className="flex-bet" style={{marginBottom:6}}><span className="muted small">Zwischensumme</span><span>{fmt(cartSubtotal)}</span></div>
              {discount>0&&<div className="flex-bet" style={{marginBottom:6}}><span className="green small">Punkte-Rabatt</span><span className="green">- {fmt(discount)}</span></div>}
              <div className="flex-bet" style={{fontFamily:"var(--ff)",fontSize:"1.4rem",color:"var(--white)",marginTop:6}}>
                <span>Gesamt</span><span style={{color:"var(--gold2)"}}>{fmt(finalTotal)}</span>
              </div>
              <div style={{fontSize:".75rem",color:"var(--tq)",textAlign:"right",marginTop:4}}>+ {pointsEarned} Punkte</div>
              <div className="btn-row">
                <button className="btn btn-s" onClick={onClose}>Abbrechen</button>
                <button className="btn btn-p" style={{flex:1}} onClick={()=>setStep(2)}>Weiter zur Zahlung</button>
              </div>
            </>
          )}

          {step===2&&(
            <>
              <div style={{fontSize:".7rem",letterSpacing:".2em",color:"var(--tq)",textTransform:"uppercase",marginBottom:10}}>Zahlungsart</div>
              <div className="pay-opts">
                {[{v:"card",l:"Kreditkarte",icon:"CARD"},{v:"paypal",l:"PayPal",icon:"PP"},{v:"cash",l:"Bar",icon:"BAR"}].map(p=>(
                  <div key={p.v} className={`pay-opt${payMethod===p.v?" on":""}`} onClick={()=>setPayMethod(p.v)}>
                    <span className="pay-icon">{p.icon}</span>
                    <span className="pay-label">{p.l}</span>
                  </div>
                ))}
              </div>
              {payMethod==="card"&&(
                <>
                  <div className="fg mt-4">
                    <label className="fl">Kartennummer</label>
                    <input className="fi" placeholder="•••• •••• •••• ••••" maxLength={19} value={cardNum}
                      onChange={e=>{let v=e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim();setCardNum(v);}}/>
                  </div>
                  <div style={{display:"flex",gap:12}}>
                    <div className="fg" style={{flex:1}}>
                      <label className="fl">Gültig bis</label>
                      <input className="fi" placeholder="MM/JJ"/>
                    </div>
                    <div className="fg" style={{flex:1}}>
                      <label className="fl">CVV</label>
                      <input className="fi" placeholder="•••" maxLength={3}/>
                    </div>
                  </div>
                </>
              )}
              {payMethod==="paypal"&&(
                <div className="info-box mt-4">Sie werden nach Bestätigung zu PayPal weitergeleitet.</div>
              )}
              {payMethod==="cash"&&(
                <div className="info-box mt-4">Barzahlung bei Abholung oder Lieferung. Bitte passend halten.</div>
              )}
              <div className="divider"/>
              <div className="flex-bet" style={{fontFamily:"var(--ff)",fontSize:"1.4rem",color:"var(--white)"}}>
                <span>Zu zahlen</span><span style={{color:"var(--gold2)"}}>{fmt(finalTotal)}</span>
              </div>
              <div className="btn-row">
                <button className="btn btn-s" onClick={()=>setStep(1)}>Zurück</button>
                <button className="btn btn-p" style={{flex:1}} onClick={()=>setStep(3)}>Bestätigen</button>
              </div>
            </>
          )}

          {step===3&&(
            <>
              <div className="info-box mb-3">
                <div className="flex-bet mb-3"><span className="muted small">Bestellart</span><span className="small">{orderType==="dine_in"?"Vor Ort":orderType==="takeaway"?"Mitnehmen":"Lieferung"}</span></div>
                <div className="flex-bet mb-3"><span className="muted small">Zahlung</span><span className="small">{payMethod==="card"?"Kreditkarte":payMethod==="paypal"?"PayPal":"Bar"}</span></div>
                {discount>0&&<div className="flex-bet mb-3"><span className="muted small">Rabatt</span><span className="green small">- {fmt(discount)}</span></div>}
                <div className="flex-bet"><span className="muted small">Gesamtbetrag</span><span className="gold">{fmt(finalTotal)}</span></div>
              </div>
              <div className="info-box">
                <Award size={13} style={{display:"inline",marginRight:6,color:"var(--gold)"}}/>
                Sie erhalten <strong className="gold">{pointsEarned} Punkte</strong> für diese Bestellung.
                {pointsSpent>0&&<span> {pointsSpent} Punkte werden eingelöst.</span>}
              </div>
              <button className="btn btn-p btn-block" style={{marginTop:18}} onClick={confirm} disabled={processing}>
                {processing?"Bestellung wird verarbeitet...":"Bestellung aufgeben"}
              </button>
              <button className="btn btn-s btn-block" style={{marginTop:10}} onClick={()=>setStep(2)} disabled={processing}>Zurück</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SUCCESS MODAL
// ────────────────────────────────────────────────────────────
function SuccessModal({open,order,onClose}){
  if(!order) return null;
  return(
    <div className={`modal-wrap${open?" on":""}`} onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="m-body" style={{paddingTop:32}}>
          <div className="succ-icon"><Check size={32}/></div>
          <div className="succ-title">Vielen Dank!</div>
          <div className="succ-sub">
            Ihre Bestellung #{order.id} wurde erfolgreich aufgegeben.<br/>
            Wir bereiten Ihre Gerichte mit grösster Sorgfalt zu.
          </div>
          <div className="succ-pts"><Award size={20} style={{display:"inline",marginRight:8,color:"var(--gold)"}}/>{order.pointsEarned} Punkte gutgeschrieben</div>
          <div className="info-box tc">Geschätzte Wartezeit: 15 – 25 Minuten</div>
          <button className="btn btn-p btn-block" style={{marginTop:18}} onClick={onClose}>Zur Speisekarte</button>
        </div>
      </div>
    </div>
  );
}
