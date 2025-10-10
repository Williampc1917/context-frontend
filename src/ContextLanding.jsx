import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Mic,
  Calendar,
  Mail,
  Users,
  Zap,
  Command,
  CornerDownLeft,
  MessageCircle,
  Check,
  ArrowRight,
} from "lucide-react";

const ProblemSection = lazy(() => import("./sections/ProblemSection.jsx"));
const SolutionSection = lazy(() => import("./sections/SolutionSection.jsx"));
const HowItWorksSection = lazy(() => import("./sections/HowItWorksSection.jsx"));
export default function ContextLanding() {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const orbY = useTransform(scrollYProgress, [0, 0.3], [0, prefersReducedMotion ? 0 : 40]);
  const orbX = useTransform(scrollYProgress, [0, 0.3], [0, prefersReducedMotion ? 0 : -20]);
  const orb2Y = useTransform(scrollYProgress, [0, 0.3], [0, prefersReducedMotion ? 0 : -30]);

  const demoLines = useMemo(
    () => [
      "Draft a warm follow-up to Jennifer & propose Fri 2pm.",
      "Summarize email thread with Noah in my tone.",
      "When did I last meet Amy? Suggest a check-in.",
      "Any Top-20 I'm ghosting this week?",
    ],
    []
  );
  
  const [demoIdx, setDemoIdx] = useState(0);
  
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setDemoIdx((i) => (i + 1) % demoLines.length), 2600);
    return () => clearInterval(id);
  }, [demoLines.length, prefersReducedMotion]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen overflow-x-clip text-gray-900 bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <motion.div
          style={{ y: orbY, x: orbX }}
          className="absolute -top-40 -left-28 size-[780px] rounded-full blur-3xl opacity-90"
        >
          <div className="size-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,.22),transparent_65%)]" />
        </motion.div>
        <motion.div
          style={{ y: orb2Y }}
          className="absolute -bottom-60 right-[-10%] size-[900px] rounded-full blur-3xl opacity-90"
        >
          <div className="size-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,.22),transparent_65%)]" />
        </motion.div>
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 via-white/30 to-transparent backdrop-blur-sm" />
      </div>
      <div className="bg-noise pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light opacity-60" />

      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-white/35 backdrop-blur-2xl border-b border-white/30 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button onClick={() => scrollTo("top")} className="text-lg font-semibold tracking-tight">
            Context
          </button>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <button onClick={() => scrollTo("problem")} className="hover:text-gray-600 transition-colors">
            The problem
            </button>
            <button onClick={() => scrollTo("features")} className="hover:text-gray-600 transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo("dashboard")} className="hover:text-gray-600 transition-colors">
              Dashboard
            </button>
            <button onClick={() => scrollTo("how")} className="hover:text-gray-600 transition-colors">
              How it works
            </button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-gray-600 transition-colors">
              Pricing
            </button>
          </div>
          <button onClick={() => scrollTo("waitlist")} className="btn-primary">
            Join the waitlist
          </button>
        </div>
      </nav>

      <section id="top" className="relative px-6 pb-18 pt-28 md:pt-36 lg:px-8">
        {/* Floating brand logos - only 1 of each */}
        <FloatingLogo 
          src="/gmail.svg" 
          alt="Gmail" 
          className="left-[12%] top-[20%] w-[110px]" 
          delay={0}
        />
        <FloatingLogo 
          src="/google-calendar.svg" 
          alt="Google Calendar" 
          className="right-[15%] bottom-[18%] w-[115px]" 
          delay={0.4}
        />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="hero-headline">
              <span className="relative inline-block">
                Speak.
                <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 animate-pulse-slow" />
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 animate-gradient">
                Context
              </span>{" "}
              takes care of Gmail and Calendar
            </h1>

            <p className="mt-5 text-xl text-gray-600">
              AI Voice assistant that Knows who matters, how you talk to them, and when to reach out — all while keeping Gmail and Calendar perfectly in sync
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => scrollTo("waitlist")} className="btn-primary">
                Join the waitlist
              </button>
              <button onClick={() => scrollTo("how")} className="btn-glass">
                See how it works <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px", amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-10 max-w-5xl"
          >
            <div className="iphone-shell">
              <div className="iphone-notch" aria-hidden />
              <div className="ls-card">
                <div className="ls-left">
                  <div className="ls-mic">
                    <Mic size={18} />
                  </div>
                </div>
                <div className="ls-bubble">
                  "Morning! 6 emails from your Top 20 need a nudge. Jennifer hasn't heard from you in 9 days."
                </div>
              </div>
              <div className="ls-your-reply">"Draft a warm follow-up and suggest Friday 2pm."</div>
              <div className="ls-tip">
                <span className="ls-tip-badge">Tip</span>
                <span className="align-middle">{demoLines[demoIdx]}</span>
              </div>
            </div>

            <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(99,102,241,.12),transparent_60%)]" />
          </motion.div>
        </div>
      </section>
      {/* === New: Problem section (right under hero) === */}
