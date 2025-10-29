// followupcard.jsx
//
// Feature 02 — “Replies that sound like you”
//
// ✨ Update per request:
// - Show the Gmail-style draft FIRST, crisp.
// - Type the body out slowly so users can watch it build.
// - After the draft is fully typed, hold briefly, THEN blur the draft
//   and bring in the chat overlay (same You/Claro style as Feature 01).
//
// Stack:
//   BACK: Gmail compose (crisp → blur once chat starts)
//   FRONT: Chat overlay (appears only after the draft finishes)
//
// Requires Tailwind + framer-motion + your FeatureLayout component.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureLayout from "./FeatureLayout.jsx";

/* -------------------------------------------------
   Hook: typewriter
------------------------------------------------- */
function useTypewriter(fullText, active, speedMs = 22) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!active) return;
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i <= fullText.length) setShown(fullText.slice(0, i));
      else clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [fullText, active, speedMs]);
  return shown;
}

/* =================================================
   MAIN
   ================================================= */
export default function FollowupCard() {
  const rootRef = useRef(null);

  // one-shot view trigger
  const [started, setStarted] = useState(false);

  // chat lifecycle (runs only after the draft finishes + a short hold)
  const [chatStarted, setChatStarted] = useState(false);
  const [chatPhase, setChatPhase] = useState(null); // 'user_voice' | 'user_final' | 'ai_draft' | 'ai_final'

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

  // Content
  const userTranscript =
    "Tell Sarah I’ll send pricing tomorrow and thank her for being patient.";

  const draftFull =
    "Hey Sarah —\n\nThanks again for being patient on pricing. I’ll send updated numbers tomorrow.\n\nAppreciate you,\nJ";

  // While the draft is being typed, chat is NOT visible.
  // When the draft is complete, we wait a beat, then start chat.
  const emailTyped = useTypewriter(draftFull, started && !chatStarted, 22); // slower = more time to watch
  const emailDone = emailTyped.length === draftFull.length;

  useEffect(() => {
    if (!started || chatStarted || !emailDone) return;

    const timers = [];
    const hold = setTimeout(() => {
      setChatStarted(true);
      setChatPhase("user_voice");
      timers.push(setTimeout(() => setChatPhase("user_final"), 700));
      timers.push(setTimeout(() => setChatPhase("ai_draft"), 1100));
      timers.push(setTimeout(() => setChatPhase("ai_final"), 2400));
    }, 900); // extra time to admire the finished draft

    return () => {
      clearTimeout(hold);
      timers.forEach(clearTimeout);
    };
  }, [started, emailDone, chatStarted]);

  // Chat text typing for the user message (starts after chat begins)
  const userTypeActive =
    chatPhase === "user_final" || chatPhase === "ai_draft" || chatPhase === "ai_final";
  const userTyped = useTypewriter(userTranscript, userTypeActive, 20);
  const userDone = userTyped.length === userTranscript.length;

  // UI helpers
  const showUserBubble =
    chatPhase === "user_voice" ||
    chatPhase === "user_final" ||
    chatPhase === "ai_draft" ||
    chatPhase === "ai_final";
  const showAiBubble = chatPhase === "ai_draft" || chatPhase === "ai_final";
  const aiStillTalkingForUI = chatPhase === "ai_draft"; // simple pulse while handing off

  // The compose is crisp until chat starts; then we blur it.
  const composeIsBlurred = chatStarted;

  return (
    <FeatureLayout
      ref={rootRef}
      eyebrow="Feature 02"
      title="Replies that sound like you. Instantly."
      description={[
        <p key="p1" className="text-base leading-relaxed text-gray-700">
          Say “Draft a reply,” and Claro writes the message in the tone you
          actually use with that person — same greeting, same formality, same sign-off.
        </p>,
        <p key="p2" className="text-sm leading-relaxed text-gray-500">
          You just say what you want (“Tell Sarah I’ll send pricing tomorrow”),
          Claro turns it into a clean, relationship-safe email, and you say “Send.”
        </p>,
      ]}
      background={
        <div
          className="pointer-events-none absolute inset-0 mx-auto max-w-6xl blur-[100px] opacity-40"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(224,122,95,0.10) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      }
    >
      {/* BACK: Gmail compose. We type first, then blur once chat starts. */}
      <AnimatePresence>
        {started && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 28, rotate: -0.6 }}
            animate={{
              opacity: started ? 1 : 0,
              y: started ? 0 : 28,
              rotate: -0.6,
              filter: composeIsBlurred
                ? "blur(2.6px) saturate(0.92) brightness(0.98)"
                : "blur(0px) saturate(1) brightness(1)",
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[440px] pointer-events-none"
          >
            <GmailDraftCard bodyText={emailTyped} bodyDone={emailDone} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FRONT: Chat overlay shows only after draft completes */}
      {chatStarted && (
        <div className="absolute top-6 right-4 w-[320px] max-w-[80%] z-40 flex flex-col gap-3 pointer-events-none">
          {/* USER bubble (outgoing, right-aligned) */}
          <AnimatePresence>
            {showUserBubble && (
              <motion.div
                key="user-bubble"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full justify-end gap-2 pointer-events-auto"
              >
                <div
                  className="
                    max-w-[220px]
                    rounded-2xl px-3 py-2 text-[13px] leading-snug
                    text-white bg-gradient-to-br from-blue-500 to-blue-600
                    shadow-[0_16px_40px_rgba(0,0,0,0.18)]
                    ring-1 ring-blue-600/40 border border-white/10 break-words
                  "
                  style={{ borderTopRightRadius: "0.5rem" }}
                >
                  {chatPhase === "user_voice" && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/90">
                        Listening…
                      </span>
                      <VoiceBars active />
                    </div>
                  )}

                  {chatPhase !== "user_voice" && (
                    <div className="text-[13px] font-medium text-white whitespace-pre-wrap">
                      {userTyped}
                      {!userDone && <CaretBlink light />}
                    </div>
                  )}
                </div>

                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-[10px] font-medium flex items-center justify-center ring-1 ring-gray-300 pointer-events-auto">
                    You
                  </div>

                  {chatPhase === "user_voice" && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow:
                          "0 0 8px rgba(59,130,246,0.6),0 0 16px rgba(59,130,246,0.4)",
                      }}
                      animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI bubble (incoming, left-aligned) */}
          <AnimatePresence>
            {showAiBubble && (
              <motion.div
                key="ai-bubble-row"
                initial={{ opacity: 0, y: 28, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full justify-start gap-2 items-start pointer-events-auto"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#FFE8DC] text-[#C76545] text-[10px] font-medium flex items-center justify-center ring-1 ring-orange-200">
                    C
                  </div>

                  {aiStillTalkingForUI && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow:
                          "0 0 8px rgba(224,122,95,0.5),0 0 16px rgba(224,122,95,0.3)",
                      }}
                      animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>

                <div
                  className="
                    max-w-[260px]
                    rounded-2xl px-4 py-3
                    bg-gray-100 text-gray-900
                    ring-1 ring-gray-200 border border-white/40
                    shadow-[0_24px_48px_rgba(0,0,0,0.12)]
                    text-[14px] leading-[1.4] font-medium
                    whitespace-pre-wrap break-words
                  "
                  style={{
                    borderTopLeftRadius: "0.5rem",
                    boxShadow: "0 28px 64px rgba(0,0,0,0.12), 0 6px 28px rgba(0,0,0,0.06)",
                  }}
                >
                  {aiStillTalkingForUI && (
                    <div className="flex items-center gap-2 mb-2 text-[12px] font-medium text-gray-700">
                      <span>Drafting…</span>
                      <div className="text-gray-500">
                        <VoiceBars active />
                      </div>
                    </div>
                  )}

                  <div className="text-gray-900">
                    Here’s how I’ll send it to Sarah — it sounds like you.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </FeatureLayout>
  );
}

/* =================================================
   SUBCOMPONENTS
   ================================================= */

function GmailDraftCard({ bodyText, bodyDone }) {
  return (
    <div
      className="
        w-full
        rounded-xl overflow-hidden
        bg-white text-gray-800
        ring-1 ring-black/5 border border-black/5
        shadow-[0_32px_80px_rgba(0,0,0,0.28)]
        text-[13px] leading-[1.45]
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between px-3 py-2 bg-[#202124] text-white border-b border-black/40 text-[12px]">
        <span className="font-medium">New message</span>
        <div className="flex items-center gap-3 text-white/70">
          <span className="text-[12px] leading-none">▁</span>
          <span className="text-[11px] leading-none">⧉</span>
          <span className="text-[12px] leading-none">✕</span>
        </div>
      </div>

      {/* To */}
      <div className="px-3 py-2 border-b border-gray-200 text-[12px] leading-snug text-gray-700 flex items-start flex-wrap gap-2">
        <span className="text-gray-500 min-w-[34px]">To</span>
        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-2 py-[2px] text-[11px] font-medium leading-none ring-1 ring-gray-300 border border-white shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
          Sarah&nbsp;Quinn
        </span>
      </div>

      {/* Subject */}
      <div className="px-3 py-2 border-b border-gray-200 text-[12px] leading-snug text-gray-700 flex items-start flex-wrap gap-2">
        <span className="text-gray-500 min-w-[54px]">Subject</span>
        <span className="text-gray-900 font-medium">Pricing update</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3 whitespace-pre-wrap min-h-[160px] text-[13px] leading-[1.45] text-gray-800">
        {bodyText}
        {!bodyDone && <CaretBlink />}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
        <button
          className="
            inline-flex items-center justify-center rounded-md px-2.5 py-1.5
            text-[12px] font-medium leading-none text-white
            bg-[#0b57d0] shadow-[0_2px_4px_rgba(0,0,0,0.2)]
          "
        >
          Send
        </button>
        <button
          className="
            inline-flex items-center justify-center rounded-md px-2.5 py-1.5
            text-[12px] font-medium leading-none text-gray-700
            bg-white ring-1 ring-gray-300 border border-white/60
            shadow-[0_1px_2px_rgba(0,0,0,0.08)]
          "
        >
          Edit
        </button>
      </div>
    </div>
  );
}

/* ===== Shared micro components (same vibe as Feature 01) ===== */

function VoiceBars({ active }) {
  return (
    <div className="flex gap-[2px] items-end h-[12px]">
      {[0, 0.15, 0.3].map((d, i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-current rounded-[1px] text-blue-100"
          style={{ backgroundColor: "currentColor", color: "rgb(255 255 255 / 0.9)" }}
          animate={active ? { height: ["4px", "11px", "5px", "9px", "6px"] } : { height: "5px" }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: d }}
          initial={false}
        />
      ))}
    </div>
  );
}

function CaretBlink({ light = false }) {
  return (
    <motion.span
      className={`inline-block w-[2px] h-[14px] align-bottom ml-[2px] ${
        light ? "bg-white" : "bg-gray-900"
      }`}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}
