import React, { useEffect, useRef } from "react";

/**
 * RevealHeadline — Pixel tiles → Crisp DOM text (DOM text fades in at the end)
 *
 * Keeps your original reveal exactly the same.
 * After reveal, a subtle breathing overlay begins after breathDelayMs.
 * Breathing overlay "ramps in" gradually (tiles appear little by little),
 * with a per-tile fade ramp to avoid popping.
 */

export function RevealHeadline({
  text = "Clarity for the way you\nconnect",
  className = "text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]",
  // Brand + fonts (DOM text uses cleanFont)
  cleanColor = "#3D405B",
  activeColor = "#E07A5F",
  cleanFont = "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif",

  // Timing / motion (REVEAL)
  durationMs = 2200,
  delayMs = 120,
  waveEase = "cubic", // 'linear' | 'cubic'
  direction = "ltr",  // 'ltr' | 'rtl' | 'center'

  // Tiles
  tileStart = 12,  // px at t=0
  tileEnd = 2.5,   // px at t=1 (grid density / spacing)
  threshold = 0.5,
  tileShape = "square", // "square" | "circle"

  // DOM text reveal timing (0..1 progress)
  revealFrom = 0.82,
  revealTo = 0.98,

  // Seam-control additions (REVEAL)
  jitterBasePx = 0.5,   // keep tiny randomness at end so grid never aligns perfectly
  seamOverlapPx = 0.75, // overlap by the finish so no gutters/lines

  // Start breathing after this delay (gap between reveal end and overlay start)
  breathDelayMs = 900,

  // Staged breathing intro (tiles appear gradually)
  breathIntroMs = 7500,        // total time to bring overlay to full density
  breathPerTileRampMs = 220,   // fade-in time for each tile after it "activates"

  // Interactivity
  retriggerOnHover = false,    // <-- ADDED BACK
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const h1Ref = useRef(null);
  const rafRef = useRef(0);

  // RAF + timer for the breathing overlay
  const breathRafRef = useRef(0);
  const breathTimeoutRef = useRef(0);

  const S = useRef({
    dpr: 1,
    w: 0,
    h: 0,
    lines: [],
    centers: [], // [{cx, cy}] from DOM spans
    fontSize: 64,
    fontWeight: 700,
    letterSpacingPx: 0,
    lineHeightPx: 0,
    // clean text mask
    off: null,
    octx: null,
    maskData: null,
    maskW: 0,
    maskH: 0,
    // pre-sampled points at final density
    // { x, y, rSeed, phase, rate, spatial, introKey }
    points: [],
    step: 0, // sampling grid spacing (CSS px)
    // timing
    start: 0,
    progress: 0,
    running: false,
    visible: true,
    // breathing state
    breathStart: 0,
    lastNow: 0,
    flow: 0,
    revealedOnce: false,
  });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // ---- Breathing config (internal) ----
  const BREATH = {
    periodMs: 3200,       // full in/out cycle
    alphaBase: 0.10,
    alphaAmp:  0.18,
    sizeAmpPx: 0.35,
    tintMix:   0.45,      // 0..1 toward cleanColor (0 = activeColor)
    driftPx:   0.25,      // micro subpixel wander
    fieldFreqX: 0.018,    // radians per CSS px
    fieldFreqY: 0.013,
    fieldDrift: 0.0009,   // radians per ms (slow drift)
  };

  // ---------- utils ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeCubic = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);
  const hexToRgb = (hex) => {
    const s = hex.replace("#", "");
    const n = parseInt(s.length === 3 ? s.split("").map(c => c + c).join("") : s, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const mix = (ca, cb, t) => ({
    r: Math.round(lerp(ca.r, cb.r, t)),
    g: Math.round(lerp(ca.g, cb.g, t)),
    b: Math.round(lerp(ca.b, cb.b, t)),
  });
  const rand2 = (ix, iy) => {
    const s = Math.sin((ix * 12.9898 + iy * 78.233 + 0.5) * 43758.5453);
    return s - Math.floor(s);
  };

  // measure/draw helpers for letter-spacing
  function measureLineWidth(ctx, str, letterSpacing) {
    let w = 0;
    for (let i = 0; i < str.length; i++) {
      w += ctx.measureText(str[i]).width;
      if (i < str.length - 1) w += letterSpacing;
    }
    return w;
  }
  function drawLineWithSpacing(ctx, str, cx, cy, letterSpacing) {
    const total = measureLineWidth(ctx, str, letterSpacing);
    let x = cx - total / 2;
    for (let i = 0; i < str.length; i++) {
      ctx.fillText(str[i], Math.round(x), Math.round(cy));
      x += ctx.measureText(str[i]).width;
      if (i < str.length - 1) x += letterSpacing;
    }
  }

  function alphaAtCss(x, y) {
    const St = S.current;
    const px = clamp(Math.round(x * St.dpr), 0, St.maskW - 1);
    const py = clamp(Math.round(y * St.dpr), 0, St.maskH - 1);
    const idx = (py * St.maskW + px) * 4 + 3; // alpha
    return (St.maskData[idx] || 0) / 255;
  }

  // ---------- measure real DOM & build mask ----------
  function measureAndBuild() {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!wrap || !canvas || !h1) return;

    const St = S.current;

    const wrapRect = wrap.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    St.fontSize = parseFloat(cs.fontSize) || 64;
    St.fontWeight = parseInt(cs.fontWeight || "700", 10) || 700;
    St.lineHeightPx =
      cs.lineHeight === "normal"
        ? Math.round(St.fontSize * 1.2)
        : Math.round(parseFloat(cs.lineHeight) || St.fontSize * 1.2);
    St.letterSpacingPx = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing) || 0;

    St.lines = String(text).split("\n");

    // canvas dims: match the visible <h1> box exactly
    St.w = Math.max(1, Math.round(wrapRect.width));
    St.h = Math.max(1, Math.round(wrapRect.height));
    St.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    canvas.width = Math.round(St.w * St.dpr);
    canvas.height = Math.round(St.h * St.dpr);
    canvas.style.width = "100%";
    canvas.style.height = `${St.h}px`;
    ctx.setTransform(St.dpr, 0, 0, St.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // collect line centers from actual DOM <span data-line>
    const spans = wrap.querySelectorAll("[data-line]");
    St.centers = [];
    spans.forEach((node) => {
      const r = node.getBoundingClientRect();
      St.centers.push({
        cx: (r.left + r.width / 2) - wrapRect.left,
        cy: (r.top + r.height / 2) - wrapRect.top,
      });
    });

    // build clean text mask (offscreen), with letter-spacing
    St.off = document.createElement("canvas");
    St.off.width = canvas.width;
    St.off.height = canvas.height;
    St.octx = St.off.getContext("2d");
    St.octx.setTransform(St.dpr, 0, 0, St.dpr, 0, 0);
    St.octx.imageSmoothingEnabled = false;
    St.octx.clearRect(0, 0, St.w, St.h);

    St.octx.fillStyle = "#000";
    St.octx.textAlign = "left";
    St.octx.textBaseline = "middle";
    St.octx.font = `${St.fontWeight} ${St.fontSize}px ${cleanFont}`;
    for (let i = 0; i < St.lines.length; i++) {
      const line = St.lines[i];
      const c = St.centers[i] || { cx: St.w / 2, cy: (i + 0.5) * St.lineHeightPx };
      drawLineWithSpacing(St.octx, line, c.cx, c.cy, St.letterSpacingPx);
    }

    const img = St.octx.getImageData(0, 0, St.off.width, St.off.height);
    St.maskData = img.data;
    St.maskW = St.off.width;
    St.maskH = St.off.height;

    // pre-sample tile positions at final density
    S.current.points.length = 0;
    const step = Math.max(2, tileEnd);
    S.current.step = step; // track sampling grid
    for (let y = step * 0.5; y < St.h; y += step) {
      const row = Math.floor(y / step);
      const rowOffset = row % 2 ? step * 0.33 : 0; // faint diagonal flow
      for (let x = step * 0.5 + rowOffset; x < St.w; x += step) {
        if (alphaAtCss(x, y) >= threshold) {
          const cx = Math.floor(x / step), cy = Math.floor(y / step);
          const seed = rand2(cx, cy) - 0.5;        // -0.5..0.5 (deterministic)
          const phase = seed * Math.PI * 2;
          const rate  = 0.85 + 0.3 * Math.abs(seed);
          const spatial = x * BREATH.fieldFreqX + y * BREATH.fieldFreqY;
          const introKey = seed + 0.5;             // 0..1 → staged activation order
          S.current.points.push({ x, y, rSeed: seed, phase, rate, spatial, introKey });
        }
      }
    }

    // reset breathing timers
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    S.current.breathStart = now;
    S.current.lastNow = now;
    S.current.flow = 0;
  }

  // ---------- draw (original reveal) ----------
  function draw(progress) {
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!canvas || !h1) return;
    const St = S.current;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, St.w, St.h);

    // DOM text opacity (start invisible → fade in near the end)
    if (revealTo > revealFrom) {
      const t =
        progress <= revealFrom
          ? 0
          : progress >= revealTo
          ? 1
          : (progress - revealFrom) / (revealTo - revealFrom);
      const domOpacity = easeOut(t);
      h1.style.opacity = String(domOpacity);
    }

    // Sharpening tiles
    const progEase = easeOut(progress);
    const size = lerp(tileStart, tileEnd, progEase);
    const cA = hexToRgb(activeColor);
    const cB = hexToRgb(cleanColor);
    const tint = mix(cA, cB, progEase);
    ctx.fillStyle = `rgb(${tint.r},${tint.g},${tint.b})`;
    ctx.globalAlpha = 0.95;

    const tFill = waveEase === "cubic" ? easeCubic(progress) : progress;
    let xLeft = 0, xRight = St.w;
    if (direction === "ltr") {
      xRight = St.w * tFill;
    } else if (direction === "rtl") {
      xLeft = St.w * (1 - tFill);
    } else {
      const half = (St.w * tFill) / 2;
      xLeft = St.w * 0.5 - half;
      xRight = St.w * 0.5 + half;
    }

    // Seam killers
    const jitterAmt = Math.max(jitterBasePx, (size - tileEnd) * 0.12);
    const targetEndSize = (St.step || tileEnd) + seamOverlapPx;
    let s = size + (targetEndSize - size) * progEase;

    // snap to device pixels
    const q = 1 / St.dpr;
    s = Math.max(q, Math.round(s / q) * q);

    for (let i = 0; i < St.points.length; i++) {
      const p = St.points[i];
      if (p.x < xLeft - s || p.x > xRight + s) continue;
      const j = p.rSeed * jitterAmt;
      const rx = Math.round((p.x + j - s / 2) / q) * q;
      const ry = Math.round((p.y + j - s / 2) / q) * q;

      if (tileShape === "circle") {
        const cx = rx + s / 2, cy = ry + s / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(rx, ry, s, s);
      }
    }
    ctx.globalAlpha = 1;

    // Fade overlay near the end to fully reveal DOM text
    if (progress >= 0.9) {
      const fade = clamp((progress - 0.9) / 0.1, 0, 1);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, St.w, St.h);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ---------- breathing overlay (with staged intro) ----------
  function drawBreath(now) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const St = S.current;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, St.w, St.h);

    const q = 1 / St.dpr;
    const baseSize = Math.max(q, Math.round(((St.step || tileEnd) + seamOverlapPx) / q) * q);

    const cA = hexToRgb(activeColor);
    const cB = hexToRgb(cleanColor);
    const tint = mix(cA, cB, clamp(BREATH.tintMix, 0, 1));
    ctx.fillStyle = `rgb(${tint.r},${tint.g},${tint.b})`;

    const omega = (Math.PI * 2) / Math.max(1, BREATH.periodMs);
    const dt = now - S.current.lastNow;
    S.current.lastNow = now;
    S.current.flow += BREATH.fieldDrift * dt;

    // Global intro progress 0..1 for staged density
    const introT =
      breathIntroMs > 0 ? clamp((now - S.current.breathStart) / breathIntroMs, 0, 1) : 1;

    for (let i = 0; i < S.current.points.length; i++) {
      const p = S.current.points[i];

      // Skip tiles that haven't "activated" yet based on their introKey order
      if (p.introKey > introT) continue;

      // Per-tile fade-in ramp to avoid popping
      let introAlphaScale = 1;
      if (introT < 1 && breathPerTileRampMs > 0) {
        const t0 = p.introKey * breathIntroMs; // tile's activation time
        const local = clamp((now - (S.current.breathStart + t0)) / breathPerTileRampMs, 0, 1);
        introAlphaScale = easeOut(local);      // 0→1 per tile after activation
      }

      // low-frequency phase per tile with gentle spatial drift
      const theta = p.phase + (omega * (now - S.current.breathStart) * p.rate) + (p.spatial + S.current.flow);
      const v = 0.5 + 0.5 * Math.sin(theta); // 0..1

      const a = (BREATH.alphaBase + BREATH.alphaAmp * v) * introAlphaScale;
      let s = baseSize + BREATH.sizeAmpPx * (v - 0.5) * 2;

      const dx = p.rSeed * BREATH.driftPx * (v - 0.5) * 2;
      const dy = -p.rSeed * BREATH.driftPx * (v - 0.5) * 2;

      s = Math.max(q, Math.round(s / q) * q);
      const rx = Math.round((p.x + dx - s / 2) / q) * q;
      const ry = Math.round((p.y + dy - s / 2) / q) * q;

      ctx.globalAlpha = a;
      if (tileShape === "circle") {
        ctx.beginPath();
        ctx.arc(rx + s / 2, ry + s / 2, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(rx, ry, s, s);
      }
    }

    ctx.globalAlpha = 1;
  }

  function breathTick(now) {
    if (!S.current.visible || prefersReducedMotion) {
      cancelAnimationFrame(breathRafRef.current);
      breathRafRef.current = 0;
      return;
    }
    drawBreath(now);
    breathRafRef.current = requestAnimationFrame(breathTick);
  }

  function startBreathing() {
    if (h1Ref.current) h1Ref.current.style.opacity = "1";
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    S.current.breathStart = now;
    S.current.lastNow = now;
    if (!breathRafRef.current) {
      breathRafRef.current = requestAnimationFrame(breathTick);
    }
  }

  function stopBreathing() {
    cancelAnimationFrame(breathRafRef.current);
    breathRafRef.current = 0;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && S.current) ctx.clearRect(0, 0, S.current.w, S.current.h);
  }

  function clearBreathDelay() {
    if (breathTimeoutRef.current) {
      clearTimeout(breathTimeoutRef.current);
      breathTimeoutRef.current = 0;
    }
  }

  // ---------- RAF loop (original reveal) ----------
  function tick(now) {
    const St = S.current;
    if (!St.running) return;
    if (!St.start) St.start = now + delayMs;
    const t = clamp((now - St.start) / durationMs, 0, 1);
    St.progress = t;
    draw(t);
    if (t < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      St.running = false;
      St.revealedOnce = true;
      if (h1Ref.current) h1Ref.current.style.opacity = "1";

      // Delay the breathing overlay (then it ramps in gradually)
      clearBreathDelay();
      breathTimeoutRef.current = window.setTimeout(() => {
        if (S.current.visible && !prefersReducedMotion) {
          startBreathing();
        }
      }, Math.max(0, breathDelayMs));
    }
  }

  function startAnim() {
    const St = S.current;
    const h1 = h1Ref.current;

    // reset overlay & delay when retriggering
    stopBreathing();
    clearBreathDelay();

    if (h1) h1.style.opacity = "0"; // hide DOM text at start

    if (!St.visible || prefersReducedMotion) {
      // Skip animation; show final text
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, St.w, St.h);
      St.running = false;
      St.progress = 1;
      if (h1) h1.style.opacity = "1";

      if (!prefersReducedMotion && St.visible) {
        clearBreathDelay();
        breathTimeoutRef.current = window.setTimeout(() => {
          startBreathing();
        }, Math.max(0, breathDelayMs));
      }
      return;
    }
    St.start = 0;
    St.progress = 0;
    St.running = true;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  // ---------- lifecycle ----------
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!wrap || !canvas || !h1) return;

    // Layering & base styles
    Object.assign(wrap.style, { position: "relative", width: "100%" });
    Object.assign(h1.style, {
      position: "relative",
      zIndex: 1,
      margin: 0,
      whiteSpace: "normal",
      width: "100%",
      color: cleanColor,
      fontFamily: cleanFont,
      textAlign: "center",
      opacity: "0", // start hidden
    });
    Object.assign(canvas.style, {
      position: "absolute",
      inset: 0,
      width: "100%",
      zIndex: 2,
      pointerEvents: "none",
      willChange: "opacity, transform",
    });

    const rebuild = () => {
      measureAndBuild();
      // keep current progress frame on rebuild
      draw(S.current.progress || 0);
    };

    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(rebuild);
    } else {
      rebuild();
    }

    const ro = new ResizeObserver(rebuild);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        S.current.visible = !!entries[0]?.isIntersecting;
        if (!S.current.visible) {
          stopBreathing();
          clearBreathDelay();
        } else if (S.current.revealedOnce && !prefersReducedMotion) {
          if (!breathRafRef.current && !breathTimeoutRef.current) {
            startBreathing(); // resume without re-staging delay
          }
        }
      },
      { root: null, threshold: 0 }
    );
    io.observe(wrap);

    // autoplay once on mount
    startAnim();

    const trigger = () => startAnim();
    if (retriggerOnHover) {
      wrap.addEventListener("mouseenter", trigger);
      wrap.addEventListener("touchstart", trigger, { passive: true });
    }

    return () => {
      ro.disconnect();
      io.disconnect();
      if (retriggerOnHover) {
        wrap.removeEventListener("mouseenter", trigger);
        wrap.removeEventListener("touchstart", trigger);
      }
      clearBreathDelay();
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(breathRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    text,
    className,
    cleanColor,
    activeColor,
    cleanFont,
    // reveal
    durationMs,
    delayMs,
    waveEase,
    direction,
    tileStart,
    tileEnd,
    threshold,
    revealFrom,
    revealTo,
    jitterBasePx,
    seamOverlapPx,
    tileShape,
    // breathing
    breathDelayMs,
    breathIntroMs,
    breathPerTileRampMs,
    retriggerOnHover,          // <-- now defined
    prefersReducedMotion,
  ]);

  const domLines = String(text).split("\n");

  return (
    <div ref={wrapRef} className="relative mx-auto w-full text-center select-none">
      {/* Real, crisp DOM text for accessibility/SEO */}
      <h1 ref={h1Ref} className={className}>
        {domLines.map((ln, i) => (
          <span key={i} data-line className="inline-block">
            {ln}
            {i < domLines.length - 1 && <br />}
          </span>
        ))}
      </h1>

      {/* Overlay canvas */}
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
}

export default RevealHeadline;