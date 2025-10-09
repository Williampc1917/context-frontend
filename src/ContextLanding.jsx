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

const RelationshipDashboard = lazy(() => import("./sections/RelationshipDashboard.jsx"));

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

      <section id="features" className="section-grad relative overflow-hidden px-6 py-24 lg:px-8">
  {/* soft background glow, no images */}
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute -top-40 -left-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-70
                    bg-[radial-gradient(circle_at_center,rgba(99,102,241,.14),transparent_65%)]" />
    <div className="absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-70
                    bg-[radial-gradient(circle_at_center,rgba(56,189,248,.14),transparent_65%)]" />
  </div>

  <div className="mx-auto max-w-7xl">
    {/* Title */}
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px", amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      <h2 className="text-4xl font-bold tracking-tight md:text-5xl">See the magic in 60 seconds</h2>
      <p className="mt-3 text-lg text-gray-600">Built for Gmail, Calendar, and the way you speak.</p>
    </motion.div>

    {/* Responsive rail: horizontal snap on mobile, 4-column grid on desktop */}
    <div
      className="grid grid-flow-col auto-cols-[85%] gap-4 overflow-x-auto pb-2 snap-x snap-mandatory
                 md:grid-flow-row md:auto-cols-auto md:grid-cols-4 md:overflow-visible md:gap-6"
      role="list"
    >
      {/* Card 1 — Draft that sounds like you */}
      <motion.div
        role="listitem"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="snap-center rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur-xl
                   shadow-[0_10px_24px_rgba(15,23,42,.08)] group"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,.16),transparent_60%)]">
            <Mail size={18} className="text-gray-700" aria-hidden />
          </div>
          <div className="text-sm font-semibold">Draft that sounds like you</div>
        </div>

        {/* mock email UI */}
        <div className="relative h-56 rounded-xl border border-gray-200/70 bg-white p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-400" />
              Email thread
            </span>
            <span>9:41</span>
          </div>

          <div className="mb-2 h-4 w-40 rounded bg-gray-100" />
          <div className="mb-1 h-3 w-[85%] rounded bg-gray-100" />
          <div className="mb-1 h-3 w-[70%] rounded bg-gray-100" />
          <div className="mb-4 h-3 w-[60%] rounded bg-gray-100" />

          {/* "Summary of the thread" pill */}
          <div className="absolute left-4 top-10 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700 shadow-sm">
            Summary of the thread
          </div>

          {/* reply bubble */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gradient-to-b from-indigo-50/70 to-white px-3 py-2">
            <div className="h-3 w-24 rounded bg-gray-200/80" />
            <div className="h-3 w-10 rounded bg-gray-200/60" />
            <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700">
              <CornerDownLeft size={12} aria-hidden /> Send
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[11px] text-gray-700">In your tone</span>
          <span className="rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[11px] text-gray-700">1-tap send</span>
        </div>
      </motion.div>

      {/* Card 2 — Morning voice briefing */}
      <motion.div
        role="listitem"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="snap-center rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur-xl
                   shadow-[0_10px_24px_rgba(15,23,42,.08)] group"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,.18),transparent_60%)]">
            <Mic size={18} className="text-gray-700" aria-hidden />
          </div>
          <div className="text-sm font-semibold">Morning voice briefing</div>
        </div>

        {/* mock briefing UI with waveform */}
        <div className="relative h-56 rounded-xl border border-gray-200/70 bg-white p-4">
          <div className="mb-3 text-xs text-gray-500">“Good morning — here’s what matters.”</div>

          {/* waveform */}
          <div className="mt-2 grid h-24 grid-cols-24 items-end gap-[3px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ height: 6 }}
                whileInView={{ height: [6, 24 + ((i * 7) % 36), 10] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.03, ease: "easeInOut" }}
                className="block w-[6px] rounded bg-emerald-400/70"
                aria-hidden
              />
            ))}
          </div>

          {/* chips overlays */}
          <div className="absolute left-4 top-12 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[11px] text-gray-800 shadow">
            6 VIP emails · 3 urgent
          </div>
          <div className="absolute right-4 bottom-4 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-[11px] text-emerald-800 shadow">
            Jennifer: pricing due Fri
          </div>

          {/* play button (no audio) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="grid size-10 place-items-center rounded-full border border-gray-200 bg-white shadow">
              <div className="ml-0.5 h-0 w-0 border-y-8 border-l-[12px] border-y-transparent border-l-gray-700" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mt-3 text-[12px] text-gray-600">What’s urgent, what’s pending, what to say.</div>
      </motion.div>

      {/* Card 3 — Propose times in seconds */}
      <motion.div
        role="listitem"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="snap-center rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur-xl
                   shadow-[0_10px_24px_rgba(15,23,42,.08)] group"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,.18),transparent_60%)]">
            <Calendar size={18} className="text-gray-700" aria-hidden />
          </div>
          <div className="text-sm font-semibold">Propose times in seconds</div>
        </div>

        {/* mini calendar */}
        <div className="relative h-56 rounded-xl border border-gray-200/70 bg-white p-4">
          <div className="mb-2 h-4 w-24 rounded bg-gray-100" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const isPicked = i === 10 || i === 15;
              const isToday = i === 12;
              return (
                <div
                  key={i}
                  className={`grid aspect-square place-items-center rounded-lg border text-[11px] 
                              ${isPicked ? "border-sky-300 bg-sky-50 text-sky-700" : isToday ? "border-gray-300 bg-gray-50" : "border-gray-200"}`}
                >
                  {i + 3}
                </div>
              );
            })}
          </div>

          {/* time chips */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            <button className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] text-sky-700 shadow">Fri 2–3pm</button>
            <button className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-800 shadow">Mon 9:30am</button>
            <button className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-800 shadow">Tue 11am</button>
          </div>
        </div>

        <div className="mt-3 text-[12px] text-gray-600">Suggest slots that fit your cadence.</div>
      </motion.div>

      {/* Card 4 — Never ghost your Top-20 */}
      <motion.div
        role="listitem"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="snap-center rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur-xl
                   shadow-[0_10px_24px_rgba(15,23,42,.08)] group"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,.16),transparent_60%)]">
            <Zap size={18} className="text-gray-700" aria-hidden />
          </div>
          <div className="text-sm font-semibold">Never ghost your Top-20</div>
        </div>

        {/* alert toast */}
        <div className="relative h-56 rounded-xl border border-gray-200/70 bg-white p-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-900 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <div className="grid size-6 place-items-center rounded-full bg-rose-600 text-[10px] font-semibold text-white">
                D
              </div>
              <div className="font-medium">David Chen</div>
              <span className="ml-auto rounded-full border border-rose-200 bg-white/80 px-2 py-0.5 text-[10px]">Urgent</span>
            </div>
            <div className="text-[11px] leading-5">
              It’s been <span className="font-semibold">5 days</span> since you replied (typical: 24h).  
              Draft a quick follow-up?
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px]">Draft follow-up</button>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">Needs action</span>
            </div>
          </div>

          {/* tiny history */}
          <div className="mt-3 space-y-1">
            <div className="h-3 w-[80%] rounded bg-gray-100" />
            <div className="h-3 w-[65%] rounded bg-gray-100" />
            <div className="h-3 w-[50%] rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-3 text-[12px] text-gray-600">Nudges before relationships go cold.</div>
      </motion.div>
    </div>

    {/* Privacy note + handoff CTA */}
    <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4 text-center">
      <p className="text-sm text-gray-500">
        Privacy-first: reads to draft — <span className="font-medium text-gray-700">never</span> sends without your OK.
      </p>
      <button
        onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })}
        className="btn-glass inline-flex items-center gap-2"
      >
        See your professional world at a glance <ArrowRight size={16} />
      </button>
    </div>
  </div>
