// ./sections/SolutionSection.jsx
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Type, Mic } from "lucide-react";

export default function SolutionSection() {
  const sectionRef = useRef(null);
  const [highlight, setHighlight] = useState(null);

  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px", amount: 0.3 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <section id="solution" ref={sectionRef} className="relative overflow-visible px-6 py-24 lg:px-8">
      {/* Full-bleed smart network with 3D depth + parallax */}
      <BackgroundNetwork containerRef={sectionRef} highlight={highlight} />

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Context saves you hours — and relationships
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Three principles that make Context unlike any productivity app.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          <PillarCard
            Icon={Brain}
            title="Relationship Intelligence"
            accent="indigo"
            bullets={[
              "Auto-prioritizes your Top 20",
              "Knows cadence per person",
              "Nudges before things go cold",
            ]}
            onHover={(rect) => setHighlight(centerInSection(sectionRef, rect))}
            onLeave={() => setHighlight(null)}
          />
          <PillarCard
            Icon={Type}
            title="Writing in Your Tone"
            accent="emerald"
            bullets={[
              "Learns how you write to each VIP",
              "Drafts match person-specific tone",
              "One-tap send from your voice",
            ]}
            onHover={(rect) => setHighlight(centerInSection(sectionRef, rect))}
            onLeave={() => setHighlight(null)}
          />
          <PillarCard
            Icon={Mic}
            title="Hands-Free Flow"
            accent="sky"
            bullets={[
              "Voice triage for Gmail",
              "Instant drafts & follow-ups",
              "Smart scheduling from one command",
            ]}
            onHover={(rect) => setHighlight(centerInSection(sectionRef, rect))}
            onLeave={() => setHighlight(null)}
          />
        </div>
      </div>
    </section>
  );
}

/* =======================
   Full-bleed Smart Network (3D-ish)
   ======================= */
