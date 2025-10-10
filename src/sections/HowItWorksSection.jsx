import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import {
  Inbox,
  Wand2,
  Bell,
  Shield,
  Type,
  Mail,
} from "lucide-react";
import { useSection } from "../hooks/useSection"; // ADD THIS

export default function FeatureSection() {
  const { ref, isVisible } = useSection(); // ADD THIS

  return (
    <section ref={ref} id="features" className="relative overflow-hidden px-6 py-28 lg:px-8">
      {/* ... rest stays the same but replace all whileInView with isVisible ... */}
      {/* Soft, section-wide glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-28 h-[520px] w-[520px] rounded-full blur-3xl opacity-70 bg-[radial-gradient(circle_at_center,rgba(99,102,241,.12),transparent_65%)]" />
        <div className="absolute -bottom-48 -right-24 h-[560px] w-[560px] rounded-full blur-3xl opacity-70 bg-[radial-gradient(circle_at_center,rgba(56,189,248,.12),transparent_65%)]" />
      </div>

      {/* Header */}
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
  className="mx-auto mb-14 max-w-3xl text-center"
>
  <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
    The magic behind Context
  </h2>
  <p className="mt-3 text-base text-gray-600">
    Four reasons your inbox, calendar, and relationships finally work together.
  </p>
</motion.div>

      {/* 2×2 Grid */}
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        <FeatureTile
  isVisible={isVisible}
  delay={0}
  title="Smart relationship triage"
  sub="Surfaces who matters now — not just what's newest."
  accent="indigo"
  Icon={Inbox}
>
  <TriageVisual />
</FeatureTile>

<FeatureTile
  isVisible={isVisible}
  delay={0.1}
  title="AI drafts in your tone"
  sub="Replies that sound like you, customized per person."
  accent="emerald"
  Icon={Wand2}
>
  <DraftsVisual />
</FeatureTile>

<FeatureTile
  isVisible={isVisible}
  delay={0.2}
  title="Proactive nudges"
  sub="Warns before you ghost, with timing that fits your cadence."
  accent="amber"
  Icon={Bell}
>
  <NudgesVisual />
</FeatureTile>

<FeatureTile
  isVisible={isVisible}
  delay={0.3}
  title="Privacy by design"
  sub="Your data stays with Google. No auto-sending — you're always in control."
  accent="sky"
  Icon={Shield}
>
  <PrivacyVisual />
</FeatureTile>
      </div>
    </section>
  );
}

/* =======================
   Generic Feature Tile
   ======================= */
