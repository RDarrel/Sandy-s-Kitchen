import { useState, useEffect, useRef } from "react";

const WIFI_DURATION = 180;
const fmt = (s) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

/* ─────────────────────────────────────────
   PERSON SVG
───────────────────────────────────────── */
function Person({ holdItem, dropArm, phoneUp, walking, showPhone, wifiTime }) {
  const rightArmAngle = dropArm ? 38 : -18;
  const leftArmAngle = phoneUp ? -8 : 14;

	  return (
	    <svg
	      viewBox="0 0 160 250"
	      xmlns="http://www.w3.org/2000/svg"
	      style={{
	        width: "100%",
	        height: "auto",
	        display: "block",
	        overflow: "visible",
	      }}
	      className={walking ? "walking" : ""}
	    >
      <defs>
        <linearGradient id="hG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity=".07" />
          <stop offset="100%" stopColor="black" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="246" rx="50" ry="6" fill="rgba(0,0,0,.4)" />
      <g className="leg-la" style={{ transformOrigin: "60px 158px" }}>
        <rect x="52" y="158" width="22" height="60" rx="10" fill="#1f3a5a" />
        <rect x="50" y="158" width="26" height="18" rx="9" fill="#243f60" />
        <rect x="44" y="208" width="34" height="14" rx="7" fill="#0a0f1c" />
        <rect x="46" y="210" width="30" height="8" rx="4" fill="#111828" />
      </g>
      <g className="leg-ra" style={{ transformOrigin: "100px 158px" }}>
        <rect x="86" y="158" width="22" height="60" rx="10" fill="#182f4a" />
        <rect x="84" y="158" width="26" height="18" rx="9" fill="#1e3555" />
        <rect x="82" y="208" width="34" height="14" rx="7" fill="#0a0f1c" />
        <rect x="84" y="210" width="30" height="8" rx="4" fill="#111828" />
      </g>
      <g className="boda">
        <rect
          x="26"
          y="90"
          width="27"
          height="55"
          rx="9"
          fill="#0f2030"
          stroke="#1e3a5f"
          strokeWidth="1.5"
        />
        <rect
          x="31"
          y="97"
          width="17"
          height="5"
          rx="2"
          fill="#1a3a5f"
          opacity=".7"
        />
        <circle
          cx="39"
          cy="134"
          r="4"
          fill="#0a1828"
          stroke="#1e3a5f"
          strokeWidth="1.5"
        />
        <path
          d="M38 90 Q46 83 53 90"
          stroke="#1a3a5f"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="50" y="88" width="68" height="74" rx="14" fill="#1e3c60" />
        <rect
          x="50"
          y="88"
          width="68"
          height="74"
          rx="14"
          fill="url(#hG2)"
          opacity=".4"
        />
        <path
          d="M72 88 Q84 99 96 88"
          stroke="#2a4f7f"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect
          x="65"
          y="136"
          width="37"
          height="18"
          rx="5"
          fill="#182e4a"
          stroke="#1e3a5f"
          strokeWidth="1"
        />
        <rect x="82" y="141" width="3.5" height="7" rx="1.5" fill="#1e3a5f" />
        <rect
          x="57"
          y="99"
          width="19"
          height="13"
          rx="2.5"
          fill="#0a1828"
          stroke="#00ff9f"
          strokeWidth="1"
          opacity=".7"
        />
        <text
          x="66"
          y="109"
          textAnchor="middle"
          fontSize="6"
          fontFamily="Share Tech Mono,monospace"
          fill="#00ff9f"
          opacity=".8"
        >
          ECO
        </text>
        {/* LEFT ARM */}
        <g
          style={{
            transformOrigin: "50px 98px",
            transform: `rotate(${leftArmAngle}deg)`,
            transition: "transform .5s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <rect x="26" y="92" width="28" height="16" rx="8" fill="#1e3c60" />
	          {phoneUp && showPhone && (
	            <g transform="translate(24 96)">
	              <g transform="rotate(14) scale(.42)">
	                <HeldPhone wifiTime={wifiTime} withArms={false} as="g" />
	              </g>
	            </g>
	          )}
          <circle cx="25" cy="100" r="10" fill="#c8916a" />
          <path
            d="M19 95 Q15 100 19 105"
            stroke="#b87858"
            strokeWidth="1.8"
            fill="none"
          />
        </g>
        {/* RIGHT ARM */}
        <g
          style={{
            transformOrigin: "118px 96px",
            transform: `rotate(${rightArmAngle}deg)`,
            transition: "transform .5s cubic-bezier(.4,0,.2,1)",
          }}
	        >
          <rect x="112" y="90" width="38" height="16" rx="8" fill="#1e3c60" />
          <circle cx="150" cy="98" r="10" fill="#c8916a" />
          <path
            d="M156 93 Q160 98 156 103"
            stroke="#b87858"
	            strokeWidth="1.8"
	            fill="none"
	          />
		          {holdItem && !phoneUp && (
		            <text
		              x="148"
		              y="84"
	              fontSize="20"
	              style={{
	                filter:
	                  holdItem === "bottle"
	                    ? "drop-shadow(0 0 5px rgba(0,255,120,.8))"
	                    : "drop-shadow(0 0 5px rgba(255,100,50,.6))",
	              }}
            >
              {holdItem === "bottle" ? "🍶" : "🔩"}
            </text>
          )}
        </g>
        <rect x="74" y="74" width="20" height="16" rx="5" fill="#c8916a" />
        <circle cx="84" cy="52" r="34" fill="#c8916a" />
        <path
          d="M50 48 Q52 20 84 18 Q116 20 118 48 Q112 32 84 34 Q56 34 50 48Z"
          fill="#2a1208"
        />
        <path d="M50 48 Q44 60 48 70 Q50 52 56 47Z" fill="#2a1208" />
        <path d="M118 48 Q124 60 120 70 Q118 52 112 47Z" fill="#2a1208" />
        <ellipse cx="50" cy="54" rx="7" ry="10" fill="#b87e58" />
        <ellipse cx="118" cy="54" rx="7" ry="10" fill="#b87e58" />
        <ellipse cx="50" cy="54" rx="4.5" ry="6" fill="#c8916a" opacity=".6" />
        <ellipse cx="118" cy="54" rx="4.5" ry="6" fill="#c8916a" opacity=".6" />
        <path
          d="M63 39 Q71 35 78 39"
          stroke="#2a1208"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{
            transform: dropArm || phoneUp ? "translateY(-3px)" : "none",
            transition: "transform .3s",
          }}
        />
        <path
          d="M90 39 Q97 35 105 39"
          stroke="#2a1208"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{
            transform: dropArm || phoneUp ? "translateY(-3px)" : "none",
            transition: "transform .3s",
          }}
        />
        <ellipse cx="70" cy="50" rx="6.5" ry="7.5" fill="white" />
        <ellipse cx="98" cy="50" rx="6.5" ry="7.5" fill="white" />
        <circle cx="71" cy="51" r="4.5" fill="#3a2010" />
        <circle cx="99" cy="51" r="4.5" fill="#3a2010" />
        <circle cx="72" cy="52" r="2.8" fill="#0a0808" />
        <circle cx="100" cy="52" r="2.8" fill="#0a0808" />
        <circle cx="73.5" cy="49" r="1.4" fill="white" opacity=".8" />
        <circle cx="101.5" cy="49" r="1.4" fill="white" opacity=".8" />
        <path
          d="M81 59 Q84 64 87 59"
          stroke="#b07858"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {phoneUp ? (
          <path
            d="M71 70 Q84 80 97 70"
            stroke="#1a0808"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : dropArm ? (
          <path
            d="M71 70 Q84 78 97 70"
            stroke="#1a0808"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M73 70 Q84 76 95 70"
            stroke="#1a0808"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        <ellipse cx="59" cy="62" rx="8" ry="4.5" fill="#e8a080" opacity=".2" />
        <ellipse cx="109" cy="62" rx="8" ry="4.5" fill="#e8a080" opacity=".2" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────
   HELD PHONE — big, facing viewer, with arms
───────────────────────────────────────── */
function HeldPhone({ wifiTime, withArms = true, as = "svg", transform }) {
  const pct = wifiTime / WIFI_DURATION;
  const barW = Math.round(pct * 158);
  const urgent = wifiTime <= 30;
  const tc = urgent ? "#ff3355" : "#00d4ff";
  const gc = urgent ? "rgba(255,50,85,.8)" : "rgba(0,212,255,.8)";

	  const inner = (
	    <>
      <defs>
        <linearGradient id="pbody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2d40" />
          <stop offset="100%" stopColor="#0a1420" />
        </linearGradient>
        <linearGradient id="pscreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020c18" />
          <stop offset="100%" stopColor="#030f20" />
        </linearGradient>
        <linearGradient id="pbar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={tc} />
          <stop offset="100%" stopColor={urgent ? "#ff6b35" : "#00ff9f"} />
        </linearGradient>
        <filter id="pglow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pgsm" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* LEFT/RIGHT ARMS holding phone */}
      {withArms && (
        <>
          <rect x="-44" y="212" width="56" height="16" rx="8" fill="#1e3c60" />
          <circle cx="-46" cy="220" r="12" fill="#c8916a" />
          <path
            d="M-52 215 Q-56 220 -52 225"
            stroke="#b87858"
            strokeWidth="1.8"
            fill="none"
          />

          <rect x="168" y="212" width="56" height="16" rx="8" fill="#1e3c60" />
          <circle cx="226" cy="220" r="12" fill="#c8916a" />
          <path
            d="M232 215 Q236 220 232 225"
            stroke="#b87858"
            strokeWidth="1.8"
            fill="none"
          />
        </>
      )}

      {/* phone shadow */}
      <rect
        x="7"
        y="7"
        width="166"
        height="296"
        rx="22"
        fill="rgba(0,0,0,.5)"
      />
      {/* phone body */}
      <rect
        x="3"
        y="3"
        width="174"
        height="304"
        rx="20"
        fill="url(#pbody)"
        stroke="#2a4060"
        strokeWidth="2.5"
      />
      {/* sheen */}
      <rect
        x="3"
        y="3"
        width="24"
        height="304"
        rx="20"
        fill="rgba(255,255,255,.05)"
      />
      {/* buttons */}
      <rect x="0" y="70" width="3" height="24" rx="1.5" fill="#1a2e48" />
      <rect x="0" y="100" width="3" height="24" rx="1.5" fill="#1a2e48" />
      <rect x="177" y="80" width="3" height="36" rx="1.5" fill="#1a2e48" />
      {/* top bar */}
      <rect x="3" y="3" width="174" height="26" rx="20" fill="#0a1525" />
      <rect x="3" y="22" width="174" height="7" fill="#0a1525" />
      {/* notch */}
      <rect x="58" y="6" width="64" height="14" rx="7" fill="#050d18" />
      <circle cx="90" cy="13" r="4" fill="#080f1a" />
      <circle cx="90" cy="13" r="2.2" fill="#0d1826" />
      <circle cx="91.2" cy="11.8" r=".9" fill="rgba(255,255,255,.18)" />
      {/* screen */}
      <rect x="9" y="26" width="162" height="272" rx="5" fill="#030810" />
      <rect
        x="10"
        y="27"
        width="160"
        height="270"
        rx="4"
        fill="url(#pscreen)"
      />
      {/* status bar */}
      <rect
        x="10"
        y="27"
        width="160"
        height="18"
        rx="3"
        fill="rgba(0,0,0,.4)"
      />
      <text
        x="18"
        y="39"
        fontFamily="Share Tech Mono,monospace"
        fontSize="8"
        fill="#3a8faf"
      >
        12:34
      </text>
      <text
        x="140"
        y="39"
        fontFamily="Share Tech Mono,monospace"
        fontSize="8"
        fill="#3a8faf"
      >
        📶🔋
      </text>
      {/* wifi icon */}
      <text
        x="90"
        y="90"
        textAnchor="middle"
        fontSize="28"
        fill={tc}
        filter="url(#pgsm)"
        style={{ animation: "ptick 1s ease-in-out infinite" }}
      >
        📶
      </text>
      <text
        x="90"
        y="106"
        textAnchor="middle"
        fontFamily="Share Tech Mono,monospace"
        fontSize="8"
        fill={urgent ? "#ff6060" : "#3a9fbf"}
        letterSpacing="2"
      >
        {urgent ? "LOW TIME!" : "WIFI ACTIVE"}
      </text>
      {/* BIG TIMER */}
      <text
        x="90"
        y="158"
        textAnchor="middle"
        fontFamily="Orbitron,monospace"
        fontSize="44"
        fontWeight="900"
        fill={tc}
        filter="url(#pglow)"
        style={{ animation: "ptick 1s ease-in-out infinite" }}
      >
        {fmt(wifiTime)}
      </text>
      {/* progress bar */}
      <rect
        x="11"
        y="168"
        width="158"
        height="7"
        rx="3.5"
        fill="rgba(0,0,0,.6)"
      />
      <rect
        x="11"
        y="168"
        width={barW}
        height="7"
        rx="3.5"
        fill="url(#pbar)"
        style={{ animation: "pbar 1s ease-in-out infinite" }}
      />
      <text
        x="90"
        y="186"
        textAnchor="middle"
        fontFamily="Share Tech Mono,monospace"
        fontSize="7.5"
        fill="#2a6f8f"
        letterSpacing="2"
      >
        REMAINING
      </text>
      {/* app grid */}
      {[
        [18, 200, "#1a3a5f", "📱"],
        [52, 200, "#1a3a20", "🌐"],
        [86, 200, "#3a2010", "📷"],
        [120, 200, "#2a1a3a", "🎵"],
        [18, 242, "#1a3a5f", "📧"],
        [52, 242, "#1a2a3a", "🗺"],
        [86, 242, "#3a1a1a", "📞"],
        [120, 242, "#1a3020", "💬"],
      ].map(([x, y, bg, em], i) => (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width="26"
            height="26"
            rx="7"
            fill={bg}
            stroke="rgba(255,255,255,.1)"
            strokeWidth=".7"
            opacity=".75"
          />
          <text x={x + 13} y={y + 18} textAnchor="middle" fontSize="12">
            {em}
          </text>
        </g>
      ))}
      {/* dock */}
      <rect
        x="14"
        y="277"
        width="152"
        height="18"
        rx="9"
        fill="rgba(255,255,255,.04)"
        stroke="rgba(255,255,255,.05)"
        strokeWidth=".8"
      />
      {[
        { x: 20, em: "🏠" },
        { x: 52, em: "🔍" },
        { x: 84, em: "⭐" },
        { x: 116, em: "⚙️" },
      ].map((d, i) => (
        <text key={i} x={d.x} y="291" fontSize="12">
          {d.em}
        </text>
      ))}
      <rect
        x="65"
        y="299"
        width="50"
        height="4"
        rx="2"
        fill="rgba(255,255,255,.2)"
      />
      {/* screen glow border */}
      <rect
        x="10"
        y="27"
        width="160"
        height="270"
        rx="4"
        fill="none"
        stroke={tc}
        strokeWidth="1.5"
        style={{ animation: "pglw 1s ease-in-out infinite", opacity: 0.6 }}
      />
      <rect
        x="3"
        y="3"
        width="174"
        height="304"
        rx="20"
        fill="none"
        stroke={tc}
        strokeWidth="2"
        opacity=".5"
        filter="url(#pgsm)"
        style={{ animation: "pglw 1s ease-in-out infinite" }}
      />

	      <style>{`
	        @keyframes ptick { 0%,100%{opacity:1;} 50%{opacity:.3;} }
	        @keyframes pglw  { 0%,100%{opacity:.5;} 50%{opacity:1;} }
	        @keyframes pbar  { 0%,100%{filter:drop-shadow(0 0 3px ${gc});} 50%{filter:drop-shadow(0 0 8px ${gc});} }
	      `}</style>
	    </>
	  );

	  if (as === "g") {
	    return (
	      <g transform={transform}>
	        <g transform="translate(50 0)">{inner}</g>
	      </g>
	    );
	  }

  return (
    <svg
      viewBox="-50 0 280 310"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {inner}
    </svg>
  );
}

/* ─────────────────────────────────────────
   VENDING MACHINE — compact, slot on left side
───────────────────────────────────────── */
function VendingMachine({
  flash,
  screenText,
  screenCls,
  bottleCount,
  slotGlow,
  dropItem,
}) {
  return (
    <div className={`vm-wrap${flash ? " " + flash : ""}`}>
      {/* SIDE SLOT — left face */}
      <div className={`vm-side-slot${slotGlow ? " " + slotGlow : ""}`}>
        <div className="vm-side-slot-hole">
          {dropItem && (
            <span className="drop-anim" key={dropItem.key}>
              {dropItem.emoji}
            </span>
          )}
        </div>
        <div className="vm-side-slot-lbl">INSERT</div>
      </div>

      <div className="vm-cab">
        <div className="vm-ribs" />
        <div className="vm-shine" />
        <div className="vm-hdr">
          <div className="vm-brand">VENDOPET</div>
          <div className="vm-tagline">♻ ECO · REWARD · WIFI ♻</div>
        </div>
        <div className="vm-eco">
          <span>♻</span>
          <span>BOTTLE → FREE WIFI</span>
        </div>
        <div className="vm-screen-wrap">
          <div className="vm-screen">
            <div className={`vm-scr-txt${screenCls ? " " + screenCls : ""}`}>
              {screenText}
            </div>
          </div>
        </div>
        <div className="vm-prod">
          <div className="vm-prod-items">🍶 🍶 🍶 🍶</div>
          <div className="vm-prod-shelf">
            <div className="vm-shelf-lbl">A1 · A2 · A3 · A4</div>
          </div>
        </div>
        <div className="vm-sensors">
          {[
            { c: "#00ff7f", d: 0, l: "PWR" },
            { c: "#00d4ff", d: 0.7, l: "NET" },
            { c: "#00ff7f", d: 1.4, l: "SYS" },
          ].map((s, i) => (
            <div className="vm-snsr" key={i}>
              <div
                className="vm-snsr-dot"
                style={{
                  animationDelay: `${s.d}s`,
                  background: s.c,
                  boxShadow: `0 0 7px ${s.c},0 0 14px ${s.c}66`,
                }}
              />
              <div className="vm-snsr-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="vm-ctr">
          <span className="vm-ctr-lbl">♻ BOTTLES</span>
          <span className="vm-ctr-val">
            {String(bottleCount).padStart(3, "0")}
          </span>
        </div>
        <div className="vm-vents">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="vm-vent" />
          ))}
        </div>
      </div>
      <div className="vm-base">
        <div className="vm-coin-row">
          <div className="vm-coin-slot" />
          <div className="vm-coin-lbl">COIN</div>
          <div className="vm-base-lights">
            {["#00ff7f", "#00d4ff", "#ff6b35"].map((c, i) => (
              <div
                key={i}
                className="vm-blight"
                style={{
                  background: c,
                  boxShadow: `0 0 5px ${c}88`,
                  animationDuration: `${1.5 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="vm-tray">
          <span className="vm-tray-lbl">▼ TRAY ▼</span>
        </div>
      </div>
    </div>
  );
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 55}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  d: `${2 + Math.random() * 3}s`,
  delay: `${Math.random() * 4}s`,
}));

/* ═══════════════════════════════════════
   CSS
═══════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
	html,body{width:100%;min-height:100vh;
	  background:radial-gradient(ellipse at 50% 0%,#0d1f3c 0%,#060c18 60%,#030810 100%);
	  font-family:'Rajdhani',sans-serif;overflow-x:hidden;}
.sl{position:fixed;inset:0;pointer-events:none;z-index:999;
  background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,160,.004) 3px,rgba(0,255,160,.004) 4px);}
	.app-outer{width:100%;min-height:100vh;display:flex;align-items:stretch;justify-content:stretch;padding:0;}
	.app{display:flex;flex-direction:column;align-items:stretch;width:100%;max-width:none;height:100vh;
	  filter:drop-shadow(0 20px 60px rgba(0,0,0,.8));}

	/* SCENE */
	.scene{width:100%;flex:1;position:relative;overflow:hidden;
	  background:linear-gradient(180deg,#030912 0%,#061020 30%,#081528 55%,#0d1e38 80%,#12243f 100%);
	  border:2px solid #162840;border-bottom:none;border-radius:16px 16px 0 0;}
.stars{position:absolute;inset:0;pointer-events:none;}
.star{position:absolute;border-radius:50%;background:white;
  animation:twinkle var(--d) ease-in-out infinite var(--delay);}
@keyframes twinkle{0%,100%{opacity:.8;}50%{opacity:.1;}}
.ground{position:absolute;bottom:0;left:0;right:0;height:20%;
  background:linear-gradient(180deg,#0c1a2e 0%,#091422 100%);border-top:3px solid #1e3a5f;}
.tiles{position:absolute;inset:0;
  background:repeating-linear-gradient(90deg,transparent 0,transparent calc(7.5% - 1px),rgba(30,58,95,.4) calc(7.5% - 1px),rgba(30,58,95,.4) 7.5%);}
.ground-stripe{position:absolute;top:22%;left:0;right:0;height:3px;
  background:repeating-linear-gradient(90deg,rgba(255,210,60,.18) 0,rgba(255,210,60,.18) 26px,transparent 26px,transparent 60px);}

/* ── VENDING MACHINE — 13% width ── */
	.vm-wrap{position:absolute;right:4%;bottom:8%;width:clamp(110px,14%,170px);z-index:20;
	  filter:drop-shadow(-4px 10px 22px rgba(0,0,0,.85));}
.vm-wrap.acc{animation:mAcc .7s ease;}
.vm-wrap.rej{animation:mRej .6s ease;}
@keyframes mAcc{50%{filter:drop-shadow(0 0 28px rgba(0,255,120,.9));}}
@keyframes mRej{50%{filter:drop-shadow(0 0 28px rgba(255,50,80,.9));}}

/* SIDE SLOT */
.vm-side-slot{position:absolute;left:-18%;top:40%;width:20%;
  display:flex;flex-direction:column;align-items:center;gap:2px;z-index:5;}
.vm-side-slot-hole{width:100%;height:clamp(7px,1.3vw,11px);
  background:#020508;border:1.5px solid #1e3050;border-radius:3px;
  box-shadow:inset 0 2px 6px rgba(0,0,0,.95);position:relative;overflow:visible;
  transition:border-color .3s,box-shadow .3s;}
.vm-side-slot.glow-g .vm-side-slot-hole{border-color:#00ff7f;box-shadow:0 0 10px rgba(0,255,120,.6),inset 0 2px 6px rgba(0,0,0,.95);}
.vm-side-slot.glow-r .vm-side-slot-hole{border-color:#ff3355;box-shadow:0 0 10px rgba(255,50,85,.6),inset 0 2px 6px rgba(0,0,0,.95);}
.vm-side-slot-lbl{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.4vw,3px);color:#2a6f8f;letter-spacing:.1em;}
	.drop-anim{position:absolute;left:50%;top:-240%;
	  font-size:clamp(6px,1vw,8px);pointer-events:none;z-index:20;
	  animation:dropIn .55s cubic-bezier(.2,.9,.4,1) forwards;}
	@keyframes dropIn{
	  0%  {top:-240%;opacity:1;transform:translate(-50%,0) scale(1);}
	  70% {top:6%;    opacity:1;transform:translate(-50%,0) scale(.75);}
	  100%{top:45%;   opacity:0;transform:translate(-50%,0) scale(.45);}
	}

/* MACHINE BODY */
.vm-cab{width:100%;
  background:linear-gradient(165deg,#3a5070 0%,#2a3f5f 8%,#1c2e48 25%,#16253e 55%,#111e32 100%);
  border-radius:9px 9px 0 0;border:2px solid #3a5575;border-bottom:none;position:relative;overflow:hidden;}
.vm-cab::before{content:'';position:absolute;top:0;left:0;bottom:0;width:10%;
  background:linear-gradient(to right,rgba(255,255,255,.18),transparent);pointer-events:none;}
.vm-cab::after{content:'';position:absolute;top:0;right:0;bottom:0;width:10%;
  background:linear-gradient(to left,rgba(255,255,255,.1),transparent);pointer-events:none;}
.vm-ribs{position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(90deg,transparent,transparent 16px,rgba(255,255,255,.01) 16px,rgba(255,255,255,.01) 17px);}
.vm-shine{position:absolute;top:0;left:0;right:0;height:28%;
  background:linear-gradient(180deg,rgba(255,255,255,.06) 0%,transparent 100%);pointer-events:none;}
.vm-hdr{background:linear-gradient(160deg,#0d4025,#196038,#0d4025);
  padding:7% 9% 5%;border-bottom:2px solid #092518;position:relative;overflow:hidden;border-radius:7px 7px 0 0;}
.vm-hdr::before{content:'';position:absolute;inset:0;
  background:linear-gradient(160deg,rgba(255,255,255,.07) 0%,transparent 50%);pointer-events:none;}
.vm-brand{font-family:'Orbitron',monospace;font-size:clamp(5px,1.4vw,10px);font-weight:900;
  color:#00ff9f;letter-spacing:.3em;text-align:center;
  text-shadow:0 0 10px rgba(0,255,140,1),0 0 22px rgba(0,255,140,.5);
  position:relative;z-index:1;animation:brandPls 3s ease-in-out infinite;}
@keyframes brandPls{
  0%,100%{text-shadow:0 0 10px rgba(0,255,140,1),0 0 22px rgba(0,255,140,.5);}
  50%{text-shadow:0 0 18px #00ff9f,0 0 40px rgba(0,255,140,.7);}
}
.vm-tagline{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.55vw,4px);
  color:#40c080;letter-spacing:.18em;text-align:center;margin-top:2px;opacity:.8;position:relative;z-index:1;}
.vm-eco{display:flex;align-items:center;justify-content:center;gap:3px;
  background:rgba(0,50,25,.5);border-top:1px solid #1a5030;border-bottom:1px solid #1a5030;
  padding:2px 4px;font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.45vw,3.5px);color:#3abf7f;letter-spacing:.12em;}
.vm-screen-wrap{margin:5% 8% 0;background:#040404;border:2px solid #181818;
  border-radius:4px;padding:2px;box-shadow:inset 0 3px 8px rgba(0,0,0,.9);}
.vm-screen{background:#030f08;border-radius:3px;aspect-ratio:3/1.9;
  display:flex;align-items:center;justify-content:center;
  position:relative;overflow:hidden;padding:4px;}
.vm-screen::before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,100,.018) 2px,rgba(0,255,100,.018) 3px);}
.vm-scr-txt{font-family:'Share Tech Mono',monospace;font-size:clamp(3px,.75vw,6px);
  color:#00ff7f;text-align:center;line-height:1.7;text-shadow:0 0 8px rgba(0,255,120,.8);
  white-space:pre-line;z-index:4;position:relative;}
.vm-scr-txt.red{color:#ff3355;text-shadow:0 0 8px rgba(255,50,85,.8);}
.vm-scr-txt.blue{color:#00d4ff;text-shadow:0 0 8px rgba(0,212,255,.8);}
.vm-prod{margin:4% 8% 0;background:#020609;border:1.5px solid #1a2a40;border-radius:4px;
  aspect-ratio:3/1;position:relative;overflow:hidden;}
.vm-prod::before{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 9px,rgba(30,60,100,.15) 9px,rgba(30,60,100,.15) 10px);}
.vm-prod-items{position:absolute;top:6%;left:0;right:0;
  display:flex;justify-content:space-around;padding:0 5%;font-size:clamp(5px,1.1vw,9px);}
.vm-prod-shelf{position:absolute;bottom:0;left:0;right:0;height:22%;
  background:linear-gradient(180deg,#1a3050,#0f2035);border-top:1.5px solid #2a4060;
  display:flex;align-items:center;justify-content:center;}
.vm-shelf-lbl{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.4vw,3px);color:#1a3a5f;letter-spacing:.12em;}
.vm-sensors{display:flex;justify-content:center;gap:8%;margin:4% 8% 0;}
.vm-snsr{display:flex;flex-direction:column;align-items:center;gap:2px;}
.vm-snsr-dot{width:clamp(3px,.55vw,4.5px);height:clamp(3px,.55vw,4.5px);border-radius:50%;
  animation:sensorBlink 2s ease-in-out infinite;}
.vm-snsr-lbl{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.38vw,3px);color:#1a3a5f;letter-spacing:.1em;}
@keyframes sensorBlink{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.15;transform:scale(.7);}}
.vm-ctr{margin:4% 8% 0;background:#04100a;border:1px solid #1a4028;border-radius:4px;
  padding:3% 6%;display:flex;align-items:center;justify-content:space-between;}
.vm-ctr-lbl{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.42vw,3.2px);color:#2a7f4f;letter-spacing:.1em;}
.vm-ctr-val{font-family:'Orbitron',monospace;font-size:clamp(5px,1.1vw,10px);font-weight:700;
  color:#00ff7f;text-shadow:0 0 8px rgba(0,255,120,.8);letter-spacing:.2em;}
.vm-vents{margin:4% 13% 0;display:flex;flex-direction:column;gap:3px;padding-bottom:9%;}
.vm-vent{height:3px;border-radius:2px;
  background:linear-gradient(90deg,transparent 0%,#0f2030 10%,#1a3550 50%,#0f2030 90%,transparent 100%);
  box-shadow:inset 0 1px 2px rgba(0,0,0,.8);}
.vm-base{width:100%;background:linear-gradient(180deg,#131f32,#0d1828);
  border:2px solid #2a4060;border-top:1.5px solid #1a2e4a;border-radius:0 0 8px 8px;padding:0 8%;}
.vm-coin-row{display:flex;align-items:center;justify-content:space-between;padding:5% 0;border-bottom:1px solid #162640;}
.vm-coin-slot{width:34%;height:clamp(4px,.8vw,6px);background:#020508;border:1.5px solid #1a3050;
  border-radius:3px;box-shadow:inset 0 2px 6px rgba(0,0,0,.95);}
.vm-coin-lbl{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.42vw,3.2px);color:#1a3a5f;letter-spacing:.1em;}
.vm-base-lights{display:flex;gap:4px;}
.vm-blight{width:clamp(3px,.5vw,4px);height:clamp(3px,.5vw,4px);border-radius:50%;animation:sensorBlink ease-in-out infinite;}
.vm-tray{height:clamp(9px,2vw,14px);background:linear-gradient(180deg,#03060a,#020508);
  border:1.5px solid #1a3050;border-radius:0 0 6px 6px;margin:0 -1px;
  display:flex;align-items:center;justify-content:center;box-shadow:inset 0 3px 8px rgba(0,0,0,.9);}
.vm-tray-lbl{font-family:'Share Tech Mono',monospace;font-size:clamp(2px,.38vw,3px);color:#1a2e40;letter-spacing:.2em;}

/* WIFI WAVES */
	.waves{position:absolute;bottom:55%;right:11%;pointer-events:none;z-index:25;}
.wave{position:absolute;border-radius:50%;border:2px solid rgba(0,210,255,.65);opacity:0;}
.wave:nth-child(1){width:2.5vw;height:2.5vw;margin:-1.25vw 0 0 -1.25vw;animation:wExp 1.3s ease-out infinite 0s;}
.wave:nth-child(2){width:4.5vw;height:4.5vw;margin:-2.25vw 0 0 -2.25vw;animation:wExp 1.3s ease-out infinite .4s;}
.wave:nth-child(3){width:6.5vw;height:6.5vw;margin:-3.25vw 0 0 -3.25vw;animation:wExp 1.3s ease-out infinite .8s;}
@keyframes wExp{0%{opacity:.85;transform:scale(.2);}100%{opacity:0;transform:scale(1);}}
.waves.off{display:none;}

/* PERSON */
	.person-anchor{position:absolute;bottom:17%;z-index:30;}
	.person-svg-wrap{width:clamp(60px,13vw,105px);position:relative;overflow:visible;}
.person-anchor.wi{animation:pWalkIn 2.2s cubic-bezier(.4,0,.55,1) forwards;}
.person-anchor.st{left:12%;}
	.person-anchor.ap{animation:pApproach 1.2s cubic-bezier(.4,0,.55,1) forwards;}
	.person-anchor.cl{left:68%;}
	.person-anchor.bk{animation:pBack .6s cubic-bezier(.2,.9,.3,1) forwards;}
	.person-anchor.wa{animation:pWalkOut 2.8s cubic-bezier(.4,0,.6,1) forwards;}
	@keyframes pWalkIn  {from{left:-25%;}to{left:12%;}}
	@keyframes pApproach{from{left:12%;}to{left:68%;}}
	@keyframes pBack    {from{left:68%;}to{left:56%;}}
	@keyframes pWalkOut {from{left:12%;}to{left:115%;}}

.walking .leg-la{animation:legLa .38s steps(2,end) infinite;transform-origin:50% 0%;}
.walking .leg-ra{animation:legRa .38s steps(2,end) infinite;transform-origin:50% 0%;}
.walking .boda  {animation:bBob  .38s steps(2,end) infinite;}
	@keyframes legLa{0%{transform:rotate(22deg);}50%{transform:rotate(-22deg);}100%{transform:rotate(22deg);}}
	@keyframes legRa{0%{transform:rotate(-22deg);}50%{transform:rotate(22deg);}100%{transform:rotate(-22deg);}}
	@keyframes bBob {0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}

	/* HAND → SLOT DROP (from the person's hand to the machine slot) */
	.hand-drop{position:absolute;left:66%;bottom:56%;z-index:40;pointer-events:none;
	  font-size:clamp(14px,2.4vw,26px);
	  filter:drop-shadow(0 8px 14px rgba(0,0,0,.75));
	  --dx:13vw;--dy:-2vh;
	  animation:handToSlot .65s cubic-bezier(.2,.9,.4,1) forwards;}
	@keyframes handToSlot{
	  0%  {opacity:1;transform:translate(-50%,-50%) scale(1);}
	  70% {opacity:1;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.72);}
	  100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.35);}
	}

/* PHONE SCENE — full overlay, person holds phone toward viewer */


	/* PANEL */
	.panel{width:100%;flex:0 0 auto;background:linear-gradient(160deg,#0e1828,#0a1220);
	  border:2px solid #1a3050;border-top:none;border-radius:0 0 16px 16px;
	  padding:clamp(6px,1.1vw,10px) clamp(8px,1.6vw,14px);position:relative;}
.panel::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 0%,rgba(0,255,140,.04),transparent 50%);
  pointer-events:none;border-radius:0 0 16px 16px;}
	.panel-head{display:flex;align-items:center;justify-content:space-between;
	  margin-bottom:clamp(4px,.7vw,8px);gap:8px;flex-wrap:wrap;}
	.p-title{font-family:'Orbitron',monospace;font-size:clamp(10px,1.9vw,16px);font-weight:900;
	  color:#00ff9f;letter-spacing:.3em;
	  text-shadow:0 0 12px rgba(0,255,140,.8),0 0 28px rgba(0,255,140,.35);animation:brandPls 3s ease-in-out infinite;}
	.p-sub{font-size:clamp(5px,.7vw,7px);color:#2a6f5f;letter-spacing:.22em;margin-top:1px;}
	.reset-btn{background:transparent;border:1.5px solid #1e3a5f;color:#3a7faf;
	  font-family:'Share Tech Mono',monospace;font-size:clamp(6px,.75vw,8px);letter-spacing:.14em;
	  padding:clamp(4px,.7vw,6px) clamp(7px,1.1vw,12px);border-radius:6px;cursor:pointer;transition:all .2s;white-space:nowrap;}
.reset-btn:hover{color:#00d4ff;border-color:#00d4ff;box-shadow:0 0 14px rgba(0,212,255,.25);}
	.hdiv{height:1px;background:linear-gradient(90deg,transparent,#1e3a5f,transparent);margin-bottom:clamp(4px,.7vw,8px);}
	.panel-body{display:flex;gap:clamp(5px,.8vw,10px);align-items:stretch;flex-wrap:wrap;}
	.status-bar{background:#050d18;border:1px solid #1e3a5f;border-radius:7px;
	  padding:clamp(4px,.7vw,6px) clamp(7px,1vw,10px);display:flex;align-items:center;gap:8px;
	  margin-bottom:clamp(4px,.7vw,8px);min-height:26px;}
.sdot{width:9px;height:9px;border-radius:50%;background:#00ff9f;
  box-shadow:0 0 8px rgba(0,255,140,.8);flex-shrink:0;animation:blink 1.5s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.1;}}
.sdot.r{background:#ff3355;box-shadow:0 0 8px rgba(255,50,85,.8);}
.sdot.b{background:#00d4ff;box-shadow:0 0 8px rgba(0,212,255,.8);}
	.status-text{font-size:clamp(8px,1.15vw,10px);color:#00ff9f;letter-spacing:.05em;line-height:1.25;}
.status-text.r{color:#ff3355;}.status-text.b{color:#00d4ff;}
	.choices-col{flex:1.4;display:flex;flex-direction:column;min-width:160px;}
	.clbl{font-size:clamp(5px,.7vw,7px);color:#2a5f7f;letter-spacing:.22em;margin-bottom:4px;font-family:'Share Tech Mono',monospace;}
	.crow{display:flex;gap:clamp(5px,.8vw,8px);}
	.cbtn{flex:1;padding:clamp(6px,.9vw,8px) 10px;border-radius:10px;border:2px solid;background:transparent;cursor:pointer;
	  font-family:'Rajdhani',sans-serif;font-size:clamp(7px,.95vw,9px);font-weight:700;letter-spacing:.07em;line-height:1.05;
	  display:flex;flex-direction:column;align-items:center;gap:5px;transition:all .2s;position:relative;overflow:hidden;}
.cbtn::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .2s;}
.cbtn:disabled{opacity:.28;cursor:not-allowed;}
.cb-b{border-color:#00ff9f;color:#00ff9f;}
.cb-b::before{background:radial-gradient(ellipse at center,rgba(0,255,140,.13),transparent 70%);}
.cb-b:not(:disabled):hover{box-shadow:0 0 28px rgba(0,255,140,.4);transform:translateY(-3px);}
.cb-b:not(:disabled):hover::before{opacity:1;}
.cb-m{border-color:#ff6b35;color:#ff6b35;}
.cb-m::before{background:radial-gradient(ellipse at center,rgba(255,107,53,.13),transparent 70%);}
.cb-m:not(:disabled):hover{box-shadow:0 0 28px rgba(255,107,53,.4);transform:translateY(-3px);}
.cb-m:not(:disabled):hover::before{opacity:1;}
	.cico{font-size:clamp(14px,2.2vw,20px);}
	.stats-col{min-width:112px;display:flex;flex-direction:column;gap:4px;}
	.slbl{font-size:clamp(5px,.7vw,7px);color:#2a5f7f;letter-spacing:.22em;font-family:'Share Tech Mono',monospace;margin-bottom:1px;}
	.srow{display:flex;gap:6px;}
	.sbox{flex:1;background:#050d18;border:1px solid #1e3a5f;border-radius:7px;padding:clamp(4px,.7vw,6px) 6px;text-align:center;}
	.sval{font-family:'Orbitron',monospace;font-size:clamp(12px,2vw,16px);color:#00ff9f;font-weight:700;}
	.skey{font-size:clamp(4px,.6vw,6px);color:#2a6f5f;letter-spacing:.16em;margin-top:1px;font-family:'Share Tech Mono',monospace;}
	.sbox-wide{background:#050d18;border:1px solid #1e3a5f;border-radius:8px;
	  padding:clamp(4px,.7vw,6px);display:flex;align-items:center;justify-content:space-between;}
.steps{display:flex;gap:6px;margin-bottom:4px;}
.sp{width:7px;height:7px;border-radius:50%;background:#0a1828;border:1px solid #1e3a5f;transition:all .4s;}
.sp.done{background:#00ff9f;box-shadow:0 0 7px rgba(0,255,140,.8);}
.sp.act{background:#00d4ff;box-shadow:0 0 7px rgba(0,212,255,.8);animation:dotP .8s ease-in-out infinite;}
@keyframes dotP{0%,100%{transform:scale(1);}50%{transform:scale(1.7);}}
`;

/* ═══════════════════════════════════════
   MAIN APP
═══════════════════════════════════════ */
export default function VendoPet() {
  const [scene, setScene] = useState("boot");
  const [choice, setChoice] = useState(null);
  const [wifiTime, setWifiTime] = useState(WIFI_DURATION);
  const [bottleCount, setBottleCount] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [showWaves, setShowWaves] = useState(false);
  const [mFlash, setMFlash] = useState("");
  const [screenText, setScreenText] = useState(
    "INSERT PLASTIC\nBOTTLE TO GET\nFREE WIFI ACCESS",
  );
  const [screenCls, setScreenCls] = useState("");
  const [slotGlow, setSlotGlow] = useState("");
  const [dropItem, setDropItem] = useState(null);
  const [handDrop, setHandDrop] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const wifiRef = useRef(null);

  const isWalking = ["walk-in", "walk-toward", "walk-away"].includes(scene);
  const isDropArm = scene === "dropping";
  const isPhoneUp = scene === "wifi";

	  const anchorCls =
	    scene === "walk-in"
	      ? "wi"
	      : scene === "walk-toward"
	        ? "ap"
	        : ["close", "dropping", "accepted", "rejected"].includes(scene)
	          ? "cl"
	          : ["step-back", "wifi"].includes(scene)
	            ? "bk"
	          : scene === "walk-away"
	            ? "wa"
	            : "st";

  useEffect(() => {
    const t1 = setTimeout(() => setScene("walk-in"), 200);
    const t2 = setTimeout(() => setScene("idle"), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function doFlash(cls) {
    setMFlash(cls);
    setTimeout(() => setMFlash(""), 800);
  }

  function handleChoice(type) {
    if (scene !== "idle") return;
    setChoice(type);
    setScene("walk-toward");
    setScreenText("DETECTING\nMOTION...");

    setTimeout(() => {
      setScene("close");
      setScreenText("INSERT ITEM\nINTO SLOT");
      setTimeout(() => {
        setScene("dropping");
        const emoji = type === "bottle" ? "🍶" : "🔩";
	        setSlotGlow(type === "bottle" ? "glow-g" : "glow-r");
	        setDropItem({ emoji, key: Date.now() });
	        setHandDrop({ emoji, key: Date.now() + 1 });
	        setScreenText("SCANNING\nITEM...");
	        setTimeout(() => setHandDrop(null), 650);

	        setTimeout(() => {
	          setDropItem(null);
	          setHandDrop(null);
	          setSlotGlow("");

          if (type === "bottle") {
            doFlash("acc");
            setBottleCount((c) => c + 1);
            setSessions((s) => s + 1);
            setScreenText("✓ BOTTLE\nACCEPTED!\nCONNECTING...");
	            setScreenCls("");
	            setScene("accepted");
	            setTimeout(() => {
	              setShowPhone(false);
	              setShowWaves(false);
	              setScene("step-back");
	            }, 1100);

	            setTimeout(() => {
	              setScene("wifi");
	              setShowWaves(true);
	              setShowPhone(true);
              setScreenText("📶 WIFI\nACTIVE\nCHECK PHONE");
              setScreenCls("blue");
              let t = WIFI_DURATION;
              setWifiTime(t);
              clearInterval(wifiRef.current);
              wifiRef.current = setInterval(() => {
                t -= 1;
                setWifiTime(t);
                if (t <= 0) {
                  clearInterval(wifiRef.current);
                  setShowPhone(false);
                  setShowWaves(false);
                  setChoice(null);
                  setScene("walk-away");
                  setScreenText("SESSION\nCOMPLETE!\nTHANK YOU ♻");
                  setScreenCls("");
                  setTimeout(() => {
                    setScene("walk-in");
                    setScreenText(
                      "INSERT PLASTIC\nBOTTLE TO GET\nFREE WIFI ACCESS",
                    );
                    setTimeout(() => setScene("idle"), 2500);
                  }, 2900);
                }
              }, 1000);
            }, 1800);
          } else {
            doFlash("rej");
            setScreenText("✗ REJECTED!\nMETAL DETECTED.\nBOTTLE ONLY!");
            setScreenCls("red");
            setScene("rejected");
            setTimeout(() => {
              setChoice(null);
              setScene("walk-away");
              setTimeout(() => {
                setScreenText(
                  "INSERT PLASTIC\nBOTTLE TO GET\nFREE WIFI ACCESS",
                );
                setScreenCls("");
                setScene("walk-in");
                setTimeout(() => setScene("idle"), 2500);
              }, 2900);
            }, 1800);
          }
        }, 750);
      }, 600);
    }, 1200);
  }

	  function handleReset() {
	    clearInterval(wifiRef.current);
	    setBottleCount(0);
	    setSessions(0);
	    setChoice(null);
	    setShowWaves(false);
	    setMFlash("");
	    setSlotGlow("");
	    setDropItem(null);
	    setHandDrop(null);
	    setShowPhone(false);
	    setScreenText("INSERT PLASTIC\nBOTTLE TO GET\nFREE WIFI ACCESS");
	    setScreenCls("");
	    setWifiTime(WIFI_DURATION);
	    setScene("walk-in");
    setTimeout(() => setScene("idle"), 2600);
  }

  useEffect(() => () => clearInterval(wifiRef.current), []);

  const STEPS = [
    "WALK IN",
    "IDLE",
    "APPROACH",
    "DROP",
    "ACCEPTED",
    "WIFI",
    "LEAVE",
  ];
	  const STEP_MAP = {
	    "walk-in": 0,
	    idle: 1,
	    "walk-toward": 2,
	    close: 2,
	    dropping: 3,
	    accepted: 4,
	    rejected: 4,
	    "step-back": 4,
	    wifi: 5,
	    "walk-away": 6,
	  };
  const stepIdx = STEP_MAP[scene] ?? 1;
  const disabled = scene !== "idle";

  const STATUS = {
    boot: { t: "INITIALIZING VENDOPET...", c: "" },
    "walk-in": { t: "Someone is approaching...", c: "" },
    idle: { t: "Ready. Choose what to insert.", c: "" },
    "walk-toward": { t: "Walking to the slot — item in hand...", c: "" },
    close: { t: "Standing at the side slot.", c: "" },
	    dropping: { t: "Inserting item into the slot...", c: "" },
	    "step-back": { t: "Stepping back... then showing the phone.", c: "" },
    accepted: { t: "✓ Bottle accepted! WiFi connecting...", c: "" },
    rejected: { t: "✗ Metal rejected! Plastic bottles only.", c: "r" },
    wifi: { t: "📶 WiFi active! Phone facing you — see the timer.", c: "b" },
    "walk-away": { t: "Session done. Thanks for recycling! ♻", c: "" },
  };
  const s = STATUS[scene] || STATUS.idle;

  return (
    <>
      <style>{css}</style>
      <div className="sl" />
      <div className="app-outer">
        <div className="app">
          <div className="scene">
            <div className="stars">
              {STARS.map((st) => (
                <div
                  key={st.id}
                  className="star"
                  style={{
                    top: st.top,
                    left: st.left,
                    width: st.size,
                    height: st.size,
                    "--d": st.d,
                    "--delay": st.delay,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(ellipse at 68% 55%,rgba(0,220,120,.07) 0%,transparent 40%),radial-gradient(ellipse at 30% 70%,rgba(0,100,255,.04) 0%,transparent 35%)",
              }}
            />
            <div className="ground">
              <div className="tiles" />
              <div className="ground-stripe" />
            </div>

            {/* PERSON */}
	            <div
	              className={`person-anchor ${anchorCls}`}
	              style={anchorCls === "st" ? { left: "12%" } : undefined}
	            >
	              <div className="person-svg-wrap">
	                <Person
	                  holdItem={choice && !isPhoneUp ? choice : null}
	                  dropArm={isDropArm}
	                  phoneUp={isPhoneUp}
	                  walking={isWalking}
	                  showPhone={showPhone}
	                  wifiTime={wifiTime}
	                />
	              </div>
	            </div>

	            {handDrop && (
	              <div className="hand-drop" key={handDrop.key}>
	                {handDrop.emoji}
	              </div>
	            )}

	            <div className={`waves${showWaves ? "" : " off"}`}>
	              <div className="wave" />
	              <div className="wave" />
	              <div className="wave" />
            </div>

            <VendingMachine
              flash={mFlash}
              screenText={screenText}
              screenCls={screenCls}
              bottleCount={bottleCount}
              slotGlow={slotGlow}
              dropItem={dropItem}
            />


	          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="p-title">VENDOPET</div>
                <div className="p-sub">ECO-REWARD WIFI STATION · v3.0</div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div className="steps">
                  {STEPS.map((label, i) => (
                    <div
                      key={i}
                      title={label}
                      className={`sp${i < stepIdx ? " done" : i === stepIdx ? " act" : ""}`}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "clamp(6px,0.8vw,7px)",
                    color: "#2a5f7f",
                    fontFamily: "Share Tech Mono",
                    letterSpacing: 2,
                  }}
                >
                  {STEPS[stepIdx] || ""}
                </div>
              </div>
              <button className="reset-btn" onClick={handleReset}>
                [ RESET ]
              </button>
            </div>
            <div className="hdiv" />
            <div className="status-bar">
              <div className={`sdot${s.c ? " " + s.c : ""}`} />
              <div className={`status-text${s.c ? " " + s.c : ""}`}>{s.t}</div>
            </div>
            <div className="panel-body">
              <div className="choices-col">
                <div className="clbl">[ SELECT ITEM TO INSERT ]</div>
                <div className="crow">
                  <button
                    className="cbtn cb-b"
                    disabled={disabled}
                    onClick={() => handleChoice("bottle")}
                  >
                    <span className="cico">🍶</span>
                    <span>PLASTIC BOTTLE</span>
                  </button>
                  <button
                    className="cbtn cb-m"
                    disabled={disabled}
                    onClick={() => handleChoice("metal")}
                  >
                    <span className="cico">🔩</span>
                    <span>METAL / OTHER</span>
                  </button>
                </div>
              </div>
              <div className="stats-col">
                <div className="slbl">[ STATISTICS ]</div>
                <div className="srow">
                  <div className="sbox">
                    <div className="sval">{bottleCount}</div>
                    <div className="skey">BOTTLES</div>
                  </div>
                  <div className="sbox">
                    <div className="sval">{sessions}</div>
                    <div className="skey">SESSIONS</div>
                  </div>
                </div>
                <div className="sbox-wide">
                  <div className="skey">TOTAL MINUTES EARNED</div>
	                  <div
	                    style={{
	                      fontFamily: "Orbitron,monospace",
	                      fontSize: "clamp(12px,1.9vw,18px)",
	                      color: "#00ff9f",
	                      fontWeight: 700,
	                    }}
	                  >
                    {bottleCount * 3}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
