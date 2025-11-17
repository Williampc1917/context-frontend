import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlarmClock,
  Handshake,
  Mail,
  MessageSquareText,
  MessagesSquare,
  Reply,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";

const ICONS = {
  message: MessageSquareText,
  replyNeeded: Reply,
  priorityRising: TrendingUp,
  overdue: AlarmClock,
  connectionOpportunity: Handshake,
  keyContact: UserRoundCheck,
  thread: MessagesSquare,
};

const VISUAL_BOUNDS = {
  minWidth: 320,
  maxWidth: 520,
};

const DEFAULT_GROUP_STACKS = {
  interactions: {
    stack: { top: 10, left: 20 },
    anchor: { top: 19, left: 34 },
    zBase: 40,
  },
  priorities: {
    stack: { top: 52, left: 75 },
    anchor: { top: 57, left: 86 },
    zBase: 30,
  },
  connections: {
    stack: { top: 76, left: 24 },
    anchor: { top: 82, left: 40 },
    zBase: 20,
  },
};

const COMPACT_GROUP_STACKS = {
  interactions: {
    stack: { top: 1, left: 32 },
    anchor: { top: 18, left: 44 },
    zBase: 40,
  },
  priorities: {
    stack: { top: 60, left: 68 },
    anchor: { top: 66, left: 78 },
    zBase: 30,
  },
  connections: {
    stack: { top: 82, left: 36 },
    anchor: { top: 86, left: 48 },
    zBase: 20,
  },
};

const HUB_POSITION = { top: 50, left: 50 };

const CHAOS_BITS = [
  {
    id: "message",
    type: "card",
    icon: "message",
    title: "Message",
    detail: "Recent interaction",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 4, left: 8 },
    compactPosition: { top: 1, left: 24 },
    group: "interactions",
    stackIndex: 0,
    floatRadius: 28,
    layer: 3,
  },
  {
    id: "reply-needed",
    type: "card",
    icon: "replyNeeded",
    title: "Reply Needed",
    detail: "Thread awaiting you",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 16, left: 56 },
    compactPosition: { top: 20, left: 60 },
    group: "interactions",
    stackIndex: 1,
    floatRadius: 34,
    layer: 2,
  },
  {
    id: "priority-rising",
    type: "card",
    icon: "priorityRising",
    title: "Priority Rising",
    detail: "Shifting priority",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 36, left: 12 },
    compactPosition: { top: 40, left: 26 },
    group: "priorities",
    stackIndex: 0,
    floatRadius: 30,
    layer: 3,
  },
  {
    id: "overdue",
    type: "card",
    icon: "overdue",
    title: "Overdue",
    detail: "Priority slipping",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 54, left: 60 },
    compactPosition: { top: 60, left: 62 },
    group: "priorities",
    stackIndex: 1,
    floatRadius: 24,
    layer: 1,
  },
  {
    id: "connection-opportunity",
    type: "card",
    icon: "connectionOpportunity",
    title: "Connection Opportunity",
    detail: "Important relationship",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 70, left: 14 },
    compactPosition: { top: 74, left: 32 },
    group: "connections",
    stackIndex: 0,
    floatRadius: 26,
    layer: 2,
  },
  {
    id: "key-contact",
    type: "card",
    icon: "keyContact",
    title: "Key Contact",
    detail: "The \"matters most\" node",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 78, left: 44 },
    compactPosition: { top: 80, left: 52 },
    group: "connections",
    stackIndex: 1,
    floatRadius: 22,
    layer: 2,
  },
  {
    id: "thread",
    type: "card",
    icon: "thread",
    title: "Thread",
    detail: "Context / multi-message chain",
    accent: "#0A84FF",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,246,251,0.92))",
    position: { top: 28, left: 70 },
    compactPosition: { top: 32, left: 66 },
    group: "interactions",
    stackIndex: 2,
    floatRadius: 20,
    layer: 2,
  },
];

