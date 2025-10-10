import { motion } from "framer-motion";
import { BellOff, Brain, Hourglass, Bot } from "lucide-react";

export default function ProblemSection() {
  return (
    <div className="relative">
      {/* soft background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-8%] h-[380px] w-[380px] rounded-full blur-3xl opacity-80 bg-[radial-gradient(circle_at_center,rgba(244,63,94,.12),transparent_65%)]" />
        <div className="absolute -bottom-24 right-[-6%] h-[420px] w-[420px] rounded-full blur-3xl opacity-80 bg-[radial-gradient(circle_at_center,rgba(99,102,241,.12),transparent_65%)]" />
      </div>

      {/* Refined Problem Heading */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px", amount: 0.3 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  className="relative mx-auto mb-12 max-w-3xl text-center"
>

  <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
    It’s not neglect  {" "}
    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-indigo-500 to-sky-500 animate-gradient-slow">
      it’s overload
      <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-rose-400/70 via-indigo-400/70 to-sky-400/70 animate-pulse-slow" />
    </span>
  </h2>

  <p className="mt-6 text-xl text-gray-600/90 leading-relaxed max-w-2xl mx-auto">
  You’re not neglecting your network — you’re drowning in threads, follow-ups, and details that no one can remember
    
  </p>
</motion.div>

      {/* Stat cards */}
      <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          tone="rose"
          Icon={BellOff}
          heading="Ghosting"
          value="73%"
          label="of deals"
          sub="die from slow follow-up"
        />
        <StatCard
          tone="indigo"
          Icon={Brain}
          heading="Context overload"
          value="70%"
          label="can’t recall"
          sub="what’s pending with key contacts"
        />
        <StatCard
          tone="amber"
          Icon={Hourglass}
          heading="Time wasted"
          value="15"
          suffix="h/week"
          label="lost to email"
          sub="manual triage & drafts"
        />
        <StatCard
          tone="slate"
          Icon={Bot}
          heading="Robotic tone"
          value="76%"
          label="say AI"
          sub="sounds unnatural"
        />
      </div>
    </div>
  );
}

/* ============
   Components
   ============ */
function StatCard({ tone = "indigo", Icon, heading, value, suffix, label, sub }) {
  const styles = getToneStyles(tone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px", amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,.08)] ring-1 ${styles.ring}`}
    >
      {/* halo */}
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 ${styles.halo}`}
        animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.02, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* header row */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`grid size-9 place-items-center rounded-xl bg-white/80 ${styles.iconText}`}>
          {Icon ? <Icon size={18} /> : null}
        </div>
        <div className="text-sm font-semibold text-gray-800">{heading}</div>
      </div>

      {/* numbers */}
      <div className="flex items-baseline gap-2">
        <div className="text-5xl font-bold leading-none tracking-tight">{value}</div>
        {suffix ? <div className="translate-y-[2px] text-sm font-medium text-gray-600">{suffix}</div> : null}
      </div>
      <div className={`mt-2 text-sm font-semibold ${styles.accentText}`}>{label}</div>
      <div className="text-sm text-gray-700">{sub}</div>
    </motion.div>
  );
}

function getToneStyles(tone) {
  switch (tone) {
    case "rose":
      return {
        ring: "ring-rose-400/50",
        accentText: "text-rose-600",
        iconText: "text-rose-600",
        halo: "bg-[radial-gradient(circle_at_center,rgba(244,63,94,.10),transparent_60%)]",
      };
    case "amber":
      return {
        ring: "ring-amber-400/50",
        accentText: "text-amber-600",
        iconText: "text-amber-600",
        halo: "bg-[radial-gradient(circle_at_center,rgba(245,158,11,.10),transparent_60%)]",
      };
    case "slate":
      return {
        ring: "ring-slate-300/50",
        accentText: "text-slate-600",
        iconText: "text-slate-600",
        halo: "bg-[radial-gradient(circle_at_center,rgba(100,116,139,.10),transparent_60%)]",
      };
    case "indigo":
    default:
      return {
        ring: "ring-indigo-400/50",
        accentText: "text-indigo-600",
        iconText: "text-indigo-600",
        halo: "bg-[radial-gradient(circle_at_center,rgba(99,102,241,.10),transparent_60%)]",
      };
  }
}