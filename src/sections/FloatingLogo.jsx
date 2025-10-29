import React, { useState, useEffect } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

/**
 * FloatingLogo (fade-in on scroll, then stick forever)
 * - Scroll drives wrapper opacity/translateY until `stickAtProgress` is reached.
 * - After that, it locks visible (opacity: 1, y: 0) even when scrolling back up.
 * - Inner <img> does gentle float/rotate only (no scroll transform conflicts).
 */
export default function FloatingLogo({
  src,
  alt,
  className = "",
  delay = 0,
  hideBelow, // e.g. "md" -> hidden md:block
  targetRef, // section ref used for scroll-based fade
  stickAtProgress = 0.12, // point where it's considered "fully shown"
}) {
  const prefersReducedMotion = useReducedMotion();

  // Scroll progress for the target section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  // Has the logo been revealed to the desired point at least once?
  const [hasAppeared, setHasAppeared] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Fade-in curve: 0 -> 1 from progress 0 to stickAtProgress (then clamp)
  const rawOpacity = useTransform(
    scrollYProgress,
    [0, stickAtProgress],
    [0, 1], // framer clamps by default, so stays at 1 beyond stickAtProgress
  );

  // Subtle lift as it fades in
  const rawY = useTransform(scrollYProgress, [0, stickAtProgress], [10, 0]);

  // Smooth the scroll motion (prevents twitchiness)
  const opacity = useSpring(rawOpacity, {
    stiffness: 120,
    damping: 20,
    mass: 0.35,
  });
  const translateY = useSpring(rawY, {
    stiffness: 120,
    damping: 20,
    mass: 0.35,
  });

  // When the section progress crosses stickAtProgress (and image is loaded), lock it
  useEffect(() => {
    // Set initial state in case page loads mid-section
    const v0 = scrollYProgress.get();
    if (!hasAppeared && imgLoaded && v0 >= stickAtProgress)
      setHasAppeared(true);

    const unsub = scrollYProgress.on("change", (v) => {
      if (!hasAppeared && imgLoaded && v >= stickAtProgress)
        setHasAppeared(true);
    });
    return () => unsub();
  }, [scrollYProgress, hasAppeared, imgLoaded, stickAtProgress]);

  const hideCls = hideBelow ? `hidden ${hideBelow}:block` : "";

  // Inner gentle float animation (decoupled from scroll)
  const floatAnimate = prefersReducedMotion
    ? { opacity: 1 }
    : { y: [0, -8, 0, 6, 0], rotate: [-1.2, 1.2, -1.2] };

  const floatTransition = prefersReducedMotion
    ? { delay, duration: 0.6 }
    : {
        delay,
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      };

  return (
    <motion.div
      className={`pointer-events-none select-none will-change-transform transform-gpu ${hideCls} ${className}`}
      // Wrapper handles scroll-based reveal; after stick, freeze values
      style={{
        opacity: hasAppeared ? 1 : opacity,
        y: hasAppeared ? 0 : translateY,
        filter:
          "drop-shadow(0 18px 40px rgba(0,0,0,.18)) drop-shadow(0 0 20px rgba(255,255,255,.28))",
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        aria-hidden="true"
        draggable={false}
        className="will-change-transform transform-gpu"
        onLoad={() => setImgLoaded(true)}
        animate={floatAnimate}
        transition={floatTransition}
      />
    </motion.div>
  );
}