function FeatureTile({ isVisible, delay, title, sub, Icon, accent = "indigo", children }) {
  const styles = useAccent(accent);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 backdrop-blur-xl ring-1 ${styles.ring}
                  shadow-[0_8px_28px_rgba(15,23,42,.08)]`}
    >
      {/* Halo */}
      <div className={`pointer-events-none absolute -inset-6 -z-10 blur-xl ${styles.halo}`} />

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl border border-white/60 bg-white/90 shadow">
          <Icon className="text-gray-800" size={22} />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-gray-600">{sub}</p>
        </div>
      </div>

      {/* Visual */}
      <div className="relative h-50 md:h-96 overflow-hidden rounded-2xl border border-white/60 bg-white/70">
        {children}
      </div>
    </motion.article>
  );
}

function useAccent(accent) {
  switch (accent) {
    case "emerald":
      return {
        ring: "ring-emerald-300/50",
        halo:
          "bg-[radial-gradient(circle_at_center,rgba(16,185,129,.14),transparent_62%)]",
      };
    case "amber":
      return {
        ring: "ring-amber-300/50",
        halo:
          "bg-[radial-gradient(circle_at_center,rgba(245,158,11,.14),transparent_62%)]",
      };
    case "sky":
      return {
        ring: "ring-sky-300/50",
        halo:
          "bg-[radial-gradient(circle_at_center,rgba(56,189,248,.14),transparent_62%)]",
      };
    case "indigo":
    default:
      return {
        ring: "ring-indigo-300/50",
        halo:
          "bg-[radial-gradient(circle_at_center,rgba(99,102,241,.14),transparent_62%)]",
      };
  }
}

/* =======================
   Visuals
   ======================= */

/** 1) Smart Relationship Triage */
/** 1) Smart Relationship Triage — voice chat style (drop-in) */
/** 1) Smart Relationship Triage — Smooth Chat Animation */
/** 1) Smart Relationship Triage — Smooth Chat Animation */
/** 1) Smart Relationship Triage — iOS-Style Chat Animation */
function TriageVisual() {
  const prefersReducedMotion = useReducedMotion();

  const AI_TEXT =
    "Hi! I found 3 priority contacts: Jennifer needs a follow-up (9 days overdue), Noah is waiting on timeline (2 days), and Amy confirmed today’s agenda.";
  const USER_TEXT = "Read me Jennifer’s new email";
  const EMAIL_TEXT =
    "Hey — quick update on pricing. Friday 2pm works for me. I’ve attached the latest numbers and can finalize this week.";

  // show bubbles
  const [showAI1, setShowAI1] = useState(prefersReducedMotion);
  const [showUser, setShowUser] = useState(prefersReducedMotion);
  const [showAI2, setShowAI2] = useState(prefersReducedMotion);

  // typewriter counts
  const [aiCount, setAiCount] = useState(prefersReducedMotion ? AI_TEXT.length : 0);
  const [userCount, setUserCount] = useState(prefersReducedMotion ? USER_TEXT.length : 0);
  const [emailCount, setEmailCount] = useState(prefersReducedMotion ? EMAIL_TEXT.length : 0);

  const [typing, setTyping] = useState(null); // 'ai' | 'user' | 'email' | null

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeouts = [];
    const intervals = [];

    const wait = (ms) => new Promise((r) => timeouts.push(setTimeout(r, ms)));

    const typeOut = (text, setCount, speed, who) =>
      new Promise((resolve) => {
        setTyping(who);
        const id = setInterval(() => {
          setCount((c) => {
            if (c < text.length) return c + 1;
            clearInterval(id);
            resolve();
            return c;
          });
        }, speed);
        intervals.push(id);
      }).then(() => setTyping(null));

    (async () => {
      setShowAI1(true);
      await wait(300);
      await typeOut(AI_TEXT, setAiCount, 38, "ai"); // slower typing

      setShowUser(true);
      await wait(250);
      await typeOut(USER_TEXT, setUserCount, 44, "user"); // slower typing

      setShowAI2(true);
      await wait(250);
      await typeOut(EMAIL_TEXT, setEmailCount, 36, "email"); // slower typing
    })();

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [prefersReducedMotion]);

  // determine status text
  let status = "";
  if (typing === "ai" || typing === "email") status = "AI is speaking...";
  else if (typing === "user") status = "AI is listening...";
  else status = "";

  return (
    <div className="h-full w-full relative bg-white flex flex-col">
      <div className="relative flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        {showAI1 && (
          <Bubble role="ai" typing={typing === "ai"}>
            {AI_TEXT.slice(0, aiCount)}
          </Bubble>
        )}
        {showUser && (
          <Bubble role="user" typing={typing === "user"}>
            {USER_TEXT.slice(0, userCount)}
          </Bubble>
        )}
        {showAI2 && (
          <Bubble role="ai">
            <EmailPreview
              sender="Jennifer"
              label="new email"
              body={EMAIL_TEXT.slice(0, emailCount)}
              typing={typing === "email"}
            />
          </Bubble>
        )}
      </div>

      {/* status bar */}
      {status && (
        <div className="border-t border-gray-200 bg-gray-50 text-gray-600 text-xs py-2 px-4 text-center animate-fade-in">
          {status}
        </div>
      )}
    </div>
  );
}

function Bubble({ role, children, typing = false }) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm rounded-2xl ${
          isUser
            ? "bg-blue-600 text-white shadow-sm"
            : "bg-white border border-gray-200 text-gray-900 shadow-sm"
        }`}
        style={{
          borderTopLeftRadius: isUser ? 18 : 8,
          borderTopRightRadius: isUser ? 8 : 18,
        }}
      >
        <span className="leading-5">
          {children}
          {typing && !prefersReducedMotion && (
            <span className={`${isUser ? "text-white/80" : "text-gray-400"} ml-0.5 animate-pulse`}>
              ▍
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
}

function EmailPreview({ sender = "Jennifer", label = "new email", body, typing = false }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <Mail size={14} className="text-gray-500" />
        <span>
          {sender} — {label}
        </span>
      </div>
      <div className="leading-5 text-gray-900">
        {body}
        {typing && <span className="ml-0.5 text-gray-400 animate-pulse">▍</span>}
      </div>
    </div>
  );
}
/** 2) AI Drafts in Your Tone (typing) */
function DraftsVisual() {
  const prefersReducedMotion = useReducedMotion();
  const fullText =
    "Hi Jennifer — circling back on pricing. Friday 2pm works on my end if that’s still helpful. Quick agenda below.";
  const [count, setCount] = useState(prefersReducedMotion ? fullText.length : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let id;
    if (count < fullText.length) {
      id = setInterval(() => {
        setCount((c) => {
          if (c < fullText.length) return c + 1;
          clearInterval(id);
          return c; // stop once done
        });
      }, 30);
    }

    return () => clearInterval(id);
  }, [count, fullText.length, prefersReducedMotion]);

  return (
    <div className="relative h-full w-full p-4">
      {/* tone chip */}
      <div className="absolute left-4 top-4 z-10 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
        Jennifer • warm & concise
      </div>

      {/* bubble */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="w-[92%] rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-gray-100 text-gray-700">
              <Type size={14} />
            </div>
            <div className="text-xs text-gray-500">Draft</div>
          </div>
          <p className="text-sm leading-6 text-gray-800">
            {fullText.slice(0, count)}
            {!prefersReducedMotion && count < fullText.length && (
              <span className="animate-pulse">▍</span>
            )}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-700">
              Thread-aware
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-700">
              One-tap send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 3) Proactive Nudges (floating chips) */
/** 3) Proactive Nudges (floating chips — extended version) */
/** 3) Proactive Nudges (non-overlapping floating chips) */
/** 3) Proactive Nudges — non-overlapping refined layout */
function NudgesVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden p-3">
      <FloatChip
        className="left-6 top-6"
        text="No reply to Daniel in 5d · typical 24h"
        tone="amber"
        delay={0}
      />
      <FloatChip
        className="right-6 top-10"
        text="Investor update overdue"
        tone="rose"
        delay={0.4}
      />
      <FloatChip
        className="left-[22%] top-[38%]"
        text="Team intro with Noah still pending"
        tone="sky"
        delay={0.8}
      />
      <FloatChip
        className="left-[56%] top-[56%]"
        text="Last touch with Jennifer · 9d ago"
        tone="violet"
        delay={1.2}
      />
      {/* Bottom pair adjusted */}
      <FloatChip
        className="left-[10%] bottom-[24%]"
        text="Haven’t met Amy in 4w · schedule?"
        tone="indigo"
        delay={1.6}
      />
      <FloatChip
        className="right-[10%] bottom-[10%]"
        text="No follow-up with Sarah since last proposal"
        tone="emerald"
        delay={2}
      />
    </div>
  );
}
function FloatChip({ className = "", text, tone = "amber", delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();

  const styles =
    tone === "rose"
      ? { border: "border-rose-200", bg: "bg-rose-50/90", text: "text-rose-900" }
      : tone === "indigo"
      ? { border: "border-indigo-200", bg: "bg-indigo-50/90", text: "text-indigo-900" }
      : tone === "emerald"
      ? { border: "border-emerald-200", bg: "bg-emerald-50/90", text: "text-emerald-900" }
      : tone === "sky"
      ? { border: "border-sky-200", bg: "bg-sky-50/90", text: "text-sky-900" }
      : tone === "violet"
      ? { border: "border-violet-200", bg: "bg-violet-50/90", text: "text-violet-900" }
      : { border: "border-amber-200", bg: "bg-amber-50/90", text: "text-amber-900" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: [0.85, 1, 0.85], y: [0, -4, 0], x: [0, 2, -2, 0] }
      }
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute rounded-xl border ${styles.border} ${styles.bg} px-3 py-2 text-[12px] ${styles.text} shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <Bell size={14} />
        <span>{text}</span>
      </div>
    </motion.div>
  );
}

