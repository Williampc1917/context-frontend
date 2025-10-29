import { useEffect, useState, useCallback, useRef } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight, Menu, X, Mail, Twitter, Linkedin } from "lucide-react";
import "./index.css";
import { rafThrottle } from "./utils/throttle";
import { useForm, ValidationError } from "@formspree/react";
import { useSection } from "./hooks/useSection";
import React from "react";

// Import sections directly - no lazy loading
import ProblemSection from "./sections/ProblemSection.jsx";
import { RevealHeadline } from "./sections/RevealHeadline.jsx";
import ClaroBrainOverlay from "./sections/ClaroBrainOverlay.jsx";
import FloatingLogo from "./sections/FloatingLogo.jsx";
import EmailCard from "./sections/EmailCard.jsx";

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

  const heroRef = useRef(null);

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
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollTo("top")}
            className="group flex items-center gap-3 rounded-full px-2 py-1 transition-colors hover:bg-white/70"
          >
            <span className="flex size-10 items-center justify-center rounded-full border border-[#E07A5F]/40 bg-white/80 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src="/waveform.svg"
                alt="Claro AI waveform logo"
                className="h-6 w-6 object-contain"
              />
            </span>

            <span className="text-[20px] font-silkscreen tracking-tight leading-none text-[#3D405B]">
              <span className="text-[#E07A5F]">Claro</span>
              <span className="ml-1">AI</span>
            </span>
          </button>

          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <div className="pointer-events-auto flex items-center gap-10 text-[15px] font-medium text-[#3D405B]/80">
              <NavLink label="The problem" onClick={() => scrollTo("problem")} />
              <NavLink label="Solution" onClick={() => scrollTo("solution")} />
              <NavLink label="Features" onClick={() => scrollTo("features")} />
              <NavLink label="How it works" onClick={() => scrollTo("how")} />
              <NavLink label="Waitlist" onClick={() => scrollTo("waitlist")} />
            </div>
          </div>

          <div className="ml-auto flex items-center justify-end gap-3">
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
          <div className="fixed inset-x-0 top-16 z-50 px-4 pt-4 pb-6 md:hidden">
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
        ref={heroRef}
        className="hero-canvas relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-28 md:pt-36 pb-18 lg:px-8 text-center"
      >
        <div className="hero-shell w-full max-w-5xl px-6 py-16 md:py-20 lg:px-16 mx-auto">
          {/* Hero text block */}
          <div className="hero-content flex flex-col items-center justify-center w-full max-w-3xl lg:max-w-4xl mx-auto text-center">
            <RevealHeadline
              text={"Clarity for the way you\nconnect"}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]"
              cleanColor="#3D405B"
              activeColor="#E07A5F"
              durationMs={2400}
              tileEnd={3.2}
              threshold={0.4}
              breathDelayMs={1200} // ← gap between reveal end and breathing start
            />

            <p className="mt-6 text-lg sm:text-xl text-[#3D405B]/80 max-w-2xl mx-auto">
              CLARO AI is a voice assistant for your email and calendar. It
              understands how you connect — who matters, how you communicate,
              and when to reach out.
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

          <ClaroBrainOverlay
            className="mt-10"
            aiLines={[
              "Here’s your daily briefing — ready?",
              "Jennifer’s note looks urgent — she’s waiting on pricing.",
              "Reply ready — matches how you usually write to Sarah.",
            "You promised Alex that update — want me to finish it?",
            "Tomorrow’s QBR with Jennifer — I’ve summarized your last thread.",
            "You’re free until 2 PM — want to catch up on pending replies?",
            "Here’s your schedule for tomorrow — one client call and one team sync.",
            "No meeting logged since your last promise to Alex — should I set one?",
          ]}
          aiLineTags={[
            ["Context", "Relationships"], // daily briefing
            ["Relationships", "Context"], // urgent note
            ["Tone", "Relationships"], // reply ready
            ["Tone", "Memory"], // friendly tone
            ["Memory", "Relationships"], // update reminder
            ["Context", "Memory"], // QBR summary
            ["Context", "Memory"], // free until 2pm
            ["Context", "Relationships"], // schedule awareness
            ["Memory", "Relationships"], // overdue meeting
          ]}
          capsules={[
            { label: "Understands your world", tag: "Context" },
            { label: "Remembers what matters", tag: "Memory" },
            { label: "Writes like you", tag: "Tone" },
            { label: "Knows who matters", tag: "Relationships" },
          ]}
          radiusX={440}
          />
        </div>

        <FloatingLogo
          src={`${import.meta.env.BASE_URL}gmail.svg`}
          alt="Gmail"
          className="absolute left-[8%] top-[22%] w-[90px] sm:w-[110px] lg:w-[140px] z-30"
          delay={0}
          hideBelow="md"
          targetRef={heroRef}
        />

        <FloatingLogo
          src={`${import.meta.env.BASE_URL}google-calendar.svg`}
          alt="Google Calendar"
          className="absolute right-[8%] top-[22%] w-[85px] sm:w-[100px] lg:w-[130px] z-30"
          delay={0.4}
          hideBelow="md"
          targetRef={heroRef}
        />
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

      <section id="how" className="section-plain w-full py-28 px-4">
        <div className="mx-auto mb-20 flex max-w-4xl justify-center text-center">
          <HowItWorksHeading />
        </div>

        <div className="flex justify-center">
          <EmailCard />
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
      <footer className="relative mt-20 overflow-hidden border-t border-white/50 bg-[#111323] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 top-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(224,122,95,0.45),transparent_65%)] blur-3xl" />
          <div className="absolute right-[-10%] bottom-[-20%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_65%)] blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-sm">
            <button
              type="button"
              onClick={() => scrollTo("top")}
              className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-left shadow-lg backdrop-blur"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-white/80">
                <img src="/waveform.svg" alt="Claro AI" className="h-5 w-5" />
              </span>
              <span className="text-xl font-silkscreen tracking-tight text-white">
                <span className="text-[#E07A5F]">Claro</span>
                <span className="ml-1 text-white">AI</span>
              </span>
            </button>
            <p className="mt-4 text-base text-white/70">
              Claro AI is the relationship intelligence copilot that keeps your communications warm and the right follow-ups on track.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                <Mail size={16} />
                hello@claro.ai
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Based in San Francisco
              </span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <FooterSocialLink
                href="https://twitter.com"
                label="Follow Claro AI on X"
              >
                <Twitter size={18} />
              </FooterSocialLink>
              <FooterSocialLink
                href="https://linkedin.com"
                label="Connect with Claro AI on LinkedIn"
              >
                <Linkedin size={18} />
              </FooterSocialLink>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-12 sm:flex-row sm:justify-between lg:gap-16">
            <FooterNavGroup
              title="Product"
              links={[
                { label: "Solution", target: "solution" },
                { label: "Features", target: "features" },
                { label: "How it works", target: "how" },
                { label: "Waitlist", target: "waitlist" },
              ]}
              onNavigate={scrollTo}
            />
            <FooterNavGroup
              title="Company"
              links={[
                { label: "About", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Press", href: "#" },
              ]}
            />
            <FooterNavGroup
              title="Resources"
              links={[
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Support", href: "mailto:hello@claro.ai" },
              ]}
            />
          </div>

        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Claro AI. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#E07A5F]" aria-hidden />
              Based in New York.
            </p>
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

function NavLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative text-[#3D405B]/75 transition-colors duration-200 hover:text-[#3D405B] focus:outline-none"
    >
      {label}
      <span className="pointer-events-none absolute -bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#E07A5F]/70 transition-all duration-300 group-hover:w-7" />
    </button>
  );
}

function HowItWorksHeading() {
  const prefersReducedMotion = useReducedMotion();

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.8, ease: [0.22, 1, 0.36, 1] };

  const headingVariants = {
    initial: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition,
    },
  };

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.7 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-center px-4 py-4"
    >
      <motion.h2
        variants={headingVariants}
        className="text-5xl font-bold tracking-tight text-[#1c1f33] sm:text-6xl md:text-7xl"
      >
        How Claro Works
      </motion.h2>
    </motion.div>
  );
}

function FooterNavGroup({ title, links, onNavigate }) {
  return (
    <div className="min-w-[150px]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
        {title}
      </p>
      <ul className="mt-4 space-y-3 text-sm text-white/70">
        {links.map((item) => {
          const { label, href, target } = item;
          const resolvedHref = target ? `#${target}` : href ?? "#";

          const handleClick = target
            ? (event) => {
                event.preventDefault();
                onNavigate?.(target);
              }
            : undefined;

          return (
            <li key={label}>
              <a
                href={resolvedHref}
                onClick={handleClick}
                className="group inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <span>{label}</span>
                {target && (
                  <span className="pointer-events-none inline-block h-px w-4 bg-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FooterSocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 shadow-[0_8px_20px_rgba(17,19,35,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
