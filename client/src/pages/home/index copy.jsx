import { useState, useEffect, useRef } from "react";

const C = {
  cream: "#F5F0E4",
  creamDark: "#EDE5D0",
  green: "#2D5016",
  greenMid: "#3D6B20",
  greenLight: "#5A8F35",
  gold: "#C8860A",
  goldLight: "#E8A020",
  ink: "#141210",
  inkSoft: "#2A2520",
  red: "#C0390A",
  sand: "#D4C49A",
};

const NAV = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Catering", href: "#catering" },
  { label: "Venue", href: "#venue" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Book Now", href: "#book" },
];

const MENU = [
  {
    name: "Kare-Kare",
    tag: "House Special",
    price: "₱380",
    desc: "Slow-braised oxtail in velvety peanut sauce, served with bagoong alamang",
    emoji: "🥜",
    bg: "#3D6B20",
  },
  {
    name: "Lechon Kawali",
    tag: "Bestseller",
    price: "₱320",
    desc: "Twice-cooked crispy pork belly with house liver sauce & atchara",
    emoji: "🥩",
    bg: "#8B3A0A",
  },
  {
    name: "Sinigang na Isda",
    tag: "Comfort Bowl",
    price: "₱350",
    desc: "Tamarind-sour broth with bangus, kangkong and fresh garden vegetables",
    emoji: "🍲",
    bg: "#1A5066",
  },
  {
    name: "Chicken Inasal",
    tag: "Fan Favorite",
    price: "₱280",
    desc: "Grilled chicken marinated in tanglad & calamansi, with garlic rice",
    emoji: "🍗",
    bg: "#7A5010",
  },
  {
    name: "Bibingka",
    tag: "Merienda",
    price: "₱120",
    desc: "Warm clay-pot rice cake topped with salted egg, kesong puti & coconut",
    emoji: "🍰",
    bg: "#5A3580",
  },
  {
    name: "Halo-Halo",
    tag: "Dessert",
    price: "₱150",
    desc: "Shaved ice paradise with ube halaya, leche flan, macapuno & pinipig",
    emoji: "🧁",
    bg: "#A02060",
  },
];

const CATERING = [
  {
    icon: "🎂",
    title: "Birthday & Debut",
    from: "₱5,000",
    pax: "30–150",
    desc: "Make every milestone legendary with a full Filipino spread. We handle setup, serving, and cleanup so you enjoy every moment.",
  },
  {
    icon: "💍",
    title: "Weddings",
    from: "₱25,000",
    pax: "50–300",
    desc: "Your love story deserves world-class food. From cocktail hour to reception buffet, we craft menus as beautiful as your day.",
  },
  {
    icon: "🏢",
    title: "Corporate Events",
    from: "₱8,000",
    pax: "20–200",
    desc: "Impress clients and energize your team. Professional service for seminars, launches, and company parties.",
  },
  {
    icon: "🎉",
    title: "Private Parties",
    from: "₱3,500",
    pax: "10–80",
    desc: "Reunions, baptisms, barkada fiestas — no event too small. Bring the fiesta to your door with Sandy's warmth.",
  },
];

const REVIEWS = [
  {
    name: "Maria Santos",
    role: "Birthday Celebration",
    stars: 5,
    text: "Sandy's Kitchenette made our family reunion absolutely unforgettable. The kare-kare was better than my Lola's, and that is saying everything.",
    init: "MS",
  },
  {
    name: "Jose Reyes",
    role: "Corporate Dinner",
    stars: 5,
    text: "Hired Sandy's for our company Christmas party. From setup to the last dish, absolutely professional. Every guest asked for the caterer's number.",
    init: "JR",
  },
  {
    name: "Ana Villanueva",
    role: "Wedding Reception",
    stars: 5,
    text: "Our wedding buffet was a dream. Guests were raving about the lechon kawali all night. Sandy's team made everything seamless and beautiful.",
    init: "AV",
  },
  {
    name: "Carlo Mendoza",
    role: "Debut Celebration",
    stars: 5,
    text: "The venue looked stunning, the food was incredible, and the service was five-star. Sandy's turned our daughter's debut into a memory for life.",
    init: "CM",
  },
];

const VENUE_ROOMS = [
  {
    emoji: "🌿",
    name: "Garden Pavilion",
    cap: "Up to 200 pax",
    desc: "Open-air tropical paradise draped in greenery",
  },
  {
    emoji: "🕯️",
    name: "Heritage Hall",
    cap: "Up to 80 pax",
    desc: "Warm intimate space with rustic Filipino décor",
  },
  {
    emoji: "🌸",
    name: "Bloom Room",
    cap: "Up to 40 pax",
    desc: "Romantic garden-view room for small celebrations",
  },
  {
    emoji: "🌅",
    name: "Sunset Terrace",
    cap: "Up to 60 pax",
    desc: "Al-fresco dining under open sky and evening breeze",
  },
];

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, y = 32, className = "", style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const LeafSVG = ({ style = {}, flip = false, opacity = 0.15 }) => (
  <svg
    viewBox="0 0 100 180"
    style={{
      position: "absolute",
      pointerEvents: "none",
      opacity,
      transform: flip ? "scaleX(-1)" : "none",
      ...style,
    }}
    fill="none"
  >
    <path
      d="M50 170 Q8 110 25 35 Q50 0 75 35 Q92 110 50 170Z"
      fill={C.greenMid}
    />
    <path
      d="M50 170 Q50 85 50 8"
      stroke={C.green}
      strokeWidth="1.2"
      opacity="0.4"
    />
    <path
      d="M50 140 Q28 122 25 95"
      stroke={C.green}
      strokeWidth="0.9"
      opacity="0.35"
    />
    <path
      d="M50 140 Q72 122 75 95"
      stroke={C.green}
      strokeWidth="0.9"
      opacity="0.35"
    />
    <path
      d="M50 105 Q30 88 28 65"
      stroke={C.green}
      strokeWidth="0.9"
      opacity="0.3"
    />
    <path
      d="M50 105 Q70 88 72 65"
      stroke={C.green}
      strokeWidth="0.9"
      opacity="0.3"
    />
  </svg>
);

