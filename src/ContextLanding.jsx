import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Mic,
  Calendar,
  Mail,
  Users,
  Zap,
  Shield,
  Command,
  CornerDownLeft,
  MessageCircle,
  Check,
  ArrowRight,
} from "lucide-react";

// Lazy-load the dashboard section to keep the initial bundle light
const RelationshipDashboard = lazy(() => import("./sections/RelationshipDashboard.jsx"));

export default function ContextLanding() {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // gentle parallax for hero blobs
  const { scrollYProgress } = useScroll();
  const orbY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 160]);
  const orbX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -80]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -120]);

  // rotating demo text for the Tip chip (hero)
  const demoLines = useMemo(
    () => [
      "“Draft a warm follow-up to Jennifer & propose Fri 2pm.”",
      "“Summarize email thread with Noah in my tone.”",
      "“When did I last meet Amy? Suggest a check-in.”",
      "“Any Top-20 I’m ghosting this week?”",
    ],
    []
  );
  const [demoIdx, setDemoIdx] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setDemoIdx((i) => (i + 1) % demoLines.length), 2600);
    return () => clearInterval(id);
  }, [demoLines.length, prefersReducedMotion]);

  // rotating hints for the features section “you can say”
  const sayHints = useMemo(
    () => ["Draft a warm follow-up for Jennifer", "Show overdue only", "Propose Tue 2pm"],
    []
  );
  const [sayIdx, setSayIdx] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setSayIdx((i) => (i + 1) % sayHints.length), 2600);
    return () => clearInterval(id);
  }, [sayHints.length, prefersReducedMotion]);

  const fade = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-120px" },
    transition: { duration: 0.7, ease: "easeOut" },
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen overflow-x-clip text-gray-900 bg-surface">
      {/* BACKGROUND: gradients + grain */}
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

      {/* NAV */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled ? "bg-white/35 backdrop-blur-2xl border-b border-white/30 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button onClick={() => scrollTo("top")} className="text-lg font-semibold tracking-tight">
            Context
          </button>
        <div className="hidden items-center gap-8 text-sm md:flex">
            <button onClick={() => scrollTo("features")} className="hover:text-gray-600">
              Features
            </button>
            <button onClick={() => scrollTo("dashboard")} className="hover:text-gray-600">
              Dashboard
            </button>
            <button onClick={() => scrollTo("how")} className="hover:text-gray-600">
              How it works
            </button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-gray-600">
              Pricing
            </button>
          </div>
          <button onClick={() => scrollTo("waitlist")} className="btn-primary">
            Join the waitlist
          </button>
        </div>
      </nav>

      {/* HERO — gradient section */}
      <section id="top" className="relative px-6 pb-18 pt-28 md:pt-36 lg:px-8">
        {/* floating tiles (iOS vibe) */}
        <FloatingTile className="right-[7%] top-[16%] rotate-[18deg]" Icon={CornerDownLeft} />
        <FloatingTile className="left-[6%] bottom-[-20px] -rotate-[18deg]" Icon={Command} />
        <FloatingTile className="right-[22%] bottom-[12%] rotate-[9deg]" Icon={MessageCircle} glow />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
              handles the rest.
            </h1>

            <p className="mt-5 text-xl text-gray-600">
              An iOS assistant that understands your tone, timing, and relationships—turning voice into perfectly timed
              emails and meetings.
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

          {/* iPhone-style hero visual */}
          <motion.div {...fade} className="relative mx-auto mt-10 max-w-5xl">
            <div className="iphone-shell">
              <div className="iphone-notch" aria-hidden />
              <div className="ls-card">
                <div className="ls-left">
                  <div className="ls-mic">
                    <Mic size={18} />
                  </div>
                </div>
                <div className="ls-bubble">
                  “Morning! 6 emails from your Top 20 need a nudge. Jennifer hasn’t heard from you in 9 days.”
                </div>
              </div>
              <div className="ls-your-reply">“Draft a warm follow-up and suggest Friday 2pm.”</div>
              <div className="ls-tip">
                <span className="ls-tip-badge">Tip</span>
                <span className="align-middle">{demoLines[demoIdx]}</span>
              </div>
            </div>

            <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(99,102,241,.12),transparent_60%)]" />
          </motion.div>
        </div>
      </section>

      {/* FEATURES — concise with real Gmail/Calendar logos floating in background */}
      <section id="features" className="section-grad relative overflow-hidden px-6 py-20 lg:px-8">
        {/* Background floating brand logos (from /public), very subtle */}
        <motion.img
          src="/gmail.svg"
          alt="Gmail"
          aria-hidden
          className="pointer-events-none absolute -z-10 left-[-32px] top-8 w-[120px] select-none opacity-[0.12]"
          initial={{ y: 0, rotate: 0 }}
          animate={prefersReducedMotion ? {} : { y: [-6, 6, -6], rotate: [0, 2, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="/google-calendar.svg"
          alt="Google Calendar"
          aria-hidden
          className="pointer-events-none absolute -z-10 right-[-24px] bottom-8 w-[120px] select-none opacity-[0.12]"
          initial={{ y: 0, rotate: 0 }}
          animate={prefersReducedMotion ? {} : { y: [6, -6, 6], rotate: [0, -2, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        <div className="mx-auto max-w-7xl">
          <motion.div {...fade} className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Everything you need</h2>
            <div className="mx-auto mt-3 h-[2px] w-28 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
            <p className="mt-3 text-lg text-gray-600">Built for email, calendar, and the way you speak.</p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            <Pillar
              title="Prioritize who matters"
              desc="Understands your relationships and typical cadence to surface what needs attention first."
            />
            <Pillar
              title="Speak to act"
              desc="Voice briefings, drafts, and scheduling—hands-free and in your tone."
            />
            <Pillar
              title="Email + Calendar in sync"
              desc="Replies reference meetings; follow-ups align to real deadlines."
            />
          </div>
        </div>
      </section>

      {/* RELATIONSHIP DASHBOARD — GRADIENT section */}
      <section id="dashboard" className="section-grad px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="glass-card mx-auto h-[420px] max-w-[720px] animate-pulse" />}>
            <RelationshipDashboard />
          </Suspense>
        </div>
      </section>

      {/* HOW IT WORKS — PLAIN section */}
      <section id="how" className="section-plain px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fade} className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">How it works</h2>
          </motion.div>

          <div className="space-y-20">
            {[
              { step: "01", title: "Pick your Top 20", desc: "Key clients, investors, or accounts. Focus where it matters.", Icon: Users },
              { step: "02", title: "We learn the relationship", desc: "Email + calendar patterns build tone, cadence & timing.", Icon: Mail },
              { step: "03", title: "Manage by voice", desc: "Briefings, drafts, scheduling & follow-ups — hands-free.", Icon: Mic },
              { step: "04", title: "Never ghost again", desc: "Nudges before things go cold. Peace of mind.", Icon: Zap },
            ].map(({ step, title, desc, Icon }, i) => (
              <motion.div
                key={step}
                {...fade}
                className={`flex flex-col items-center gap-10 ${i % 2 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
              >
                <div className="flex-1">
                  <div className="mb-2 text-sm font-medium text-gray-400">{step}</div>
                  <h3 className="text-3xl font-bold">{title}</h3>
                  <p className="mt-2 text-lg text-gray-600">{desc}</p>
                </div>
                <div className="flex-1">
                  <div className="glass-card flex h-56 items-center justify-center text-gray-400">
                    <Icon size={64} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST — PLAIN section */}
      <section id="waitlist" className="section-plain px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold tracking-tight">Get early access</h3>
          <p className="mt-2 text-lg text-gray-600">
            Join the waitlist and be the first to try Context. We’ll reach out when TestFlight is ready.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* PRICING — PLAIN section */}
      <section id="pricing" className="section-plain px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fade} className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Simple, transparent pricing</h2>
            <p className="mt-2 text-lg text-gray-600">Start free for 7 days. No credit card required.</p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              {
                name: "Individual",
                price: "$49",
                note: "/month",
                features: ["20 VIPs", "Gmail + Calendar", "Unlimited voice", "Ghosting alerts", "Prep & scheduling"],
                dark: false,
              },
              {
                name: "Team",
                price: "$39",
                note: "/user/mo",
                features: ["Everything in Individual", "Team analytics", "Shared VIPs", "Shared calendars", "Admin controls"],
                dark: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                note: "",
                features: ["50+ VIPs/user", "Advanced calendar", "SSO & security", "API access", "Dedicated support"],
                dark: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-8 backdrop-blur-xl ${
                  p.dark ? "bg-gray-900 text-white border-gray-800 shadow-xl" : "bg-white/70 border-white/60"
                }`}
              >
                {p.dark && <div className="mb-3 text-xs font-semibold">MOST POPULAR</div>}
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="my-3">
                  <span className="text-5xl font-bold">{p.price}</span>
                  {p.note && <span className={p.dark ? "ml-1 text-white/70" : "ml-1 text-gray-600"}>{p.note}</span>}
                </div>
                <button className={`btn w-full ${p.dark ? "btn-on-dark" : "btn-primary"}`}>
                  {p.price === "Custom" ? "Contact sales" : "Join the waitlist"}
                </button>
                <div className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className={p.dark ? "mt-0.5 text-white" : "mt-0.5 text-gray-900"} size={18} />
                      <span className={p.dark ? "text-white/80" : "text-gray-700"}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — GRADIENT section */}
      <section className="section-grad px-6 py-24 lg:px-8">
        <div className="glass-card mx-auto max-w-4xl p-12 text-center">
          <h3 className="text-4xl font-bold tracking-tight">Ready to never drop the ball?</h3>
          <p className="mt-2 text-lg text-gray-600">
            Join professionals who manage their most important relationships with Context.
          </p>
          <button onClick={() => scrollTo("waitlist")} className="btn-primary mt-6">
            Join the waitlist
          </button>
        </div>
      </section>

      {/* FOOTER — PLAIN */}
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

/* ---------- “Everything you need” helpers ---------- */

function Pillar({ title, desc, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className="rounded-2xl border border-white/60 bg-white/70 p-6 backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,.08)]"
    >
      <div className="mb-3 text-lg font-semibold">{title}</div>
      <p className="mb-0 text-sm text-gray-600">{desc}</p>
      {children}
    </motion.div>
  );
}

function RowPill({ name, label, color = "emerald", pulse = false }) {
  const map = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/80 px-3 py-2 backdrop-blur-xl">
      <div className="truncate text-sm font-medium">{name}</div>
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-2 py-0.5 text-xs text-gray-700 backdrop-blur-xl ${
          pulse ? "animate-[pulse_2.6s_ease-in-out_infinite]" : ""
        }`}
      >
        <span className={`inline-block size-2.5 rounded-full ${map[color]}`} />
        {label}
      </span>
    </div>
  );
}

function TimeChip({ when }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-gray-700 backdrop-blur-xl">
      <Calendar size={14} />
      <span>{when}</span>
    </div>
  );
}

function SayDoes({ say, does }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-gray-700 backdrop-blur-xl">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
          <Mic size={14} />
        </span>
        <span className="font-medium">You:</span>
        <span>{say}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-gray-700 backdrop-blur-xl">
        <span className="inline-block size-2.5 rounded-full bg-indigo-500" />
        <span className="font-medium">Context:</span>
        <span>{does}</span>
      </div>
    </div>
  );
}

function Proof({ number, label }) {
  return (
    <div className="inline-flex items-baseline gap-2">
      <span className="text-2xl font-semibold tabular-nums">{number}</span>
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

/* ---------- Waitlist ---------- */

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
        <div className="text-sm font-medium">Thanks! We’ll be in touch at</div>
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

/* ---------- shared helpers ---------- */

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="mb-3 font-semibold">{title}</div>
      <ul className="space-y-2 text-gray-600">
        {items.map((t) => (
          <li key={t}>
            <a className="hover:text-gray-900" href="#">
              {t}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatingTile({ className = "", Icon, glow = false }) {
  return (
    <motion.div
      initial={{ y: 0, rotate: 0, opacity: 0 }}
      animate={{ y: [-4, 4, -4], rotate: [0, 2, 0], opacity: 1 }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none absolute ${className}`}
    >
      <div className={`tile ${glow ? "tile-glow" : ""}`}>
        <Icon size={28} className="text-gray-600" />
      </div>
    </motion.div>
  );
}