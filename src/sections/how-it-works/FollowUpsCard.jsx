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

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureLayout from "./FeatureLayout.jsx";
import InboxRow from "./InboxRow.jsx";

const FOLLOW_UP_ROWS = [
  {
    unread: true,
    from: "Jennifer Lee",
    time: "3:17 PM",
    subject: "Checking in on updated pricing",
    body:
      "Just following up on the revised pricing you said you’d send yesterday. They’re waiting on it to move forward.",
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
      "You’re presenting slide 7. I told leadership you’d send the updated pricing by 5pm so I can lock the deck. Can you add one line on margin justification?",
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
      "I still don’t have the final numbers you said you’d send over. If we don’t lock them in by Friday, this slips to next week. Who’s giving the green light?",
    chips: [
      { color: "amber", text: "Friday deadline" },
      { color: "red", text: "blocked on you" },
    ],
    hasAttachment: false,
  },
  {
    unread: true,
    from: "Maya Patel",
    time: "12:22 PM",
    subject: "Quick check-in on next steps",
    body:
      "No rush — just wanted to see if you’re still planning to send over the summary from last week’s call. Happy to wait until things calm down.",
    chips: [{ color: "blue", text: "friendly reminder" }],
    hasAttachment: false,
  },
];

const TARGET_CONTACT = FOLLOW_UP_ROWS[1];
const SIGN_OFF_SNIPPET = "Appreciate you,\nJ";

