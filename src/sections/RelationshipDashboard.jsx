import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";

/**
 * Relationship Dashboard (compact, read-only)
 * - Two rings (inner 4, outer 6) + center
 * - Fixed angles -> no layout jitter
 * - Soft fade/scale entrance; subtle pulse on 🔴 only
 * - Mobile strips for < md
 */
export default function RelationshipDashboard() {
  const prefersReducedMotion = useReducedMotion();

  // Smaller, curated demo set (4 + 6 = 10 nodes)
  const nodes = useMemo(
    () => [
      { id: "you", name: "You", ring: 0, status: "center" },

      // inner ring (VIPs)
      { id: "jennifer", name: "Jennifer", ring: 1, org: "Acme", status: "due" },
      { id: "mike", name: "Mike", ring: 1, org: "Leadership", status: "cold" },
      { id: "sarah", name: "Sarah", ring: 1, org: "Design", status: "healthy" },
      { id: "david", name: "David", ring: 1, org: "Client", status: "healthy" },

      // outer ring (stakeholders/active)
      { id: "noah", name: "Noah", ring: 2, org: "Ops", status: "due" },
      { id: "amy", name: "Amy", ring: 2, org: "Sales", status: "healthy" },
      { id: "priya", name: "Priya", ring: 2, org: "CS", status: "healthy" },
      { id: "liam", name: "Liam", ring: 2, org: "Client", status: "due" },
      { id: "maya", name: "Maya", ring: 2, org: "Investor", status: "cold" },
    ],
    []
  );

  // rotating “Ask” hints
  const hints = useMemo(
    () => ["Who am I neglecting?", "What’s pending with Jennifer?", "Show overdue only."],
    []
  );
  const [hintIdx, setHintIdx] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setHintIdx((i) => (i + 1) % hints.length), 2600);
    return () => clearInterval(id);
  }, [hints.length, prefersReducedMotion]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Title + legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto mb-10 max-w-3xl text-center"
      >
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">See your professional world at a glance.</h2>
        <p className="mt-3 text-lg text-gray-600">Three rings. One priority — your Top 20.</p>
        <div className="mt-3 inline-flex items-center gap-4 text-sm text-gray-600">
          <LegendDot color="emerald" label="Healthy" />
          <LegendDot color="amber" label="Due soon" />
          <LegendDot color="rose" label="Overdue" />
        </div>
      </motion.div>

      {/* Desktop/Tablet: compact radial */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative hidden md:block"
      >
        <CompactRadial data={nodes} prefersReducedMotion={!!prefersReducedMotion} />

        {/* voice hint */}
        <div className="pointer-events-auto mx-auto mt-4 w-full max-w-[640px] rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-center text-sm text-gray-700 shadow-[0_10px_20px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
              <Mic size={14} />
            </span>
            <span className="font-medium">Ask:</span>
            <em className="not-italic text-gray-700">{hints[hintIdx]}</em>
          </span>
          <span className="ml-2 text-gray-500">• Hold the mic in the app</span>
        </div>

        <div className="mt-3 text-center text-xs text-gray-500">Concept preview. Live view in the app.</div>
      </motion.div>

      {/* Mobile: three strips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="md:hidden"
      >
        <MobileStrips data={nodes} />
        <div className="pointer-events-auto mx-auto mt-4 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-center text-sm text-gray-700 shadow-[0_10px_20px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
              <Mic size={14} />
            </span>
            <span className="font-medium">Ask:</span>
            <em className="not-italic text-gray-700">{hints[hintIdx]}</em>
          </span>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500">Concept preview. Live view in the app.</div>
      </motion.div>
    </div>
  );
}

/* ---------------- Compact radial graph ---------------- */

function CompactRadial({ data, prefersReducedMotion }) {
  const SIZE = 540;
  const C = SIZE / 2;

  // fixed radii + fixed angle sets => no jitter
  const R = { center: 0, inner: 130, outer: 220 };
  const ANGLES = {
    inner: [-90, 0, 90, 180], // top, right, bottom, left
    outer: [-135, -60, 15, 75, 150, 210], // aesthetically spaced
  };

  const centerNode = data.find((d) => d.ring === 0);
  const inner = data.filter((d) => d.ring === 1);
  const outer = data.filter((d) => d.ring === 2);

  const toXY = (deg, r) => {
    const rad = (deg - 90) * (Math.PI / 180); // 0° at top
    return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
  };

  // helper: glass chip with colored halo
  const Chip = ({ x, y, name, org, status }) => {
    const { halo, ringClass, pulse } = statusClasses(status);
    return (
      <foreignObject x={x - 58} y={y - 28} width="116" height="56">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
            type: "spring",
            stiffness: 220,
            damping: 22,
            mass: 0.55,
          }}
          className={`pointer-events-none rounded-2xl border border-white/60 bg-white/75 px-3 py-2 text-center backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,.08)] ${ringClass} ${pulse}`}
          style={{
            boxShadow: `0 0 0 8px ${halo} inset, 0 10px 24px rgba(15,23,42,.08)`,
          }}
        >
          <div className="truncate text-[12px] text-gray-500">{org || "\u00A0"}</div>
          <div className="truncate text-sm font-medium">{name}</div>
        </motion.div>
      </foreignObject>
    );
  };

  // helper: center “You”
  const Center = () => (
    <foreignObject x={C - 56} y={C - 56} width="112" height="112">
      <div className="pointer-events-none flex h-[112px] w-[112px] flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/75 text-center backdrop-blur-2xl shadow-[0_10px_30px_rgba(15,23,42,.12)]">
        <div className="text-[12px] text-gray-500">You</div>
        <div className="text-lg font-semibold">Context</div>
      </div>
    </foreignObject>
  );

  // helper: draw straight edges with soft glow (no animated pathLength)
  const Edge = ({ x, y }) => (
    <line
      x1={C}
      y1={C}
      x2={x}
      y2={y}
      stroke="rgba(255,255,255,.6)"
      strokeWidth="1"
      strokeLinecap="round"
      style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.25))" }}
    />
  );

  return (
    <div className="relative mx-auto max-w-[700px]">
      <svg width={SIZE} height={SIZE} role="img" aria-label="Relationship network graph">
        {/* background halo */}
        <defs>
          <radialGradient id="halo2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,.16)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R.outer + 22} fill="url(#halo2)" />

        {/* rings */}
        {[R.inner, R.outer].map((r) => (
          <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1" />
        ))}

        {/* center */}
        {centerNode && <Center />}

        {/* edges + chips */}
        {inner.map((n, i) => {
          const [x, y] = toXY(ANGLES.inner[i % ANGLES.inner.length], R.inner);
          return (
            <g key={n.id}>
              <Edge x={x} y={y} />
              <Chip x={x} y={y} name={n.name} org={n.org} status={n.status} />
            </g>
          );
        })}

        {outer.map((n, i) => {
          const [x, y] = toXY(ANGLES.outer[i % ANGLES.outer.length], R.outer);
          return (
            <g key={n.id}>
              <Edge x={x} y={y} />
              <Chip x={x} y={y} name={n.name} org={n.org} status={n.status} />
            </g>
          );
        })}
      </svg>

      {/* tiny static callout to sell the dream */}
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
          className="pointer-events-none absolute right-2 top-2 rounded-xl border border-white/60 bg-white/80 px-3 py-1 text-xs text-gray-700 backdrop-blur-xl"
        >
          Jennifer • needs reply • due Fri
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- Mobile strips ---------------- */

function MobileStrips({ data }) {
  const overdue = data.filter((d) => d.status === "cold");
  const due = data.filter((d) => d.status === "due");
  const healthy = data.filter((d) => d.status === "healthy");

  return (
    <div className="space-y-6">
      <Strip title="Overdue" color="rose" items={overdue} />
      <Strip title="Due soon" color="amber" items={due} />
      <Strip title="Healthy" color="emerald" items={healthy} />
    </div>
  );
}

function Strip({ title, color, items }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm">
        <LegendDot color={color} />
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
        {items.map((d) => {
          const { halo, ringClass, pulse } = statusClasses(d.status);
          return (
            <div
              key={d.id}
              className={`w-48 shrink-0 snap-start rounded-2xl border border-white/60 bg-white/75 px-3 py-2 text-left backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,.08)] ${ringClass} ${pulse}`}
              style={{ boxShadow: `0 0 0 8px ${halo} inset, 0 10px 24px rgba(15,23,42,.08)` }}
            >
              <div className="truncate text-[12px] text-gray-500">{d.org || "\u00A0"}</div>
              <div className="truncate text-sm font-medium">{d.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function LegendDot({ color = "emerald", label = "" }) {
  const map = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block size-2.5 rounded-full ${map[color]}`} />
      {label ? <span>{label}</span> : null}
    </span>
  );
}

function statusClasses(status) {
  // halo colors (rgba) + ring color classes
  if (status === "healthy")
    return { halo: "rgba(16,185,129,.26)", ringClass: "ring-1 ring-emerald-400/60", pulse: "" };
  if (status === "due")
    return { halo: "rgba(245,158,11,.28)", ringClass: "ring-1 ring-amber-400/60", pulse: "" };
  if (status === "cold")
    return {
      halo: "rgba(244,63,94,.32)",
      ringClass: "ring-1 ring-rose-400/70",
      // gentle pulse only on red
      pulse: "animate-[pulse_2.6s_ease-in-out_infinite]",
    };
  return { halo: "rgba(99,102,241,.18)", ringClass: "", pulse: "" };
}