function BackgroundNetwork({ containerRef, highlight }) {
  const prefersReducedMotion = useReducedMotion();
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [graph, setGraph] = useState({ nodes: [], edges: [], W: 0, H: 0 });

  // Observe section size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  // Generate a larger graph (≈160% both directions) with depth
  useEffect(() => {
    if (!size.w || !size.h) return;

    const W = Math.floor(size.w * 1.6);
    const H = Math.floor(size.h * 1.6);
    const pad = 10;
    const area = W * H;

    // More nodes when bigger; clamp to avoid perf spikes
    const nodeCount = Math.max(100, Math.min(200, Math.floor(area / 18000)));

    // Each node has a depth z ∈ [0,1] (0=far, 1=near)
    const nodes = Array.from({ length: nodeCount }).map((_, i) => {
      const z = Math.random();
      return {
        id: i,
        x: rand(pad, W - pad),
        y: rand(pad, H - pad),
        z,
        r: rand(1.4, 2.2) * (0.8 + z * 0.9), // larger when closer
        blur: z < 0.33 ? "blurL" : z < 0.66 ? "blurM" : "blurS",
      };
    });

    // Connect each node to 3 nearest neighbors; depth = avg(z)
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      const nearest = nodes
        .map((n, j) => ({
          j,
          d: i === j ? Infinity : dist(nodes[i].x, nodes[i].y, n.x, n.y),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);

      for (const { j } of nearest) {
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        if (!edges.find((e) => e.a === a && e.b === b)) {
          const depth = (nodes[a].z + nodes[b].z) / 2;
          edges.push({ a, b, depth });
        }
      }
    }

    setGraph({ nodes, edges, W, H });
  }, [size.w, size.h]);

  // Spotlight opacity near hovered card — corrected for overflow
  const opFor = (x, y, base = 0.22, boost = 0.6) => {
    if (!highlight || !graph.W) return base;
    const offsetX = (graph.W - size.w) / 2;
    const offsetY = (graph.H - size.h) / 2;
    const hx = highlight.x + offsetX;
    const hy = highlight.y + offsetY;
    const sigma = 320; // slightly wider spotlight for big canvas
    const d = dist(x, y, hx, hy);
    const w = Math.exp(-(d * d) / (2 * sigma * sigma));
    return base + boost * w;
  };

  if (!graph.W || !graph.H) return null;

  // Layer helpers
  const edgesByLayer = (edges, layer) =>
    edges.filter((e) =>
      layer === "back" ? e.depth < 0.33 : layer === "mid" ? e.depth < 0.66 : e.depth >= 0.66
    );
  const nodesByLayer = (nodes, layer) =>
    nodes.filter((n) =>
      layer === "back" ? n.z < 0.33 : layer === "mid" ? n.z < 0.66 : n.z >= 0.66
    );

  return (
    // Expand draw area beyond section; gives wide, free look
    <div className="pointer-events-none absolute -inset-x-[22%] -inset-y-[18%] -z-10">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${graph.W} ${graph.H}`}
        className="absolute inset-0"
      >
        <defs>
          {/* Depth-of-field blur variants */}
          <filter id="blurS" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
          </filter>
          <filter id="blurM" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
          </filter>
          <filter id="blurL" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>

          {/* Node glow (radial) */}
          <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.9)" />
          </radialGradient>

          {/* Wires gradient */}
          <linearGradient id="wireGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.65)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.5)" />
          </linearGradient>
        </defs>

        {/* ==== BACK LAYER (far, blurrier, slower) ==== */}
        <motion.g
          animate={
            prefersReducedMotion
              ? {}
              : { x: [-8, 8, -8], y: [0, 2, 0] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          {edgesByLayer(graph.edges, "back").map((e, idx) => {
            const n1 = graph.nodes[e.a];
            const n2 = graph.nodes[e.b];
            const mx = (n1.x + n2.x) / 2;
            const my = (n1.y + n2.y) / 2;
            return (
              <motion.line
                key={`b-edge-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="url(#wireGrad)"
                strokeWidth="0.9"
                strokeOpacity={opFor(mx, my, 0.12, 0.45)}
                filter="url(#blurL)"
                animate={prefersReducedMotion ? {} : { strokeDashoffset: [-20, 20] }}
                transition={{ duration: rand(8, 12), repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
            );
          })}
          {nodesByLayer(graph.nodes, "back").map((n, i) => (
            <motion.circle
              key={`b-node-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#nodeGrad)"
              fillOpacity={opFor(n.x, n.y, 0.18, 0.55)}
              filter="url(#blurL)"
              animate={prefersReducedMotion ? {} : { opacity: [0.45, 0.7, 0.45], scale: [1, 1.06, 1] }}
              transition={{ duration: rand(3.5, 5), repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </motion.g>

        {/* ==== MID LAYER (current) ==== */}
        <motion.g
          animate={
            prefersReducedMotion
              ? {}
              : { x: [-10, 10, -10], y: [0, 3, 0] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          {edgesByLayer(graph.edges, "mid").map((e, idx) => {
            const n1 = graph.nodes[e.a];
            const n2 = graph.nodes[e.b];
            const mx = (n1.x + n2.x) / 2;
            const my = (n1.y + n2.y) / 2;
            return (
              <motion.line
                key={`m-edge-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="url(#wireGrad)"
                strokeWidth="1"
                strokeOpacity={opFor(mx, my, 0.16, 0.55)}
                filter="url(#blurM)"
                animate={prefersReducedMotion ? {} : { strokeDashoffset: [-24, 24] }}
                transition={{ duration: rand(6, 10), repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
            );
          })}
          {nodesByLayer(graph.nodes, "mid").map((n, i) => (
            <motion.circle
              key={`m-node-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#nodeGrad)"
              fillOpacity={opFor(n.x, n.y, 0.24, 0.65)}
              filter="url(#blurM)"
              animate={prefersReducedMotion ? {} : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
              transition={{ duration: rand(2.8, 4.4), repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </motion.g>

        {/* ==== FRONT LAYER (near, sharper, slightly thicker) ==== */}
        <motion.g
          animate={
            prefersReducedMotion
              ? {}
              : { x: [-14, 14, -14], y: [0, 4, 0] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          {edgesByLayer(graph.edges, "front").map((e, idx) => {
            const n1 = graph.nodes[e.a];
            const n2 = graph.nodes[e.b];
            const mx = (n1.x + n2.x) / 2;
            const my = (n1.y + n2.y) / 2;
            return (
              <motion.line
                key={`f-edge-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="url(#wireGrad)"
                strokeWidth="1.2"
                strokeOpacity={opFor(mx, my, 0.22, 0.7)}
                filter="url(#blurS)"
                animate={prefersReducedMotion ? {} : { strokeDashoffset: [-28, 28] }}
                transition={{ duration: rand(5, 8), repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
            );
          })}
          {nodesByLayer(graph.nodes, "front").map((n, i) => (
            <motion.circle
              key={`f-node-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#nodeGrad)"
              fillOpacity={opFor(n.x, n.y, 0.3, 0.8)}
              filter="url(#blurS)"
              animate={prefersReducedMotion ? {} : { opacity: [0.55, 1, 0.55], scale: [1, 1.1, 1] }}
              transition={{ duration: rand(2.4, 3.6), repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* little sparkles on the front layer */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.circle
              key={`spark-${i}`}
              cx={rand(0, graph.W)}
              cy={rand(0, graph.H)}
              r={rand(0.6, 1.2)}
              fill="white"
              opacity={0.5}
              animate={prefersReducedMotion ? {} : { opacity: [0, 1, 0] }}
              transition={{ duration: rand(2, 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              filter="url(#blurS)"
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}

/* =======================
   Pillar Card
   ======================= */
function PillarCard({ Icon, title, bullets = [], accent = "indigo", onHover, onLeave }) {
  const cardRef = useRef(null);

  const accents = {
    indigo: {
      ring: "ring-indigo-400/50",
      halo: "bg-[radial-gradient(circle_at_center,rgba(99,102,241,.16),transparent_62%)]",
      dot: "bg-indigo-500",
      chipBorder: "border-indigo-200",
      chipBg: "bg-indigo-50",
      chipText: "text-indigo-800",
    },
    emerald: {
      ring: "ring-emerald-400/50",
      halo: "bg-[radial-gradient(circle_at_center,rgba(16,185,129,.16),transparent_62%)]",
      dot: "bg-emerald-500",
      chipBorder: "border-emerald-200",
      chipBg: "bg-emerald-50",
      chipText: "text-emerald-800",
    },
    sky: {
      ring: "ring-sky-400/50",
      halo: "bg-[radial-gradient(circle_at_center,rgba(56,189,248,.16),transparent_62%)]",
      dot: "bg-sky-500",
      chipBorder: "border-sky-200",
      chipBg: "bg-sky-50",
      chipText: "text-sky-800",
    },
  }[accent];

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px", amount: 0.25 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 backdrop-blur-xl shadow-[0_8px_28px_rgba(15,23,42,.08)] ring-1 ${accents.ring}`}
      role="article"
      aria-label={title}
      onMouseEnter={() => onHover?.(cardRef.current?.getBoundingClientRect())}
      onMouseLeave={onLeave}
      onFocus={() => onHover?.(cardRef.current?.getBoundingClientRect())}
      onBlur={onLeave}
    >
      <div className="relative mb-4">
        <div className={`pointer-events-none absolute -inset-6 -z-10 rounded-3xl ${accents.halo} blur-[14px]`} />
        <div className="grid size-12 place-items-center rounded-2xl border border-white/60 bg-white/90 shadow">
          <Icon size={26} className="text-gray-800" aria-hidden />
        </div>
      </div>

      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>

      <ul className="mt-3 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={`mt-1 inline-block size-1.5 rounded-full ${accents.dot}`} />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {title === "Relationship Intelligence" && (
          <>
            <Chip {...accents}>Ghost-proofing</Chip>
            <Chip {...accents}>Per-person cadence</Chip>
          </>
        )}
        {title === "Writing in Your Tone" && (
          <>
            <Chip {...accents}>Person-specific style</Chip>
            <Chip {...accents}>Thread-aware drafts</Chip>
          </>
        )}
        {title === "Hands-Free Flow" && (
          <>
            <Chip {...accents}>Voice triage</Chip>
            <Chip {...accents}>One-tap send</Chip>
          </>
        )}
      </div>
    </motion.article>
  );
}

function Chip({ children, chipBorder, chipBg, chipText }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${chipBorder} ${chipBg} px-2.5 py-1 text-[11px] ${chipText}`}>
      {children}
    </span>
  );
}

/* =======================
   Helpers
   ======================= */
function centerInSection(sectionRef, rect) {
  if (!rect || !sectionRef.current) return null;
  const base = sectionRef.current.getBoundingClientRect();
  return { x: rect.left - base.left + rect.width / 2, y: rect.top - base.top + rect.height / 2 };
}
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}