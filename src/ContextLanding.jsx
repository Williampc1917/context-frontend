import { useEffect, useState, useCallback, useRef } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight, Menu, X } from "lucide-react";
import "./index.css";
import { rafThrottle } from "./utils/throttle";
import { useForm, ValidationError } from "@formspree/react";
import { useSection } from "./hooks/useSection";
import React from "react";

// Import sections directly - no lazy loading
import ProblemSection from "./sections/ProblemSection.jsx";
import SolutionSection from "./sections/SolutionSection.jsx";
import HowItWorksSection from "./sections/HowItWorksSection.jsx";

export default function ContextLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { ref: waitlistRef, isVisible: waitlistVisible } = useSection({
    threshold: 0.15,
    rootMargin: "0px 0px -30% 0px",
  });

  // Throttled scroll handler for better performance
  useEffect(() => {
    const handleScroll = rafThrottle(() => {
      setScrolled(window.scrollY > 10);
    });

    // Passive listener - browser knows we won't preventDefault
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const hasLoadedRef = useRef(document.readyState === "complete");

  useEffect(() => {
    const onLoad = () => {
      hasLoadedRef.current = true;
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const run = () => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    // 1) Initial attempt
    run();

    // 2) If page hasn't fully loaded, correct once it is
    if (!hasLoadedRef.current) {
      window.addEventListener(
        "load",
        () => {
          setTimeout(run, 100);
        },
        { once: true },
      );
    }

    // 3) Retry a couple times to fight late layout shifts
    let tries = 0;
    const retry = () => {
      tries += 1;
      const rect = el.getBoundingClientRect();
      const headerH =
        document.querySelector("nav")?.getBoundingClientRect().height ?? 0;

      // If the top of the target is not within ~header height from the top, correct it
      if (rect.top < 0 || rect.top > headerH + 12) {
        run();
      }
      if (tries < 3) setTimeout(retry, 280);
    };
    setTimeout(retry, 280);

    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  return (
    <div className="relative min-h-screen overflow-x-clip text-gray-900 bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-20">
        {/* Use CSS animation instead of Framer Motion parallax */}
        <div className="hero-orb hero-orb-1">
          <div className="size-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,.22),transparent_65%)]" />
        </div>
        <div className="hero-orb hero-orb-2">
          <div className="size-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,.22),transparent_65%)]" />
        </div>
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#FAF9F7]/80 via-[#FAF9F7]/40 to-transparent backdrop-blur-sm" />
      </div>
      <div className="bg-noise pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light opacity-60" />

      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/35 backdrop-blur-2xl border-b border-white/30 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div
            onClick={() => scrollTo("top")}
            className="flex items-center gap-[10px] cursor-pointer select-none"
          >
            {/* Waveform SVG logo */}
            <img
              src="/waveform.svg"
              alt="ClaroAI waveform logo"
              className="h-8 w-8 md:h-9 md:w-9 object-contain relative top-[1px]" // ⬆️ pushes logo up 1px visually
            />

            {/* Logotype */}
            <span className="text-[20px] md:text-[22px] font-silkscreen tracking-tight leading-none relative top-[0.5px]">
              <span className="text-[#E07A5F]">Claro</span>
              <span className="text-[#3D405B]">AI</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <button
              onClick={() => scrollTo("problem")}
              className="hover:text-gray-600 transition-colors"
            >
              The problem
            </button>
            <button
              onClick={() => scrollTo("solution")}
              className="hover:text-gray-600 transition-colors"
            >
              Solution
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="hover:text-gray-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how")}
              className="hover:text-gray-600 transition-colors"
            >
              How it works
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("waitlist")}
              className="hidden btn-primary sm:inline-flex"
            >
              Join the waitlist
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 p-2 text-gray-700 shadow-sm transition-colors hover:bg-white md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-14 inset-x-0 z-50 px-4 pt-4 pb-6 md:hidden">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-xl">
              <div className="space-y-2">
                <MobileNavButton
                  label="The problem"
                  onClick={() => scrollTo("problem")}
                />
                <MobileNavButton
                  label="Solution"
                  onClick={() => scrollTo("solution")}
                />
                <MobileNavButton
                  label="Features"
                  onClick={() => scrollTo("features")}
                />
                <MobileNavButton
                  label="How it works"
                  onClick={() => scrollTo("how")}
                />
                <MobileNavButton
                  label="Waitlist"
                  onClick={() => scrollTo("waitlist")}
                />
              </div>
              <button
                onClick={() => scrollTo("waitlist")}
                className="btn-primary mt-4 w-full justify-center"
              >
                Join the waitlist
              </button>
            </div>
          </div>
        </>
      ) : null}

      <section
        id="top"
        className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-28 md:pt-36 pb-18 lg:px-8 text-center"
      >
        {/* Floating brand logos */}
        <FloatingLogo
          src={`${import.meta.env.BASE_URL}gmail.svg`}
          alt="Gmail"
          className="absolute left-[10%] top-[22%] w-[90px] sm:w-[110px] lg:w-[140px]"
          delay={0}
          hideBelow="md"
        />

        <FloatingLogo
          src={`${import.meta.env.BASE_URL}google-calendar.svg`}
          alt="Google Calendar"
          className="absolute right-[10%] bottom-[20%] w-[95px] sm:w-[115px] lg:w-[145px]"
          delay={0.4}
          hideBelow="md"
        />

        {/* Hero text block */}
        <div className="hero-content flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center">
          <BitBuildHeadline
            text={"Clarity for the way you\nconnect"}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]"
            activeColor="#E07A5F"
            placedColor="#3D405B"
            finalTextColor="#2E3148"
            // more tiles, smaller final squares
            desktopMaxBits={4000} // was 1600
            mobileMaxBits={1800} // was 520
            cellStart={12} // was 14 (slightly smaller starting squares)
            cellEnd={3} // was 7 (higher final “resolution”)
            // slower build + longer runway
            poolIntervalMs={650} // was 420
            hardStopMsDesktop={5200} // was 3200
            hardStopMsMobile={3800} // was 2400
            finalHoldMs={320} // was 140 (gives a breather before the fade)
            blendColors={true}
          />

          <p className="mt-6 text-lg sm:text-xl text-[#3D405B]/80 max-w-2xl mx-auto">
            ClaroAI is a voice assistant for your email and calendar. It
            understands how you connect — who matters, how you communicate, and
            when to reach out.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => scrollTo("waitlist")}
              className="btn-primary bg-[#E07A5F] hover:bg-[#d36f56]"
            >
              Join the waitlist
            </button>
            <button
              onClick={() => scrollTo("how")}
              className="btn-glass text-[#3D405B] border-[#3D405B]/20 hover:bg-white/80"
            >
              See how it works <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Device preview */}
        <div className="hero-iphone relative mx-auto mt-12 max-w-5xl">
          <div className="iphone-shell">
            <div className="iphone-notch" aria-hidden />
            <div className="ls-card">
              <div className="ls-left">
                <div className="ls-mic">
                  <Mic size={18} />
                </div>
              </div>
              <div className="ls-bubble">
                "Morning! 6 emails from your Top 20 need a nudge. Jennifer
                hasn't heard from you in 9 days."
              </div>
            </div>
            <div className="ls-your-reply">
              "Draft a warm follow-up and suggest Friday 2pm."
            </div>
            <div className="ls-tip">
              <span className="ls-tip-badge">Tip</span>
              <span className="align-middle">
                Try: "Draft a warm follow-up to Jennifer & propose Fri 2pm."
              </span>
            </div>
          </div>

          <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(99,102,241,.12),transparent_60%)]" />
        </div>
      </section>

      {/* Problem section */}
      <section
        id="problem"
        className="section-plain px-6 py-20 lg:px-8 scroll-mt-24 lg:scroll-mt-32"
      >
        <div className="mx-auto max-w-7xl">
          <ProblemSection />
        </div>
      </section>

      {/* Solution section */}
      <section
        id="solution"
        className="section-grad px-6 py-24 lg:px-8 scroll-mt-24 lg:scroll-mt-32"
      >
        <div className="mx-auto max-w-7xl">
          <SolutionSection />
        </div>
      </section>

      {/* How it works section */}
      <section
        id="how"
        className="section-plain px-6 py-24 scroll-mt-24 lg:scroll-mt-32"
      >
        <div className="mx-auto max-w-7xl">
          <HowItWorksSection />
        </div>
      </section>

      {/* Waitlist section */}
      <section
        id="waitlist"
        ref={waitlistRef}
        data-revealed={waitlistVisible}
        className="waitlist-section section-grad px-6 py-24 lg:px-8 scroll-mt-24 lg:scroll-mt-32"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold tracking-tight">
            Intelligence for how you connect.
          </h3>
          <p className="mt-3 text-lg text-gray-600">
            Join professionals who manage their most important relationships
            with Context.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="section-plain px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-xl font-semibold">Context</div>
              <p className="mt-2 text-gray-600">
                Relationship intelligence for busy professionals.
              </p>
            </div>
            <FooterCol
              title="Product"
              items={[
                { label: "Features", target: "features" },
                { label: "Solution", target: "solution" },
                { label: "Waitlist", target: "waitlist" },
                { label: "Security", href: "#" },
              ]}
              onNavigate={scrollTo}
            />
            <FooterCol
              title="Company"
              items={["About", "Blog", "Careers"]}
              onNavigate={scrollTo}
            />
            <FooterCol
              title="Legal"
              items={["Privacy", "Terms", "Contact"]}
              onNavigate={scrollTo}
            />
          </div>
          <div className="mt-8 text-center text-gray-600">
            © {new Date().getFullYear()} Context. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span>{label}</span>
      <ArrowRight size={16} className="text-gray-400" aria-hidden />
    </button>
  );
}

