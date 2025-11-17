import { forwardRef } from "react";

export default forwardRef(function FeatureLayout(
  { eyebrow, title, description = [], children, className = "", reverse = false },
  ref,
) {
  return (
    <article
      ref={ref}
      className={`relative mx-auto grid w-full max-w-6xl items-center gap-12 overflow-hidden rounded-[40px] bg-[#F8F7F4] px-6 py-20 md:grid-cols-2 ${className}`}
    >
      <div
        className={`relative flex w-full justify-center ${reverse ? "md:order-2" : "md:order-1"}`}
      >
        {children}
      </div>

      <div
        className={`relative w-full max-w-[500px] space-y-5 ${reverse ? "md:order-1" : "md:order-2"}`}
      >
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-gray-500 shadow-sm">
            {eyebrow}
          </span>
        ) : null}

        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl md:leading-[1.05]">
          {title}
        </h2>

        <div className="space-y-4 text-[15px] leading-relaxed text-gray-600">
          {description.map((block, index) => (
            <div key={index}>{block}</div>
          ))}
        </div>
      </div>
    </article>
  );
});