</section>

      <section id="dashboard" className="section-grad px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="glass-card mx-auto h-[420px] max-w-[720px] animate-pulse" />}>
            <RelationshipDashboard />
          </Suspense>
        </div>
      </section>

      <section id="how" className="section-plain px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px", amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-14 max-w-3xl text-center"
          >
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px", amount: 0.3 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

      <section id="waitlist" className="section-plain px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold tracking-tight">Get early access</h3>
          <p className="mt-2 text-lg text-gray-600">
            Join the waitlist and be the first to try Context. We'll reach out when TestFlight is ready.
          </p>
          <WaitlistForm />
        </div>
      </section>

      <section id="pricing" className="section-plain px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px", amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-14 max-w-3xl text-center"
          >
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

      <section className="section-grad px-6 py-24 lg:px-8">
        <div className="glass-card mx-auto max-w-4xl p-12 text-center">
          <h3 className="text-4xl font-bold tracking-tight">Ready to never drop the ball?</h3>
          <p className="mt-2 text-gray-600">
            Join professionals who manage their most important relationships with Context.
          </p>
          <button onClick={() => scrollTo("waitlist")} className="btn-primary mt-6">
            Join the waitlist
          </button>
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

function FloatingLogo({ src, alt, className = "", delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.img
      src={src}
      alt={alt}
      aria-hidden
      initial={{ y: 0, rotate: 0, opacity: 0 }}
      animate={{ 
        y: prefersReducedMotion ? 0 : [-8, 8, -8],
        rotate: prefersReducedMotion ? 0 : [-3, 3, -3],
        opacity: 0.15
      }}
      transition={{ 
        duration: 12, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
      className={`pointer-events-none absolute select-none ${className}`}
    />
  );
}