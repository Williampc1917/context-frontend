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
  const [chatPhase, setChatPhase] = useState(null); // 'user_voice' | 'user_final' | 'ai_voice' | 'ai_final' | 'user_followup' | 'ai_wrap'
  const [sendHovering, setSendHovering] = useState(false);

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
    setSendHovering(false);
    stageTimelineRef.current.forEach(clearTimeout);
    stageTimelineRef.current = [];

    const queueStage = (callback, delay) => {
      const id = setTimeout(callback, delay);
      stageTimelineRef.current.push(id);
      return id;
    };

    queueStage(() => setManualPhase("row_hover"), 1100);
    queueStage(() => setManualPhase("row_context"), 2050);
    queueStage(() => setManualPhase("reply_menu_hover"), 2700);
    queueStage(() => setManualPhase("reply_menu_click"), 3300);
    queueStage(() => setManualPhase("compose_open"), 4000);
    queueStage(() => setManualPhase("compose_greeting"), 4700);

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
    "row_hover",
    "row_context",
    "reply_menu_hover",
    "reply_menu_click",
    "compose_open",
    "compose_greeting",
    "compose_sentence",
    "compose_timing",
    "compose_signoff",
    "compose_pause",
    "compose_done",
  ];
  const phaseIndex = phaseOrder.indexOf(manualPhase);
  const hasReached = (phase) => phaseIndex >= phaseOrder.indexOf(phase);

  const composeVisible = hasReached("compose_open");
  const composeTypingActive = hasReached("compose_greeting") && !hasReached("compose_done");
  const draftSavedVisible = hasReached("compose_pause");

  const cursorState = useMemo(() => {
    const base = { visible: false, x: 0, y: 0, rotate: -6 };

    switch (manualPhase) {
      case "row_hover":
      case "row_context":
        return { visible: true, x: 292, y: 120, rotate: -8 };
      case "reply_menu_hover":
        return { visible: true, x: 338, y: 126, rotate: -8 };
      case "reply_menu_click":
        return { visible: true, x: 338, y: 122, rotate: -12 };
      case "compose_open":
      case "compose_greeting":
      case "compose_sentence":
        return { visible: true, x: 110, y: 208, rotate: -6 };
      case "compose_timing":
      case "compose_signoff":
        return { visible: true, x: 118, y: 238, rotate: -4 };
      case "compose_pause":
      case "compose_done":
        return { visible: true, x: 168, y: 316, rotate: -2 };
      default:
        return base;
    }
  }, [manualPhase]);

  const userTranscript =
    "Draft a reply for Sarah. Thank her for waiting and confirm pricing lands tomorrow.";

  const draftFull =
    "Hi Sarah —\n\nThanks again for being patient on pricing. I'll send the updated numbers tomorrow morning.\n\nAppreciate you,\nJ";

  const manualScript = useMemo(
    () => [
      { type: "text", value: "Hi Sarah", speedMs: 60 },
      { type: "text", value: ",", speedMs: 60 },
      { type: "pause", ms: 380 },
      { type: "backspace", count: 1, speedMs: 90 },
      { type: "text", value: " —", speedMs: 60 },
      { type: "text", value: "\n\n", speedMs: 60 },
      {
        type: "text",
        value: "Thanks for your patience on pricing.",
        speedMs: 56,
      },
      { type: "pause", ms: 600 },
      { type: "backspace", count: 11, speedMs: 85 },
      { type: "pause", ms: 180 },
      { type: "backspace", count: 10, speedMs: 85 },
      { type: "backspace", count: 5, speedMs: 85 },
      { type: "backspace", count: 4, speedMs: 85 },
      { type: "pause", ms: 260 },
      {
        type: "text",
        value: " again for being patient on pricing.",
        speedMs: 54,
      },
      { type: "pause", ms: 500 },
      {
        type: "text",
        value: " I'll send the updated numbers tomorrow.",
        speedMs: 52,
      },
      { type: "backspace", count: 1, speedMs: 80 },
      { type: "pause", ms: 300 },
      { type: "text", value: " morning.", speedMs: 52 },
      { type: "pause", ms: 420 },
      { type: "text", value: "\n\nBest,", speedMs: 52 },
      { type: "pause", ms: 380 },
      { type: "backspace", count: 5, speedMs: 90 },
      { type: "pause", ms: 260 },
      { type: "text", value: "Appreciate you,\nJ", speedMs: 52 },
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
    if (manualPhase !== "compose_greeting") return;
    if (!emailTyped.includes("Hi Sarah —")) return;
    setManualPhase("compose_sentence");
  }, [manualPhase, emailTyped]);

  useEffect(() => {
    if (manualPhase !== "compose_sentence") return;
    if (!emailTyped.includes("Thanks again for being patient on pricing.")) return;
    setManualPhase("compose_timing");
  }, [manualPhase, emailTyped]);

  useEffect(() => {
    if (manualPhase !== "compose_timing") return;
    if (!emailTyped.includes("I'll send the updated numbers tomorrow morning.")) return;
    setManualPhase("compose_signoff");
  }, [manualPhase, emailTyped]);

  useEffect(() => {
    if (manualPhase !== "compose_signoff") return;
    if (!emailTyped.includes("Appreciate you,\nJ")) return;
    setManualPhase("compose_pause");
  }, [manualPhase, emailTyped]);

  useEffect(() => {
    if (manualPhase !== "compose_pause") return;

    setSendHovering(true);

    const hoverOffId = setTimeout(() => setSendHovering(false), 800);
    const settleId = setTimeout(() => setManualPhase("compose_done"), 1700);

    return () => {
      clearTimeout(hoverOffId);
      clearTimeout(settleId);
    };
  }, [manualPhase]);

  useEffect(() => {
    if (manualPhase !== "compose_done") return;
    setSendHovering(false);
  }, [manualPhase]);

  const aiStartQueuedRef = useRef(false);
  const aiFinishQueuedRef = useRef(false);
  const userConfirmQueuedRef = useRef(false);
  const aiWrapQueuedRef = useRef(false);

  useEffect(() => {
    if (!started) return;

    chatTimelineRef.current.forEach(clearTimeout);
    chatTimelineRef.current = [];
    aiStartQueuedRef.current = false;
    aiFinishQueuedRef.current = false;
    userConfirmQueuedRef.current = false;
    aiWrapQueuedRef.current = false;

    const queueTimeout = (callback, delay) => {
      const id = setTimeout(callback, delay);
      chatTimelineRef.current.push(id);
      return id;
    };

    setChatStarted(true);
    setChatPhase("user_voice");
    queueTimeout(() => setChatPhase("user_final"), 900);

    return () => {
      chatTimelineRef.current.forEach(clearTimeout);
      chatTimelineRef.current = [];
      aiStartQueuedRef.current = false;
      aiFinishQueuedRef.current = false;
      userConfirmQueuedRef.current = false;
      aiWrapQueuedRef.current = false;
    };
  }, [started]);

  const userTypeActive =
    chatPhase === "user_final" || chatPhase === "ai_voice" || chatPhase === "ai_final";
  const { text: userTyped, done: userDone } = useTypewriter({
    fullText: userTranscript,
    active: userTypeActive,
    baseSpeed: 26,
    randomVariance: 24,
  });
  const userStillTalkingForUI = chatPhase === "user_voice" || !userDone;

  const aiResponse =
    "Got it — drafting your reply to Sarah in your usual tone.\n\nHi Sarah —\n\nThanks again for being patient on pricing. I’ll send the updated numbers tomorrow morning.\n\nAppreciate you,\nJ\n\nWant me to send it?";
  const aiTypeActive = chatPhase === "ai_voice" || chatPhase === "ai_final";
  const { text: aiTyped, done: aiDone } = useTypewriter({
    fullText: aiResponse,
    active: aiTypeActive,
    baseSpeed: 20,
    randomVariance: 20,
  });

  const userConfirm = "Send.";
  const userConfirmActive = chatPhase === "user_followup" || chatPhase === "ai_wrap";
  const { text: userConfirmTyped, done: userConfirmDone } = useTypewriter({
    fullText: userConfirm,
    active: userConfirmActive,
    baseSpeed: 32,
    randomVariance: 12,
  });

  const aiWrapResponse = "Sent. I’ll remind you tomorrow morning to send the pricing to Sarah.";
  const aiWrapTypeActive = chatPhase === "ai_wrap";
  const { text: aiWrapTyped, done: aiWrapDone } = useTypewriter({
    fullText: aiWrapResponse,
    active: aiWrapTypeActive,
    baseSpeed: 24,
    randomVariance: 16,
  });

  useEffect(() => {
    if (!chatStarted) return;
    if (chatPhase !== "user_final") return;
    if (!userDone) return;
    if (aiStartQueuedRef.current) return;

    aiStartQueuedRef.current = true;
    const id = setTimeout(() => {
      setChatPhase("ai_voice");
    }, 220);

    chatTimelineRef.current.push(id);

    return () => clearTimeout(id);
  }, [chatStarted, chatPhase, userDone]);

  useEffect(() => {
    if (chatPhase !== "ai_voice") return;
    if (!aiDone) return;
    if (aiFinishQueuedRef.current) return;

    aiFinishQueuedRef.current = true;
    const id = setTimeout(() => {
      setChatPhase("ai_final");
    }, 180);

    chatTimelineRef.current.push(id);

    return () => clearTimeout(id);
  }, [chatPhase, aiDone]);

  useEffect(() => {
    if (chatPhase !== "ai_final") return;
    if (userConfirmQueuedRef.current) return;

    userConfirmQueuedRef.current = true;
    const id = setTimeout(() => {
      setChatPhase("user_followup");
    }, 420);

    chatTimelineRef.current.push(id);

    return () => clearTimeout(id);
  }, [chatPhase]);

  useEffect(() => {
    if (chatPhase !== "user_followup") return;
    if (!userConfirmDone) return;
    if (aiWrapQueuedRef.current) return;

    aiWrapQueuedRef.current = true;
    const id = setTimeout(() => {
      setChatPhase("ai_wrap");
    }, 260);

    chatTimelineRef.current.push(id);

    return () => clearTimeout(id);
  }, [chatPhase, userConfirmDone]);

  const showUserBubble =
    chatPhase === "user_voice" ||
    chatPhase === "user_final" ||
    chatPhase === "ai_voice" ||
    chatPhase === "ai_final" ||
    chatPhase === "user_followup" ||
    chatPhase === "ai_wrap";
  const showAiBubble =
    chatPhase === "ai_voice" ||
    chatPhase === "ai_final" ||
    chatPhase === "user_followup" ||
    chatPhase === "ai_wrap";
  const showUserConfirmBubble = chatPhase === "user_followup" || chatPhase === "ai_wrap";
  const showAiWrapBubble = chatPhase === "ai_wrap";
  const aiStillTalkingForUI = showAiBubble && !aiDone;
  const aiWrapTalkingForUI = showAiWrapBubble && !aiWrapDone;

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
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{
                opacity: started ? 1 : 0,
                y: started ? 0 : 30,
                rotate: 0,
              }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-0"
            >
              <InboxPreviewCard
                phase={manualPhase}
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
                  initial={{ opacity: 0, y: 36, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                  }}
                  exit={{ opacity: 0, y: 36, transition: { duration: 0.5, ease: "easeInOut" } }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute inset-0 z-30"
                >
              <GmailDraftCard
                bodyText={emailTyped}
                bodyDone={emailDone}
                showQuotedThread={false}
                signOff={SIGN_OFF_SNIPPET}
                sendHovering={sendHovering}
                draftSavedVisible={draftSavedVisible}
              />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {cursorState.visible && (
                <motion.div
                  key="desktop-cursor"
                  className="pointer-events-none absolute left-0 top-0 z-40"
                  initial={{ opacity: 0, scale: 0.94, x: cursorState.x, y: cursorState.y }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: cursorState.x,
                    y: cursorState.y,
                    rotate: cursorState.rotate,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DesktopCursorGraphic />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        <div className="relative flex flex-1 justify-start lg:pl-6">
          <motion.div
            className="pointer-events-none absolute -top-10 -right-6 h-36 w-36 rounded-full bg-[rgba(224,122,95,0.14)] blur-3xl"
            animate={{ opacity: chatStarted ? 0.6 : 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="relative w-full max-w-[360px]">
            <div className="relative flex min-h-[220px] flex-col gap-3 pointer-events-none">
              <AnimatePresence>
                {chatStarted && showUserBubble && (
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
                      {userStillTalkingForUI && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-medium text-white/90">Listening…</span>
                          <VoiceBars active={chatPhase === "user_voice"} />
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
                          className="pointer-events-none absolute inset-0 rounded-full -z-10"
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
                {chatStarted && showAiBubble && (
                  <motion.div
                    key="ai-bubble-row"
                    initial={{ opacity: 0, y: 28, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="flex w-full justify-start gap-2 items-start pointer-events-auto"
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
                        max-w-[260px]
                        rounded-2xl px-4 py-3
                        bg-gray-100 text-gray-900 ring-1 ring-gray-200
                        border border-white/40 shadow-[0_24px_48px_rgba(0,0,0,0.12)]
                        text-[14px] leading-[1.4] font-medium whitespace-pre-wrap break-words
                      "
                      style={{
                        borderTopLeftRadius: "0.5rem",
                        boxShadow:
                          "0 28px 64px rgba(0,0,0,0.12), 0 6px 28px rgba(0,0,0,0.06)",
                      }}
                    >
                      {aiStillTalkingForUI && (
                        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-gray-700">
                          <span>Speaking…</span>
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

              <AnimatePresence>
                {chatStarted && showUserConfirmBubble && (
                  <motion.div
                    key="user-confirm-bubble"
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    className="flex w-full justify-end gap-2 pointer-events-auto"
                  >
                    <div
                      className="max-w-[230px] rounded-2xl px-3 py-2 text-[13px] leading-snug text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-1 ring-blue-600/40 border border-white/10 break-words"
                      style={{ borderTopRightRadius: "0.5rem" }}
                    >
                      <div className="text-[13px] font-medium text-white whitespace-pre-wrap">
                        {userConfirmTyped}
                        {!userConfirmDone && <CaretBlink light />}
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-700 ring-1 ring-gray-300">
                        You
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {chatStarted && showAiWrapBubble && (
                  <motion.div
                    key="ai-wrap-bubble"
                    initial={{ opacity: 0, y: 22, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="flex w-full justify-start gap-2 items-start pointer-events-auto"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE8DC] text-[10px] font-medium text-[#C76545] ring-1 ring-orange-200">
                        C
                      </div>
                      {aiWrapTalkingForUI && (
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
                      className="max-w-[260px] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900 ring-1 ring-gray-200 border border-white/40 shadow-[0_24px_48px_rgba(0,0,0,0.12)] text-[14px] leading-[1.4] font-medium whitespace-pre-wrap break-words"
                      style={{
                        borderTopLeftRadius: "0.5rem",
                        boxShadow: "0 28px 64px rgba(0,0,0,0.12), 0 6px 28px rgba(0,0,0,0.06)",
                      }}
                    >
                      {aiWrapTalkingForUI && (
                        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-gray-700">
                          <span>Speaking…</span>
                          <div className="text-gray-500">
                            <VoiceBars active />
                          </div>
                        </div>
                      )}

                      <div className="text-gray-900">
                        {aiWrapTyped}
                        {!aiWrapDone && <CaretBlink />}
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

function InboxPreviewCard({ phase, dimmed, chatPhase, chatStarted, aiDone, showChatStatus = true }) {
  const contactFirstName = TARGET_CONTACT.from.split(" ")[0];

  const manualStatusMap = {
    inbox_idle: `Inbox piling up — ${contactFirstName} still needs pricing.`,
    row_hover: `Inbox piling up — ${contactFirstName} still needs pricing.`,
    row_context: "Clock’s ticking — opening reply…",
    reply_menu_hover: "Clock’s ticking — opening reply…",
    reply_menu_click: "Clock’s ticking — opening reply…",
    compose_open: "Clock’s ticking — opening reply…",
    compose_greeting: "Tweaking tone",
    compose_sentence: "Fixing phrasing instead of sending…",
    compose_timing: "Clarifying timing…",
    compose_signoff: "Choosing sign-off…",
    compose_pause: "Still not sent.",
    compose_done: "Still not sent.",
  };

  let statusLabel = manualStatusMap[phase];
  if (typeof statusLabel === "function") {
    statusLabel = statusLabel();
  }

  if (showChatStatus && chatStarted && chatPhase) {
    const chatStatusMap = {
      user_voice: "Just tell Claro what you need — no clicking.",
      user_final: "Intent captured once. Claro remembers your tone.",
      ai_voice: `Claro drafts instantly, matching your ${contactFirstName} sign-off.`,
      ai_final: "Ready to send — tone matched in seconds.",
    };
    statusLabel = chatStatusMap[chatPhase] || statusLabel;
  }

  const highlightSarah =
    phase === "row_hover" ||
    phase === "row_context" ||
    phase === "reply_menu_hover" ||
    phase === "reply_menu_click" ||
    phase === "compose_open" ||
    phase === "compose_greeting" ||
    phase === "compose_sentence" ||
    phase === "compose_timing" ||
    phase === "compose_signoff" ||
    phase === "compose_pause" ||
    phase === "compose_done";

  const activeIndex = highlightSarah ? 1 : -1;

  const rows = FOLLOW_UP_ROWS;

  const inboxIsChill = chatPhase === "ai_final" && aiDone;
  const statusTone = showChatStatus && chatStarted && chatPhase ? "ai" : "manual";
  const statusClassName =
    statusTone === "manual"
      ? "absolute -top-10 left-4 z-20 flex max-w-[260px] flex-wrap items-center gap-2 rounded-full bg-[#fff2ed]/95 px-3.5 py-1.5 text-[11px] font-semibold text-[#b45309] shadow-[0_12px_28px_rgba(225,96,54,0.18)] ring-1 ring-[#fb923c]/40 border border-white/70"
      : "absolute -top-10 left-4 z-20 flex max-w-[260px] flex-wrap items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-medium text-gray-600 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-gray-200 border border-white/70";

  const showContextMenu =
    phase === "row_context" || phase === "reply_menu_hover" || phase === "reply_menu_click";
  const contextMenuHover = phase === "reply_menu_hover";
  const contextMenuPressed = phase === "reply_menu_click";

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

      <div className="relative w-full max-w-[380px]">
        <div
          className="overflow-hidden rounded-xl border border-gray-200 bg-white/95 ring-1 ring-gray-100 shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
          style={{
            boxShadow: "0 28px 64px rgba(0,0,0,0.08), 0 6px 24px rgba(0,0,0,0.05)",
            filter: dimmed ? "saturate(0.85) brightness(0.96)" : "saturate(1) brightness(1)",
            opacity: dimmed ? 0.85 : 1,
          }}
        >
          <div className="pt-3">
            <motion.div animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
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

        <AnimatePresence>
          {showContextMenu && (
            <motion.div
              key="context-menu"
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-[152px] top-[118px] z-30"
            >
              <div className="min-w-[140px] rounded-xl border border-gray-200/80 bg-white/98 p-1 text-[11px] text-gray-600 shadow-[0_20px_40px_rgba(15,23,42,0.16)] ring-1 ring-gray-100 backdrop-blur">
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors duration-200 ${
                    contextMenuPressed
                      ? "bg-blue-100 text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                      : contextMenuHover
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100/80 text-[10px] font-semibold text-blue-600">
                    ↩
                  </span>
                  Reply
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


function GmailDraftCard({
  bodyText,
  bodyDone,
  showQuotedThread,
  highlightTone,
  signOff,
  sendHovering = false,
  draftSavedVisible = false,
}) {
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
        <AnimatePresence>
          {showQuotedThread && (
            <motion.div
              key="quoted"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] leading-relaxed text-gray-500 shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
            >
              <span className="font-medium text-gray-600">Sarah Quinn</span> • "Can you send the updated pricing by 5 so I can lock the deck?"
            </motion.div>
          )}
        </AnimatePresence>

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
        <motion.button
          type="button"
          className="
            inline-flex items-center justify-center rounded-md px-2.5 py-1.5
            text-[12px] font-medium leading-none text-white
          "
          initial={false}
          animate={
            sendHovering
              ? {
                  backgroundColor: "#174ea6",
                  boxShadow: "0 6px 14px rgba(23,78,166,0.35)",
                  scale: 1.03,
                }
              : {
                  backgroundColor: "#0b57d0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  scale: 1,
                }
          }
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          Send
        </motion.button>
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

        <div className="ml-auto flex items-center text-[11px] font-medium text-gray-500">
          <AnimatePresence>
            {draftSavedVisible && (
              <motion.span
                key="draft-saved"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="tracking-tight"
              >
                Draft saved • 12:22 PM
              </motion.span>
            )}
          </AnimatePresence>
        </div>
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

function DesktopCursorGraphic() {
  return (
    <div className="drop-shadow-[0_4px_12px_rgba(15,23,42,0.22)]">
      <svg
        width="32"
        height="36"
        viewBox="0 0 32 36"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-400"
        style={{ display: "block" }}
      >
        <path
          d="M4 1L4 27.5L11.2 23.2L15.4 33L18.3 31.7L14 22.4L25.5 22.4L4 1Z"
          stroke="rgba(71,85,105,0.45)"
          strokeWidth="1.4"
          fill="white"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
