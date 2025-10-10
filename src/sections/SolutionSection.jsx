import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Type, Mic } from "lucide-react";
import { useSection } from "../hooks/useSection";
import { useMediaQuery } from "../hooks/useMediaQuery";

const MotionDiv = motion.div;
const MotionArticle = motion.article;

export default function SolutionSection() {
  const { ref, isVisible } = useSection();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);

  return (
    <section ref={ref} className="relative overflow-visible px-6 py-24 lg:px-8">
      {/* Full-bleed smart network */}
      {isDesktop ? <BackgroundNetwork isActive={isVisible} /> : <MobileNetworkBackdrop />}

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Context saves you hours — and relationships
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Three principles that make Context unlike any productivity app.
          </p>
        </MotionDiv>

        {/* Pillars */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          <PillarCard
            isVisible={isVisible}
            delay={0.1}
            Icon={Brain}
            title="Relationship Intelligence"
            accent="indigo"
            bullets={[
              "Auto-prioritizes your Top 20",
              "Knows cadence per person",
              "Nudges before things go cold",
            ]}
          />
          <PillarCard
            isVisible={isVisible}
            delay={0.2}
            Icon={Type}
            title="Writing in Your Tone"
            accent="emerald"
            bullets={[
              "Learns how you write to each VIP",
              "Drafts match person-specific tone",
              "One-tap send from your voice",
            ]}
          />
          <PillarCard
            isVisible={isVisible}
            delay={0.3}
            Icon={Mic}
            title="Hands-Free Flow"
            accent="sky"
            bullets={[
              "Voice triage for Gmail",
              "Instant drafts & follow-ups",
              "Smart scheduling from one command",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* =======================
   Optimized Smart Network
   ======================= */
function BackgroundNetwork({ isActive }) {
  const prefersReducedMotion = useReducedMotion();

  // Static configuration - compute once, never changes
  const config = useMemo(() => {
    const nodeCount = 36;
    const W = 1400;
    const H = 800;
    const pad = 20;

    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: rand(pad, W - pad),
      y: rand(pad, H - pad),
      r: rand(1.8, 2.4),
      opacity: rand(0.3, 0.7),
    }));

    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      const nearest = nodes
        .map((n, j) => ({
          j,
          d: i === j ? Infinity : dist(nodes[i].x, nodes[i].y, n.x, n.y),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);

      for (const { j } of nearest) {
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        if (!edges.find((e) => e.a === a && e.b === b)) {
          edges.push({ 
            a, 
            b, 
            opacity: rand(0.15, 0.35)
          });
        }
      }
    }

    return { nodes, edges, W, H };
  }, []);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 4 }).map(() => ({
        x: rand(0, config.W),
        y: rand(0, config.H),
        r: rand(0.8, 1.4),
        delay: rand(0, 2),
        duration: rand(3, 5),
      })),
    [config]
  );

  if (prefersReducedMotion) {
    return <StaticNetwork config={config} className="network-container" />;
  }

  return (
    <div
      className={`network-container pointer-events-none absolute -inset-x-[22%] -inset-y-[18%] -z-10 ${
        isActive ? "network-active" : "network-paused"
      }`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${config.W} ${config.H}`}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      >
        <defs>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>

          <radialGradient id="nodeGrad">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.7)" />
          </radialGradient>

          <linearGradient id="wireGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.5)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.4)" />
          </linearGradient>
        </defs>

        <g className="network-layer">
          {config.edges.map((e, idx) => {
            const n1 = config.nodes[e.a];
            const n2 = config.nodes[e.b];
            return (
              <line
                key={`edge-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="url(#wireGrad)"
                strokeWidth="1"
                strokeOpacity={e.opacity}
                filter="url(#softBlur)"
                className="network-edge"
                style={{
                  animationDelay: `${idx * 0.05}s`,
                  animationDuration: `${rand(8, 14)}s`
                }}
              />
            );
          })}

          {config.nodes.map((n, i) => (
            <circle
              key={`node-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#nodeGrad)"
              fillOpacity={n.opacity}
              filter="url(#softBlur)"
              className="network-node"
              style={{
                animationDelay: `${i * 0.03}s`,
                animationDuration: `${rand(3, 5)}s`
              }}
            />
          ))}

          {sparkles.map((sparkle, i) => (
            <circle
              key={`spark-${i}`}
              cx={sparkle.x}
              cy={sparkle.y}
              r={sparkle.r}
              fill="white"
              className="network-sparkle"
              style={{
                animationDelay: `${sparkle.delay}s`,
                animationDuration: `${sparkle.duration}s`
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function MobileNetworkBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 rounded-[56px] bg-gradient-to-b from-white/85 via-white/70 to-white/30"
    />
  );
}

function StaticNetwork({ config, className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute -inset-x-[22%] -inset-y-[18%] -z-10 opacity-60 ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${config.W} ${config.H}`}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id="nodeGradStatic">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.6)" />
          </radialGradient>
          <linearGradient id="wireGradStatic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.4)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.3)" />
          </linearGradient>
        </defs>
        <g>
          {config.edges.map((e, idx) => {
            const n1 = config.nodes[e.a];
            const n2 = config.nodes[e.b];
            return (
              <line
                key={`edge-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="url(#wireGradStatic)"
                strokeWidth="1"
                strokeOpacity={e.opacity}
              />
            );
          })}
          {config.nodes.map((n, i) => (
            <circle
              key={`node-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#nodeGradStatic)"
              fillOpacity={n.opacity}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* =======================
   Pillar Card
   ======================= */
function PillarCard({ isVisible, delay, Icon: IconComponent, title, bullets = [], accent = "indigo" }) {
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

  const IconEl = IconComponent;

  return (
    <MotionArticle
      initial={{ opacity: 0, y: 14 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 backdrop-blur-xl shadow-[0_8px_28px_rgba(15,23,42,.08)] ring-1 ${accents.ring}`}
    >
      <div className="relative mb-4">
        <div className={`pointer-events-none absolute -inset-6 -z-10 rounded-3xl ${accents.halo} blur-[14px]`} />
        <div className="grid size-12 place-items-center rounded-2xl border border-white/60 bg-white/90 shadow">
          <IconEl size={26} className="text-gray-800" />
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
    </MotionArticle>
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
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}