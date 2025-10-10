import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { Mic, ArrowRight } from "lucide-react";
import "./index.css";
import { rafThrottle } from "./utils/throttle";

// Import sections directly - no lazy loading
import ProblemSection from "./sections/ProblemSection.jsx";
import SolutionSection from "./sections/SolutionSection.jsx";
import HowItWorksSection from "./sections/HowItWorksSection.jsx";

export default function ContextLanding() {
  const [scrolled, setScrolled] = useState(false);

  // Throttled scroll handler for better performance
  useEffect(() => {
    const handleScroll = rafThrottle(() => {
      setScrolled(window.scrollY > 10);
    });

    // Passive listener - browser knows we won't preventDefault
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTo = useCallback((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Use native smooth scroll with optimized behavior
    element.scrollIntoView({ 
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip text-gray-900 bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-20">
        {/* Use CSS animation instead of Framer Motion parallax */}
        <div className="hero-orb hero-orb-1">
          <div className="size-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,.22),transparent_65%)]" />
        </div>
        <div className="hero-orb hero-orb-2">
          <div className="size-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,.22),transparent_65%)]" />
        </div>
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 via-white/30 to-transparent backdrop-blur-sm" />
      </div>
      <div className="bg-noise pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light opacity-60" />

      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-white/35 backdrop-blur-2xl border-b border-white/30 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button onClick={() => scrollTo("top")} className="text-lg font-semibold tracking-tight">
            Context
          </button>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <button onClick={() => scrollTo("problem")} className="hover:text-gray-600 transition-colors">
              The problem
            </button>
            <button onClick={() => scrollTo("features")} className="hover:text-gray-600 transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo("dashboard")} className="hover:text-gray-600 transition-colors">
              Dashboard
            </button>
            <button onClick={() => scrollTo("how")} className="hover:text-gray-600 transition-colors">
              How it works
            </button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-gray-600 transition-colors">
              Pricing
            </button>
          </div>
          <button onClick={() => scrollTo("waitlist")} className="btn-primary">
            Join the waitlist
          </button>
        </div>
      </nav>

      <section id="top" className="relative px-6 pb-18 pt-28 md:pt-36 lg:px-8">
        {/* Floating brand logos - only 1 of each */}
        <FloatingLogo 
          src="/gmail.svg" 
          alt="Gmail" 
          className="left-[12%] top-[20%] w-[110px]" 
          delay={0}
        />
        <FloatingLogo 
          src="/google-calendar.svg" 
          alt="Google Calendar" 
          className="right-[15%] bottom-[18%] w-[115px]" 
          delay={0.4}
        />

        <div className="mx-auto max-w-7xl">
          <div className="hero-content mx-auto max-w-4xl text-center">
            <h1 className="hero-headline">
              <span className="relative inline-block">
                Speak.
                <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 animate-pulse-slow" />
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 animate-gradient">
                Context
              </span>{" "}
              takes care of Gmail and Calendar
            </h1>

            <p className="mt-5 text-xl text-gray-600">
              AI Voice assistant that Knows who matters, how you talk to them, and when to reach out — all while keeping Gmail and Calendar perfectly in sync
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => scrollTo("waitlist")} className="btn-primary">
                Join the waitlist
              </button>
              <button onClick={() => scrollTo("how")} className="btn-glass">
                See how it works <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="hero-iphone relative mx-auto mt-10 max-w-5xl">
            <div className="iphone-shell">
              <div className="iphone-notch" aria-hidden />
              <div className="ls-card">
                <div className="ls-left">
                  <div className="ls-mic">
                    <Mic size={18} />
                  </div>
                </div>
                <div className="ls-bubble">
                  "Morning! 6 emails from your Top 20 need a nudge. Jennifer hasn't heard from you in 9 days."
                </div>
              </div>
              <div className="ls-your-reply">"Draft a warm follow-up and suggest Friday 2pm."</div>
              <div className="ls-tip">
                <span className="ls-tip-badge">Tip</span>
                <span className="align-middle">Try: "Draft a warm follow-up to Jennifer & propose Fri 2pm."</span>
              </div>
            </div>

            <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(99,102,241,.12),transparent_60%)]" />
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section id="problem" className="section-plain px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProblemSection />
        </div>
      </section>

      {/* Solution section */}
      <section id="solution" className="section-grad px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SolutionSection />
        </div>
      </section>

      {/* How it works section */}
      <section id="how" className="section-plain px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <HowItWorksSection />
        </div>
      </section>

      {/* Waitlist section */}
      <section id="waitlist" className="waitlist-section section-grad px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold tracking-tight">Ready to never drop the ball?</h3>
          <p className="mt-3 text-lg text-gray-600">
            Join professionals who manage their most important relationships with Context.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="section-plain px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-xl font-semibold">Context</div>
              <p className="mt-2 text-gray-600">Relationship intelligence for busy professionals.</p>
            </div>
            <FooterCol title="Product" items={["Features", "Dashboard", "Pricing", "Security"]} />
            <FooterCol title="Company" items={["About", "Blog", "Careers"]} />
            <FooterCol title="Legal" items={["Privacy", "Terms", "Contact"]} />
          </div>
          <div className="mt-8 text-center text-gray-600">© {new Date().getFullYear()} Context. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/60 bg-white/70 p-4 text-center backdrop-blur-xl">
        <div className="text-sm font-medium">Thanks! We'll be in touch at</div>
        <div className="mt-1 text-lg font-semibold">{email}</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
      <input
        required
        type="email"
        placeholder="you@company.com"
        className="w-full rounded-full border border-white/60 bg-white/80 px-4 py-3 text-sm outline-none backdrop-blur-xl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Join the waitlist
      </button>
    </form>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="mb-3 font-semibold">{title}</div>
      <ul className="space-y-2 text-gray-600">
        {items.map((t) => (
          <li key={t}>
            <a className="hover:text-gray-900 transition-colors" href="#">
              {t}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatingLogo({ src, alt, className = "", delay = 0, brightness = 0.38 }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <img
      src={src}
      alt={alt}
      className={`floating-logo pointer-events-none absolute z-10 select-none drop-shadow-[0_10px_26px_rgba(0,0,0,.22)] ${className} ${
        prefersReducedMotion ? 'floating-logo-static' : ''
      }`}
      style={{
        opacity: brightness,
        animationDelay: `${delay}s`
      }}
    />
  );
}