const Stars = ({ n = 5 }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[...Array(n)].map((_, i) => (
      <span key={i} style={{ color: C.gold, fontSize: 15 }}>
        ★
      </span>
    ))}
  </div>
);

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "catering",
    date: "",
    guests: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const submit = () => {
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div
      style={{
        fontFamily: "'Georgia',serif",
        background: C.cream,
        color: C.ink,
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:${C.creamDark};}
        ::-webkit-scrollbar-thumb{background:${C.green};border-radius:3px;}
        .fhead{font-family:'Cormorant Garamond',Georgia,serif;}
        .fbody{font-family:'DM Sans',sans-serif;}
        .btn-g{font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:14px 30px;border-radius:3px;border:none;cursor:pointer;background:${C.green};color:white;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 20px rgba(45,80,22,.25);}
        .btn-g:hover{background:${C.greenMid};transform:translateY(-3px);box-shadow:0 10px 32px rgba(45,80,22,.4);}
        .btn-gd{font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border-radius:3px;border:2px solid ${C.gold};cursor:pointer;background:transparent;color:${C.gold};transition:all .3s ease;}
        .btn-gd:hover{background:${C.gold};color:white;transform:translateY(-3px);}
        .btn-w{font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border-radius:3px;border:1.5px solid rgba(255,255,255,.55);cursor:pointer;background:transparent;color:white;transition:all .3s ease;}
        .btn-w:hover{background:rgba(255,255,255,.12);border-color:white;}
        .lift{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease;}
        .lift:hover{transform:translateY(-7px);box-shadow:0 22px 52px rgba(20,18,16,.14);}
        .nav-lnk{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;text-decoration:none;transition:color .2s;}
        input,textarea,select{font-family:'DM Sans',sans-serif;font-size:14px;color:${C.ink};width:100%;padding:13px 16px;border:1.5px solid ${C.sand};border-radius:3px;background:white;outline:none;transition:border-color .2s;}
        input:focus,textarea:focus,select:focus{border-color:${C.green};}
        textarea{resize:vertical;min-height:110px;}
        label{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:7px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(2deg)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
        @media(max-width:768px){
          .dnav{display:none!important;}
          .mbtn{display:flex!important;}
          .g2{grid-template-columns:1fr!important;gap:40px!important;}
          .g3{grid-template-columns:1fr 1fr!important;}
          .g4{grid-template-columns:1fr 1fr!important;}
          .galg{grid-template-rows:auto!important;}
          .contactg{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? "10px 0" : "18px 0",
          background: scrolled ? "rgba(245,240,228,.96)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? `1px solid rgba(212,196,154,.4)` : "none",
          transition: "all .4s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="#hero"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `2px solid ${scrolled ? C.green : "rgba(200,230,150,.6)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                transition: "border-color .4s",
              }}
            >
              🍳
            </div>
            <div>
              <div
                className="fhead"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: scrolled ? C.ink : "white",
                  lineHeight: 1,
                  transition: "color .4s",
                }}
              >
                Sandy's
              </div>
              <div
                className="fbody"
                style={{
                  fontSize: 8,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: scrolled ? C.greenLight : "rgba(200,230,150,.7)",
                  transition: "color .4s",
                }}
              >
                Kitchenette
              </div>
            </div>
          </a>
          <div
            className="dnav"
            style={{ display: "flex", gap: 26, alignItems: "center" }}
          >
            {NAV.slice(0, -1).map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="nav-lnk"
                style={{
                  color: scrolled ? C.inkSoft : "rgba(255,255,255,.78)",
                }}
                onMouseEnter={(e) => (e.target.style.color = C.greenLight)}
                onMouseLeave={(e) =>
                  (e.target.style.color = scrolled
                    ? C.inkSoft
                    : "rgba(255,255,255,.78)")
                }
              >
                {l.label}
              </a>
            ))}
            <a
              href="#book"
              className="btn-g"
              style={{ padding: "10px 22px", fontSize: 12 }}
            >
              Book Now
            </a>
          </div>
          <button
            className="mbtn"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              color: scrolled ? C.ink : "white",
              alignItems: "center",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
        {mobileOpen && (
          <div
            style={{
              background: C.cream,
              borderTop: `1px solid ${C.sand}`,
              padding: "12px 36px",
            }}
          >
            {NAV.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="nav-lnk"
                style={{
                  display: "block",
                  padding: "12px 0",
                  color: C.inkSoft,
                  borderBottom: `1px solid ${C.creamDark}`,
                }}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(145deg,#091505 0%,${C.green} 55%,#1e4010 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(ellipse at 18% 65%, rgba(90,143,53,.28) 0%, transparent 55%), radial-gradient(ellipse at 82% 28%, rgba(200,134,10,.14) 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle,rgba(255,255,255,.025) 1px,transparent 1px)`,
            backgroundSize: "30px 30px",
            pointerEvents: "none",
          }}
        />
        <LeafSVG
          style={{
            width: 300,
            top: -50,
            left: -70,
            transform: "rotate(-30deg)",
          }}
          opacity={0.2}
        />
        <LeafSVG
          style={{
            width: 220,
            bottom: -20,
            right: -50,
            transform: "rotate(145deg)",
          }}
          opacity={0.16}
          flip
        />
        <LeafSVG
          style={{
            width: 140,
            top: "22%",
            right: "7%",
            transform: "rotate(18deg)",
          }}
          opacity={0.1}
        />
        {[
          ["🌿", 7, 70, 4],
          ["🌺", 88, 18, 5],
          ["🍃", 14, 36, 3.5],
          ["🦜", 86, 72, 4.5],
        ].map(([e, l, t, d], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${l}%`,
              top: `${t}%`,
              fontSize: 26,
              opacity: 0.2,
              animation: `floatY ${d}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
              pointerEvents: "none",
            }}
          >
            {e}
          </div>
        ))}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1100,
            margin: "0 auto",
            padding: "130px 36px 90px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div style={{ animation: "fadeUp .8s ease .1s both" }}>
              <span
                className="fbody"
                style={{
                  fontSize: 11,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "rgba(180,220,130,.7)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 22,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 1,
                    background: "rgba(180,220,130,.45)",
                    display: "inline-block",
                  }}
                />
                Est. 2025 &nbsp;·&nbsp; General Tinio, Nueva Ecija
                <span
                  style={{
                    width: 24,
                    height: 1,
                    background: "rgba(180,220,130,.45)",
                    display: "inline-block",
                  }}
                />
              </span>
            </div>
            <div style={{ animation: "fadeUp .8s ease .25s both" }}>
              <h1
                className="fhead"
                style={{
                  fontSize: "clamp(58px,9vw,104px)",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 0.95,
                  marginBottom: 4,
                }}
              >
                Sandy's
              </h1>
              <h1
                className="fhead"
                style={{
                  fontSize: "clamp(34px,5.5vw,62px)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "rgba(195,228,145,.9)",
                  lineHeight: 1.1,
                  marginBottom: 26,
                }}
              >
                Kitchenette
              </h1>
            </div>
            <div style={{ animation: "fadeUp .8s ease .4s both" }}>
              <div
                style={{
                  width: 52,
                  height: 2,
                  background: `linear-gradient(90deg,${C.gold},transparent)`,
                  marginBottom: 22,
                }}
              />
              <p
                className="fbody"
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,.62)",
                  lineHeight: 1.85,
                  maxWidth: 500,
                  fontWeight: 300,
                  marginBottom: 38,
                }}
              >
                <em
                  style={{
                    fontStyle: "italic",
                    color: "rgba(215,198,135,.85)",
                  }}
                >
                  "The Taste You Won't Forget"
                </em>
                <br />
                Filipino home cooking elevated — for dining, catering, and every
                celebration worth remembering.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                animation: "fadeUp .8s ease .55s both",
              }}
            >
              <a href="#book" className="btn-g">
                Reserve a Table ↗
              </a>
              <a href="#catering" className="btn-w">
                Explore Catering
              </a>
            </div>
            <div
              style={{
                display: "flex",
                gap: 52,
                marginTop: 64,
                flexWrap: "wrap",
                animation: "fadeUp .8s ease .7s both",
              }}
            >
              {[
                ["500+", "Events Catered"],
                ["1,200+", "Happy Guests"],
                ["30+", "Filipino Recipes"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    className="fhead"
                    style={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: "rgba(195,228,145,.95)",
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </div>
                  <div
                    className="fbody"
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.38)",
                      marginTop: 5,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            animation: "floatY 2.5s ease-in-out infinite",
          }}
        >
          <span
            className="fbody"
            style={{
              fontSize: 9,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(255,255,255,.3)",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: 1,
              height: 34,
              background: `linear-gradient(to bottom,transparent,rgba(195,228,145,.4))`,
            }}
          />
        </div>
      </section>

      {/* MARQUEE */}
      <div
        style={{
          background: C.green,
          overflow: "hidden",
          padding: "13px 0",
          borderTop: `3px solid ${C.gold}`,
          borderBottom: `3px solid ${C.gold}`,
        }}
      >
        <div
          style={{
            display: "flex",
            animation: "marquee 28s linear infinite",
            width: "max-content",
          }}
        >
          {[...Array(3)].map((_, ri) => (
            <div key={ri} style={{ display: "flex", flexShrink: 0 }}>
              {[
                "🌿 Authentic Filipino Cuisine",
                "🍽️ Catering & Events",
                "🎉 Venue Reservations",
                "🥘 Fresh Ingredients Daily",
                "🏆 Best in Nueva Ecija",
                "🌺 Tropical Dining Experience",
              ].map((t) => (
                <span
                  key={t + ri}
                  className="fbody"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(195,228,145,.82)",
                    padding: "0 32px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t} &nbsp;·
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section
        id="about"
        style={{
          padding: "110px 36px",
          background: C.cream,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LeafSVG
          style={{
            width: 280,
            top: -50,
            right: -70,
            transform: "rotate(38deg)",
          }}
          opacity={0.07}
          flip
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="g2"
        >
          <Reveal>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  background: `linear-gradient(145deg,${C.green},#152808)`,
                  borderRadius: 8,
                  padding: "60px 40px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 35% 68%, rgba(90,143,53,.38), transparent 60%)`,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ fontSize: 76, marginBottom: 18 }}>👩‍🍳</div>
                <div
                  className="fhead"
                  style={{
                    color: "rgba(195,228,145,.9)",
                    fontSize: 26,
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  Sandy's Kitchen
                </div>
                <div
                  className="fbody"
                  style={{
                    color: "rgba(255,255,255,.38)",
                    fontSize: 10,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                  }}
                >
                  Est. 2025 · Nueva Ecija
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    width: 36,
                    height: 36,
                    borderTop: `2px solid rgba(195,228,145,.2)`,
                    borderLeft: `2px solid rgba(195,228,145,.2)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    width: 36,
                    height: 36,
                    borderBottom: `2px solid rgba(195,228,145,.2)`,
                    borderRight: `2px solid rgba(195,228,145,.2)`,
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: -18,
                  right: -22,
                  background: "white",
                  borderRadius: 6,
                  padding: "15px 19px",
                  boxShadow: "0 10px 36px rgba(20,18,16,.12)",
                  border: `1px solid ${C.creamDark}`,
                }}
              >
                <div
                  className="fhead"
                  style={{ fontSize: 28, fontWeight: 700, color: C.green }}
                >
                  500+
                </div>
                <div
                  className="fbody"
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: C.greenLight,
                    marginTop: 2,
                  }}
                >
                  Events Done
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -18,
                  left: -18,
                  background: C.green,
                  borderRadius: 6,
                  padding: "15px 19px",
                  boxShadow: "0 10px 36px rgba(45,80,22,.3)",
                }}
              >
                <div
                  className="fhead"
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "rgba(195,228,145,.95)",
                  }}
                >
                  100%
                </div>
                <div
                  className="fbody"
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.55)",
                    marginTop: 2,
                  }}
                >
                  Homemade
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <span
              className="fbody"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: C.greenLight,
                display: "block",
                marginBottom: 12,
              }}
            >
              Our Story
            </span>
            <div
              style={{
                width: 48,
                height: 2,
                background: `linear-gradient(90deg,${C.green},${C.gold})`,
                marginBottom: 20,
              }}
            />
            <h2
              className="fhead"
              style={{
                fontSize: "clamp(30px,4vw,48px)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: C.ink,
                marginBottom: 22,
              }}
            >
              A Labor of Love,
              <br />
              <em style={{ color: C.green }}>Served with Heart</em>
            </h2>
            <p
              className="fbody"
              style={{
                fontSize: 15,
                lineHeight: 1.9,
                color: "#5A4A38",
                fontWeight: 300,
                marginBottom: 16,
              }}
            >
              Sandy's Kitchenette was born from a single dream — to share the
              warmth of Filipino home cooking with every table. Located in
              General Tinio, Nueva Ecija, we've been serving dishes made from
              generations of tradition since 2025.
            </p>
            <p
              className="fbody"
              style={{
                fontSize: 15,
                lineHeight: 1.9,
                color: "#5A4A38",
                fontWeight: 300,
                marginBottom: 30,
              }}
            >
              Every broth is slow-simmered, every spice hand-pounded, every
              recipe guarded with love. We believe food is memory — and we make
              memories worth keeping.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 34,
              }}
            >
              {[
                [
                  "🌿",
                  "Fresh Daily",
                  "Market-fresh local ingredients every morning",
                ],
                [
                  "🤝",
                  "Personal Touch",
                  "Every event treated like our own family gathering",
                ],
                [
                  "🏡",
                  "Home-Style",
                  "Recipes perfected over generations in our kitchen",
                ],
                [
                  "⭐",
                  "Top Rated",
                  "Trusted by hundreds of families in Nueva Ecija",
                ],
              ].map(([ic, t, d]) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    gap: 11,
                    padding: "13px 14px",
                    background: "white",
                    borderRadius: 5,
                    border: `1px solid ${C.creamDark}`,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{ic}</span>
                  <div>
                    <div
                      className="fbody"
                      style={{
                        fontWeight: 600,
                        fontSize: 12,
                        color: C.ink,
                        marginBottom: 3,
                      }}
                    >
                      {t}
                    </div>
                    <div
                      className="fbody"
                      style={{
                        fontSize: 11,
                        color: "#8B7060",
                        lineHeight: 1.5,
                      }}
                    >
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a href="#book" className="btn-g">
              Book Your Experience →
            </a>
          </Reveal>
        </div>
      </section>

      {/* MENU */}
      <section
        id="menu"
        style={{
          padding: "110px 36px",
          background: C.creamDark,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LeafSVG
          style={{
            width: 190,
            bottom: -30,
            left: -40,
            transform: "rotate(-22deg)",
          }}
          opacity={0.09}
        />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 54 }}>
              <span
                className="fbody"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: C.greenLight,
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Signature Dishes
              </span>
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: `linear-gradient(90deg,${C.green},${C.gold})`,
                  margin: "0 auto 20px",
                }}
              />
              <h2
                className="fhead"
                style={{
                  fontSize: "clamp(30px,4vw,50px)",
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                A Taste of <em style={{ color: C.green }}>Filipino Heritage</em>
              </h2>
              <p
                className="fbody"
                style={{
                  fontSize: 15,
                  color: "#7A6550",
                  marginTop: 14,
                  maxWidth: 460,
                  margin: "14px auto 0",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                Every dish crafted from scratch using traditional techniques and
                the freshest local ingredients.
              </p>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))",
              gap: 20,
            }}
          >
            {MENU.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.08}>
                <div
                  className="lift"
                  style={{
                    background: "white",
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${C.creamDark}`,
                    position: "relative",
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      height: 4,
                      background: `linear-gradient(90deg,${item.bg},${item.bg}70)`,
                    }}
                  />
                  <div style={{ padding: "24px 24px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontSize: 38 }}>{item.emoji}</span>
                      <span
                        className="fbody"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: 1.6,
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: `${item.bg}18`,
                          color: item.bg,
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <h3
                      className="fhead"
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: C.ink,
                        marginBottom: 7,
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      className="fbody"
                      style={{
                        fontSize: 13,
                        color: "#7A6550",
                        lineHeight: 1.7,
                        marginBottom: 14,
                        fontWeight: 300,
                      }}
                    >
                      {item.desc}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: `1px solid ${C.creamDark}`,
                        paddingTop: 13,
                      }}
                    >
                      <span
                        className="fhead"
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: C.green,
                        }}
                      >
                        {item.price}
                      </span>
                      <a
                        href="#book"
                        className="fbody"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.gold,
                          textDecoration: "none",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          transition: "color .2s",
                        }}
                        onMouseEnter={(e) => (e.target.style.color = C.green)}
                        onMouseLeave={(e) => (e.target.style.color = C.gold)}
                      >
                        Order →
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div style={{ textAlign: "center", marginTop: 46 }}>
              <a href="#book" className="btn-g">
                View Full Menu & Order
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATERING */}
      <section
        id="catering"
        style={{
          padding: "110px 36px",
          background: `linear-gradient(155deg,#091505 0%,${C.green} 55%,#1a3a0a 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(ellipse at 14% 55%, rgba(90,143,53,.22), transparent 50%), radial-gradient(ellipse at 86% 45%, rgba(200,134,10,.1), transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <LeafSVG
          style={{
            width: 250,
            top: -40,
            right: -50,
            transform: "rotate(28deg)",
          }}
          opacity={0.14}
          flip
        />
        <LeafSVG
          style={{
            width: 170,
            bottom: -30,
            left: -40,
            transform: "rotate(-138deg)",
          }}
          opacity={0.1}
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 58 }}>
              <span
                className="fbody"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "rgba(195,228,145,.65)",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                We Come to You
              </span>
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: `linear-gradient(90deg,${C.gold},transparent)`,
                  margin: "0 auto 20px",
                }}
              />
              <h2
                className="fhead"
                style={{
                  fontSize: "clamp(30px,4vw,50px)",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                Catering for{" "}
                <em style={{ color: "rgba(195,228,145,.9)" }}>
                  Every Occasion
                </em>
              </h2>
              <p
                className="fbody"
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,.48)",
                  marginTop: 14,
                  maxWidth: 460,
                  margin: "14px auto 0",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                From intimate family dinners to grand galas — Sandy's warmth,
                straight to your celebration.
              </p>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))",
              gap: 18,
            }}
            className="g4"
          >
            {CATERING.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div
                  className="lift"
                  style={{
                    background: "rgba(255,255,255,.07)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(195,228,145,.11)",
                    borderRadius: 8,
                    padding: "32px 22px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg,${C.gold},transparent)`,
                    }}
                  />
                  <div style={{ fontSize: 42, marginBottom: 16 }}>{s.icon}</div>
                  <h3
                    className="fhead"
                    style={{
                      fontSize: 21,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 10,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="fbody"
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,.48)",
                      lineHeight: 1.75,
                      marginBottom: 22,
                      fontWeight: 300,
                    }}
                  >
                    {s.desc}
                  </p>
                  <div
                    style={{
                      borderTop: "1px solid rgba(195,228,145,.11)",
                      paddingTop: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <div>
                      <div
                        className="fbody"
                        style={{
                          fontSize: 10,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          color: "rgba(195,228,145,.45)",
                          marginBottom: 4,
                        }}
                      >
                        Starting from
                      </div>
                      <div
                        className="fhead"
                        style={{
                          fontSize: 26,
                          fontWeight: 700,
                          color: "rgba(195,228,145,.95)",
                        }}
                      >
                        {s.from}
                      </div>
                    </div>
                    <div
                      className="fbody"
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,.32)",
                        textAlign: "right",
                      }}
                    >
                      <div style={{ fontSize: 15, marginBottom: 2 }}>👥</div>
                      {s.pax} pax
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <div
              style={{
                marginTop: 52,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(195,228,145,.13)",
                borderRadius: 8,
                padding: "32px 38px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <h3
                  className="fhead"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  Ready to plan your event?
                </h3>
                <p
                  className="fbody"
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,.46)",
                    fontWeight: 300,
                  }}
                >
                  Get a personalized quote within 24 hours. We'll make it
                  perfect. 🌿
                </p>
              </div>
              <a href="#book" className="btn-gd">
                Get a Free Quote →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VENUE */}
      <section
        id="venue"
        style={{
          padding: "110px 36px",
          background: C.cream,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LeafSVG
          style={{
            width: 210,
            top: -30,
            left: -56,
            transform: "rotate(-22deg)",
          }}
          opacity={0.08}
          flip
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="g2"
        >
          <Reveal delay={0.1}>
            <span
              className="fbody"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: C.greenLight,
                display: "block",
                marginBottom: 12,
              }}
            >
              Event Venue
            </span>
            <div
              style={{
                width: 48,
                height: 2,
                background: `linear-gradient(90deg,${C.green},${C.gold})`,
                marginBottom: 20,
              }}
            />
            <h2
              className="fhead"
              style={{
                fontSize: "clamp(28px,3.5vw,44px)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: C.ink,
                marginBottom: 20,
              }}
            >
              Your Perfect
              <br />
              <em style={{ color: C.green }}>Event Space</em> Awaits
            </h2>
            <p
              className="fbody"
              style={{
                fontSize: 15,
                lineHeight: 1.9,
                color: "#5A4A38",
                fontWeight: 300,
                marginBottom: 26,
              }}
            >
              Nestled along Camia B Street, our venue blends lush tropical
              beauty with modern comforts. Every corner of Sandy's breathes
              celebration.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 34,
              }}
            >
              {[
                [
                  "🌴",
                  "Tropical Garden Setting",
                  "Lush greenery and natural ambiance for every event",
                ],
                [
                  "🎨",
                  "Full Décor Service",
                  "Florals, lighting, and styling handled by our team",
                ],
                [
                  "🎵",
                  "Sound & AV System",
                  "Full audio-visual setup included in all packages",
                ],
                [
                  "🅿️",
                  "Free Parking",
                  "Spacious parking area for you and your guests",
                ],
              ].map(([ic, t, d]) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "13px 16px",
                    background: "white",
                    borderRadius: 5,
                    border: `1px solid ${C.creamDark}`,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 20, minWidth: 26 }}>{ic}</span>
                  <div>
                    <div
                      className="fbody"
                      style={{ fontWeight: 600, fontSize: 13, color: C.ink }}
                    >
                      {t}
                    </div>
                    <div
                      className="fbody"
                      style={{ fontSize: 12, color: "#8B7060", marginTop: 2 }}
                    >
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a href="#book" className="btn-g">
              Check Availability →
            </a>
          </Reveal>
          <Reveal delay={0.2}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {VENUE_ROOMS.map((r, i) => (
                <div
                  key={r.name}
                  className="lift"
                  style={{
                    background: i % 2 === 0 ? C.green : "white",
                    border: `1px solid ${i % 2 === 0 ? "transparent" : C.creamDark}`,
                    borderRadius: 8,
                    padding: "26px 18px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 34, marginBottom: 12 }}>
                    {r.emoji}
                  </div>
                  <div
                    className="fhead"
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: i % 2 === 0 ? "rgba(195,228,145,.95)" : C.ink,
                      marginBottom: 6,
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    className="fbody"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color:
                        i % 2 === 0 ? "rgba(195,228,145,.55)" : C.greenLight,
                      marginBottom: 8,
                    }}
                  >
                    {r.cap}
                  </div>
                  <div
                    className="fbody"
                    style={{
                      fontSize: 12,
                      color: i % 2 === 0 ? "rgba(255,255,255,.42)" : "#8B7060",
                      lineHeight: 1.55,
                    }}
                  >
                    {r.desc}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section
        id="gallery"
        style={{ padding: "110px 36px", background: C.creamDark }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 54 }}>
              <span
                className="fbody"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: C.greenLight,
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Our Gallery
              </span>
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: `linear-gradient(90deg,${C.green},${C.gold})`,
                  margin: "0 auto 20px",
                }}
              />
              <h2
                className="fhead"
                style={{
                  fontSize: "clamp(30px,4vw,50px)",
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                Moments We've{" "}
                <em style={{ color: C.green }}>Created Together</em>
              </h2>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gridTemplateRows: "220px 220px",
              gap: 14,
            }}
            className="galg"
          >
            {[
              {
                label: "Family Feasts",
                emoji: "🍽️",
                bg: `linear-gradient(145deg,${C.green},#152808)`,
                span: "1/3",
              },
              {
                label: "Tropical Setting",
                emoji: "🌿",
                bg: "linear-gradient(145deg,#2a5520,#3d7a25)",
                span: "auto",
              },
              {
                label: "Catering Events",
                emoji: "🥘",
                bg: "linear-gradient(145deg,#8B3A0A,#C0560A)",
                span: "auto",
              },
              {
                label: "Sweet Desserts",
                emoji: "🍮",
                bg: "linear-gradient(145deg,#7A3580,#A050A0)",
                span: "auto",
              },
              {
                label: "Garden Venue",
                emoji: "🌺",
                bg: "linear-gradient(145deg,#1A5066,#2A7A90)",
                span: "1/3",
              },
            ].map((g, i) => (
              <Reveal key={g.label} delay={i * 0.07}>
                <div
                  className="lift"
                  style={{
                    background: g.bg,
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    height: "100%",
                    gridColumn: g.span,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "radial-gradient(circle at 30% 70%,rgba(255,255,255,.07),transparent 60%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      fontSize: g.span === "1/3" ? 62 : 46,
                      marginBottom: 14,
                    }}
                  >
                    {g.emoji}
                  </div>
                  <div
                    className="fhead"
                    style={{
                      color: "rgba(255,255,255,.9)",
                      fontSize: g.span === "1/3" ? 22 : 17,
                      fontWeight: 700,
                    }}
                  >
                    {g.label}
                  </div>
                  <div
                    className="fbody"
                    style={{
                      color: "rgba(255,255,255,.38)",
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      marginTop: 6,
                    }}
                  >
                    View Photos
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        id="reviews"
        style={{
          padding: "110px 36px",
          background: C.cream,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LeafSVG
          style={{
            width: 230,
            bottom: -55,
            right: -55,
            transform: "rotate(118deg)",
          }}
          opacity={0.07}
          flip
        />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 54 }}>
              <span
                className="fbody"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: C.greenLight,
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Testimonials
              </span>
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: `linear-gradient(90deg,${C.green},${C.gold})`,
                  margin: "0 auto 20px",
                }}
              />
              <h2
                className="fhead"
                style={{
                  fontSize: "clamp(30px,4vw,50px)",
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                Words from Our{" "}
                <em style={{ color: C.green }}>Beloved Guests</em>
              </h2>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(265px,1fr))",
              gap: 20,
            }}
          >
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.1}>
                <div
                  className="lift"
                  style={{
                    background: "white",
                    borderRadius: 8,
                    padding: "30px 26px",
                    border: `1px solid ${C.creamDark}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 14,
                      fontSize: 52,
                      color: C.green,
                      opacity: 0.06,
                      fontFamily: "Georgia,serif",
                      lineHeight: 1,
                      fontWeight: 900,
                    }}
                  >
                    "
                  </div>
                  <Stars n={r.stars} />
                  <p
                    className="fbody"
                    style={{
                      fontSize: 14,
                      color: "#5A4A38",
                      lineHeight: 1.85,
                      margin: "14px 0 22px",
                      fontStyle: "italic",
                      fontWeight: 300,
                    }}
                  >
                    "{r.text}"
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      borderTop: `1px solid ${C.creamDark}`,
                      paddingTop: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="fbody"
                        style={{
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {r.init}
                      </span>
                    </div>
                    <div>
                      <div
                        className="fbody"
                        style={{ fontWeight: 600, fontSize: 14, color: C.ink }}
                      >
                        {r.name}
                      </div>
                      <div
                        className="fbody"
                        style={{
                          fontSize: 10,
                          color: C.greenLight,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          marginTop: 2,
                        }}
                      >
                        {r.role}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div
              style={{
                marginTop: 52,
                display: "flex",
                justifyContent: "center",
                gap: 44,
                flexWrap: "wrap",
                padding: "30px 38px",
                background: `linear-gradient(90deg,${C.creamDark},white,${C.creamDark})`,
                borderRadius: 8,
                border: `1px solid ${C.sand}`,
              }}
            >
              {[
                ["4.9★", "Average Rating"],
                ["500+", "Events Catered"],
                ["1,200+", "Happy Guests"],
                ["100%", "Made Fresh"],
              ].map(([n, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div
                    className="fhead"
                    style={{ fontSize: 30, fontWeight: 700, color: C.green }}
                  >
                    {n}
                  </div>
                  <div
                    className="fbody"
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#8B7060",
                      marginTop: 4,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* BOOKING */}
      <section
        id="book"
        style={{
          padding: "110px 36px",
          background: `linear-gradient(155deg,#091505,${C.green})`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(ellipse at 20% 80%, rgba(90,143,53,.2), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(200,134,10,.1), transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <LeafSVG
          style={{
            width: 280,
            bottom: -70,
            left: -55,
            transform: "rotate(-18deg)",
          }}
          opacity={0.11}
        />
        <LeafSVG
          style={{
            width: 190,
            top: -38,
            right: -38,
            transform: "rotate(38deg)",
          }}
          opacity={0.09}
          flip
        />
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 54 }}>
              <span
                className="fbody"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "rgba(195,228,145,.65)",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Make a Reservation
              </span>
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: `linear-gradient(90deg,${C.gold},transparent)`,
                  margin: "0 auto 20px",
                }}
              />
              <h2
                className="fhead"
                style={{
                  fontSize: "clamp(30px,4vw,50px)",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                Book Your{" "}
                <em style={{ color: "rgba(195,228,145,.9)" }}>
                  Sandy's Experience
                </em>
              </h2>
              <p
                className="fbody"
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,.48)",
                  marginTop: 14,
                  maxWidth: 420,
                  margin: "14px auto 0",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                Fill in the form and we'll personally reach out within 24 hours.
                🌿
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div
              style={{
                background: "rgba(255,255,255,.07)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(195,228,145,.13)",
                borderRadius: 10,
                padding: "48px 48px",
                maxWidth: 760,
                margin: "0 auto",
              }}
            >
              {sent ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div
                    style={{
                      fontSize: 68,
                      marginBottom: 18,
                      animation: "floatY 2s ease-in-out infinite",
                    }}
                  >
                    🎉
                  </div>
                  <h3
                    className="fhead"
                    style={{
                      color: "rgba(195,228,145,.95)",
                      fontSize: 30,
                      marginBottom: 10,
                    }}
                  >
                    Salamat po!
                  </h3>
                  <p
                    className="fbody"
                    style={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: 16,
                      fontWeight: 300,
                    }}
                  >
                    We received your booking! Our team will contact you within
                    24 hours.
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 16,
                    }}
                    className="g2"
                  >
                    <div>
                      <label style={{ color: "rgba(195,228,145,.6)" }}>
                        Full Name *
                      </label>
                      <input
                        placeholder="Juan dela Cruz"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={{ color: "rgba(195,228,145,.6)" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="juan@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={{ color: "rgba(195,228,145,.6)" }}>
                        Phone Number *
                      </label>
                      <input
                        placeholder="+63 9XX XXX XXXX"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={{ color: "rgba(195,228,145,.6)" }}>
                        Service *
                      </label>
                      <select
                        value={form.service}
                        onChange={(e) =>
                          setForm({ ...form, service: e.target.value })
                        }
                      >
                        <option value="dining">Dining Reservation</option>
                        <option value="catering">Catering Service</option>
                        <option value="venue">Venue Rental</option>
                        <option value="package">
                          Full Package (Catering + Venue)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: "rgba(195,228,145,.6)" }}>
                        Event Date *
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={{ color: "rgba(195,228,145,.6)" }}>
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        min="1"
                        value={form.guests}
                        onChange={(e) =>
                          setForm({ ...form, guests: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 26 }}>
                    <label style={{ color: "rgba(195,228,145,.6)" }}>
                      Message / Special Requests
                    </label>
                    <textarea
                      placeholder="Tell us about your event, theme, dietary restrictions, or anything special you'd like us to know…"
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                    />
                  </div>
                  <button
                    onClick={submit}
                    className="btn-g"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      fontSize: 14,
                      padding: "16px",
                    }}
                  >
                    Send Booking Request &nbsp;🌿
                  </button>
                  <p
                    className="fbody"
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "rgba(255,255,255,.28)",
                      marginTop: 12,
                      fontWeight: 300,
                    }}
                  >
                    We respond within 24 hours · No spam, ever.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 14,
                marginTop: 36,
                maxWidth: 760,
                margin: "36px auto 0",
              }}
              className="g3"
            >
              {[
                ["📞", "Call Us", "+63 917 123 4567"],
                ["📧", "Email Us", "sandyskitchenette\n@gmail.com"],
                [
                  "📍",
                  "Visit Us",
                  "Camia B St., Brgy. Rio Chico\nGeneral Tinio, Nueva Ecija",
                ],
              ].map(([ic, t, d]) => (
                <div
                  key={t}
                  style={{
                    textAlign: "center",
                    padding: "20px 12px",
                    background: "rgba(255,255,255,.05)",
                    borderRadius: 7,
                    border: "1px solid rgba(195,228,145,.08)",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 9 }}>{ic}</div>
                  <div
                    className="fbody"
                    style={{
                      fontWeight: 600,
                      fontSize: 10,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: "rgba(195,228,145,.6)",
                      marginBottom: 6,
                    }}
                  >
                    {t}
                  </div>
                  <div
                    className="fbody"
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.38)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {d}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#060d03",
          padding: "34px 36px",
          borderTop: `2px solid ${C.green}`,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: `1.5px solid ${C.greenLight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              🍳
            </div>
            <div>
              <span
                className="fhead"
                style={{ fontSize: 17, fontWeight: 700, color: "white" }}
              >
                Sandy's{" "}
              </span>
              <span
                className="fhead"
                style={{
                  fontSize: 17,
                  fontStyle: "italic",
                  color: "rgba(195,228,145,.65)",
                }}
              >
                Kitchenette
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {NAV.slice(0, 6).map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="nav-lnk fbody"
                style={{ color: "rgba(255,255,255,.28)", fontSize: 11 }}
                onMouseEnter={(e) => (e.target.style.color = C.greenLight)}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,.28)")
                }
              >
                {l.label}
              </a>
            ))}
          </div>
          <p
            className="fbody"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.18)",
              letterSpacing: 0.8,
            }}
          >
            © 2025 Sandy's Kitchenette · Made with ❤️ & sarap
          </p>
        </div>
      </footer>
    </div>
  );
}
