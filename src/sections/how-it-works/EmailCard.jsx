import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import FeatureLayout from "./FeatureLayout.jsx";
import InboxRow from "./InboxRow.jsx";

/* -------------------------------------------------
   Hook: typewriter / live captions
   - When `active` is true, reveal `fullText` char by char
   - speedMs controls how fast chars appear
------------------------------------------------- */
function useTypewriter(fullText, active, speedMs = 15) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!active) return;
    setShown(""); // restart typing on (re)activation
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i <= fullText.length) {
        setShown(fullText.slice(0, i));
      } else {
        clearInterval(id);
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [fullText, active, speedMs]);

  return shown;
}

/* =================================================
   MAIN COMPONENT
   ================================================= */
export default function InboxToClarity() {
  // intersection-based "play" trigger
  const rootRef = useRef(null);
  const [started, setStarted] = useState(false);

  // timeline / phases:
  // chaos -> user_voice -> user_final -> ai_voice -> ai_final
  const [phase, setPhase] = useState("chaos");

  // kick off the animation timeline ONLY AFTER the section
  // has entered the viewport once.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect(); // run once, never again
        }
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // once started flips true, run the staged phase changes
  useEffect(() => {
    if (!started) return;

    const t1 = setTimeout(() => setPhase("user_voice"), 350); // you're talking
    const t2 = setTimeout(() => setPhase("user_final"), 1100); // transcript lands
    const t3 = setTimeout(() => setPhase("ai_voice"), 1300); // Claro starts talking
    const t4 = setTimeout(() => setPhase("ai_final"), 2900); // Claro wrapping up

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [started]);

  // assistant message (single stream, types top→down)
  const aiP1 =
    "Jennifer’s still waiting on the pricing you said you’d send, and that deal’s stuck until you reply. Sarah needs your final slide for tomorrow’s QBR at 10 — she already told leadership you’d send it by 5. Alex is blocked until you confirm the numbers before Friday. Maya’s note is just a friendly check-in.";
  const aiP2 =
    "I can draft replies for Jennifer and Alex, get you ready for the QBR, and remind you before Friday. Where do you want to start?";
  const aiFull = aiP1 + "\n\n" + aiP2;

  // user transcript text
  const userTranscript = "Catch me up.";

  // helper booleans for render state
  const userIsSpeaking = phase === "user_voice";
  const userHasTranscript = phase !== "user_voice"; // after voice we show typed text

  const aiHasStartedTalking = phase === "ai_voice" || phase === "ai_final";

  // typewriter states
  const userTypeActive =
    phase === "user_final" || phase === "ai_voice" || phase === "ai_final";
  const userTypedText = useTypewriter(userTranscript, userTypeActive, 20);
  const userDoneTyping = userTypedText.length === userTranscript.length;
  const userStillTalkingForUI = userIsSpeaking || !userDoneTyping;

  const aiTypedText = useTypewriter(aiFull, aiHasStartedTalking, 15);
  const aiDoneTyping = aiTypedText.length === aiFull.length;

  // "Claro is still talking" until its WHOLE message is done typing
  const aiStillTalkingForUI = !aiDoneTyping;

  // inbox chills only once AI fully done typing
  const inboxIsChill = aiDoneTyping && phase === "ai_final";

  // bubble visibility
  const showUserBubble =
    phase === "user_voice" ||
    phase === "user_final" ||
    phase === "ai_voice" ||
    phase === "ai_final";

  const showAiBubble = phase === "ai_voice" || phase === "ai_final";

  const userBubbleFill = userStillTalkingForUI ? "#20252E" : "#2F3C4D"; // bluish + ~20–25% lighter // ~30% lighten from #1A1719 / #232A35
  const userBubbleStrokeGradient =
    "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))";
  const userBubbleTextColor = "rgba(255,255,255,0.96)";
  const userBubbleBoxShadow = "0 6px 10px rgba(0,0,0,0.25)";

  // AI bubble (match iOS)
  const aiBubbleFill = "#332C31"; // slight lift (~10%) from #2A2328 for web contrast, keeps warm charcoal tone
  const aiBubbleStrokeGradient =
    "linear-gradient(135deg, rgba(234,132,103,0.32), rgba(243,154,131,0.14))"; // brighter coral sheen (EA8467 -> F39A83)
  const aiBubbleTextColor = "rgba(255,255,255,0.96)";
  const aiBubbleSecondaryTextColor = "rgba(255,255,255,0.68)";
  const aiBubbleBoxShadow =
    "0 5px 8px rgba(0,0,0,0.2), 0 0 36px rgba(234,132,103,0.18), inset 0 0 10px rgba(234,132,103,0.12)"; // stronger coral aura + gentle inner glow

  return (
    <FeatureLayout
      ref={rootRef}
      title="Your daily briefing, in a single command."
      description={[
        <p key="catch" className="text-base leading-relaxed text-gray-700">
          Say “Catch me up,” and Claro speaks your priorities: your key relationships, urgent follow-ups, and open promises.
        </p>,
        <p key="briefing" className="text-sm leading-relaxed text-gray-600">
          No scrolling and no searching. Just a simple voice briefing that keeps you ahead.
        </p>,
      ]}
    >
      {/* INBOX CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -1.5 }}
        animate={{
          opacity: started ? 1 : 0,
          y: started ? 0 : 30,
          rotate: -1.5,
        }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="relative w-full max-w-[380px] rounded-xl border border-gray-200 bg-white/95 ring-1 ring-gray-100 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)]"
        style={{
          boxShadow:
            "0 28px 64px rgba(0,0,0,0.08), 0 6px 24px rgba(0,0,0,0.05)",
        }}
      >
        <div className="pt-3">
          {/* EMAIL 1 */}
          <InboxRow
            calm={inboxIsChill}
            phase={phase}
            unread
            from="Jennifer Lee"
            time="3:17 PM"
            subject="Checking in on updated pricing"
            body="Just following up on the revised pricing you said you’d send yesterday. They’re waiting on it to move forward."
            chips={[
              { color: "amber", text: "waiting on you" },
              { color: "red", text: "deal at risk" },
            ]}
            index={0}
          />

          {/* EMAIL 2 */}
          <InboxRow
            calm={inboxIsChill}
            phase={phase}
            unread
            hasAttachment
            from="Sarah Quinn"
            time="2:41 PM"
            subject="QBR tomorrow 10AM — need your final slide"
            body="You’re presenting slide 7. I told leadership you’d send the updated pricing by 5pm so I can lock the deck. Can you add one line on margin justification?"
            chips={[
              { color: "amber", text: "tomorrow 10am" },
              { color: "blue", text: "you own slide 7" },
            ]}
            index={1}
          />

          {/* EMAIL 3 */}
          <InboxRow
            calm={inboxIsChill}
            phase={phase}
            unread
            from="Alex Rivera"
            time="1:09 PM"
            subject="Can you confirm the final numbers before Friday?"
            body="I still don’t have the final numbers you said you’d send over. If we don’t lock them in by Friday, this slips to next week. Who’s giving the green light?"
            chips={[
              { color: "amber", text: "Friday deadline" },
              { color: "red", text: "blocked on you" },
            ]}
            index={2}
          />

          {/* EMAIL 4 */}
          <InboxRow
            calm={inboxIsChill}
            phase={phase}
            unread
            from="Maya Patel"
            time="12:22 PM"
            subject="Quick check-in on next steps"
            body="No rush — just wanted to see if you’re still planning to send over the summary from last week’s call. Happy to wait until things calm down."
            chips={[{ color: "blue", text: "friendly reminder" }]}
            index={3}
          />
        </div>

        {/* warm stress glow cools after AI finishes */}
        <motion.div
          className="pointer-events-none absolute -top-4 -left-4 w-[120px] h-[120px] rounded-xl blur-2xl"
          style={{
            background: inboxIsChill
              ? "radial-gradient(circle_at_20%_20%,rgba(156,163,175,0.12),rgba(255,255,255,0)_70%)"
              : "radial-gradient(circle_at_20%_20%,rgba(224,122,95,0.18),rgba(255,255,255,0)_70%)",
          }}
          animate={{
            opacity: inboxIsChill ? 0.15 : 0.6,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* CHAT OVERLAY STACK */}
      <div className="absolute top-6 right-4 w-[320px] max-w-[80%] z-40 flex flex-col gap-3 pointer-events-none">
        {/* USER bubble (outgoing, right-aligned) */}
        <AnimatePresence>
          {started && showUserBubble && (
            <motion.div
              key="user-bubble"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                  flex w-full justify-end gap-2
                  pointer-events-auto
                "
            >
              {/* message bubble */}
              <div
                className="
    relative max-w-[220px] rounded-2xl px-3 py-2
    text-[13px] leading-snug
    border border-transparent
    break-words overflow-hidden
  "
                style={{
                  borderTopRightRadius: "0.5rem", // subtle 'tail' corner
                  backgroundColor: userBubbleFill,
                  boxShadow: userBubbleBoxShadow,
                  color: userBubbleTextColor,
                }}
              >
                {/* gradient stroke overlay (matches SwiftUI overlay stroke) */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    borderTopRightRadius: "0.5rem",
                    padding: "1px",
                    background: userBubbleStrokeGradient,
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    zIndex: 1,
                  }}
                />
                {/* while you're still speaking */}
                {userStillTalkingForUI && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-medium">Listening…</span>
                    <VoiceBars active={userIsSpeaking} />
                  </div>
                )}

                {/* once we have transcript: typewriter */}
                {userHasTranscript && (
                  <div className="text-[13px] font-medium whitespace-pre-wrap">
                    {userTypedText}
                    {!userDoneTyping && <CaretBlink light />}
                  </div>
                )}
              </div>

              {/* avatar on the far right */}
              {/* avatar on the far right */}
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-[10px] font-medium flex items-center justify-center ring-1 ring-gray-300 pointer-events-auto">
                  You
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI bubble (incoming, left-aligned) */}
        <AnimatePresence>
          {started && showAiBubble && (
            <motion.div
              key="ai-bubble-row"
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 1 }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                  flex w-full justify-start gap-2 items-start
                  pointer-events-auto
                "
            >
              {/* avatar on left, can still pulse while AI is "talking" */}
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
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.08, 1],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>

              {/* assistant bubble */}
              <div
                className="
      relative
      max-w-[260px]
      rounded-2xl px-4 py-3
      text-[14px] leading-[1.4] font-medium whitespace-pre-wrap break-words
    "
                style={{
                  borderTopLeftRadius: "0.5rem",
                  backgroundColor: aiBubbleFill,
                  color: aiBubbleTextColor,
                  boxShadow: aiBubbleBoxShadow,
                }}
              >
                {/* gradient stroke overlay (matches SwiftUI overlay stroke) */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    borderTopLeftRadius: "0.5rem",
                    padding: "1.5px",
                    background: aiBubbleStrokeGradient,
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    zIndex: 1,
                  }}
                />
                {/* Speaking… header lives INSIDE the bubble while AI is still "talking" */}
                {aiStillTalkingForUI && (
                  <div
                    className="flex items-center gap-2 mb-2 text-[12px] font-medium"
                    style={{ color: aiBubbleSecondaryTextColor }}
                  >
                    <span>Speaking…</span>
                    <div style={{ color: aiBubbleSecondaryTextColor }}>
                      <VoiceBars active />
                    </div>
                  </div>
                )}

                <div style={{ color: aiBubbleTextColor }}>
                  {aiTypedText}
                  {!aiDoneTyping && <CaretBlink light />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureLayout>
  );
}

/* =================================================
   VoiceBars / CaretBlink / InboxRowMock (unchanged)
   ================================================= */

function VoiceBars({ active }) {
  return (
    <div className="flex gap-[2px] items-end h-[12px]">
      {[0, 0.15, 0.3].map((d, i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-current rounded-[1px] text-blue-100"
          style={{
            backgroundColor: "currentColor",
            color: "rgb(255 255 255 / 0.9)",
          }}
          animate={
            active
              ? {
                  height: ["4px", "11px", "5px", "9px", "6px"],
                }
              : { height: "5px" }
          }
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: d,
          }}
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
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
