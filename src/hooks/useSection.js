import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Hook to control section-level animations
 * Uses IntersectionObserver with optimized settings
 */
export function useSection(options = {}) {
  const { 
    threshold = 0.1, 
    rootMargin = "0px 0px -35% 0px",
  } = options;
  
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip animation setup if reduced motion preferred
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    // Use IntersectionObserver for better performance than scroll listeners
    const observer = new IntersectionObserver(
      (entries) => {
        // Only process the first entry (our section)
        const entry = entries[0];
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once, then cleanup
        }
      },
      { 
        threshold, 
        rootMargin,
        // Performance optimization - don't track changes after initial intersection
        trackVisibility: false,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, prefersReducedMotion, isVisible]);

  return { ref, isVisible };
}