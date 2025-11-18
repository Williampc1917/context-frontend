import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import FeatureLayout from "./FeatureLayout.jsx";

const SMART_ALERTS = [
  {
    id: "alex",
    name: "Alex Wong",
    message: "Promised follow-up “next week.”",
    action: "Send update",
    severityColor: "#F5C544",
  },
  {
    id: "sarah",
    name: "Sarah Lopez",
    message: "Waiting on your reply for 2 days.",
    action: "Draft response",
    severityColor: "#FF7A7A",
  },
  {
    id: "jennifer",
    name: "Jennifer Miller",
    message: "Meeting: Budget review in 3 hours.",
    action: "Pricing & timeline recap",
    severityColor: "#62B7FF",
  },
  {
    id: "ethan",
    name: "Ethan Cole",
    message: "You promised to share that link yesterday.",
    action: "Send it now",
    severityColor: "#FFA36F",
  },
  {
    id: "jasmine",
    name: "Jasmine Lee",
    message: "No reply from Jasmine yet — want to follow up?",
    action: "Write quick note",
    severityColor: "#7F7BFF",
  },
  {
    id: "liam",
    name: "Liam Carter",
    message: "Haven’t replied to Liam’s question from yesterday.",
    action: "Draft a quick reply",
    severityColor: "#53D6B7",
  },
];

const ROTATION_MS = 3000;
const STACK_OFFSET = 26;

export default function PromiseTrackerCard() {
  const rootRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [stack, setStack] = useState(() =>
    SMART_ALERTS.map((alert, idx) => ({
      ...alert,
      instanceId: `${alert.id}-${idx}`,
    })),
  );
  const [revealed, setRevealed] = useState(false);
  const instanceRef = useRef(SMART_ALERTS.length);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || revealed) return;
    const timer = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(timer);
  }, [started, revealed]);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setStack((current) => {
        if (current.length <= 1) return current;
        const [first, ...rest] = current;
        return [
          ...rest,
          {
            ...first,
            instanceId: `${first.id}-${instanceRef.current++}`,
          },
        ];
      });
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, [started]);

  const visibleStack = started ? stack.slice(0, 3) : [];

  return (
    <FeatureLayout
      ref={rootRef}
      title="Smart Alerts that keep every promise in sight."
      description={[
        <p key="summary" className="text-base leading-relaxed text-gray-700">
          Claro notices the moments that matter, when you owe a reply, miss a
          follow up, or forget a promise, and gathers them into one clear place.
        </p>,
        <p key="detail" className="text-sm leading-relaxed text-gray-600">
          The mental load of remembering every little thing goes away, and you
          are not trying to keep track of every loose end by yourself.
        </p>,
      ]}
    >
      <div className="relative flex h-[360px] w-full max-w-[340px] items-center justify-center">
        <div className="pointer-events-none absolute inset-[-8%] -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.95),rgba(255,255,255,0.35),transparent_70%)] blur-[90px]" />
        <motion.div
          className="relative w-full pt-1"
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{
            opacity: started ? 1 : 0,
            y: started ? 0 : 36,
            scale: started ? 1 : 0.97,
          }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative h-[300px] w-full">
            <div className="pointer-events-none absolute inset-x-6 bottom-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.3),rgba(255,255,255,0))] blur-[55px] opacity-90" />
            <AnimatePresence initial={false}>
              {visibleStack.map((alert, index, visible) => {
                const targetY = index * STACK_OFFSET;
                const targetScale = 1 - index * 0.03;
                return (
                  <motion.div
                    key={alert.instanceId}
                    initial={{
                      opacity: 0,
                      y: targetY + 20,
                      scale: targetScale - 0.04,
                    }}
                    animate={{
                      opacity: 1,
                      y: targetY,
                      scale: [targetScale + 0.02, targetScale],
                    }}
                    exit={{
                      opacity: 0,
                      y: targetY - 22,
                      scale: targetScale - 0.05,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                      delay: revealed ? 0 : index * 0.16,
                    }}
                    className="absolute inset-x-0 origin-top"
                    style={{ zIndex: visible.length - index }}
                  >
                    <SmartAlertCard alert={alert} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </FeatureLayout>
  );
}

function SmartAlertCard({ alert }) {
  const { name, message, action, severityColor } = alert;

  return (
    <article
      className="relative w-full rounded-[22px] border border-white/10 bg-[#1E1B24]/95 p-5 shadow-[0_28px_55px_rgba(10,7,15,0.45)] ring-1 ring-white/5"
      style={{
        background:
          "linear-gradient(150deg, rgba(33,28,40,0.96) 0%, rgba(18,15,24,0.96) 100%)",
      }}
    >
      <div className="absolute inset-0 rounded-[22px] border border-white/5 opacity-30" />
      <div className="relative flex flex-col gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: severityColor }}
            />
            <span className="text-[15px] font-semibold text-white">{name}</span>
          </div>
          <p className="text-[13.5px] leading-relaxed text-white/70">
            {message}
          </p>
        </div>

        <div
          className="rounded-[12px] border border-white/8 px-4 py-2.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex-1 text-[12.5px] font-medium text-white/85">
              {action}
            </span>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-3.5 w-3.5 text-white/70 shrink-0"
            >
              <path
                d="M10 4v12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M6.25 7.75 10 4l3.75 3.75"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
