import React, { useEffect, useRef } from "react";

/**
 * AmbientHeadline
 * - H1 is always visible (DOM-first).
 * - Canvas tiles (2 colors) orbit along glyph contours behind the text.
 * - Pointer brush clears tiles along the user's path (repel + brief respawn cooldown).
 *
 * Tailwind-friendly: pass your typography classes via `className`.
 */
export function AmbientHeadline({
  text = "Clarity for the way you\nconnect",
  className = "text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]",
  // Colors
  activeColor = "#E07A5F", // moving/energized tiles
  placedColor = "#3D405B", // calmer/stable tiles
  finalTextColor = "#2E3148", // <h1> color
  // Density & sizing
  desktopMaxTiles = 1200,
  mobileMaxTiles = 700,
  tileSizeMin = 2,
  tileSizeMax = 5,
  // Motion & forces
  orbitSpeed = 0.75,   // tangential speed along the edge
  edgeGlue = 1.2,      // attraction toward the edge band (alpha ~ 0.5)
  noiseAmp = 0.25,     // subtle drift so paths don’t look mechanical
  damping = 0.9,       // velocity damping
  maxSpeed = 2.2,      // clamp for stability
  // Pointer clearing
  clearBrushRadius = 68,        // CSS px on desktop (auto-scaled on mobile)
  clearBrushHardness = 0.8,     // 0..1 (how strong the clearing is at center)
  clearCooldownMs = 850,        // how long to keep area "open"
  // Performance
  updateBudgetPct = 1.0,        // 0.5 updates only half particles per frame at load
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const h1Ref = useRef(null);
  const rafRef = useRef(0);

  // Internal buffers
  const stateRef = useRef({
    dpr: 1,
    width: 0,
    height: 0,
    // mask/offscreen canvas
    off: null,
    octx: null,
    maskData: null, // Uint8ClampedArray (full RGBA, but we read alpha)
    maskW: 0,
    maskH: 0,
    // layout metrics
    lines: [],
    baselineYs: [],
    lineCharXs: [],
    lineCharWs: [],
    letterSpacingPx: 0,
    lineHeightPx: 0,
    fontCSS: "",
    // emitters
    edgePoints: [],    // cached edge-band sample points
    interiorPoints: [],// sparse interior samples
    // particles
    parts: [],
    maxTiles: 0,
    // holes (pointer cooldown)
    holes: [],
    // pointer
    pointer: { x: -9999, y: -9999, active: false },
    // observers
    ioVisible: true,
    // timing
    lastTime: 0,
  });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  const hexToRgb = (hex) => {
    const s = hex.replace("#", "");
    const n = parseInt(
      s.length === 3 ? s.split("").map((c) => c + c).join("") : s,
      16
    );
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const cActive = hexToRgb(activeColor);
  const cPlaced = hexToRgb(placedColor);

  // ---------- measurement & mask ----------
  function measureAndBuildMask() {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!wrap || !canvas || !h1) return;

    const st = stateRef.current;

    // Read typography from DOM so canvas text aligns 1:1
    h1.style.color = finalTextColor;
    const cs = getComputedStyle(h1);
    const ff = cs.fontFamily || "system-ui, sans-serif";
    const fw = cs.fontWeight || "700";
    const fs = cs.fontSize || "64px";
    st.fontCSS = `${fw} ${fs} ${ff}`;

    const ls = cs.letterSpacing;
    st.letterSpacingPx = ls === "normal" ? 0 : parseFloat(ls) || 0;

    const fsNum = parseFloat(fs) || 64;
    const lhNum = cs.lineHeight === "normal" ? NaN : parseFloat(cs.lineHeight);
    st.lineHeightPx = isNaN(lhNum) ? Math.round(fsNum * 1.2) : Math.round(lhNum);

    // Lines from text (respect \n)
    st.lines = String(text).split("\n");

    // Size container to metrics
    const rect = wrap.getBoundingClientRect();
    st.width = Math.max(1, Math.round(rect.width));
    st.height = Math.max(1, st.lines.length * st.lineHeightPx);

    // DPR clamp for perf
    st.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // Setup visible canvas
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    canvas.width = Math.round(st.width * st.dpr);
    canvas.height = Math.round(st.height * st.dpr);
    canvas.style.width = "100%";
    canvas.style.height = `${st.height}px`;
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Offscreen for mask
    st.off = document.createElement("canvas");
    st.off.width = Math.round(st.width * st.dpr);
    st.off.height = Math.round(st.height * st.dpr);
    st.octx = st.off.getContext("2d");
    st.octx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    st.octx.clearRect(0, 0, st.width, st.height);

    // Compute baselines (center glyph box vertically within each line box)
    const octx = st.octx;
    octx.font = st.fontCSS;
    octx.textBaseline = "alphabetic";

    // Measure ascent/descent approximately
    const metricsAll = octx.measureText(st.lines.join(" "));
    const ascent = metricsAll.actualBoundingBoxAscent || fsNum * 0.8;
    const descent = metricsAll.actualBoundingBoxDescent || fsNum * 0.2;
    const glyphH = ascent + descent;

    st.baselineYs = [];
    for (let li = 0; li < st.lines.length; li++) {
      const baseline =
        li * st.lineHeightPx + (st.lineHeightPx - glyphH) / 2 + ascent;
      st.baselineYs.push(baseline);
    }

    // Per-line char positions centered as a block
    st.lineCharXs = [];
    st.lineCharWs = [];
    for (let li = 0; li < st.lines.length; li++) {
      const line = st.lines[li];
      const ws = [];
      let lineW = 0;
      for (let ci = 0; ci < line.length; ci++) {
        const w = octx.measureText(line[ci]).width;
        ws.push(w);
        if (ci < line.length - 1) lineW += w + st.letterSpacingPx;
        else lineW += w;
      }
      const xs = [];
      const startX = (st.width - lineW) / 2;
      let x = startX;
      for (let ci = 0; ci < line.length; ci++) {
        xs.push(x);
        x += ws[ci] + (ci < line.length - 1 ? st.letterSpacingPx : 0);
      }
      st.lineCharWs.push(ws);
      st.lineCharXs.push(xs);

      // Draw glyphs into mask (black fill = opaque alpha)
      octx.fillStyle = "#000";
      for (let ci = 0; ci < line.length; ci++) {
        octx.fillText(line[ci], xs[ci], st.baselineYs[li]);
      }
    }

    // Cache mask pixel data (device-pixel sized)
    const img = st.octx.getImageData(0, 0, st.off.width, st.off.height);
    st.maskData = img.data; // Uint8ClampedArray
    st.maskW = st.off.width;
    st.maskH = st.off.height;

    // Build emitter samples (edge band + sparse interior)
    buildEmitterSamples();

    // Decide tile cap
    const isMobile = window.innerWidth < 768;
    st.maxTiles = isMobile ? mobileMaxTiles : desktopMaxTiles;

    // Ensure wrapper has fixed height and layers stacked
    Object.assign(wrap.style, {
      position: "relative",
      width: "100%",
      height: `${st.height}px`,
    });
  }

  function alphaAtCss(x, y) {
    const st = stateRef.current;
    const px = clamp(Math.round(x * st.dpr), 0, st.maskW - 1);
    const py = clamp(Math.round(y * st.dpr), 0, st.maskH - 1);
    const idx = (py * st.maskW + px) * 4 + 3; // alpha channel
    return (st.maskData[idx] || 0) / 255; // 0..1
  }

  function gradAtCss(x, y, step = 1) {
    const st = stateRef.current;
    const s = step; // CSS px
    const aL = alphaAtCss(x - s, y);
    const aR = alphaAtCss(x + s, y);
    const aT = alphaAtCss(x, y - s);
    const aB = alphaAtCss(x, y + s);
    let gx = aR - aL;
    let gy = aB - aT;
    const mag = Math.hypot(gx, gy) || 1e-6;
    gx /= mag;
    gy /= mag;
    return { nx: gx, ny: gy, mag }; // n points toward increasing alpha (toward interior)
  }

  function buildEmitterSamples() {
    const st = stateRef.current;
    const edge = [];
    const interior = [];

    // Sample grid in CSS pixels
    const step = 3; // coarse; fine enough for tiles to find a path
    for (let y = 0; y < st.height; y += step) {
      for (let x = 0; x < st.width; x += step) {
        const a = alphaAtCss(x, y);
        // Edge band around alpha ~ 0.5, with some gradient magnitude gating
        if (a > 0.3 && a < 0.7) {
          const g = gradAtCss(x, y, 1);
          if (g.mag > 0.02) edge.push({ x, y });
        } else if (a >= 0.92 && Math.random() < 0.08) {
          // sparse interior
          interior.push({ x, y });
        }
      }
    }

    st.edgePoints = edge;
    st.interiorPoints = interior;
  }

  // ---------- particles ----------
  function respawnParticle(p, preferEdge = true) {
    const st = stateRef.current;
    const arr = preferEdge && st.edgePoints.length ? st.edgePoints : st.interiorPoints;
    if (!arr.length) {
      // fallback anywhere in box
      p.x = rand(0, st.width);
      p.y = rand(0, st.height);
    } else {
      const pt = arr[(Math.random() * arr.length) | 0];
      p.x = pt.x + rand(-2, 2);
      p.y = pt.y + rand(-2, 2);
    }

    // Avoid active "holes" (recently cleared brush stamps)
    for (let i = st.holes.length - 1; i >= 0; i--) {
      if (st.holes[i].expires <= performance.now()) st.holes.splice(i, 1);
    }
    for (let i = 0; i < st.holes.length; i++) {
      const h = st.holes[i];
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      if (dx * dx + dy * dy < h.r * h.r) {
        // try again elsewhere
        const pt = st.edgePoints[(Math.random() * st.edgePoints.length) | 0] || { x: st.width / 2, y: st.height / 2 };
        p.x = pt.x;
        p.y = pt.y;
        break;
      }
    }

    const { nx, ny } = gradAtCss(p.x, p.y, 1);
    // Tangent direction along the edge
    const tx = -ny;
    const ty = nx;

    p.vx = tx * rand(0.4, 1.0);
    p.vy = ty * rand(0.4, 1.0);
    p.size = rand(tileSizeMin, tileSizeMax);
    p.life = rand(2500, 5200); // ms
    p.born = performance.now();
    p.mode = "orbit"; // orbit | evac | fade
    p.seed = Math.random() * 1000;
  }

  function initParticles() {
    const st = stateRef.current;
    const cap = st.maxTiles;
    st.parts = new Array(cap);
    for (let i = 0; i < cap; i++) {
      st.parts[i] = {
        x: 0, y: 0, vx: 0, vy: 0, size: 3,
        life: 0, born: 0, mode: "orbit", seed: Math.random() * 1000,
      };
      respawnParticle(st.parts[i], true);
    }
  }

  // ---------- main loop ----------
  function tick(now) {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!st.lastTime) st.lastTime = now;
    let dt = now - st.lastTime;
    st.lastTime = now;

    // If not visible or reduced motion → draw nothing / minimal
    if (!st.ioVisible || prefersReducedMotion) {
      ctx.clearRect(0, 0, st.width, st.height);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Budget: optionally update only a fraction per frame under load
    const stepEvery = updateBudgetPct <= 0 ? 2 : Math.max(1, Math.round(1 / clamp(updateBudgetPct, 0.15, 1)));
    const tSec = now * 0.001;

    // Draw
    ctx.clearRect(0, 0, st.width, st.height);

    const pointer = st.pointer;
    const isMobile = window.innerWidth < 768;
    const brushR = (isMobile ? 0.75 : 1) * clearBrushRadius;

    for (let i = 0; i < st.parts.length; i++) {
      const p = st.parts[i];

      if (i % stepEvery === 0) {
        // forces
        const a = alphaAtCss(p.x, p.y);
        const g = gradAtCss(p.x, p.y, 1.2);
        // tangent/normal
        const tx = -g.ny, ty = g.nx;

        // Edge strength: 1 at alpha≈0.5, 0 at alpha≈0 or 1; also scale by gradient mag
        const edgeBand = 1 - Math.abs(a - 0.5) / 0.5; // 0..1
        const edgeStrength = clamp(edgeBand * g.mag * 4.0, 0, 1); // boost a bit

        // Orbit (tangent) + glue toward band center (alpha ~ 0.5)
        const towardEdge = (a < 0.5 ? 1 : -1); // push inside when outside, and vice versa
        let ax = tx * orbitSpeed * edgeStrength + g.nx * towardEdge * edgeGlue * edgeStrength;
        let ay = ty * orbitSpeed * edgeStrength + g.ny * towardEdge * edgeGlue * edgeStrength;

        // Subtle noise drift
        const n = Math.sin((p.seed + p.x * 0.015 + p.y * 0.01) + tSec * 0.8);
        ax += Math.cos(n * 6.283) * noiseAmp * 0.1;
        ay += Math.sin(n * 6.283) * noiseAmp * 0.1;

        // Pointer clearing (repel + brief fade)
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const r2 = brushR * brushR;
          if (d2 < r2) {
            const d = Math.max(1e-3, Math.sqrt(d2));
            const falloff = 1 - clamp(d / brushR, 0, 1); // 1 at center → 0 at edge
            const strength = clearBrushHardness * falloff * 3.2;
            // Evacuate outward along normal and slide along tangent for a brief “wipe”
            ax += (dx / d) * strength + tx * strength * 0.35;
            ay += (dy / d) * strength + ty * strength * 0.35;

            // Age faster (fade sooner)
            p.life -= 14 * falloff; // ms equivalent shrink
          }
        }

        // Integrate
        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;

        // Clamp speed
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > maxSpeed) {
          p.vx = (p.vx / spd) * maxSpeed;
          p.vy = (p.vy / spd) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;

        // Soft bounds: keep near the canvas; if far, respawn
        if (
          p.x < -40 || p.x > st.width + 40 ||
          p.y < -40 || p.y > st.height + 40 ||
          p.life <= 0
        ) {
          respawnParticle(p, true);
        }
      }

      // Color: active vs placed by local speed & edge strength
      const spd = Math.hypot(p.vx, p.vy);
      const activeMix = clamp(spd / 1.2, 0, 1); // faster → more active tint
      const r = Math.round(lerp(cPlaced.r, cActive.r, activeMix));
      const gcol = Math.round(lerp(cPlaced.g, cActive.g, activeMix));
      const b = Math.round(lerp(cPlaced.b, cActive.b, activeMix));

      // Alpha: modest, to keep text readable
      ctx.globalAlpha = 0.28; // globally subtle
      ctx.fillStyle = `rgb(${r},${gcol},${b})`;

      const s = p.size;
      ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  // ---------- lifecycle ----------
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!wrap || !canvas || !h1) return;

    // Layering
    Object.assign(canvas.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      zIndex: "0",
    });
    Object.assign(h1.style, {
      position: "relative",
      zIndex: "1",
      margin: "0",
      whiteSpace: "normal",
      width: "100%",
      color: finalTextColor,
      textAlign: "center",
    });

    const rebuild = () => {
      cancelAnimationFrame(rafRef.current || 0);
      measureAndBuildMask();
      if (!prefersReducedMotion) {
        initParticles();
        stateRef.current.lastTime = 0;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const doInitial = () => rebuild();
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(doInitial);
    } else {
      doInitial();
    }

    // ResizeObserver: rebuild on width changes
    const ro = new ResizeObserver(() => rebuild());
    ro.observe(wrap);

    // IntersectionObserver: throttle when off-screen
    const io = new IntersectionObserver(
      (entries) => {
        stateRef.current.ioVisible = !!entries[0]?.isIntersecting;
      },
      { root: null, threshold: 0 }
    );
    io.observe(wrap);

    // Pointer events (brush)
    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      let x, y;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      const st = stateRef.current;
      st.pointer.x = x;
      st.pointer.y = y;
      st.pointer.active = true;

      // Stamp a "hole" (cooldown region) so respawns avoid it briefly
      const isMobile = window.innerWidth < 768;
      const r = (isMobile ? 0.75 : 1) * clearBrushRadius * 0.9;
      st.holes.push({ x, y, r, expires: performance.now() + clearCooldownMs });
      // prune a bit
      if (st.holes.length > 64) st.holes.splice(0, st.holes.length - 64);
    };
    const onLeave = () => {
      stateRef.current.pointer.active = false;
    };

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    wrap.addEventListener("touchstart", onMove, { passive: true });
    wrap.addEventListener("touchmove", onMove, { passive: true });
    wrap.addEventListener("touchend", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current || 0);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("touchstart", onMove);
      wrap.removeEventListener("touchmove", onMove);
      wrap.removeEventListener("touchend", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    text,
    className,
    activeColor,
    placedColor,
    finalTextColor,
    desktopMaxTiles,
    mobileMaxTiles,
    tileSizeMin,
    tileSizeMax,
    orbitSpeed,
    edgeGlue,
    noiseAmp,
    damping,
    maxSpeed,
    clearBrushRadius,
    clearBrushHardness,
    clearCooldownMs,
    updateBudgetPct,
    prefersReducedMotion,
  ]);

  // Render (canvas behind, h1 on top)
  const domLines = String(text).split("\n");
  return (
    <div ref={wrapRef} className="relative mx-auto w-full text-center select-none">
      <canvas ref={canvasRef} className="block w-full h-auto" aria-hidden />
      <h1 ref={h1Ref} className={className}>
        {domLines.map((ln, i) => (
          <span key={i}>
            {ln}
            {i < domLines.length - 1 && <br />}
          </span>
        ))}
      </h1>
    </div>
  );
}