// ClaroBrainOverlay.jsx — Scalable + crash-safe with compact mobile design
// - Canvas scene scales on desktop
// - Tiny widths fall back to a compact, intentional mobile card (no canvas)
// - Cleanly switches back/forth without glitches

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";

/* ---------------- helpers ---------------- */
const centerOf = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
const relTo = (base, p) => ({ x: p.x - base.left, y: p.y - base.top });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function makeCurve(from, to, bulge = 42) {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -(dy / len) * bulge;
  const ny = (dx / len) * bulge;
  const c = { x: mid.x + nx, y: mid.y + ny };
  return { p0: from, p1: c, p2: to };
}
const quadPoint = (t, p0, p1, p2) => {
  const u = 1 - t;
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
  return { x, y };
};
const sampleCurve = (curve, STEPS = 64) => {
  const pts = new Array(STEPS + 1);
  const lens = new Array(STEPS + 1);
  let prev = curve.p0;
  let acc = 0;
  pts[0] = curve.p0;
  lens[0] = 0;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const p = quadPoint(t, curve.p0, curve.p1, curve.p2);
    acc += Math.hypot(p.x - prev.x, p.y - prev.y);
    pts[i] = p;
    lens[i] = acc;
    prev = p;
  }
  return { pts, lens, total: acc, steps: STEPS };
};
const posAtLength = (lookup, target) => {
  const { pts, lens, steps } = lookup;
  if (target <= 0) return pts[0];
  if (target >= lens[steps]) return pts[steps];
  let lo = 0,
    hi = steps;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lens[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const segLen = lens[i] - lens[i - 1] || 1;
  const t = (target - lens[i - 1]) / segLen;
  const a = pts[i - 1],
    b = pts[i];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

// color helpers
function hexToRgb(hex) {
  let s = hex.replace("#", "");
  if (s.length === 8) s = s.slice(0, 6);
  if (s.length === 3)
    s = s
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const mixRgb = (a, b, t) => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
});
const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

/* ---------------- tiny typewriter for the quote ---------------- */
function useTypewriter(text, { enabled, speed = 18 }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    let i = 0;
    setOut("");
    const id = setInterval(
      () => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      },
      Math.max(6, speed),
    );
    return () => clearInterval(id);
  }, [text, enabled, speed]);
  return out;
}