<section id="problem" className="section-plain px-6 py-20 lg:px-8">
  <div className="mx-auto max-w-7xl">
    <Suspense fallback={<div className="glass-card mx-auto h-[240px] max-w-3xl animate-pulse" />}>
      <ProblemSection />
    </Suspense>
  </div>
</section>

<section id="solution" className="section-grad px-6 py-24 lg:px-8">
  <div className="mx-auto max-w-7xl">
    <Suspense fallback={<div className="glass-card mx-auto h-[240px] max-w-3xl animate-pulse" />}>
      <SolutionSection />
    </Suspense>
  </div>
</section>

<section id="how" className="section-plain px-6 py-24">
  <div className="mx-auto max-w-7xl">
    <Suspense fallback={<div className="glass-card mx-auto h-[360px] max-w-[900px] animate-pulse" />}>
      <HowItWorksSection />
    </Suspense>
  </div>
</section>

      <section id="waitlist" className="section-grad px-6 py-24 lg:px-8">
  <div className="mx-auto max-w-4xl text-center">
    <h3 className="text-4xl font-bold tracking-tight">Ready to never drop the ball?</h3>
    <p className="mt-3 text-lg text-gray-600">
      Join professionals who manage their most important relationships with Context.
    </p>
    <WaitlistForm />
  </div>
</section>


      <footer className="section-plain px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-xl font-semibold">Context</div>
              <p className="mt-2 text-gray-600">Relationship intelligence for busy professionals.</p>
            </div>
            <FooterCol title="Product" items={["Features", "Dashboard", "Pricing", "Security"]} />
            <FooterCol title="Company" items={["About", "Blog", "Careers"]} />
            <FooterCol title="Legal" items={["Privacy", "Terms", "Contact"]} />
          </div>
          <div className="mt-8 text-center text-gray-600">© {new Date().getFullYear()} Context. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function Pillar({ title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px", amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/60 bg-white/70 p-6 backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,.08)]"
    >
      <div className="mb-3 text-lg font-semibold">{title}</div>
      <p className="mb-0 text-sm text-gray-600">{desc}</p>
    </motion.div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/60 bg-white/70 p-4 text-center backdrop-blur-xl">
        <div className="text-sm font-medium">Thanks! We'll be in touch at</div>
        <div className="mt-1 text-lg font-semibold">{email}</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
      <input
        required
        type="email"
        placeholder="you@company.com"
        className="w-full rounded-full border border-white/60 bg-white/80 px-4 py-3 text-sm outline-none backdrop-blur-xl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Join the waitlist
      </button>
    </form>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="mb-3 font-semibold">{title}</div>
      <ul className="space-y-2 text-gray-600">
        {items.map((t) => (
          <li key={t}>
            <a className="hover:text-gray-900 transition-colors" href="#">
              {t}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatingTile({ className = "", Icon, glow = false }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ y: 0, rotate: 0, opacity: 0 }}
      animate={{ 
        y: prefersReducedMotion ? 0 : [-2, 2, -2], 
        rotate: prefersReducedMotion ? 0 : [0, 1, 0], 
        opacity: 1 
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none absolute ${className}`}
    >
      <div className={`tile ${glow ? "tile-glow" : ""}`}>
        <Icon size={28} className="text-gray-600" />
      </div>
    </motion.div>
  );
}

function FloatingLogo({ src, alt, className = "", delay = 0, brightness = 0.38 }) {
  const prefersReducedMotion = useReducedMotion();

  // Stay anchored; gently pulse scale/opacity.
  const animate = prefersReducedMotion
    ? {}
    : { scale: [1, 1.06, 1], opacity: [brightness * 0.95, brightness, brightness * 0.95] };

  return (
    <motion.img
      src={src}
      alt={alt}
      // Start visible (no fade-from-0), brighter, with a subtle glow
      initial={{ scale: 1, opacity: brightness }}
      animate={animate}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay }}
      className={`pointer-events-none absolute z-10 select-none drop-shadow-[0_10px_26px_rgba(0,0,0,.22)] ${className}`}
    />
  );
}