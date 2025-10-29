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

    let timeoutId;
    let cancelled = false;
    setShown("");
    let index = 0;

    const tick = () => {
      if (cancelled) return;
      if (index >= fullText.length) return;

      index += 1;
      setShown(fullText.slice(0, index));

      const char = fullText[index - 1];
      const punctuationPause = /[.,!?]/.test(char)
        ? 140
        : char === "\n"
          ? 260
          : char === "—"
            ? 120
            : char === " "
              ? 20
              : 0;
      const randomPause = Math.random() * 40;

      timeoutId = setTimeout(tick, speedMs + punctuationPause + randomPause);
    };

    timeoutId = setTimeout(tick, speedMs);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [fullText, active, speedMs]);

  return shown;
}

/* =================================================
   MAIN
   ================================================= */
export default function FollowupCard() {
  const rootRef = useRef(null);
  const stageTimelineRef = useRef([]);
  const chatTimelineRef = useRef([]);

  const [started, setStarted] = useState(false);
  const [manualPhase, setManualPhase] = useState("prestart");
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

  useEffect(() => {
    if (!started) return;

    setManualPhase("inbox_idle");
    stageTimelineRef.current.forEach(clearTimeout);
    stageTimelineRef.current = [];

    const queueStage = (callback, delay) => {
      const id = setTimeout(callback, delay);
      stageTimelineRef.current.push(id);
      return id;
    };

    queueStage(() => setManualPhase("inbox_scroll"), 900);
    queueStage(() => setManualPhase("reply_hover"), 2100);
    queueStage(() => setManualPhase("reply_click"), 2550);
    queueStage(() => setManualPhase("compose_open"), 3000);
    queueStage(() => setManualPhase("compose_typing"), 3600);

    return () => {
      stageTimelineRef.current.forEach(clearTimeout);
      stageTimelineRef.current = [];
    };
  }, [started]);

  useEffect(() => {
    return () => {
      stageTimelineRef.current.forEach(clearTimeout);
      stageTimelineRef.current = [];
      chatTimelineRef.current.forEach(clearTimeout);
      chatTimelineRef.current = [];
    };
  }, []);

  const phaseOrder = [
    "prestart",
    "inbox_idle",
    "inbox_scroll",
    "reply_hover",
    "reply_click",
    "compose_open",
    "compose_typing",
    "compose_done",
  ];
  const phaseIndex = phaseOrder.indexOf(manualPhase);
  const hasReached = (phase) => phaseIndex >= phaseOrder.indexOf(phase);

  const composeVisible = hasReached("compose_open");
  const composeTypingActive = hasReached("compose_typing");

  const userTranscript =
    "Need a reply for Sarah. Thank her for waiting and confirm pricing lands tomorrow.";

  const draftFull =
    "Hi Sarah —\n\nThanks again for being patient on pricing. I'll send the updated numbers tomorrow morning.\n\nAppreciate you,\nJ";

  const emailTyped = useTypewriter(draftFull, composeTypingActive, 34);
  const emailDone = emailTyped.length === draftFull.length;

  useEffect(() => {
    if (manualPhase === "compose_typing" && emailDone) {
      setManualPhase("compose_done");
    }
  }, [manualPhase, emailDone]);

  const composeDoneReached = hasReached("compose_done");

  useEffect(() => {
    if (!composeDoneReached) return;

    chatTimelineRef.current.forEach(clearTimeout);
    chatTimelineRef.current = [];

    const queueTimeout = (callback, delay) => {
      const id = setTimeout(callback, delay);
      chatTimelineRef.current.push(id);
      return id;
    };

    queueTimeout(() => {
      setChatStarted(true);
      setChatPhase("user_voice");
      queueTimeout(() => setChatPhase("user_final"), 900);
      queueTimeout(() => setChatPhase("ai_draft"), 1500);
      queueTimeout(() => setChatPhase("ai_final"), 3600);
    }, 800);

    return () => {
      chatTimelineRef.current.forEach(clearTimeout);
      chatTimelineRef.current = [];
    };
  }, [composeDoneReached]);

  const userTypeActive =
    chatPhase === "user_final" || chatPhase === "ai_draft" || chatPhase === "ai_final";
  const userTyped = useTypewriter(userTranscript, userTypeActive, 26);
  const userDone = userTyped.length === userTranscript.length;

  const aiResponse =
    "Here's the reply for Sarah — want me to send it?\n\nHi Sarah —\n\nThanks again for being patient on pricing. I'll send the updated numbers tomorrow morning.\n\nAppreciate you,\nJ";
  const aiTypeActive = chatPhase === "ai_draft" || chatPhase === "ai_final";
  const aiTyped = useTypewriter(aiResponse, aiTypeActive, 20);
  const aiDone = aiTyped.length === aiResponse.length;

  const showUserBubble =
    chatPhase === "user_voice" ||
    chatPhase === "user_final" ||
    chatPhase === "ai_draft" ||
    chatPhase === "ai_final";
  const showAiBubble = chatPhase === "ai_draft" || chatPhase === "ai_final";
  const aiStillTalkingForUI = chatPhase === "ai_draft" && !aiDone;

  const composeIsBlurred = chatStarted;

  return (
    <FeatureLayout
      ref={rootRef}
      eyebrow="Feature 02"
      title="Replies that sound like you. Instantly."
      description={[
        <p key="p1" className="text-base leading-relaxed text-gray-700">
          Say “Draft a reply,” and Claro writes the message in the tone you actually use with that person —
          same greeting, same formality, same sign-off.
        </p>,
        <p key="p2" className="text-sm leading-relaxed text-gray-500">
          Without Claro, you’re scrolling, clicking, and typing it yourself. With Claro, you just describe the
          intent and it’s ready to send.
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
      <div className="relative w-full max-w-[460px]">
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1.2 }}
          animate={{
            opacity: started ? 1 : 0,
            y: started ? 0 : 30,
            rotate: -1.2,
          }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-0"
        >
          <InboxPreviewCard
            phase={manualPhase}
            hasScrolled={hasReached("inbox_scroll")}
            replyHover={manualPhase === "reply_hover"}
            replyPressed={manualPhase === "reply_click"}
            dimmed={composeVisible}
          />
        </motion.div>

        <AnimatePresence>
          {composeVisible && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 36, rotate: -0.8 }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: -0.8,
                filter: composeIsBlurred
                  ? "blur(2.6px) saturate(0.92) brightness(0.98)"
                  : "blur(0px) saturate(1) brightness(1)",
              }}
              exit={{ opacity: 0, y: 36, transition: { duration: 0.5, ease: "easeInOut" } }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-0 z-30"
            >
              <GmailDraftCard
                bodyText={emailTyped}
                bodyDone={emailDone}
                showQuotedThread={composeVisible}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <PointerCursor phase={manualPhase} visible={!composeDoneReached} />
      </div>

      {chatStarted && (
        <div className="absolute top-6 right-4 w-[320px] max-w-[80%] z-40 flex flex-col gap-3 pointer-events-none">
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
                    max-w-[230px]
                    rounded-2xl px-3 py-2 text-[13px] leading-snug
                    text-white bg-gradient-to-br from-blue-500 to-blue-600
                    shadow-[0_16px_40px_rgba(0,0,0,0.18)]
                    ring-1 ring-blue-600/40 border border-white/10 break-words
                  "
                  style={{ borderTopRightRadius: "0.5rem" }}
                >
                  {chatPhase === "user_voice" && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/90">Listening…</span>
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
                    max-w-[280px]
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
                    {aiTyped}
                    {!aiDone && <CaretBlink />}
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

function InboxPreviewCard({ phase, hasScrolled, replyHover, replyPressed, dimmed }) {
  const statusMap = {
    inbox_scroll: "Scrolling…",
    reply_hover: "Hunting for the reply button…",
    reply_click: "Opening reply…",
    compose_open: "Opening reply…",
    compose_typing: "Typing manually…",
    compose_done: "Typing manually…",
  };
  const statusLabel = statusMap[phase];

  const highlightSarah =
    phase === "reply_hover" ||
    phase === "reply_click" ||
    phase === "compose_open" ||
    phase === "compose_typing" ||
    phase === "compose_done";

  const rows = [
    {
      unread: true,
      from: "Jennifer Lee",
      time: "3:17 PM",
      subject: "Checking in on updated pricing",
      body:
        "Just following up on the revised pricing you said you'd send yesterday. They're waiting on it to move forward.",
      chips: [
        { color: "amber", text: "waiting on you" },
        { color: "red", text: "deal at risk" },
      ],
      hasAttachment: false,
    },
    {
      unread: true,
      from: "Sarah Quinn",
      time: "2:41 PM",
      subject: "QBR tomorrow 10AM — need your final slide",
      body:
        "I told leadership you'd send the updated pricing by 5pm so I can lock the deck. Can you add one line on margin justification?",
      chips: [
        { color: "amber", text: "tomorrow 10am" },
        { color: "blue", text: "you own slide 7" },
      ],
      hasAttachment: true,
    },
    {
      unread: true,
      from: "Alex Rivera",
      time: "1:09 PM",
      subject: "Can you confirm the final numbers before Friday?",
      body:
        "If we don't lock them in by Friday, this slips to next week. Who's approving the changes?",
      chips: [
        { color: "amber", text: "Friday deadline" },
        { color: "red", text: "blocked on you" },
      ],
      hasAttachment: false,
    },
    {
      unread: false,
      from: "Maya Patel",
      time: "12:22 PM",
      subject: "Quick check-in on next steps",
      body:
        "No rush — just wanted to see if you're still planning to send over the summary from last week's call.",
      chips: [{ color: "blue", text: "friendly reminder" }],
      hasAttachment: false,
    },
  ];

  return (
    <div className="relative">
      {statusLabel && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-gray-600 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-gray-200"
        >
          {statusLabel}
        </motion.div>
      )}

      <div
        className="w-full max-w-[440px] rounded-xl overflow-hidden border border-black/5 ring-1 ring-black/5 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.25)] transition-all duration-500"
        style={{
          filter: dimmed ? "saturate(0.85) brightness(0.96)" : "saturate(1) brightness(1)",
          opacity: dimmed ? 0.82 : 1,
        }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#F6F8FC] border-b border-gray-200">
          <div className="flex items-center gap-2 text-[12px] text-gray-600">
            <span className="inline-flex items-center gap-1 font-semibold text-[#D93025]">
              <span className="inline-block h-[10px] w-[10px] rounded-full bg-[#D93025]" />
              Gmail
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-2 py-[2px] text-[11px] font-medium text-gray-500 shadow-sm">
              Inbox
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-2 py-[2px] text-[11px] text-gray-400">
              Starred
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-[4px] shadow-sm">
              <span className="text-gray-300">🔍</span>
              <span>Search mail</span>
            </span>
            <span className="text-gray-300">⚙︎</span>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ y: hasScrolled ? -36 : 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="divide-y divide-gray-100"
          >
            {rows.map((row, index) => (
              <InboxRow
                key={row.from}
                index={index}
                {...row}
                active={index === 1 && highlightSarah}
                showReply={index === 1 && (replyHover || replyPressed)}
                replyHover={replyHover}
                replyPressed={replyPressed}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InboxRow({
  index,
  unread,
  from,
  time,
  subject,
  body,
  chips = [],
  hasAttachment,
  active,
  showReply,
  replyHover,
  replyPressed,
}) {
  const chipPalette = {
    amber: {
      background: "rgba(251,191,36,0.16)",
      color: "#92400e",
      border: "rgba(251,191,36,0.35)",
    },
    red: {
      background: "rgba(248,113,113,0.16)",
      color: "#b91c1c",
      border: "rgba(248,113,113,0.35)",
    },
    blue: {
      background: "rgba(59,130,246,0.12)",
      color: "#1d4ed8",
      border: "rgba(59,130,246,0.35)",
    },
  };

  const chipStyleFor = (color) => chipPalette[color] || chipPalette.blue;

  return (
    <motion.div
      animate={{
        backgroundColor: active ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,1)",
        boxShadow: active
          ? "inset 0 0 0 1px rgba(37,99,235,0.18)"
          : "inset 0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.02 }}
      className="relative px-3 py-3 bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="relative flex-shrink-0 pt-[3px]">
            {unread && (
              <motion.span
                layout
                className="absolute -left-3 top-[7px] h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.55)]"
              />
            )}
            <span className="mt-[2px] block h-[14px] w-[14px] rounded-[3px] border border-gray-300 bg-white" />
          </div>

          <button
            className={`mt-[1px] text-[13px] leading-none flex-shrink-0 ${
              unread ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
            }`}
            aria-label="Star"
          >
            ★
          </button>

          <div className="min-w-0">
            <p
              className={`truncate text-[13px] leading-snug ${
                unread ? "text-gray-900 font-medium" : "text-gray-700"
              }`}
            >
              {from}
            </p>
            <p className="truncate text-[12px] text-gray-500">{subject}</p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-start gap-2 text-[11px] text-gray-400">
          {hasAttachment && <span className="text-[12px] leading-none text-gray-400">📎</span>}
          <span>{time}</span>
        </div>
      </div>

      <p className="mt-1 truncate text-[12px] leading-snug text-gray-500">{body}</p>

      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((chip, i) => {
            const palette = chipStyleFor(chip.color);
            return (
              <span
                key={chip.text + i}
                className="rounded-full px-2 py-[2px] text-[11px] font-medium"
                style={{
                  background: palette.background,
                  color: palette.color,
                  border: `1px solid ${palette.border}`,
                  boxShadow: active ? "0 2px 6px rgba(37,99,235,0.15)" : "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {chip.text}
              </span>
            );
          })}
        </div>
      )}

      {showReply && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <motion.button
            animate={{
              scale: replyPressed ? 0.92 : replyHover ? 1.03 : 1,
              boxShadow: replyPressed
                ? "0 0 0 0 rgba(59,130,246,0.0)"
                : replyHover
                  ? "0 10px 24px rgba(59,130,246,0.18)"
                  : "0 6px 16px rgba(15,23,42,0.12)",
              backgroundColor: replyPressed ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.95)",
              color: replyPressed ? "rgb(37,99,235)" : "rgb(75,85,99)",
              borderColor: replyHover ? "rgba(59,130,246,0.45)" : "rgba(209,213,219,1)",
            }}
            transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
            className="pointer-events-none rounded-full border px-4 py-1 text-[11px] font-medium"
          >
            Reply
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

function PointerCursor({ phase, visible }) {
  const targets = {
    prestart: { opacity: 0, scale: 0.85, x: 220, y: 140 },
    inbox_idle: { opacity: 1, scale: 1, x: 250, y: 92 },
    inbox_scroll: { opacity: 1, scale: 1, x: 260, y: 150 },
    reply_hover: { opacity: 1, scale: 1, x: 276, y: 188 },
    reply_click: { opacity: 1, scale: 0.93, x: 276, y: 188 },
    compose_open: { opacity: 1, scale: 1, x: 210, y: 256 },
    compose_typing: { opacity: 0, scale: 0.9, x: 210, y: 276 },
    compose_done: { opacity: 0, scale: 0.9, x: 210, y: 276 },
  };

  if (!visible) {
    return null;
  }

  const target = targets[phase] || targets.prestart;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, x: target.x, y: target.y }}
      animate={target}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute z-40"
      style={{ transformOrigin: "top left" }}
    >
      <div className="pointer-events-none drop-shadow-[0_8px_20px_rgba(15,23,42,0.22)]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="white"
          stroke="#111827"
          strokeWidth="1.2"
          strokeLinejoin="round"
        >
          <path d="M4 3.5 9.8 17l1.9-5.4 6.2 4.1-13.9-12.2z" />
        </svg>
      </div>
    </motion.div>
  );
}

function GmailDraftCard({ bodyText, bodyDone, showQuotedThread }) {
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
  <div className="px-3 py-3 whitespace-pre-wrap min-h-[180px] text-[13px] leading-[1.45] text-gray-800">
    {showQuotedThread && (
      <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] leading-relaxed text-gray-500">
        <span className="font-medium text-gray-600">Sarah Quinn</span> • "Can you send the updated pricing by 5 so I can lock the deck?"
      </div>
    )}
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