/** 4) Privacy by Design — Enhanced visual with big shield & soft aura */
function PrivacyVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative grid h-full place-items-center bg-gradient-to-b from-white to-sky-50 overflow-hidden">
      {/* Outer glow + rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <GlowRing delay={0} size={180} />
        <GlowRing delay={1.2} size={260} />
        <GlowRing delay={2.4} size={340} />
      </div>

      {/* Shield icon */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 grid place-items-center rounded-3xl border border-white/60 
                   bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(56,189,248,0.15)] size-28"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield
            size={56}
            className="text-sky-600 drop-shadow-[0_2px_4px_rgba(56,189,248,0.4)]"
          />
        </motion.div>

        {/* Subtle halo behind the shield */}
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25),transparent_70%)] blur-2xl" />
      </motion.div>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[11px] text-gray-600"
      >
        Secure by design · On-device AI · You stay in control
      </motion.div>
    </div>
  );
}

/* Expanding glow rings around shield */
function GlowRing({ delay = 0, size = 220 }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0.25, scale: 1 }}
      animate={
        prefersReducedMotion
          ? { opacity: 0.25, scale: 1 }
          : { opacity: [0.2, 0.05, 0.2], scale: [1, 1.3, 1] }
      }
      transition={{
        duration: 5.6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{ width: size, height: size }}
      className="absolute rounded-full border border-sky-200/60"
    />
  );
}

function Ring({ delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0.2, scale: 1 }}
      animate={
        prefersReducedMotion
          ? { opacity: 0.25 }
          : { opacity: [0.3, 0.1, 0.3], scale: [1, 1.25, 1] }
      }
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute left-1/2 top-1/2 -z-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/70"
    />
  );
}