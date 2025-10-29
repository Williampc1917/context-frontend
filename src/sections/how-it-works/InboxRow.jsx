import { motion } from "framer-motion";

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

export default function InboxRow({
  calm = false,
  phase = "steady",
  unread = false,
  from,
  time,
  subject,
  body,
  chips = [],
  index = 0,
  hasAttachment = false,
  active = false,
  children,
}) {
  const isChaos = phase === "chaos";

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

  const unreadClasses = unread
    ? "bg-blue-50/[0.08] hover:bg-blue-50/[0.16]"
    : "bg-white hover:bg-gray-50";

  const activeClasses = active
    ? "ring-1 ring-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70"
    : "ring-0";

  return (
    <motion.div
      animate={rowAnimate}
      className={[
        "relative px-3 py-2 border-b border-gray-100 transition-colors",
        unreadClasses,
        activeClasses,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            {unread && (
              <div className="absolute -left-2 top-[2px] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.6)]" />
            )}
            <input
              type="checkbox"
              className="mt-[2px] w-[14px] h-[14px] rounded-[3px] border border-gray-300 appearance-none checked:bg-blue-600 checked:border-blue-600 checked:ring-1 checked:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            className={
              "mt-[1px] text-[13px] leading-none flex-shrink-0 " +
              (unread ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400")
            }
            aria-label="Star"
          >
            ★
          </button>

          <div className="min-w-0">
            <p
              className={
                "truncate text-[13px] leading-snug " +
                (unread ? "text-gray-900 font-medium" : "text-gray-700 font-normal")
              }
            >
              {isChaos && (
                <span
                  className="absolute text-[13px] text-gray-400/40 font-medium pointer-events-none select-none"
                  style={{ transform: "translate(-1px, -1px) rotate(-0.5deg)" }}
                >
                  {from}
                </span>
              )}
              {from}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          {hasAttachment && (
            <span className="text-[12px] leading-none text-gray-400">📎</span>
          )}
          <span className="text-[11px] text-gray-500 leading-none tabular-nums whitespace-nowrap relative">
            {isChaos && (
              <span
                className="absolute text-[11px] text-gray-400/40 font-medium pointer-events-none select-none"
                style={{ transform: "translate(-1px, -1px) rotate(0.4deg)" }}
              >
                {time}
              </span>
            )}
            {time}
          </span>
        </div>
      </div>

      <p
        className={
          "text-[13px] leading-snug mt-1 " +
          (unread ? "text-gray-900 font-medium" : "text-gray-800 font-medium")
        }
      >
        {isChaos && (
          <span
            className="absolute text-[13px] text-gray-400/40 font-medium pointer-events-none select-none"
            style={{ transform: "translate(-1px, -1px) rotate(-0.3deg)" }}
          >
            {subject}
          </span>
        )}
        {subject}
      </p>

      <div className="text-[12px] text-gray-600 leading-snug mt-1 line-clamp-2 relative">
        {isChaos && (
          <span
            className="absolute text-[12px] text-gray-400/30 font-normal pointer-events-none select-none line-clamp-2"
            style={{ transform: "translate(-1px, -1px) rotate(0.2deg)", maxWidth: "94%", display: "block" }}
          >
            {body}
          </span>
        )}
        {body}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {chips.map((c, i) => (
            <motion.span
              key={i}
              animate={
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
                      boxShadow: active
                        ? "0 8px 18px rgba(37,99,235,0.18)"
                        : "0 0 0 0 rgba(0,0,0,0)",
                      transition: { duration: 0.4, ease: "easeOut" },
                    }
              }
              className={[
                "inline-flex items-center rounded-[3px] border px-1.5 py-[2px] text-[10px] font-medium leading-none",
                chipColor[c.color]?.bg || chipColor.blue.bg,
                chipColor[c.color]?.text || chipColor.blue.text,
                chipColor[c.color]?.border || chipColor.blue.border,
              ].join(" ")}
            >
              {c.text}
            </motion.span>
          ))}
        </div>
      )}

      {children}
    </motion.div>
  );
}