function WaitlistForm() {
  // ⬅️ Put your Formspree form ID here
  const [state, handleSubmit] = useForm("mvgwwnrp");
  const [email, setEmail] = useState("");

  const hasError = state.errors && state.errors.length > 0;

  // ✅ SUCCESS VIEW
  if (state.succeeded) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/60 bg-white/70 p-5 text-center backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,.08)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.12, 1] }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600 shadow"
            aria-hidden
          >
            ✓
          </motion.div>
          <h4 className="text-lg font-semibold">All set.</h4>
          <p className="mt-1 text-sm text-gray-600">
            We’ll reach out to <span className="font-medium">{email}</span>.
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  // 🧾 FORM (idle / submitting / error)
  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        // Formspree handles the POST + validation
        handleSubmit(e);
      }}
      className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
      // Subtle shake if Formspree returns an error
      animate={hasError ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
      aria-live="polite"
    >
      <input
        required
        type="email"
        id="email"
        name="email" // 👈 Formspree requires a name
        placeholder="you@company.com"
        className="w-full rounded-full border border-white/60 bg-white/80 px-4 py-3 text-sm outline-none backdrop-blur-xl focus:border-indigo-400"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.submitting}
      />

      <button
        type="submit"
        disabled={state.submitting}
        className={`relative btn-primary overflow-hidden transition-all ${
          state.submitting ? "brightness-95 opacity-90" : "hover:scale-[1.02]"
        }`}
      >
        {/* Idle label */}
        <span className={state.submitting ? "invisible" : "visible"}>
          Join the waitlist
        </span>

        {/* ✨ Three-dot loader (Apple-y, inside the button) */}
        {state.submitting && (
          <span className="absolute inset-0 flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.3, y: 0 }}
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              />
            ))}
          </span>
        )}
      </button>

      {/* Inline field error (from Formspree) */}
      <ValidationError prefix="Email" field="email" errors={state.errors} />

      {/* Generic error line for non-field issues */}
      {hasError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-rose-600 mt-2"
          role="alert"
        >
          Something went wrong. Please try again.
        </motion.p>
      )}
    </motion.form>
  );
}

