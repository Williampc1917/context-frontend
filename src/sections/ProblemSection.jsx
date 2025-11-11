// ProblemSection.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* =========================
   VoiceParticles (Canvas) — Smooth Wave in Bits (no grid)
   ========================= */
function VoiceParticles({
  play,
  delay = 0,
  reducedMotion = false,
  height = 96,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const roRef = useRef(null);
  const startTimer = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    let running = false;

    // animation state
    let phase = 0;
    let boost = 0;
    let width = 0;
    let heightPx = height;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let tPrev = 0;

    const cfg = {
      baseAmp: 18, // baseline amplitude (CSS px @ DPR 1)
      speed: 0.015, // carrier phase speed
      freq: 2.2, // carrier frequency
      fadeAlpha: 0.36, // bits alpha
      bitGapCss: 10, // horizontal spacing between bits (CSS px)
      bitScale: 0.52, // bit size relative to gap
      fillMain: "#ff8a3d",
      fillEcho: "rgba(255,179,106,0.35)",
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(0, Math.floor(rect.width));
      const small = width < 640;
      heightPx = small ? Math.min(height, 64) : height;

      // amplitude auto-scale for small widths
      const ampScale = small ? 0.6 : 1;
      cfg.baseAmp = 18 * ampScale;

      canvas.style.width = width + "px";
      canvas.style.height = heightPx + "px";
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(heightPx * dpr));
    };

    const draw = () => {
      if (!running) return;

      const now = performance.now() / 1000;
      const dt = tPrev ? Math.min(0.05, now - tPrev) : 0.016;
      tPrev = now;

      // gentle breathing so it never feels robotic
      const breath = 0.9 + 0.1 * Math.sin(now * 0.65);
      boost *= 0.94; // decay scroll boost
      phase += cfg.speed;

      const { width: cw, height: ch } = canvas;
      ctx.clearRect(0, 0, cw, ch);

      const midY = ch / 2;
      const gapPx = Math.max(6, cfg.bitGapCss) * dpr; // device px
      const bitSize = Math.max(2, Math.floor(gapPx * cfg.bitScale));
      const ampPx = cfg.baseAmp * (breath + boost * 0.8) * dpr;

      ctx.globalAlpha = reducedMotion ? 0.22 : cfg.fadeAlpha;

      const count = Math.floor((cw / gapPx) | 0);

      for (let i = 0; i <= count; i++) {
        const x = i * gapPx + gapPx * 0.5; // center column

        // normalized across 0..1
        const t = i / Math.max(1, count);

        // gaussian energy envelope (more motion near center)
        const center = 0.5,
          sigma = 0.22;
        const gauss = Math.exp(-0.5 * Math.pow((t - center) / sigma, 2));

        // carrier wave
        const ySignal = Math.sin(t * Math.PI * 2 * cfg.freq + phase);
        const y = midY + ySignal * ampPx * (0.35 + gauss * 0.65);

        // square bit centered at (x, y)
        const rx = Math.round(x - bitSize / 2);
        const ry = Math.round(y - bitSize / 2);

        // main bit
        ctx.fillStyle = cfg.fillMain;
        ctx.fillRect(rx, ry, bitSize, bitSize);

        // faint echo/glow just above (adds depth while staying “bitty”)
        ctx.fillStyle = cfg.fillEcho;
        ctx.fillRect(
          rx,
          ry - 1 * dpr,
          bitSize,
          Math.max(1, Math.floor(bitSize * 0.85)),
        );
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      boost = Math.min(1, boost + 0.35);
    };

    const start = () => {
      if (running) return;
      running = true;
      resize();
      tPrev = performance.now() / 1000;
      rafRef.current = requestAnimationFrame(draw);
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
    };

    roRef.current = new ResizeObserver(() => resize());
    roRef.current.observe(wrap);

    if (play) {
      if (reducedMotion) {
        // static snapshot for reduced-motion
        startTimer.current = setTimeout(() => {
          resize();
          const { width: cw, height: ch } = canvas;
          ctx.clearRect(0, 0, cw, ch);

          const midY = ch / 2;
          const gapPx = Math.max(6, cfg.bitGapCss) * dpr;
          const bitSize = Math.max(2, Math.floor(gapPx * cfg.bitScale));
          const amp = cfg.baseAmp * dpr;
          ctx.globalAlpha = 0.22;

          const count = Math.floor((cw / gapPx) | 0);
          for (let i = 0; i <= count; i++) {
            const x = i * gapPx + gapPx * 0.5;
            const t = i / Math.max(1, count);
            const center = 0.5,
              sigma = 0.22;
            const gauss = Math.exp(-0.5 * Math.pow((t - center) / sigma, 2));
            const ySignal = Math.sin(t * Math.PI * 2 * cfg.freq);
            const y = midY + ySignal * amp * (0.35 + gauss * 0.65);

            const rx = Math.round(x - bitSize / 2);
            const ry = Math.round(y - bitSize / 2);
            ctx.fillStyle = cfg.fillMain;
            ctx.fillRect(rx, ry, bitSize, bitSize);
          }
        }, delay * 1000);
      } else {
        startTimer.current = setTimeout(start, delay * 1000);
      }
    }

    return () => {
      stop();
      roRef.current?.disconnect();
      if (startTimer.current) clearTimeout(startTimer.current);
    };
  }, [play, delay, reducedMotion, height]);

  return (
    <div ref={wrapRef} className="particlesWrap">
      <canvas ref={canvasRef} />
    </div>
  );
}