/* ---------------- pieces ---------------- */
function AIBubble({
  text,
  prefersReducedMotion,
  brandWarm = "#e07a5f",
  brandCool = "#3d405b",
}) {
  const typed = useTypewriter(text, {
    enabled: !prefersReducedMotion,
    speed: 20,
  });
  return (
    <motion.div
      key={text}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="inline-flex items-start gap-3 rounded-3xl px-5 py-3.5 shadow-2xl backdrop-blur-lg max-w-[22rem]"
      style={{
        background: "rgba(255,255,255,0.95)",
        border: "1px solid rgba(255,255,255,0.35)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.16), 0 0 0 1px rgba(61,64,91,0.15)",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden"
        style={{
          background: `${brandWarm}22`,
          boxShadow: `0 0 0 2px ${brandWarm}22 inset`,
        }}
      >
        {/* Animated orange wavelength bars */}
        <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-[2px] rounded-full"
              style={{ background: brandWarm, height: 8 }}
              animate={{
                height: [6, 16, 6],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: i * 0.12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-[16px] leading-snug text-slate-800">{typed}</p>
    </motion.div>
  );
}

function PillarCapsule({
  title,
  tech,
  accent = "#ffffff",
  x,
  y,
  active,
  delay = 0,
  prefersReducedMotion,
  nodeRef,
  onHoverStart,
  onHoverEnd,
  brandCool = "#3d405b",
}) {
  return (
    <div
      ref={nodeRef}
      className="absolute left-1/2 top-1/2 z-20"
      style={{
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
      aria-hidden
    >
      <motion.div
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        className="rounded-2xl px-4 py-3 text-slate-100 backdrop-blur"
        style={{
          background: "rgba(17,19,26,0.5)",
          border: `1px solid ${
            active ? `${accent}55` : "rgba(203,213,225,0.22)"
          }`,
          boxShadow: active
            ? `0 0 0 2px ${accent}1F inset, 0 0 10px ${accent}24`
            : `0 0 0 1px ${brandCool}24 inset`,
          minWidth: 180,
        }}
        animate={
          prefersReducedMotion ? { opacity: 1 } : { y: [0, -2, 0], opacity: 1 }
        }
        transition={{
          duration: 8.5,
          repeat: prefersReducedMotion ? 0 : Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
          delay,
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="text-[16px] md:text-[17px] font-medium leading-tight text-slate-100">
            {title}
          </div>
          <div
            className="mt-1 text-[10px] tracking-[0.18em] uppercase leading-none"
            style={{ color: `${accent}CC` }}
          >
            {tech}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Responsive breakpoint hook ---
function useBreakpoint() {
  const get = () => {
    if (typeof window === "undefined") return "lg";
    const w = window.innerWidth;
    return w < 480
      ? "xs"
      : w < 768
        ? "sm"
        : w < 1024
          ? "md"
          : w < 1280
            ? "lg"
            : "xl";
  };
  const [bp, setBp] = React.useState(get);
  React.useEffect(() => {
    const onChange = () => setBp(get());
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []);
  return bp;
}

/* ---------------- main ---------------- */
export default function ClaroBrainOverlay({
  className = "",
  height = 600,
  aiLines = [],
  aiLineTags = [],

  // default pillars
  capsules = [
    {
      title: "Knows who matters",
      tech: "Relationship Intelligence",
      tag: "Relationships",
      accent: "#F59E0B",
      x: 0,
      y: -230,
    },
    {
      title: "Writes like you",
      tech: "Tone Engine",
      tag: "Tone",
      accent: "#60A5FA",
      x: -360,
      y: 0,
    },
    {
      title: "Understands your world",
      tech: "Context Graph",
      tag: "Context",
      accent: "#A78BFA",
      x: 360,
      y: 0,
    },
    {
      title: "Remembers what matters",
      tech: "Memory Core",
      tag: "Memory",
      accent: "#67E8F9",
      x: 0,
      y: 230,
    },
  ],

  /* Brand */
  brandWarm = "#e07a5f",
  brandCool = "#3d405b",

  /* Layout ellipse (used when x/y not provided) */
  radiusX = 360,
  radiusY = 230,

  /* Inner neuron dots (DISABLED by default) */
  showInnerNeurons = false,
  innerNeuronCount = 10,
  innerRadius = 110,
  innerRadiusY = 82,

  /* Connection styling */
  bulge = 42,
  baseStroke = "rgba(61,64,91,0.28)",
  shimmerOpacity = 0.12,
  glowPx = 4,
  pulseEveryMs = 1600,
  flowDuration = 1.4,
  shimmerSpeed = 22,
  hotBoost = 1.15,

  /* Quote / bubble timing */
  clockMs = 800,
  quoteIntervalMs = 4200,
  aiIntervalMs,

  /* Scene toggles */
  darkBackground = true,
  showCenterHalo = false,
  showMesh = true,
  meshCount = 6,
  showHudLabels = true,
  parallaxStrength = 3,

  /* Voxel tile field */
  showBits = true,
  bitCell = 20,
  bitCount = 1200,
  bitBaseAlpha = 0.025,
  voxelScale = 3.5,
  voxelLift = 6,
  voxelShadow = 0.1,

  /* Tile-train pulses */
  tileTrain = 6,
  tileGap = 12,
  tileSize = 2.0,
  tileHeadBoost = 1.08,
}) {
  const prefersReducedMotion = useReducedMotion();
  const intervalMs =
    typeof aiIntervalMs === "number" ? aiIntervalMs : quoteIntervalMs;

  const DESIGN_W = 1200;
  const DESIGN_H = typeof height === "number" ? height : 600;

  const PRESETS = {
    Relationships: {
      title: "Knows who matters",
      tech: "Relationship Intelligence",
      accent: "#F59E0B",
    },
    Tone: { title: "Writes like you", tech: "Tone Engine", accent: "#60A5FA" },
    Context: {
      title: "Understands your world",
      tech: "Context Graph",
      accent: "#A78BFA",
    },
    Memory: {
      title: "Remembers what matters",
      tech: "Memory Core",
      accent: "#67E8F9",
    },
  };

  const caps = useMemo(() => {
    return capsules.map((c, i) => {
      const preset = PRESETS[c.tag] || {};
      return {
        title: c.title ?? c.label ?? preset.title ?? "",
        tech: c.tech ?? preset.tech ?? (c.tag || ""),
        tag: c.tag ?? Object.keys(PRESETS)[i] ?? `node-${i}`,
        accent: c.accent ?? preset.accent ?? brandWarm,
        x: typeof c.x === "number" ? c.x : undefined,
        y: typeof c.y === "number" ? c.y : undefined,
      };
    });
  }, [capsules, brandWarm]);

  // perf profile
  const perfScale = useMemo(() => {
    const cores =
      typeof navigator !== "undefined" && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 4;
    const mem =
      typeof navigator !== "undefined" && navigator.deviceMemory
        ? navigator.deviceMemory
        : 4;
    const mobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android/i.test(navigator.userAgent || "");
    const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
    return mobile || cores <= 4 || mem <= 4 || winW < 1000 ? 0.75 : 1.0;
  }, []);
  const bp = useBreakpoint();
  const profile = useMemo(() => {
    if (prefersReducedMotion)
      return {
        fps: 20,
        maxDpr: 1,
        bitScale: 0.6,
        trainScale: 0.6,
        glows: false,
        parallax: 0,
      };
    if (bp === "xs" || bp === "sm")
      return {
        fps: 26,
        maxDpr: perfScale < 1 ? 1 : 1.25,
        bitScale: 0.7,
        trainScale: 0.75,
        glows: false,
        parallax: 1.2,
      };
    return {
      fps: 30,
      maxDpr: perfScale < 1 ? 1.25 : 1.5,
      bitScale: 1,
      trainScale: 1,
      glows: perfScale >= 1.0,
      parallax: 3,
    };
  }, [bp, prefersReducedMotion, perfScale]);
  const fpsTarget = profile.fps;
  const maxDpr = profile.maxDpr;
  const shimmerSpeedEff = useMemo(
    () => shimmerSpeed * (prefersReducedMotion ? 0.6 : 0.9),
    [shimmerSpeed, prefersReducedMotion],
  );
  const bitCountEff = Math.max(
    150,
    Math.round(
      bitCount * (prefersReducedMotion ? 0.5 : perfScale) * profile.bitScale,
    ),
  );
  const tileTrainEff = Math.max(
    3,
    Math.round(
      tileTrain * (prefersReducedMotion ? 0.5 : perfScale) * profile.trainScale,
    ),
  );
  const enableGlows = profile.glows;
  const parallaxStrengthEff = Math.min(parallaxStrength, profile.parallax);

  // quotes
  const [qIndex, setQIndex] = useState(0);
  useEffect(() => {
    if (aiLines.length <= 1) return;
    const id = setInterval(
      () => setQIndex((i) => (i + 1) % aiLines.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [aiLines.length, intervalMs]);

  // refs
  const containerRef = useRef(null);
  const centerBoxRef = useRef(null);
  const capRefs = useRef([]);
  const setCapRef = (i) => (el) => (capRefs.current[i] = el);
  const [posOverride, setPosOverride] = useState([]);
  const canvasRef = useRef(null);
  const dprRef = useRef(1);

  const staticBufferRef = useRef(null);
  const staticCtxRef = useRef(null);

  const curvesRef = useRef([]);
  const meshPathRef = useRef(null);
  const coreRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef({ w: 0, h: 0 });

  const bitsRef = useRef([]);
  const lastRippleTimeRef = useRef(0);
  const hoveredRef = useRef(null);

  // neurons (optional)
  const neurons = useMemo(() => {
    const arr = [];
    for (let i = 0; i < innerNeuronCount; i++) {
      const t = (i / innerNeuronCount) * Math.PI * 2;
      arr.push({ x: Math.cos(t) * innerRadius, y: Math.sin(t) * innerRadiusY });
    }
    return arr;
  }, [innerNeuronCount, innerRadius, innerRadiusY]);

  const positions = useMemo(() => {
    const n = caps.length || 1;
    return caps.map((c, i) => {
      if (typeof c.x === "number" && typeof c.y === "number")
        return { x: c.x, y: c.y };
      const t = (i / n) * Math.PI * 2;
      return { x: Math.cos(t) * radiusX, y: Math.sin(t) * radiusY };
    });
  }, [caps, radiusX, radiusY]);

  const meshPairs = useMemo(() => {
    const n = caps.length;
    if (n < 3) return [];
    const pairs = [];
    for (let i = 0; i < n; i++) pairs.push([i, (i + 1) % n]);
    for (let i = 0; i < n; i++) {
      const j = (i + Math.ceil(n / 2)) % n;
      if (i < j) pairs.push([i, j]);
    }
    return pairs.slice(0, Math.min(meshCount, pairs.length));
  }, [caps.length, meshCount]);

  // pause when offscreen
  const inViewRef = useRef(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        inViewRef.current = !!e?.isIntersecting;
      },
      { root: null, threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ---- Fallback state (no canvas) ----
  const [isFallback, setIsFallback] = useState(false);

  // ---------- rAF-debounced recompute (layout + caches) ----------
  const rerenderStatic = () => {
    const buffer = staticBufferRef.current;
    const sctx = staticCtxRef.current;
    const { w, h } = sizeRef.current;
    const dpr = dprRef.current;
    if (!buffer || !sctx || !w || !h) return;

    // reset + clear
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, buffer.width, buffer.height);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // BACKDROP
    const grad = sctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0b0f18");
    grad.addColorStop(1, "#151923");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, w, h);

    // faint grid
    sctx.save();
    sctx.globalAlpha = 0.35;
    const grid = document.createElement("canvas");
    const dprLocal = dpr;
    grid.width = 32 * dprLocal;
    grid.height = 32 * dprLocal;
    const gctx = grid.getContext("2d");
    gctx.scale(dprLocal, dprLocal);
    gctx.strokeStyle = `${brandCool}1A`;
    gctx.lineWidth = 1;
    gctx.beginPath();
    gctx.moveTo(0, 0.5);
    gctx.lineTo(32, 0.5);
    gctx.moveTo(0.5, 0);
    gctx.lineTo(0.5, 32);
    gctx.stroke();
    const pattern = sctx.createPattern(grid, "repeat");
    if (pattern) {
      sctx.fillStyle = pattern;
      sctx.fillRect(0, 0, w, h);
    }
    sctx.restore();

    // crosshair
    sctx.strokeStyle = "rgba(61,64,91,0.10)";
    sctx.lineWidth = 1;
    sctx.beginPath();
    sctx.moveTo(coreRef.current.x, 0);
    sctx.lineTo(coreRef.current.x, h);
    sctx.moveTo(0, coreRef.current.y);
    sctx.lineTo(w, coreRef.current.y);
    sctx.stroke();

    if (showCenterHalo) {
      const grd = sctx.createRadialGradient(
        coreRef.current.x,
        coreRef.current.y,
        0,
        coreRef.current.x,
        coreRef.current.y,
        140,
      );
      grd.addColorStop(0, `${brandCool}10`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = grd;
      sctx.fillRect(0, 0, w, h);
    }

    // mesh
    if (showMesh && meshPathRef.current) {
      sctx.save();
      sctx.strokeStyle = `${brandCool}20`;
      sctx.lineWidth = 1;
      sctx.stroke(meshPathRef.current);
      sctx.restore();
    }

    // base wires
    sctx.save();
    sctx.strokeStyle = baseStroke;
    sctx.lineCap = "round";
    for (const item of curvesRef.current) {
      sctx.lineWidth = 1.2;
      sctx.stroke(item.path);
    }
    sctx.restore();

    // HUD labels
    if (showHudLabels) {
      sctx.save();
      sctx.font =
        "9px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter";
      sctx.fillStyle = "rgba(226,232,240,0.75)";
      sctx.textAlign = "right";
      curvesRef.current.forEach(({ from }, i) => {
        const tag = caps[i]?.tag || "";
        const hud =
          tag === "Context"
            ? "CTX"
            : tag === "Memory"
              ? "MEM"
              : tag === "Tone"
                ? "TONE"
                : tag === "Relationships"
                  ? "REL"
                  : "SIG";
        sctx.fillText(hud, from.x - 6, from.y - 6);
      });
      sctx.restore();
    }

    // voxel baseline
    if (showBits && bitsRef.current.length) {
      const coolRGB = hexToRgb(brandCool);
      const warmRGB = hexToRgb(brandWarm);
      for (const b of bitsRef.current) {
        const depth = clamp(b.baseDepth * 0.9, 0, 1);
        const alpha = bitBaseAlpha;
        const sz = tileSize + depth * voxelScale;
        const lift = (depth - 0.5) * 2 * voxelLift;
        const col = mixRgb(coolRGB, warmRGB, depth);
        // shadow
        sctx.save();
        sctx.fillStyle = `rgba(0,0,0,${voxelShadow * (0.2 + depth * 0.5)})`;
        sctx.fillRect(
          b.x - sz / 2,
          b.y - sz / 2 + Math.max(0, lift) * 0.6,
          sz,
          sz,
        );
        sctx.restore();
        // tile
        sctx.save();
        if (enableGlows) {
          sctx.shadowColor = rgba(col, 0.12 * (0.3 + depth * 0.7));
          sctx.shadowBlur = 0.6 + 1.2 * depth;
        }
        sctx.fillStyle = rgba(col, alpha);
        sctx.fillRect(b.x - sz / 2, b.y - sz / 2 - lift, sz, sz);
        // bevel
        sctx.fillStyle = "rgba(255,255,255,0.15)";
        const g = Math.max(1, sz * 0.14);
        sctx.fillRect(b.x - sz / 2, b.y - sz / 2 - lift, g, g);
        sctx.restore();
      }
    }
  };

  useEffect(() => {
    let ro;
    let pending = 0;
    let resizeTimer;

    function recompute() {
      const container = containerRef.current;
      if (!container) return;

      const crect = container.getBoundingClientRect();

      // scene scale (compute before touching coreEl so we can decide fallback)
      // NOTE: when we're in mobile fallback, the container is short. Use the intended desktop height here.
      const viewportW =
        typeof window !== "undefined" ? window.innerWidth : crect.width;
      const sW = (crect.width || viewportW) / DESIGN_W;

      // Use desired desktop height (prop) rather than current (mobile) DOM height
      const targetH = typeof height === "number" ? height : DESIGN_H;
      const sH = targetH / DESIGN_H;

      const sceneScale = clamp(Math.min(sW, sH), 0.5, 1.0);

      const fallback =
        viewportW < 720 || sceneScale < 0.62 || prefersReducedMotion;
      setIsFallback(fallback);

      if (fallback) {
        // tear down canvases to free GPU
        const cvsInFallback = canvasRef.current;
        if (cvsInFallback) {
          try {
            const vctx = cvsInFallback.getContext("2d");
            if (vctx) vctx.clearRect(0, 0, crect.width, crect.height);
          } catch {}
          cvsInFallback.width = 0;
          cvsInFallback.height = 0;
        }
        if (staticBufferRef.current) {
          staticBufferRef.current.width = 0;
          staticBufferRef.current.height = 0;
        }
        curvesRef.current = [];
        bitsRef.current = [];
        meshPathRef.current = null;
        return; // nothing else while in fallback
      }

      // We are NOT in fallback -> ensure desktop nodes exist
      const cvs = canvasRef.current;
      const coreEl = centerBoxRef.current;

      // If we just exited fallback, the canvas or core may not be mounted yet this tick.
      if (!cvs || !coreEl) {
        pending = requestAnimationFrame(recompute);
        return;
      }

      const coreRect = coreEl.getBoundingClientRect();

      const pCore = relTo(crect, centerOf(coreRect));
      const scaledCore = { x: pCore.x, y: pCore.y };
      const scaledBulge = bulge * sceneScale;
      coreRef.current = scaledCore;
      sizeRef.current = { w: crect.width, h: crect.height };

      // DPR clamp
      const rawDpr = window.devicePixelRatio || 1;
      const isSmall = crect.width < 768;
      const dpr = Math.max(1, Math.min(isSmall ? 1 : maxDpr, rawDpr));
      dprRef.current = dpr;

      // size canvases
      cvs.width = Math.floor(crect.width * dpr);
      cvs.height = Math.floor(crect.height * dpr);
      cvs.style.width = `${crect.width}px`;
      cvs.style.height = `${crect.height}px`;
      const vctx = cvs.getContext("2d");
      vctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!staticBufferRef.current)
        staticBufferRef.current = document.createElement("canvas");
      const sBuf = staticBufferRef.current;
      const STATIC_SCALE = isSmall ? 0.9 : 1;
      sBuf.width = Math.floor(crect.width * dpr * STATIC_SCALE);
      sBuf.height = Math.floor(crect.height * dpr * STATIC_SCALE);
      staticCtxRef.current = sBuf.getContext("2d");
      staticCtxRef.current.setTransform(STATIC_SCALE, 0, 0, STATIC_SCALE, 0, 0);

      // scaled positions
      const n = caps.length || 1;
      const rx = radiusX * sceneScale;
      const ry = radiusY * sceneScale;
      const tmp = caps.map((c, i) => {
        if (typeof c.x === "number" && typeof c.y === "number")
          return { x: c.x * sceneScale, y: c.y * sceneScale };
        const t = (i / n) * Math.PI * 2;
        return { x: Math.cos(t) * rx, y: Math.sin(t) * ry };
      });
      setPosOverride(tmp);

      // capsule centers from DOM
      const nodes = capRefs.current.map((el) => {
        if (!el) return scaledCore;
        const r = el.getBoundingClientRect();
        return relTo(crect, centerOf(r));
      });

      // curves
      curvesRef.current = nodes.map((p, i) => {
        const curve = makeCurve(p, scaledCore, scaledBulge);
        const lookup = sampleCurve(curve, 60);
        const path = new Path2D();
        path.moveTo(curve.p0.x, curve.p0.y);
        path.quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y);
        return {
          idx: i,
          curve,
          lookup,
          tag: caps[i]?.tag || "",
          from: p,
          accent: caps[i]?.accent || brandWarm,
          path,
          grad: null,
        };
      });

      // mesh
      if (showMesh) {
        const mPath = new Path2D();
        meshPairs.forEach(([a, b]) => {
          const pa = nodes[a],
            pb = nodes[b];
          const curve = makeCurve(pa, pb, bulge * 0.35 * sceneScale);
          mPath.moveTo(curve.p0.x, curve.p0.y);
          mPath.quadraticCurveTo(
            curve.p1.x,
            curve.p1.y,
            curve.p2.x,
            curve.p2.y,
          );
        });
        meshPathRef.current = mPath;
      } else {
        meshPathRef.current = null;
      }

      // voxels
      if (showBits) {
        const cols = Math.max(1, Math.floor(crect.width / bitCell));
        const rows = Math.max(1, Math.floor(crect.height / bitCell));
        const chosen = new Set();
        const arr = [];
        const target = Math.min(bitCountEff, cols * rows);
        while (arr.length < target) {
          const c = Math.floor(Math.random() * cols);
          const r = Math.floor(Math.random() * rows);
          const key = r * cols + c;
          if (chosen.has(key)) continue;
          chosen.add(key);
          const x = c * bitCell + bitCell / 2;
          const y = r * bitCell + bitCell / 2;
          const dx = x - scaledCore.x,
            dy = y - scaledCore.y;
          if (Math.hypot(dx, dy) < 56 * sceneScale) continue;
          arr.push({
            x,
            y,
            baseDepth: Math.random(),
            dist: Math.hypot(dx, dy),
          });
        }
        bitsRef.current = arr;
      } else {
        bitsRef.current = [];
      }

      rerenderStatic();

      try {
        const vctx2 = cvs.getContext("2d");
        vctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
        vctx2.clearRect(0, 0, crect.width, crect.height);
        if (staticBufferRef.current)
          vctx2.drawImage(
            staticBufferRef.current,
            0,
            0,
            crect.width,
            crect.height,
          );
      } catch {}
    }

    const schedule = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        recompute();
      });
    };

    recompute();

    ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(schedule, 120);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(schedule, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      ro && ro.disconnect();
      window.removeEventListener("resize", onResize);
      if (pending) cancelAnimationFrame(pending);
      clearTimeout(resizeTimer);
    };
  }, [
    bulge,
    showMesh,
    meshPairs,
    caps,
    showBits,
    bitCell,
    bitCountEff,
    maxDpr,
    brandWarm,
    meshCount,
    baseStroke,
    brandCool,
    showCenterHalo,
    showHudLabels,
    radiusX,
    radiusY,
    height,
    prefersReducedMotion,
    isFallback, // <- re-bind observers when mode flips
  ]);

  // ------------- CANVAS RENDER LOOP -------------
  const pulsesRef = useRef([]);
  const shimmerPhaseRef = useRef(0);
  const clockRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || isFallback) return;
    let last = Math.floor(Math.random() * Math.max(1, caps.length));
    const t = setInterval(() => {
      if (!curvesRef.current.length) return;
      const hotIndices = caps
        .map((c, i) => (aiLineTags?.[0]?.includes(c.tag) ? i : -1))
        .filter((v) => v >= 0);
      const next =
        hotIndices.length && Math.random() < 0.55
          ? hotIndices[Math.floor(Math.random() * hotIndices.length)]
          : (last + 1 + Math.floor(Math.random() * (caps.length - 1))) %
            caps.length;
      last = next;
      const isHot = aiLineTags?.[0]?.includes(caps[next]?.tag);
      pulsesRef.current.push({
        idx: next,
        start: performance.now(),
        dur: (flowDuration / (isHot ? hotBoost : 1)) * 1000,
        fast: isHot,
      });
    }, pulseEveryMs);
    return () => clearInterval(t);
  }, [
    caps,
    aiLineTags,
    flowDuration,
    hotBoost,
    pulseEveryMs,
    prefersReducedMotion,
    isFallback,
  ]);

  useEffect(() => {
    if (!showInnerNeurons || prefersReducedMotion || isFallback) return;
    const t = setInterval(
      () =>
        (clockRef.current =
          (clockRef.current + 1) % Math.max(1, innerNeuronCount)),
      clockMs,
    );
    return () => clearInterval(t);
  }, [
    showInnerNeurons,
    clockMs,
    innerNeuronCount,
    prefersReducedMotion,
    isFallback,
  ]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    lastRippleTimeRef.current = performance.now() + 220;
  }, [qIndex, prefersReducedMotion]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || isFallback) return; // don't start loop in fallback
    const ctx = cvs.getContext("2d");
    const coolRGB = hexToRgb(brandCool);
    const warmRGB = hexToRgb(brandWarm);

    runningRef.current = true;

    const draw = (now) => {
      const { w, h } = sizeRef.current;
      const dpr = dprRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (staticBufferRef.current)
        ctx.drawImage(staticBufferRef.current, 0, 0, w, h);

      if (!prefersReducedMotion) {
        const shimmerDelta = shimmerSpeedEff * (1 / fpsTarget);
        for (const item of curvesRef.current) {
          if (!item.grad) {
            item.grad = ctx.createLinearGradient(
              item.curve.p0.x,
              item.curve.p0.y,
              item.curve.p2.x,
              item.curve.p2.y,
            );
            item.grad.addColorStop(0.0, `${brandCool}00`);
            item.grad.addColorStop(0.55, `${item.accent}55`);
            item.grad.addColorStop(0.85, `${item.accent}88`);
            item.grad.addColorStop(1.0, "#ffffff");
          }
          ctx.save();
          ctx.strokeStyle = item.grad;
          ctx.globalAlpha = shimmerOpacity;
          ctx.lineWidth = hoveredRef.current === item.idx ? 1.8 : 1.5;
          ctx.lineCap = "round";
          if (enableGlows) {
            ctx.shadowColor = item.accent;
            ctx.shadowBlur = glowPx;
          }
          ctx.setLineDash([22, 360]);
          shimmerPhaseRef.current =
            (shimmerPhaseRef.current + shimmerDelta) % 400;
          ctx.lineDashOffset = -shimmerPhaseRef.current;
          ctx.stroke(item.path);
          ctx.restore();
        }
      }

      if (!prefersReducedMotion && pulsesRef.current.length) {
        const next = [];
        for (const pulse of pulsesRef.current) {
          const { idx, start, dur } = pulse;
          const t = (now - start) / dur;
          if (t >= 1) {
            lastRippleTimeRef.current = now;
            continue;
          }
          next.push(pulse);
          const { lookup, accent } = curvesRef.current[idx];
          const maxLen = lookup.lens[lookup.steps];
          const headLen = maxLen * t;
          const accentRGB = hexToRgb(accent);
          for (let j = 0; j < tileTrainEff; j++) {
            const d = headLen - j * tileGap;
            if (d < 0) break;
            const pos = posAtLength(lookup, d);
            const mixT = 1 - j / Math.max(1, tileTrainEff - 1);
            const col = mixRgb(coolRGB, accentRGB, mixT);
            const alpha = 0.18 + 0.25 * mixT;
            const sz = j === 0 ? tileSize * tileHeadBoost : tileSize;
            ctx.save();
            ctx.fillStyle = rgba(col, alpha);
            if (enableGlows) {
              ctx.shadowColor = rgba(accentRGB, 0.3 * mixT);
              ctx.shadowBlur = glowPx * 0.4 * mixT;
            }
            ctx.fillRect(pos.x - sz / 2, pos.y - sz / 2, sz, sz);
            if (j <= 1) {
              ctx.fillStyle = "rgba(255,255,255,0.35)";
              const g = sz * 0.35;
              ctx.fillRect(pos.x - g / 2, pos.y - g / 2, g, g);
            }
            ctx.restore();
          }
        }
        pulsesRef.current = next;
      }

      if (showBits && bitsRef.current.length) {
        const lastRippleAge = Math.max(0, now - lastRippleTimeRef.current);
        const rippleBoost = Math.max(0, 1 - lastRippleAge / 900);
        if (rippleBoost > 0.02) {
          const maxPulseDist = 440;
          const cool = coolRGB;
          const warm = warmRGB;
          for (const b of bitsRef.current) {
            if (b.dist > maxPulseDist) continue;
            const pulse =
              Math.max(0, 1 - b.dist / maxPulseDist) * 0.35 * rippleBoost;
            if (pulse < 0.01) continue;
            const depth = clamp(b.baseDepth * 0.9 + pulse * 0.1, 0, 1);
            const alpha = clamp(
              bitBaseAlpha + pulse * 0.12,
              bitBaseAlpha,
              0.14,
            );
            const sz = tileSize + depth * voxelScale;
            const lift = (depth - 0.5) * 2 * voxelLift;
            const col = mixRgb(cool, warm, depth);
            ctx.save();
            if (enableGlows) {
              ctx.shadowColor = rgba(col, 0.12 * (0.3 + depth * 0.7));
              ctx.shadowBlur = 0.6 + 1.2 * depth;
            }
            ctx.fillStyle = rgba(col, alpha);
            ctx.fillRect(b.x - sz / 2, b.y - sz / 2 - lift, sz, sz);
            ctx.restore();
          }
        }
      }

      if (showInnerNeurons && !prefersReducedMotion && neurons.length) {
        ctx.save();
        for (let i = 0; i < neurons.length; i++) {
          const pt = neurons[i];
          const cx = coreRef.current.x + pt.x;
          const cy = coreRef.current.y + pt.y;
          const active = clockRef.current === i;
          ctx.beginPath();
          ctx.fillStyle = active ? `${brandCool}88` : `${brandCool}55`;
          if (enableGlows) {
            ctx.shadowColor = `${brandCool}88`;
            ctx.shadowBlur = active ? glowPx : glowPx * 0.5;
          }
          ctx.arc(cx, cy, active ? 2.0 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    let rafId;
    let last = 0;
    const interval = 1000 / fpsTarget;
    const loop = (now) => {
      if (!runningRef.current) return;
      if (document.hidden) {
        last = now;
        rafId = requestAnimationFrame(loop);
        return;
      }
      const delta = now - last;
      if (delta >= interval) {
        last = now - (delta % interval);
        if (inViewRef.current) draw(now);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    caps,
    neurons,
    prefersReducedMotion,
    baseStroke,
    glowPx,
    shimmerOpacity,
    brandWarm,
    brandCool,
    showBits,
    bitBaseAlpha,
    tileTrainEff,
    tileGap,
    tileSize,
    tileHeadBoost,
    fpsTarget,
    shimmerSpeedEff,
    voxelLift,
    voxelScale,
    voxelShadow,
    showInnerNeurons,
    showMesh,
    showCenterHalo,
    showHudLabels,
    isFallback,
  ]);

  // -------- parallax (just a transform; no redraw) --------
  const parallaxRaf = useRef(null);
  const onMouseMove = (e) => {
    if (prefersReducedMotion || !parallaxStrength || isFallback) return;
    if (parallaxRaf.current) cancelAnimationFrame(parallaxRaf.current);
    parallaxRaf.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      const cvs = canvasRef.current;
      if (cvs) {
        const amt = parallaxStrengthEff;
        cvs.style.transform = `translate3d(${nx * amt}px, ${ny * amt}px, 0)`;
      }
    });
  };
  useEffect(
    () => () =>
      parallaxRaf.current && cancelAnimationFrame(parallaxRaf.current),
    [],
  );

  // ===== RENDER =====
  if (isFallback) {
    // Compact, intentional mobile card (no huge empty space)
    return (
      <div
        key="fallback"
        ref={containerRef}
        className={`relative mx-auto w-full flex justify-center ${className}`}
        style={{ padding: "12px 12px 16px" }}
      >
        <div
          className="rounded-3xl shadow-lg"
          style={{
            maxWidth: 380,
            width: "100%",
            borderRadius: 24,
            padding: "16px 18px 20px",
            background: "linear-gradient(180deg,#0D1118 0%,#121722 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 14px rgba(0,0,0,0.45)",
          }}
        >
          {/* Bubble */}
          <div
            ref={centerBoxRef}
            className="w-full flex justify-center mb-2"
            style={{ marginTop: -2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`core-${qIndex}`}
                initial={prefersReducedMotion ? false : { scale: 0.985 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <AIBubble
                  text={aiLines[qIndex] ?? ""}
                  prefersReducedMotion={prefersReducedMotion}
                  brandWarm={brandWarm}
                  brandCool={brandCool}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Capsules grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {caps.map((c, i) => (
              <div
                key={`${i}-${c.title}`}
                className="flex flex-col items-center justify-center rounded-xl text-center text-slate-100"
                style={{
                  padding: "10px",
                  minHeight: 54,
                  background:
                    "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                <div className="text-[14.5px] font-medium leading-snug">
                  {c.title}
                </div>
                <div
                  className="mt-0.5 text-[10px] uppercase tracking-[0.18em] leading-tight"
                  style={{ color: `${c.accent}CC` }}
                >
                  {c.tech}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop / canvas
  return (
    <div
      key="desktop"
      ref={containerRef}
      onMouseMove={onMouseMove}
      className={`relative mx-auto w-full max-w-7xl ${className}`}
      style={{ height }}
    >
      <div className="absolute inset-0 -z-10 rounded-[44px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 will-change-transform"
        />
      </div>

      <div
        ref={centerBoxRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`core-${qIndex}`}
            initial={prefersReducedMotion ? false : { scale: 0.985 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <AIBubble
              key={aiLines[qIndex] ?? "__fallback__"}
              text={aiLines[qIndex] ?? ""}
              prefersReducedMotion={prefersReducedMotion}
              brandWarm={brandWarm}
              brandCool={brandCool}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 z-20">
        {caps.map((c, i) => {
          const pos = posOverride[i] || positions[i];
          return (
            <PillarCapsule
              key={`${i}-${c.title}-${c.tech}`}
              nodeRef={setCapRef(i)}
              title={c.title}
              tech={c.tech}
              accent={c.accent}
              x={pos.x}
              y={pos.y}
              active={false}
              prefersReducedMotion={prefersReducedMotion}
              delay={0.06 * i}
              onHoverStart={() => (hoveredRef.current = i)}
              onHoverEnd={() => (hoveredRef.current = null)}
              brandCool={brandCool}
            />
          );
        })}
      </div>
    </div>
  );
}
