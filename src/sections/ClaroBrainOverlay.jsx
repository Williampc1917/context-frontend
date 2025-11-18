import React from "react";

const CORE_CAPSULES = [
  {
    title: "Relationship Intelligence",
    blurb: "Ranks and monitors your top connections in real time",
    hoverBlurb:
      "Tracks every interaction across Gmail and Calendar to reveal your most valuable relationships and gently nudges you before they fade",
    accent: "#F59E0B",
  },
  {
    title: "Tone Engine",
    blurb:
      "Writes every email in your voice, adapting naturally to how you communicate with each person",
    hoverBlurb:
      "Learns your rhythm and phrasing from past messages, crafting replies that feel personal, consistent, and authentically you",
    accent: "#60A5FA",
  },
  {
    title: "Context Graph",
    blurb:
      "Connects every thread, meeting, and commitment into one cohesive view",
    hoverBlurb:
      "Links conversations, topics, and upcoming events into a single timeline so you always have full context before responding or speaking",
    accent: "#A78BFA",
  },
  {
    title: "Memory Core",
    blurb: "Remembers every promise and helps you follow through effortlessly",
    hoverBlurb:
      "Captures commitments and due dates as you talk or write, surfacing reminders exactly when you need them so nothing slips through",
    accent: "#5EEAD4",
  },
];

/**
 * ClaroBrainOverlay
 * Lightweight, responsive card grid that highlights the four core subsystems.
 * No heavy canvas or animation deps — just clean layout that works on mobile.
 */
export default function ClaroBrainOverlay({
  height = 480, // kept for backwards compatibility; used to size the wrapper
}) {
  const [activeCard, setActiveCard] = React.useState(null);
  const [mountedCard, setMountedCard] = React.useState(null);
  const [isDesktop, setIsDesktop] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event) => {
      setIsDesktop(event.matches);
      if (!event.matches) {
        setActiveCard(null);
      }
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (activeCard) {
      setMountedCard(activeCard);
      return;
    }

    if (!mountedCard) return;
    const timeout = setTimeout(() => setMountedCard(null), 250);
    return () => clearTimeout(timeout);
  }, [activeCard, mountedCard]);

  const isOverlayVisible = isDesktop && Boolean(activeCard);
  const overlayData =
    isDesktop && mountedCard
      ? CORE_CAPSULES.find((capsule) => capsule.title === mountedCard)
      : null;

  return (
    <div
      className="relative w-full rounded-[32px] bg-[#060912] px-5 py-8 text-white shadow-[0_30px_80px_rgba(8,12,22,0.65)] ring-1 ring-white/5 sm:px-8 sm:py-10"
      style={{ minHeight: height }}
      onMouseLeave={() => setActiveCard(null)}
    >
      {overlayData ? (
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[32px] bg-[#060912]/70 backdrop-blur-2xl transition-all duration-500 ease-out ${
            isOverlayVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-[0.97]"
          }`}
          aria-hidden={!isOverlayVisible}
        >
          <div
            className="max-w-2xl rounded-[28px] border-2 bg-white/10 p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-3xl transition-[opacity,transform] duration-500 ease-out"
            style={{
              borderColor: overlayData.accent,
              boxShadow: `0 25px 80px ${overlayData.accent}22`,
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: overlayData.accent }}
              />
              <p className="text-2xl font-semibold tracking-tight">
                {overlayData.title}
              </p>
            </div>
            <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg">
              {overlayData.hoverBlurb}
            </p>
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <div
        className={`grid auto-rows-fr grid-cols-1 items-stretch gap-4 transition-all duration-300 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:gap-8 ${
          isOverlayVisible ? "opacity-25 blur-[1px]" : "opacity-100"
        }`}
      >
        {CORE_CAPSULES.map(({ title, blurb, accent }) => (
          <article
            key={title}
            className="flex h-full flex-col rounded-[24px] border border-white/5 bg-gradient-to-bl from-white/5 to-transparent p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_35px_rgba(3,8,20,0.35)] transition-transform duration-200 hover:-translate-y-1 hover:bg-white/10 lg:p-6"
            onMouseEnter={() => {
              if (!isDesktop) return;
              setActiveCard(title);
            }}
            onMouseLeave={() => {
              if (!isDesktop) return;
              setActiveCard((prev) => (prev === title ? null : prev));
            }}
            style={{
              cursor: isDesktop ? "pointer" : "default",
            }}
          >
            <header className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <p className="text-lg font-semibold leading-snug text-white md:text-xl">
                {title}
              </p>
            </header>
            <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed text-slate-300">
              {blurb}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