function FooterCol({ title, items, onNavigate }) {
  return (
    <div>
      <div className="mb-3 font-semibold">{title}</div>
      <ul className="space-y-2 text-gray-600">
        {items.map((item) => {
          const key = typeof item === "string" ? item : item.label;
          const href =
            typeof item === "string"
              ? "#"
              : item.target
                ? `#${item.target}`
                : item.href || "#";

          const handleClick =
            typeof item === "string" || !item.target
              ? undefined
              : (event) => {
                  event.preventDefault();
                  onNavigate?.(item.target);
                };

          return (
            <li key={key}>
              <a
                className="hover:text-gray-900 transition-colors"
                href={href}
                onClick={handleClick}
              >
                {key}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FloatingLogo({
  src,
  alt,
  className = "",
  delay = 0,
  brightness = 0.38,
  hideBelow,
}) {
  const prefersReducedMotion = useReducedMotion();
  const visibilityClass = hideBelow ? `hidden ${hideBelow}:block` : "";

  return (
    <img
      src={src}
      alt={alt}
      className={`floating-logo pointer-events-none absolute z-10 select-none drop-shadow-[0_10px_26px_rgba(0,0,0,.22)] ${visibilityClass} ${className} ${
        prefersReducedMotion ? "floating-logo-static" : ""
      }`}
      style={{
        opacity: brightness,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

/**
 * BitBuildHeadline — smoother, earlier, seamless swap (tiles → crisp text)
 * (hardened: container-width measuring, no post-swap font remeasure, width-gated reflow)
 */
export function BitBuildHeadline({
  text = "Clarity for the way you\nconnect",
  className = "",
  activeColor = "#E07A5F",
  placedColor = "#3D405B",
  finalTextColor = "#2E3148",

  // Feel
  cellEnd = 7,
  cellStart = 14,
  drift = 0.06,
  magnet = 0.06,
  magnetBoost = 0.22,
  damping = 0.9,
  snapFactor = 0.42,

  // Per-letter & finale thresholds
  letterCompleteThreshold = 0.85,
  allCompleteThreshold = 0.992,
  finalHoldMs = 140, // kept; not used explicitly
  hardStopMsDesktop = 3200,
  hardStopMsMobile = 2400,

  // Capacity
  desktopMaxBits = 3200,
  mobileMaxBits = 1800,

  // Animation pacing
  poolIntervalMs = 520,
  blendColors = true,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const h1Ref = useRef(null);
  const rafRef = useRef(0);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!wrap || !canvas || !h1) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    const off = document.createElement("canvas");
    const octx = off.getContext("2d");

    // Device / layout
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0, height = 0;
    let lastWrapWidth = -1; // width gate for ResizeObserver

    // Text/lines
    const lines = String(text).split("\n");
    let fontCSS = "";
    let letterSpacingPx = 0;
    let lineHeightPx = 0;

    // Per-line layout
    const lineCharXs = [];
    const lineCharWs = [];
    const baselineYs = [];
    const lineWidths = [];

    // Per-letter flattening
    const charOffsets = [];
    let totalChars = 0;

    // Targets & particles
    let targets = [];
    let parts = [];
    let perLetterTotal = [];
    let perLetterArrived = [];

    // Densification pools
    let pools = [];
    let activatedPool = 0;

    // Stages
    let startedAt = 0;
    let stage = "build"; // build -> swapToDom -> done
    let stageStart = 0;
    let tileOpacity = 1.0;
    let canvasTextAlpha = 0.0;
    let preInkAlpha = 0.0;

    const maxBits = window.innerWidth < 768 ? mobileMaxBits : desktopMaxBits;
    const hardStopMs =
      window.innerWidth < 768 ? hardStopMsMobile : hardStopMsDesktop;

    const getNum = (v) => (v === "normal" ? NaN : parseFloat(v));
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const lerp = (a, b, t) => a + (b - a) * t;
    const smoothstep = (e0, e1, x) => {
      const t = clamp01((x - e0) / Math.max(1e-6, e1 - e0));
      return t * t * (3 - 2 * t);
    };
    const hexToRgb = (hex) => {
      const s = hex.replace("#", "");
      const n = parseInt(s.length === 3 ? s.split("").map(c => c + c).join("") : s, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };
    const cActive = hexToRgb(activeColor);
    const cPlaced = hexToRgb(placedColor);

    // Average per-letter completion across the whole headline (0..1)
    const getGlobalProgress = () => {
      if (!totalChars) return 0;
      let sum = 0;
      for (let i = 0; i < totalChars; i++) {
        const total = perLetterTotal[i] || 1;
        sum += Math.min(1, (perLetterArrived[i] || 0) / total);
      }
      return sum / totalChars;
    };

    // ─────────────────────────────────────────────────────────────────────
    // POSITIONING — container width, metric-locked height, pinned DOM metrics
    // ─────────────────────────────────────────────────────────────────────
    const measureFromDOM = () => {
      // Read DOM styles
      h1.style.color = finalTextColor;
      const cs = getComputedStyle(h1);
      const ff = cs.fontFamily || "system-ui, sans-serif";
      const fw = cs.fontWeight || "700";
      const fs = cs.fontSize || "64px";
      fontCSS = `${fw} ${fs} ${ff}`;

      const lsNum = getNum(cs.letterSpacing);
      letterSpacingPx = isNaN(lsNum) ? 0 : lsNum;

      // line-height: computed px or fallback
      const lhNum = getNum(cs.lineHeight);
      const fsNum = parseFloat(fs) || 64;
      lineHeightPx = isNaN(lhNum) ? fsNum * 1.2 : lhNum;

      // 🔒 Pin DOM metrics so DOM & canvas line boxes match
      h1.style.lineHeight = `${Math.round(lineHeightPx)}px`;
      h1.style.letterSpacing = `${letterSpacingPx}px`;

      // Measure WIDTH from WRAPPER (decouple from glyph-width changes)
      const containerRect = wrap.getBoundingClientRect();
      width = Math.ceil(containerRect.width);

      // HEIGHT locked to metrics
      const blockHeight = Math.ceil(lineHeightPx * lines.length);
      height = blockHeight;

      // Canvases @ DPR
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = "100%";             // fluid
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      off.width = Math.floor(width * dpr);
      off.height = Math.floor(height * dpr);
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Layer elements (fluid width, fixed metric height)
      Object.assign(wrap.style, {
        position: "relative",
        width: "100%",
        height: `${height}px`,
      });
      Object.assign(canvas.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        opacity: "1",
      });
      Object.assign(h1.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        opacity: "0",
        margin: "0",
        whiteSpace: "normal", // we insert <br/> manually
        textAlign: "center",
        width: "100%",
      });

      // Build mask per line with exact spacing + baseline alignment
      octx.clearRect(0, 0, width, height);
      octx.font = fontCSS;
      octx.textBaseline = "alphabetic";

      // Font metrics
      const metricsAll = octx.measureText(lines.join(" "));
      const ascent = metricsAll.actualBoundingBoxAscent || 0;
      const descent = metricsAll.actualBoundingBoxDescent || 0;
      const glyphHeight = ascent + descent;

      // Top-aligned to our own fixed-height box
      const blockTop = 0;
      baselineYs.length = 0;
      for (let li = 0; li < lines.length; li++) {
        const baseline = Math.round(
          blockTop + li * lineHeightPx + (lineHeightPx - glyphHeight) / 2 + ascent
        );
        baselineYs.push(baseline);
      }

      // Per-line character widths + x positions (center each line)
      lineCharXs.length = 0;
      lineCharWs.length = 0;
      lineWidths.length = 0;
      charOffsets.length = 0;
      totalChars = 0;

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const xs = [];
        const ws = [];
        let lineW = 0;

        for (let ci = 0; ci < line.length; ci++) {
          const w = octx.measureText(line[ci]).width;
          ws.push(w);
          lineW += w + (ci < line.length - 1 ? letterSpacingPx : 0);
        }
        lineWidths.push(lineW);

        const startX = (width - lineW) / 2; // center within wrapper width
        let x = startX;
        for (let ci = 0; ci < line.length; ci++) {
          xs.push(x);
          x += ws[ci] + (ci < line.length - 1 ? letterSpacingPx : 0);
        }

        lineCharXs.push(xs);
        lineCharWs.push(ws);

        // Mask
        octx.fillStyle = "#000";
        for (let ci = 0; ci < line.length; ci++) {
          octx.fillText(line[ci], xs[ci], baselineYs[li]);
        }

        charOffsets.push(totalChars);
        totalChars += line.length;
      }
    };

    const globalIndex = (lineIdx, charIdx) => charOffsets[lineIdx] + charIdx;

    const letterIndexFromX = (lineIdx, x) => {
      const xs = lineCharXs[lineIdx];
      const ws = lineCharWs[lineIdx];
      for (let i = 0; i < xs.length; i++) {
        const start = xs[i];
        const end = start + ws[i] + (i < xs.length - 1 ? letterSpacingPx : 0);
        if (x >= start && x < end) return globalIndex(lineIdx, i);
      }
      return globalIndex(lineIdx, xs.length - 1);
    };

    // ─────────────────────────────────────────────────────────────────────
    // DENSIFICATION
    // ─────────────────────────────────────────────────────────────────────
    const buildPools = () => {
      const makePool = (step) => {
        const list = [];
        for (let li = 0; li < lines.length; li++) {
          const baseline = baselineYs[li];
          const bandTop = baseline - step * 20;
          const bandBottom = baseline + step * 20;

          for (let y = bandTop; y < bandBottom; y += step) {
            for (let x = 0; x < width; x += step) {
              const a = octx.getImageData(
                Math.round(x * dpr), Math.round(y * dpr), 1, 1
              ).data[3];
              if (a > 128) {
                const letterIdx = letterIndexFromX(li, x);
                list.push({ x: x + step / 2, y: y + step / 2, letterIdx });
              }
            }
          }
        }
        return list;
      };

      const s0 = Math.max(8, Math.round(cellStart * 1.05)); // coarse
      const s1 = Math.max(5, Math.round((cellStart + cellEnd) / 2)); // medium
      const s2 = Math.max(3, Math.round(cellEnd)); // fine
      pools = [makePool(s0), makePool(s1), makePool(s2)];
      activatedPool = 0;
    };

    const rebuildPerLetterTotals = () => {
      perLetterTotal = new Array(totalChars).fill(0);
      for (const t of targets) perLetterTotal[t.letterIdx]++;
      // Zero-ink glyphs count as complete
      for (let i = 0; i < totalChars; i++) {
        if (perLetterTotal[i] === 0) perLetterTotal[i] = 1;
      }
      perLetterArrived = new Array(totalChars).fill(0);
    };

    // Particle spawner
    const addParticlesForTargets = (newTargets) => {
      const margin = Math.max(24, Math.min(100, width * 0.12));
      const cx = width / 2;
      const cy = height / 2;
      const a = width / 2 + margin;
      const b = height / 2 + margin;
      const phi0 = Math.random() * Math.PI * 2;

      for (let i = 0; i < newTargets.length; i++) {
        const t = newTargets[i];
        const theta = phi0 + Math.random() * Math.PI * 2;
        const rJitter = 0.88 + Math.random() * 0.38;

        const x0 = cx + a * rJitter * Math.cos(theta);
        const y0 = cy + b * rJitter * Math.sin(theta);

        const dx = t.x - x0;
        const dy = t.y - y0;
        const dist = Math.hypot(dx, dy) || 1;
        const ix = dx / dist;
        const iy = dy / dist;
        const px = -iy;
        const py = ix;

        const baseSpeed = 0.6 + Math.random() * 0.6;
        const swirlAmt = 0.25 + Math.random() * 0.35;

        const vx0 = (ix + px * swirlAmt) * baseSpeed;
        const vy0 = (iy + py * swirlAmt) * baseSpeed;

        const delay = Math.random() * 160 + Math.min(420, dist * 0.22);

        parts.push({
          x: x0, y: y0, vx: vx0, vy: vy0,
          tx: t.x, ty: t.y,
          letterIdx: t.letterIdx,
          delay,
          arrived: false,
        });
      }
    };

    const activateNextPool = () => {
      if (activatedPool >= pools.length) return false;
      const pool = pools[activatedPool++] || [];
      if (!pool.length) return activateNextPool();

      const remaining = Math.max(0, maxBits - targets.length);
      if (remaining <= 0) return false;

      const keepProb = Math.min(1, remaining / pool.length);
      const kept = keepProb >= 0.999 ? pool : pool.filter(() => Math.random() < keepProb);

      targets = targets.concat(kept);
      rebuildPerLetterTotals();
      addParticlesForTargets(kept);
      return true;
    };

    // Crisp text (per-letter reveal)
    const drawCrispLetters = () => {
      ctx.save();
      ctx.fillStyle = finalTextColor;
      ctx.font = fontCSS;
      ctx.textBaseline = "alphabetic";

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        for (let ci = 0; ci < line.length; ci++) {
          const gi = globalIndex(li, ci);
          const total = perLetterTotal[gi] || 1;
          const prog = perLetterArrived[gi] / total;
          const reveal = smoothstep(0.55, 0.92, prog);
          const a = clamp01(reveal * canvasTextAlpha);
          if (a <= 0.001) continue;
          ctx.globalAlpha = a;
          ctx.fillText(line[ci], lineCharXs[li][ci], baselineYs[li]);
        }
      }
      ctx.restore();
    };

    const draw = (now) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!startedAt) startedAt = now;

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      perLetterArrived.fill(0);
      const elapsed = now - startedAt;

      // Densify over time
      const shouldActivate = Math.floor(elapsed / poolIntervalMs);
      while (activatedPool < Math.min(pools.length, shouldActivate + 1)) {
        if (!activateNextPool()) break;
      }

      // Update particles
      for (const p of parts) {
        if (!p.arrived) {
          p.vx += (Math.random() - 0.5) * drift;
          p.vy += (Math.random() - 0.5) * drift;

          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          const d = Math.hypot(dx, dy) || 1;
          let pull = elapsed > p.delay ? (magnet + magnetBoost) * 0.9 : magnet * 0.9;

          const total = perLetterTotal[p.letterIdx] || 1;
          const progLocal = perLetterArrived[p.letterIdx] / total;
          if (progLocal >= letterCompleteThreshold) pull += 0.20;
          if (elapsed > hardStopMs * 0.55) pull += 0.10;

          p.vx += (dx / d) * pull;
          p.vy += (dy / d) * pull;

          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;

          const snapDist = cellEnd * (snapFactor * 0.85);
          const dAfter = Math.hypot(p.tx - p.x, p.ty - p.y);
          if (dAfter < snapDist || elapsed > hardStopMs * 0.7) {
            p.arrived = true;
            p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0;
          }
        }
        if (p.arrived) perLetterArrived[p.letterIdx]++;
      }

      // Completion check
      let allDone = true;
      for (let i = 0; i < totalChars; i++) {
        const total = perLetterTotal[i] || 1;
        const prog = perLetterArrived[i] / total;
        if (prog < allCompleteThreshold) allDone = false;
      }

      // Prefade crisp ink late in BUILD
      const globalProgForPrefade = getGlobalProgress();
      const targetPre = smoothstep(0.78, 0.90, globalProgForPrefade) * 0.10;
      preInkAlpha += (targetPre - preInkAlpha) * 0.06;

      // Tiles
      ctx.save();
      for (const p of parts) {
        const total = perLetterTotal[p.letterIdx] || 1;
        const prog = perLetterArrived[p.letterIdx] / total;
        const t = easeOutCubic(clamp01(prog));
        const s = Math.pow(t, 0.85);
        const tile = Math.round(cellEnd + (cellStart - cellEnd) * (1 - s));

        let localAlpha = tileOpacity;
        if (stage === "swapToDom") {
          const reveal = smoothstep(0.55, 0.92, prog);
          localAlpha = tileOpacity * (1 - reveal);
        }
        ctx.globalAlpha = clamp01(localAlpha);

        if (blendColors) {
          const r = lerp(cActive.r, cPlaced.r, t);
          const g = lerp(cActive.g, cPlaced.g, t);
          const b = lerp(cActive.b, cPlaced.b, t);
          ctx.fillStyle = `rgb(${r|0},${g|0},${b|0})`;
        } else {
          ctx.fillStyle = p.arrived ? placedColor : activeColor;
        }
        ctx.fillRect(Math.round(p.x - tile / 2), Math.round(p.y - tile / 2), tile, tile);
      }
      ctx.restore();

      // Ink
      if (stage === "swapToDom" || stage === "done") {
        drawCrispLetters();
      } else if (preInkAlpha > 0.001) {
        const saved = canvasTextAlpha;
        canvasTextAlpha = preInkAlpha;
        drawCrispLetters();
        canvasTextAlpha = saved;
      }

      // Stage transitions
      const globalProg = getGlobalProgress();
      const earlySwap = globalProg >= 0.88 || elapsed > hardStopMs * 0.70;
      if (stage === "build" && (allDone || earlySwap)) {
        stage = "swapToDom";
        stageStart = now;
      }
      if (stage === "swapToDom") {
        canvasTextAlpha += (1 - canvasTextAlpha) * 0.16;
        tileOpacity = 1 - canvasTextAlpha;

        if (tileOpacity < 0.02 && canvasTextAlpha > 0.98) {
          canvas.style.opacity = "0";
          h1.style.opacity = "1";
          stage = "done";
          cancelAnimationFrame(rafRef.current || 0);
          return;
        }
      }
    };

    // Rebuild; if layoutOnly=true and we're done, just reflow (no re-animate)
    const rebuild = (layoutOnly = false) => {
      cancelAnimationFrame(rafRef.current || 0);

      measureFromDOM();

      if (prefersReducedMotion || layoutOnly) {
        canvas.style.opacity = "0";
        h1.style.opacity = "1";
        stage = "done";
        return;
      }

      buildPools();
      targets = [];
      parts = [];
      rebuildPerLetterTotals();
      activatedPool = 0;

      canvasTextAlpha = 0.0;
      tileOpacity = 1.0;
      preInkAlpha = 0.0;

      activateNextPool();

      stage = "build";
      stageStart = performance.now();
      startedAt = 0;
      canvas.style.opacity = "1";
      h1.style.opacity = "0";

      rafRef.current = requestAnimationFrame(draw);
    };

    // Observe container width only (ignore tiny height blips)
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      const w = Math.round(cr.width);
      if (w !== lastWrapWidth) {
        lastWrapWidth = w;
        const layoutOnly = stage === "done";
        rebuild(layoutOnly);
      }
    });
    ro.observe(wrap);

    // Initial build — wait for fonts ready to avoid FOIT/FOUT snap
    const doInitial = () => rebuild();
    if (document.fonts?.status !== "loaded") {
      document.fonts.ready.then(doInitial);
    } else {
      doInitial();
    }

    return () => {
      cancelAnimationFrame(rafRef.current || 0);
      ro.disconnect();
    };
  }, [
    text,
    className,
    activeColor,
    placedColor,
    finalTextColor,
    cellStart,
    cellEnd,
    drift,
    magnet,
    magnetBoost,
    damping,
    snapFactor,
    letterCompleteThreshold,
    allCompleteThreshold,
    finalHoldMs,
    hardStopMsDesktop,
    hardStopMsMobile,
    desktopMaxBits,
    mobileMaxBits,
    poolIntervalMs,
    blendColors,
    prefersReducedMotion,
  ]);

  // DOM headline with manual <br/> (whiteSpace: normal)
  const domLines = String(text).split("\n");

  return (
    <div ref={wrapRef} className="relative mx-auto w-full text-center select-none">
      <canvas ref={canvasRef} className="block w-full h-auto" aria-hidden />
      <h1
        ref={h1Ref}
        className={className}
        style={{ margin: 0, whiteSpace: "normal", width: "100%" }}
      >
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