export default function RelationshipIntelligenceVisual() {
  const containerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [gathered, setGathered] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [layoutFactor, setLayoutFactor] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") {
      return;
    }

    const updateFactor = (widthOverride) => {
      const measuredWidth =
        typeof widthOverride === "number" ? widthOverride : el.offsetWidth;
      if (!measuredWidth) return;

      setLayoutFactor((prev) => {
        const next = calculateLayoutFactor(measuredWidth);
        return Math.abs(prev - next) > 0.001 ? next : prev;
      });
    };

    updateFactor();

    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver((entries) => {
        if (!entries.length) return;
        updateFactor(entries[0].contentRect.width);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", updateFactor);
    return () => window.removeEventListener("resize", updateFactor);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setStarted(true);
      return;
    }

    let hasStarted = false;
    let fallbackTimer;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasStarted = true;
          setStarted(true);
          window.clearTimeout(fallbackTimer);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    fallbackTimer = window.setTimeout(() => {
      if (!hasStarted) {
        setStarted(true);
        io.disconnect();
      }
    }, 1500);

    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!started) {
      setGathered(false);
      setStacked(false);
      return;
    }

    const gatherTimer = setTimeout(() => setGathered(true), 3400);
    const stackTimer = setTimeout(() => setStacked(true), 5600);

    return () => {
      clearTimeout(gatherTimer);
      clearTimeout(stackTimer);
    };
  }, [started]);

  const groupStacks = useMemo(
    () => interpolateGroupStacks(layoutFactor),
    [layoutFactor],
  );

  const waveConnections = useMemo(
    () => buildWaveConnections(groupStacks),
    [groupStacks],
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[300px] w-full max-w-[520px] items-center justify-center sm:h-[360px] md:h-[420px]"
    >
      <div className="pointer-events-none absolute inset-[-20%] -z-20 bg-[radial-gradient(circle_at_50%_40%,rgba(226,251,240,0.45),transparent_65%)] blur-[95px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-3 -z-10 mx-auto h-32 w-48 rounded-[50%] bg-[radial-gradient(circle,rgba(15,23,42,0.18),transparent_65%)] blur-[40px]" />

      <div className="relative h-full w-full">
        <div className="pointer-events-none absolute inset-0 rounded-[45%] border border-white/30 opacity-40 blur-[2px]" />
        <WaveformHub stacked={stacked} connections={waveConnections} />
        {CHAOS_BITS.map((bit) => (
          <FloatingBit
            key={bit.id}
            bit={bit}
            started={started}
            gathered={gathered}
            stacked={stacked}
            groupStacks={groupStacks}
            layoutFactor={layoutFactor}
          />
        ))}
      </div>
    </div>
  );
}