/* -------------------------------------------------
   Hook: typewriter
------------------------------------------------- */
function useTypewriter({
  fullText = "",
  script = null,
  active,
  baseSpeed = 22,
  randomVariance = 40,
  backspaceSpeed = 80,
}) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;

    let timeoutId;
    let cancelled = false;

    const computePunctuationPause = (char) => {
      if (char === "\n") return 260;
      if (char === "—") return 120;
      if (/[.,!?]/.test(char)) return 140;
      if (char === " ") return 20;
      return 0;
    };

    setText("");
    setDone(false);

    const actions = [];

    if (script && script.length > 0) {
      script.forEach((token) => {
        if (token.type === "text" && token.value) {
          for (const char of token.value) {
            actions.push({ kind: "text", char, pace: token.speedMs });
          }
        }
        if (token.type === "backspace") {
          const count = token.count ?? 1;
          for (let i = 0; i < count; i += 1) {
            actions.push({ kind: "backspace", pace: token.speedMs });
          }
        }
        if (token.type === "pause") {
          actions.push({ kind: "pause", duration: token.ms ?? 0 });
        }
      });
    } else {
      for (const char of fullText) {
        actions.push({ kind: "text", char });
      }
    }

    let actionIndex = 0;
    let buffer = "";

    const runNext = () => {
      if (cancelled) return;

      if (actionIndex >= actions.length) {
        setDone(true);
        setText(script ? buffer : fullText);
        return;
      }

      const action = actions[actionIndex];
      actionIndex += 1;

      if (action.kind === "text") {
        buffer += action.char;
        setText(buffer);
        const punctuationPause = computePunctuationPause(action.char);
        const randomPause = randomVariance ? Math.random() * randomVariance : 0;
        const delay = (action.pace ?? baseSpeed) + punctuationPause + randomPause;
        timeoutId = setTimeout(runNext, delay);
        return;
      }

      if (action.kind === "backspace") {
        buffer = buffer.slice(0, -1);
        setText(buffer);
        const delay = action.pace ?? backspaceSpeed;
        timeoutId = setTimeout(runNext, delay);
        return;
      }

      if (action.kind === "pause") {
        const pauseDuration = action.duration ?? baseSpeed;
        timeoutId = setTimeout(runNext, pauseDuration);
        return;
      }
    };

    timeoutId = setTimeout(runNext, baseSpeed);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [fullText, script, active, baseSpeed, randomVariance, backspaceSpeed]);

  return useMemo(() => ({ text, done }), [text, done]);
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
    "compose_rewrite",
    "compose_done",
  ];
  const phaseIndex = phaseOrder.indexOf(manualPhase);
  const hasReached = (phase) => phaseIndex >= phaseOrder.indexOf(phase);

  const composeVisible = hasReached("compose_open");
  const composeTypingActive = hasReached("compose_typing") && !hasReached("compose_done");

  const userTranscript =
    "Need a reply for Sarah. Thank her for waiting and confirm pricing lands tomorrow.";

  const draftFull =
    "Hi Sarah —\n\nThanks again for being patient on pricing. I'll send the updated numbers tomorrow morning.\n\nAppreciate you,\nJ";

  const manualScript = useMemo(
    () => [
      {
        type: "text",
        value: "Hi Sarah —\n\nThanks agian for waiting on the pricing update.",
        speedMs: 62,
      },
      { type: "pause", ms: 620 },
      { type: "backspace", count: 40, speedMs: 90 },
      { type: "pause", ms: 320 },
      {
        type: "text",
        value: "again for being patient on pricing. I'll send the updated numbers tomorrow morning.",
        speedMs: 58,
      },
      { type: "pause", ms: 450 },
      { type: "text", value: "\n\nAppreciate you,\nJ", speedMs: 56 },
    ],
    [],
  );

  const { text: emailTyped, done: emailDone } = useTypewriter({
    fullText: draftFull,
    script: manualScript,
    active: composeTypingActive,
    baseSpeed: 55,
    randomVariance: 26,
    backspaceSpeed: 120,
  });

  useEffect(() => {
    if (manualPhase !== "compose_typing") return;
    if (!emailTyped.includes("Thanks agian for waiting on the pricing update.")) return;
    setManualPhase("compose_rewrite");
  }, [manualPhase, emailTyped]);

  useEffect(() => {
    if ((manualPhase === "compose_typing" || manualPhase === "compose_rewrite") && emailDone) {
      setManualPhase("compose_done");
    }
  }, [manualPhase, emailDone]);

  const composeDoneReached = hasReached("compose_done");

  useEffect(() => {
    if (!started) return;

    chatTimelineRef.current.forEach(clearTimeout);
    chatTimelineRef.current = [];

    const queueTimeout = (callback, delay) => {
      const id = setTimeout(callback, delay);
      chatTimelineRef.current.push(id);
      return id;
    };

    setChatStarted(true);
    setChatPhase("user_voice");
    queueTimeout(() => setChatPhase("user_final"), 900);
    queueTimeout(() => setChatPhase("ai_draft"), 1500);
    queueTimeout(() => setChatPhase("ai_final"), 3200);

    return () => {
      chatTimelineRef.current.forEach(clearTimeout);
      chatTimelineRef.current = [];
    };
  }, [started]);

  const userTypeActive =
    chatPhase === "user_final" || chatPhase === "ai_draft" || chatPhase === "ai_final";
  const { text: userTyped, done: userDone } = useTypewriter({
    fullText: userTranscript,
    active: userTypeActive,
    baseSpeed: 26,
    randomVariance: 24,
  });

  const aiResponse =
    "Claro drafted your reply in seconds — ready to send?\n\nHi Sarah —\n\nThanks again for being patient on pricing. I'll send the updated numbers tomorrow morning.\n\nAppreciate you,\nJ";
  const aiTypeActive = chatPhase === "ai_draft" || chatPhase === "ai_final";
  const { text: aiTyped, done: aiDone } = useTypewriter({
    fullText: aiResponse,
    active: aiTypeActive,
    baseSpeed: 20,
    randomVariance: 20,
  });

  const showUserBubble =
    chatPhase === "user_voice" ||
    chatPhase === "user_final" ||
    chatPhase === "ai_draft" ||
    chatPhase === "ai_final";
  const showAiBubble = chatPhase === "ai_draft" || chatPhase === "ai_final";
  const aiStillTalkingForUI = chatPhase === "ai_draft" && !aiDone;

  const composeIsBlurred = chatStarted && composeDoneReached;

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
      <div className="relative flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 flex-col items-start gap-6">
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
                chatPhase={chatPhase}
                chatStarted={chatStarted}
                aiDone={aiDone}
                showChatStatus={false}
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
                    signOff={SIGN_OFF_SNIPPET}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <PointerCursor phase={manualPhase} visible={!composeDoneReached} />
          </div>

        </div>

        <div className="flex flex-1 justify-start lg:pl-6">
          <div className="relative w-full max-w-[360px] rounded-[28px] border border-gray-200/70 bg-white/85 p-5 shadow-[0_32px_70px_rgba(15,23,42,0.08)] backdrop-blur-[2px]">
            <motion.div
              className="pointer-events-none absolute -top-10 -right-6 h-36 w-36 rounded-full bg-[rgba(224,122,95,0.14)] blur-3xl"
              animate={{ opacity: chatStarted ? 0.6 : 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="relative z-10 flex min-h-[220px] flex-col gap-3">
              <AnimatePresence>
                {showUserBubble && (
                  <motion.div
                    key="user-bubble"
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex w-full justify-end gap-2"
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
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-700 ring-1 ring-gray-300">
                        You
                      </div>

                      {chatPhase === "user_voice" && (
                        <motion.div
                          className="pointer-events-none absolute inset-0 rounded-full"
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
                    className="flex w-full items-start gap-2"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE8DC] text-[10px] font-medium text-[#C76545] ring-1 ring-orange-200">
                        C
                      </div>

                      {aiStillTalkingForUI && (
                        <motion.div
                          className="pointer-events-none absolute inset-0 rounded-full"
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
                        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-gray-700">
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
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}

/* =================================================
   SUBCOMPONENTS
   ================================================= */

function InboxPreviewCard({
  phase,
  hasScrolled,
  replyHover,
  replyPressed,
  dimmed,
  chatPhase,
  chatStarted,
  aiDone,
  showChatStatus = true,
}) {
  const contactFirstName = TARGET_CONTACT.from.split(" ")[0];

  const manualStatusMap = {
    inbox_idle: `Inbox piling up — ${contactFirstName} still needs pricing.`,
    inbox_scroll: `Still digging for ${contactFirstName}’s thread…`,
    reply_hover: `${contactFirstName}’s waiting — find the reply button.`,
    reply_click: "Clock’s ticking — opening reply…",
    compose_open: "Reply window finally open — you’re still on the hook.",
    compose_typing: "Still typing it yourself…",
    compose_rewrite: "Fixing typos instead of sending…",
    compose_done: "Manual draft finally ready.",
  };

  let statusLabel = manualStatusMap[phase];
  if (typeof statusLabel === "function") {
    statusLabel = statusLabel();
  }

  if (showChatStatus && chatStarted && chatPhase) {
    const chatStatusMap = {
      user_voice: "Just tell Claro what you need — no clicking.",
      user_final: "Intent captured once. Claro remembers your tone.",
      ai_draft: `Claro drafts instantly, matching your ${contactFirstName} sign-off.`,
      ai_final: "Ready to send — tone matched in seconds.",
    };
    statusLabel = chatStatusMap[chatPhase] || statusLabel;
  }

  const highlightSarah =
    phase === "reply_hover" ||
    phase === "reply_click" ||
    phase === "compose_open" ||
    phase === "compose_typing" ||
    phase === "compose_rewrite" ||
    phase === "compose_done";

  const activeIndex = highlightSarah ? 1 : hasScrolled ? 0 : -1;
  const replyShouldShow = replyHover || replyPressed;

  const rows = FOLLOW_UP_ROWS;

  const inboxIsChill = chatPhase === "ai_final" && aiDone;
  const statusTone = showChatStatus && chatStarted && chatPhase ? "ai" : "manual";
  const statusClassName =
    statusTone === "manual"
      ? "absolute -top-12 left-1/2 z-20 -translate-x-1/2 flex max-w-[280px] flex-wrap items-center gap-2 rounded-full bg-[#fff2ed]/95 px-3.5 py-1.5 text-[11px] font-semibold text-[#b45309] shadow-[0_12px_32px_rgba(225,96,54,0.22)] ring-1 ring-[#fb923c]/50 border border-white/70"
      : "absolute -top-12 left-1/2 z-20 -translate-x-1/2 flex max-w-[280px] flex-wrap items-center gap-2 rounded-full bg-white/92 px-3.5 py-1.5 text-[11px] font-medium text-gray-600 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-gray-200 border border-white/70";

  return (
    <div className="relative">
      {statusLabel && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={statusClassName}
        >
          <span className="text-center leading-tight">{statusLabel}</span>
        </motion.div>
      )}

      <div
        className="relative w-full max-w-[380px] overflow-hidden rounded-xl border border-gray-200 bg-white/95 ring-1 ring-gray-100 shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
        style={{
          boxShadow: "0 28px 64px rgba(0,0,0,0.08), 0 6px 24px rgba(0,0,0,0.05)",
          filter: dimmed ? "saturate(0.85) brightness(0.96)" : "saturate(1) brightness(1)",
          opacity: dimmed ? 0.85 : 1,
        }}
      >
        <div className="pt-3">
          <motion.div
            animate={{ y: hasScrolled ? -36 : 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {rows.map((row, index) => {
              const isActive = index === activeIndex;

              return (
                <InboxRow
                  key={row.from}
                  index={index}
                  calm={inboxIsChill}
                  phase={inboxIsChill ? "calm" : "manual"}
                  active={isActive}
                  {...row}
                >
                  {index === 1 && replyShouldShow && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <motion.div
                        animate={{
                          scale: replyPressed ? 0.92 : replyHover ? 1.03 : 1,
                          boxShadow: replyPressed
                            ? "0 0 0 0 rgba(59,130,246,0)"
                            : replyHover
                              ? "0 10px 24px rgba(59,130,246,0.18)"
                              : "0 6px 16px rgba(15,23,42,0.12)",
                          backgroundColor: replyPressed
                            ? "rgba(59,130,246,0.2)"
                            : "rgba(255,255,255,0.95)",
                          color: replyPressed ? "rgb(37,99,235)" : "rgb(75,85,99)",
                          borderColor: replyHover
                            ? "rgba(59,130,246,0.45)"
                            : "rgba(209,213,219,1)",
                        }}
                        transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
                        className="pointer-events-none inline-flex items-center rounded-full border px-4 py-1 text-[11px] font-medium"
                      >
                        Reply
                      </motion.div>
                    </motion.div>
                  )}
                </InboxRow>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          className="pointer-events-none absolute -top-4 -left-4 h-[120px] w-[120px] rounded-xl blur-2xl"
          style={{
            background: inboxIsChill
              ? "radial-gradient(circle_at_20%_20%,rgba(156,163,175,0.12),rgba(255,255,255,0)_70%)"
              : "radial-gradient(circle_at_20%_20%,rgba(224,122,95,0.18),rgba(255,255,255,0)_70%)",
          }}
          animate={{ opacity: inboxIsChill ? 0.15 : 0.6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}


function PointerCursor({ phase, visible }) {
  const targets = {
    prestart: { opacity: 0, scale: 0.85, x: 190, y: 140 },
    inbox_idle: { opacity: 1, scale: 1, x: 214, y: 92 },
    inbox_scroll: { opacity: 1, scale: 1, x: 224, y: 148 },
    reply_hover: { opacity: 1, scale: 1, x: 236, y: 186 },
    reply_click: { opacity: 1, scale: 0.93, x: 236, y: 186 },
    compose_open: { opacity: 1, scale: 1, x: 188, y: 246 },
    compose_typing: { opacity: 0, scale: 0.9, x: 188, y: 266 },
    compose_rewrite: { opacity: 0, scale: 0.9, x: 188, y: 266 },
    compose_done: { opacity: 0, scale: 0.9, x: 188, y: 266 },
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

function GmailDraftCard({ bodyText, bodyDone, showQuotedThread, highlightTone, signOff }) {
  const hasSignOff = Boolean(signOff) && bodyText.includes(signOff);
  const signOffIndex = hasSignOff ? bodyText.indexOf(signOff) : -1;
  const beforeSignOff = hasSignOff ? bodyText.slice(0, signOffIndex) : bodyText;
  const signOffText = hasSignOff ? bodyText.slice(signOffIndex, signOffIndex + signOff.length) : "";
  const afterSignOff = hasSignOff
    ? bodyText.slice(signOffIndex + signOff.length)
    : "";

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

        <span>{beforeSignOff}</span>

        {hasSignOff && (
          <motion.span
            layout="position"
            initial={false}
            animate={{
              backgroundColor: highlightTone ? "rgba(224,122,95,0.22)" : "rgba(0,0,0,0)",
              color: highlightTone ? "#b45309" : "inherit",
              paddingInline: highlightTone ? "4px" : "2px",
              boxShadow: highlightTone
                ? "0 0 0 2px rgba(224,122,95,0.15), 0 8px 18px rgba(224,122,95,0.18)"
                : "none",
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="-mx-[2px] rounded-md px-[2px]"
          >
            {signOffText}
          </motion.span>
        )}

        {afterSignOff}
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
