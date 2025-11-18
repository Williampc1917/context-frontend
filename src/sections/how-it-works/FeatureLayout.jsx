import { forwardRef } from "react";

export default forwardRef(function FeatureLayout(
  {
    title,
    description = [],
    children,
    className = "",
    reverse = false,
  },
  ref,
) {
  return (
    <article
      ref={ref}
      className={`relative mx-auto grid w-full max-w-6xl items-center gap-12 overflow-hidden rounded-[40px] border border-white/60 bg-gradient-to-br from-[#F5F5F7] via-[#E8E9EF] to-[#DCDDDF] px-6 py-20 shadow-[0px_15px_45px_rgba(15,15,20,0.08)] md:grid-cols-2 ${className}`}
    >
      <div
        className={`relative flex w-full justify-center ${reverse ? "md:order-2" : "md:order-1"}`}
      >
        {children}
      </div>

      <div
        className={`relative w-full max-w-[500px] space-y-5 ${reverse ? "md:order-1" : "md:order-2"}`}
      >
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          {title}
        </h2>

        <div className="space-y-4 text-lg text-slate-600 sm:text-xl">
          {description.map((block, index) => (
            <div key={index}>{block}</div>
          ))}
        </div>
      </div>
    </article>
  );
});