function FloatingBit({
  bit,
  started,
  gathered,
  stacked,
  groupStacks,
  layoutFactor,
}) {
  const groupConfig = bit.group ? groupStacks[bit.group] : null;
  const drift = useMemo(() => {
    const radius = stacked ? 5 : bit.floatRadius ?? 24;
    const tilt = stacked ? 3 : bit.maxTilt ?? 10;

    return {
      x: [
        0,
        randomBetween(-radius, radius),
        randomBetween(radius * -0.6, radius * 0.8),
        randomBetween(-radius * 0.4, radius * 0.4),
        0,
      ],
      y: [
        0,
        randomBetween(radius * -0.5, radius),
        randomBetween(-radius, radius * 0.6),
        randomBetween(-radius * 0.5, radius * 0.5),
        0,
      ],
      rotate: [
        0,
        randomBetween(-tilt, tilt),
        randomBetween(-tilt * 0.6, tilt * 0.6),
        randomBetween(-tilt * 0.4, tilt * 0.4),
        0,
      ],
    };
  }, [bit.floatRadius, bit.maxTilt, stacked]);

  const baseFloatDuration = useMemo(() => randomBetween(7, 11), []);
  const floatTransition = useMemo(
    () => ({
      duration: stacked ? baseFloatDuration * 1.2 : baseFloatDuration,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
      delay: randomBetween(0, 1.4),
    }),
    [baseFloatDuration, stacked],
  );

  const restingPosition = useMemo(
    () =>
      blendPositions(
        bit.compactPosition ?? bit.position,
        bit.position,
        layoutFactor,
      ),
    [bit.compactPosition, bit.position, layoutFactor],
  );

  const restingStyle = useMemo(
    () => toPercentPosition(restingPosition),
    [restingPosition],
  );

  const stackTargetStyle = useMemo(
    () =>
      groupConfig
        ? toPercentPosition(groupConfig.stack)
        : null,
    [groupConfig],
  );

  const targetPosition =
    started && gathered && stackTargetStyle ? stackTargetStyle : restingStyle;

  const stackIndex = bit.stackIndex ?? 0;
  const stackOffsetY = stacked ? stackIndex * 6 : 0;
  const stackScale = stacked ? 1 - stackIndex * 0.02 : 1;
  const stackOpacity = stacked ? Math.max(0.65, 1 - stackIndex * 0.18) : 1;
  const zIndex =
    stacked && groupConfig
      ? groupConfig.zBase - stackIndex
      : bit.layer ?? 1;

  const baseDelay = (bit.layer ?? 1) * 0.08;
  const transition = stacked
    ? {
        type: "spring",
        stiffness: 70,
        damping: 16,
        mass: 0.8,
        delay: baseDelay,
      }
    : {
        duration: gathered ? 1.15 : 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: baseDelay,
      };

  return (
    <motion.div
      className="absolute"
      style={{
        zIndex,
      }}
      initial={{
        opacity: 0,
        scale: 0.85,
        y: 16,
        top: restingStyle.top,
        left: restingStyle.left,
      }}
      animate={{
        opacity: started ? stackOpacity : 0,
        scale: started ? stackScale : 0.85,
        y: started ? stackOffsetY : 16,
        top: targetPosition.top,
        left: targetPosition.left,
      }}
      transition={transition}
    >
      <motion.div
        animate={
          started
            ? {
                x: drift.x,
                y: drift.y,
                rotate: drift.rotate,
              }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={started ? floatTransition : { duration: 0 }}
        className="relative"
      >
        {bit.type === "person" ? (
          <PersonBit bit={bit} />
        ) : (
          <CardBit bit={bit} />
        )}
      </motion.div>
    </motion.div>
  );
}

function WaveformHub({ stacked, connections = [] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: stacked ? 1 : 0 }}
        transition={{ duration: 0.6, delay: stacked ? 0.5 : 0 }}
      >
        <defs>
          <linearGradient id="wave-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(14,165,233,0.65)" />
            <stop offset="100%" stopColor="rgba(14,165,233,0.1)" />
          </linearGradient>
        </defs>
        {connections.map((conn, index) => (
          <motion.path
            key={conn.id}
            d={`M ${HUB_POSITION.left} ${HUB_POSITION.top} L ${conn.target.left} ${conn.target.top}`}
            stroke="url(#wave-line)"
            strokeWidth={1.35}
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: stacked ? 0.8 : 0, pathLength: stacked ? 1 : 0 }}
            transition={{ duration: 1.2, delay: stacked ? 0.6 + index * 0.15 : 0 }}
          />
        ))}
        <motion.circle
          cx={HUB_POSITION.left}
          cy={HUB_POSITION.top}
          r={2.2}
          fill="#C7E7F7"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: stacked ? 0.8 : 0, scale: stacked ? 1 : 0.6 }}
          transition={{ duration: 0.6, delay: stacked ? 0.5 : 0 }}
        />
        {connections.map((conn, index) => (
          <motion.circle
            key={`${conn.id}-node`}
            cx={conn.target.left}
            cy={conn.target.top}
            r={1.4}
            fill="#8BCAE6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: stacked ? 0.9 : 0, scale: stacked ? 1 : 0.5 }}
            transition={{ duration: 0.6, delay: stacked ? 0.9 + index * 0.15 : 0 }}
          />
        ))}
      </motion.svg>

      <motion.div
        className="absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl"
        style={{ top: `${HUB_POSITION.top}%`, left: `${HUB_POSITION.left}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: stacked ? 0.5 : 0 }}
        transition={{ duration: 0.8, delay: stacked ? 0.7 : 0 }}
      />

      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.16)] backdrop-blur"
        style={{ top: `${HUB_POSITION.top}%`, left: `${HUB_POSITION.left}%` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: stacked ? 1 : 0, scale: stacked ? 1 : 0.8 }}
        transition={{ duration: 0.7, delay: stacked ? 0.8 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src="/waveform.svg" alt="waveform" className="h-16 w-16 object-contain" />
      </motion.div>
    </div>
  );
}

function CardBit({ bit }) {
  const Icon = ICONS[bit.icon] ?? Mail;

  return (
    <div
      className="w-[130px] rounded-2xl border border-white/60 p-3 text-[10px] shadow-[0_20px_55px_rgba(15,23,42,0.18)] backdrop-blur-[6px] sm:w-[150px] sm:text-[11px]"
      style={{ background: bit.background }}
    >
      <div className="flex items-center gap-2 font-semibold text-slate-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-inner">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} style={{ color: bit.accent }} />
        </span>
        {bit.title}
      </div>
      <p className="mt-1 text-[9px] font-medium text-slate-500 sm:text-[10px]">{bit.detail}</p>
    </div>
  );
}

function PersonBit({ bit }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-2.5 py-1.5 text-[9px] shadow-[0_18px_40px_rgba(15,23,42,0.15)] backdrop-blur-[6px] sm:gap-3 sm:px-3 sm:text-[10px]">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-inner sm:h-9 sm:w-9 sm:text-xs"
        style={{
          background: `linear-gradient(140deg, ${bit.palette[0]}, ${bit.palette[1]})`,
        }}
      >
        {bit.initials}
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold text-slate-800 sm:text-[11px]">
          {bit.note}
        </div>
        <div className="text-[9px] text-slate-500 sm:text-[10px]">{bit.sub}</div>
      </div>
    </div>
  );
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function interpolateGroupStacks(factor) {
  return Object.keys(DEFAULT_GROUP_STACKS).reduce((acc, key) => {
    const base = DEFAULT_GROUP_STACKS[key];
    const compact = COMPACT_GROUP_STACKS[key] ?? base;
    acc[key] = {
      stack: interpolatePoint(compact.stack, base.stack, factor),
      anchor: interpolatePoint(compact.anchor, base.anchor, factor),
      zBase: base.zBase,
    };
    return acc;
  }, {});
}

function interpolatePoint(compact, base, factor) {
  if (!compact || !base) return base ?? compact ?? { top: 0, left: 0 };
  return {
    top: lerp(compact.top, base.top, factor),
    left: lerp(compact.left, base.left, factor),
  };
}

function blendPositions(compact, base, factor) {
  if (!compact) return base;
  return {
    top: lerp(compact.top, base.top, factor),
    left: lerp(compact.left, base.left, factor),
  };
}

function toPercentPosition(position) {
  return {
    top: `${position.top}%`,
    left: `${position.left}%`,
  };
}

function buildWaveConnections(stacks) {
  return Object.keys(stacks).map((key) => ({
    id: key,
    target: stacks[key].anchor,
  }));
}

function calculateLayoutFactor(width) {
  if (!width) return 1;
  const clampedWidth = clamp(
    width,
    VISUAL_BOUNDS.minWidth,
    VISUAL_BOUNDS.maxWidth,
  );
  const range = VISUAL_BOUNDS.maxWidth - VISUAL_BOUNDS.minWidth;
  if (!range) return 1;
  return (clampedWidth - VISUAL_BOUNDS.minWidth) / range;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}