/* =========================
   Section (headline + typing, no clipping)
   ========================= */
export default function ProblemSection() {
  const sectionRef = useRef(null);
  const boxRef = useRef(null);
  const measureRef = useRef(null);
  const rafFitRef = useRef(0);
  const getIsMobile = () =>
    typeof window !== "undefined"
      ? window.matchMedia?.("(max-width: 900px)")?.matches ?? false
      : false;

  const [play, setPlay] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [fontPx, setFontPx] = useState(180);
  const [textWidthPx, setTextWidthPx] = useState(0);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [mobileHeadlineVisible, setMobileHeadlineVisible] = useState(false);
  const [mobileSublineVisible, setMobileSublineVisible] = useState(false);
  const [mobileWaveVisible, setMobileWaveVisible] = useState(false);
  const mobileSequenceStartedRef = useRef(false);
  const mobileTimersRef = useRef([]);

  const line1 = "You type. You scroll. You drown in inboxes.";
  const line2 = "CLARO AI lets you talk your work into motion.";
  const mobileLines = useMemo(
    () => ["You type.", "You scroll.", "You drown", "in inboxes"],
    [],
  );
  const clearMobileTimers = useCallback(() => {
    mobileTimersRef.current.forEach((id) => clearTimeout(id));
    mobileTimersRef.current = [];
  }, []);

  const chars = useMemo(() => Array.from(line1).length, [line1]);
  const typeSpeed = 0.045;
  const typeDur = +(chars * typeSpeed).toFixed(2);
  const waveDelay = typeDur + 0.05;

  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(!!m?.matches);
    on();
    m?.addEventListener?.("change", on);
    return () => m?.removeEventListener?.("change", on);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 900px)");
    const update = () => setIsMobile(!!mq?.matches);
    update();
    if (mq) {
      if (mq.addEventListener) {
        mq.addEventListener("change", update);
      } else if (mq.addListener) {
        mq.addListener(update);
      }
    }
    return () => {
      if (mq) {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", update);
        } else if (mq.removeListener) {
          mq.removeListener(update);
        }
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      clearMobileTimers();
    };
  }, [clearMobileTimers]);

  useEffect(() => {
    if (!isMobile) {
      clearMobileTimers();
      mobileSequenceStartedRef.current = false;
      setMobileHeadlineVisible(false);
      setMobileSublineVisible(false);
      setMobileWaveVisible(false);
    }
  }, [isMobile, clearMobileTimers]);

  useEffect(() => {
    if (reduce) {
      setPlay(false);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    let mobileHasActivated = mobileSequenceStartedRef.current;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (isMobile) {
          if (entry.isIntersecting && !mobileHasActivated) {
            mobileHasActivated = true;
            setPlay(true);
          } else if (entry.isIntersecting && mobileHasActivated) {
            setPlay(true);
          }
          return;
        }
        setPlay(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (!isMobile) setPlay(false);
    };
  }, [reduce, isMobile]);

  useEffect(() => {
    if (!isMobile || reduce || !play) return;
    if (mobileSequenceStartedRef.current) return;

    mobileSequenceStartedRef.current = true;
    setMobileHeadlineVisible(true);

    const headlineToSubDelay = 260;
    const subToWaveDelay = 600;
    const subTimer = window.setTimeout(() => {
      setMobileSublineVisible(true);
    }, headlineToSubDelay);
    const waveTimer = window.setTimeout(() => {
      setMobileWaveVisible(true);
    }, subToWaveDelay);

    mobileTimersRef.current.push(subTimer, waveTimer);
  }, [isMobile, reduce, play]);

  useEffect(() => {
    if (!isMobile) return;
    if (reduce) {
      clearMobileTimers();
      mobileSequenceStartedRef.current = true;
      setMobileHeadlineVisible(true);
      setMobileSublineVisible(true);
      setMobileWaveVisible(false);
    }
  }, [isMobile, reduce, clearMobileTimers]);

  // Fit single-line headline (no clipping, resize-safe)
  useEffect(() => {
    const fitNow = () => {
      const box = boxRef.current,
        meas = measureRef.current;
      if (!box || !meas) return;

      const MIN = 32,
        BASE = 220,
        MAX = 360;
      const avail = box.clientWidth || 0;
      if (!avail) return;

      const MARGIN = Math.max(12, Math.round(avail * 0.012));
      const SAFETY = 6;

      meas.style.fontSize = `${BASE}px`;
      const baseWidth = meas.getBoundingClientRect().width || 1;

      const targetAvail = Math.max(1, avail - MARGIN - SAFETY);
      const scale = targetAvail / baseWidth;
      const proposed = Math.max(MIN, Math.min(MAX, BASE * scale));

      meas.style.fontSize = `${proposed}px`;
      const exactWidth = meas.getBoundingClientRect().width;

      const finalFont =
        exactWidth > targetAvail
          ? Math.max(MIN, proposed * (targetAvail / exactWidth))
          : proposed;

      meas.style.fontSize = `${finalFont}px`;
      const finalWidth = meas.getBoundingClientRect().width + SAFETY;

      const r2 = (v) => Math.round(v * 100) / 100;
      const nextFs = r2(finalFont);
      const nextTw = r2(Math.min(finalWidth, targetAvail));

      if (Math.abs(nextFs - fontPx) > 0.25) setFontPx(nextFs);
      if (Math.abs(nextTw - textWidthPx) > 0.5) setTextWidthPx(nextTw);
    };

    const fit = () => {
      if (rafFitRef.current) cancelAnimationFrame(rafFitRef.current);
      rafFitRef.current = requestAnimationFrame(() => {
        rafFitRef.current = 0;
        fitNow();
      });
    };

    fit();
    const ro = new ResizeObserver(() => fit());
    boxRef.current && ro.observe(boxRef.current);
    window.addEventListener("resize", fit);
    return () => {
      if (rafFitRef.current) cancelAnimationFrame(rafFitRef.current);
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [line1, fontPx, textWidthPx]);

  const effectiveWaveDelay = isMobile ? 0.05 : waveDelay;
  const effectiveTypeDuration = isMobile ? 0 : typeDur;

  const vars = useMemo(
    () => ({
      ["--chars"]: chars,
      ["--type-dur"]: `${effectiveTypeDuration}s`,
      ["--wave-delay"]: `${effectiveWaveDelay}s`,
      ["--fs"]: `${fontPx}px`,
      ["--text-w"]: `${Math.max(0, textWidthPx)}px`,
      ["--reveal-pad"]: "0.18em", // protect descenders from clipping
    }),
    [chars, effectiveTypeDuration, effectiveWaveDelay, fontPx, textWidthPx],
  );

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden py-16 sm:py-20 md:py-28 ${play ? "is-play" : ""} ${reduce ? "is-reduced" : ""} ${isMobile ? "is-mobile" : ""}`}
      style={vars}
    >
      <div
        className="mx-auto w-full px-4 sm:px-6 md:px-8"
        style={{ maxWidth: "min(1800px, 100%)" }}
      >
        {/* offscreen measurer */}
        <span ref={measureRef} className="measure" aria-hidden="true">
          {line1}
        </span>

        <div ref={boxRef} className="headlineBox">
          {!isMobile && (
            <h1 className="headline typedHead" style={{ fontSize: "var(--fs)" }}>
              <span className="type">
                <span className="type__text" aria-hidden="true">
                  {line1}
                </span>
                <span className="sr-only">{line1}</span>
                <span className="caret" aria-hidden="true" />
              </span>
            </h1>
          )}

          {isMobile && (
            <h1
              className={`headline mobileHead transition-all duration-500 ${
                mobileHeadlineVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {mobileLines.map((text, idx) => (
                <span key={idx} className="mobileLine">
                  {text}
                </span>
              ))}
            </h1>
          )}
        </div>

        {isMobile ? (
          <p
            className="subline"
            style={{
              opacity: mobileSublineVisible ? 1 : 0,
              transform: mobileSublineVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
            }}
          >
            {line2}
          </p>
        ) : (
          <p className="subline">{line2}</p>
        )}

        <div
          className={
            isMobile
              ? `transition-all duration-500 ${
                  mobileWaveVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`
              : ""
          }
        >
          {!reduce && (!isMobile || mobileWaveVisible) && (
            <VoiceParticles play={play} delay={isMobile ? 0 : waveDelay} height={96} />
          )}
        </div>
      </div>

      <style>{`
        .headlineBox { width: 100%; overflow: visible; }
        .headline {
          margin: 0;
          line-height: 1.06;
          font-weight: 800;
          color: #0b0d10;
          letter-spacing: -0.012em;
          text-rendering: optimizeLegibility;
        }

        .measure {
          position: absolute; left: -9999px; top: -9999px;
          white-space: nowrap; font-weight: 800; font-size: 220px; line-height: 1.06;
          font-family: inherit; visibility: hidden; pointer-events: none;
        }

        .typedHead { display: block; }
        .type { position: relative; display: inline-block; white-space: nowrap; margin-bottom: calc(var(--reveal-pad) * -1); }
        .type__text { display: inline-block; overflow: hidden; width: 0; padding-bottom: var(--reveal-pad); }
        .caret { position: absolute; top: 0; bottom: -0.05em; left: 0; width: 3px; background: #111827; transform: translateX(0); }

        
        .mobileHead {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          margin: 0;
          width: min(100%, 480px);
          text-align: left;
          letter-spacing: -0.015em;
          line-height: 1.02;
          gap: 0.05em;
        }
        .mobileLine {
          display: block;
          font-size: clamp(56px, 16vw, 120px);
          font-weight: 800;
          width: 100%;
        }

        .subline { margin-top: 18px; font-size: clamp(26px, 4.5vw, 44px); color: #4b5563; opacity: 0; transform: translateY(6px); }

        .particlesWrap { margin-top: 28px; opacity: 0; pointer-events: none; width: 100%; height: 96px; }
        .particlesWrap canvas { width: 100%; height: 100%; display: block; }

        .is-play .type__text { animation: typingPx var(--type-dur) steps(var(--chars)) forwards; }
        .is-play .caret { animation: caretFollowPx var(--type-dur) steps(var(--chars)) forwards, caretBlink 0.9s step-end var(--type-dur) infinite; }
        .is-play .subline { animation: fadeUp .6s ease-out calc(var(--wave-delay) + .15s) forwards; }
        .is-play .particlesWrap { animation: voiceShow .6s ease var(--wave-delay) forwards; }

        @keyframes typingPx      { from { width: 0; } to { width: var(--text-w); } }
        @keyframes caretFollowPx { from { transform: translateX(0); } to { transform: translateX(var(--text-w)); } }
        @keyframes caretBlink    { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
        @keyframes fadeUp        { to { opacity: 1; transform: translateY(0); } }
        @keyframes voiceShow     { to { opacity: 1; } }

        @media (max-width: 900px) {
          .subline   { font-size: clamp(22px, 7vw, 34px); }
          .particlesWrap { height: 64px; }
        }

        .is-reduced .type__text { width: auto !important; }
        .is-reduced .caret { animation: none !important; transform: translateX(var(--text-w)) !important; opacity: 1 !important; }
        .is-reduced .subline { opacity: 1 !important; transform: none !important; }
        .is-reduced .particlesWrap { opacity: 1 !important; }
      `}</style>
    </section>
  );
}
