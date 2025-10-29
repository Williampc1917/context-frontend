import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <section
      ref={rootRef}
      className="relative w-full max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-12 items-center overflow-hidden"
    >
      {/* soft warm bg glow */}
      <div
        className="pointer-events-none absolute inset-0 mx-auto max-w-6xl blur-[100px] opacity-40"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(224,122,95,0.10) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* LEFT COLUMN (Inbox + chat overlay) */}
      <div className="relative w-full flex justify-center">
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
            <InboxRowMock
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
            <InboxRowMock
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
            <InboxRowMock
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
            <InboxRowMock
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
                    max-w-[220px]
                    rounded-2xl
                    px-3 py-2
                    text-[13px]
                    leading-snug
                    text-white
                    bg-gradient-to-br from-blue-500 to-blue-600
                    shadow-[0_16px_40px_rgba(0,0,0,0.18)]
                    ring-1 ring-blue-600/40
                    border border-white/10
                    break-words
                  "
                  style={{
                    borderTopRightRadius: "0.5rem", // subtle 'tail' corner
                  }}
                >
                  {/* while you're still speaking */}
                  {userIsSpeaking && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/90">
                        Listening…
                      </span>
                      <VoiceBars active />
                    </div>
                  )}

                  {/* once we have transcript: typewriter */}
                  {userHasTranscript && (
                    <div className="text-[13px] font-medium text-white whitespace-pre-wrap">
                      {userTypedText}
                      {!userDoneTyping && <CaretBlink light />}
                    </div>
                  )}
                </div>

                {/* avatar on the far right */}
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-[10px] font-medium flex items-center justify-center ring-1 ring-gray-300 pointer-events-auto">
                    You
                  </div>

                  {userIsSpeaking && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow:
                          "0 0 8px rgba(59,130,246,0.6),0 0 16px rgba(59,130,246,0.4)",
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
                    max-w-[260px]
                    rounded-2xl
                    px-4 py-3
                    bg-gray-100
                    text-gray-900
                    ring-1 ring-gray-200
                    border border-white/40
                    shadow-[0_24px_48px_rgba(0,0,0,0.12)]
                    text-[14px]
                    leading-[1.4]
                    font-medium
                    whitespace-pre-wrap
                    break-words
                  "
                  style={{
                    borderTopLeftRadius: "0.5rem", // subtle incoming 'tail'
                    boxShadow:
                      "0 28px 64px rgba(0,0,0,0.12), 0 6px 28px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Speaking… header lives INSIDE the bubble while AI is still "talking" */}
                  {aiStillTalkingForUI && (
                    <div className="flex items-center gap-2 mb-2 text-[12px] font-medium text-gray-700">
                      <span>Speaking…</span>
                      <div className="text-gray-500">
                        <VoiceBars active />
                      </div>
                    </div>
                  )}

                  <div className="text-gray-900">
                    {aiTypedText}
                    {!aiDoneTyping && <CaretBlink />}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT COLUMN COPY */}
      <div className="relative w-full max-w-[500px]">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 leading-[1.1]">
          Your inbox, summarized for you
        </h2>

        <p className="text-[15px] text-gray-600 leading-relaxed mt-4">
          Claro sorts your day by what matters most. It prioritizes key
          relationships, urgent follow-ups, and open promises, all through a
          simple voice command.
        </p>
      </div>
    </section>
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

function InboxRowMock({
  calm,
  phase,
  unread,
  from,
  time,
  subject,
  body,
  chips = [],
  index,
  hasAttachment,
}) {
  const isChaos = phase === "chaos";

  // row anim state
  const rowAnimate = calm
    ? {
        opacity: 0.6,
        filter: "blur(0.4px) grayscale(0.2)",
        y: 0,
        rotate: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      }
    : phase === "chaos"
      ? {
          opacity: 1,
          y: [0, -2, 0],
          rotate: [0, -0.4, 0.3, 0],
          transition: {
            duration: 2.0,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.8,
            delay: index * 0.2,
          },
        }
      : {
          opacity: 1,
          y: 0,
          rotate: 0,
          transition: { duration: 0.7, ease: "easeOut" },
        };

  // chip pulse during chaos
  const chipAnimate =
    !calm && phase === "chaos"
      ? {
          boxShadow: [
            "0 0 0 0 rgba(224,122,95,0)",
            "0 8px 24px -4px rgba(224,122,95,0.35)",
            "0 0 0 0 rgba(224,122,95,0)",
          ],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          },
        }
      : {
          boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          transition: { duration: 0.4, ease: "easeOut" },
        };

  const unreadClasses = unread
    ? "bg-blue-50/[0.08] hover:bg-blue-50/[0.16]"
    : "bg-white hover:bg-gray-50";

  return (
    <motion.div
      animate={rowAnimate}
      className={
        "relative px-3 py-2 border-b border-gray-100 transition-colors " +
        unreadClasses
      }
    >
      {/* HEADER ROW */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {/* checkbox + unread dot */}
          <div className="relative flex-shrink-0">
            {unread && (
              <div className="absolute -left-2 top-[2px] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.6)]" />
            )}
            <input
              type="checkbox"
              className="mt-[2px] w-[14px] h-[14px] rounded-[3px] border border-gray-300 appearance-none checked:bg-blue-600 checked:border-blue-600 checked:ring-1 checked:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* star */}
          <button
            className={
              "mt-[1px] text-[13px] leading-none flex-shrink-0 " +
              (unread
                ? "text-yellow-400"
                : "text-gray-400 hover:text-yellow-400")
            }
            aria-label="Star"
          >
            ★
          </button>

          {/* sender */}
          <div className="min-w-0">
            <p
              className={
                "truncate text-[13px] leading-snug " +
                (unread
                  ? "text-gray-900 font-medium"
                  : "text-gray-700 font-normal")
              }
            >
              {isChaos && (
                <span
                  className="absolute text-[13px] text-gray-400/40 font-medium pointer-events-none select-none"
                  style={{
                    transform: "translate(-1px, -1px) rotate(-0.5deg)",
                  }}
                >
                  {from}
                </span>
              )}
              {from}
            </p>
          </div>
        </div>

        {/* right side: attachment + time */}
        <div className="flex items-start gap-2 flex-shrink-0">
          {hasAttachment && (
            <span className="text-[12px] leading-none text-gray-400">📎</span>
          )}
          <span className="text-[11px] text-gray-500 leading-none tabular-nums whitespace-nowrap relative">
            {isChaos && (
              <span
                className="absolute text-[11px] text-gray-400/40 font-medium pointer-events-none select-none"
                style={{
                  transform: "translate(-1px, -1px) rotate(0.4deg)",
                }}
              >
                {time}
              </span>
            )}
            {time}
          </span>
        </div>
      </div>

      {/* SUBJECT */}
      <p
        className={
          "text-[13px] leading-snug mt-1 " +
          (unread ? "text-gray-900 font-medium" : "text-gray-800 font-medium")
        }
      >
        {isChaos && (
          <span
            className="absolute text-[13px] text-gray-400/40 font-medium pointer-events-none select-none"
            style={{
              transform: "translate(-1px, -1px) rotate(-0.3deg)",
            }}
          >
            {subject}
          </span>
        )}
        {subject}
      </p>

      {/* BODY PREVIEW */}
      <div className="text-[12px] text-gray-600 leading-snug mt-1 line-clamp-2 relative">
        {isChaos && (
          <span
            className="absolute text-[12px] text-gray-400/30 font-normal pointer-events-none select-none line-clamp-2"
            style={{
              transform: "translate(-1px, -1px) rotate(0.2deg)",
              maxWidth: "94%",
              display: "block",
            }}
          >
            {body}
          </span>
        )}
        {body}
      </div>

      {/* CHIPS */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {chips.map((c, i) => (
            <motion.span
              key={i}
              animate={chipAnimate}
              className={[
                "inline-flex items-center rounded-[3px] border px-1.5 py-[2px] text-[10px] font-medium leading-none",
                chipColor[c.color].bg,
                chipColor[c.color].text,
                chipColor[c.color].border,
              ].join(" ")}
            >
              {c.text}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* chip color tokens */
const chipColor = {
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200/60",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/60",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/60",
  },
};
