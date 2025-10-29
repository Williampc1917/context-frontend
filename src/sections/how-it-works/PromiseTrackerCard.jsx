import FeatureLayout from "./FeatureLayout.jsx";

export default function PromiseTrackerCard() {
  return (
    <FeatureLayout
      eyebrow="Feature 04"
      title="Promise tracker (placeholder)"
      description={[
        <p key="placeholder" className="text-sm leading-relaxed text-gray-500">
          Display goes here. Explanation goes here.
        </p>,
      ]}
      background={
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-6xl opacity-40 blur-[110px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(234,179,8,0.14),transparent_70%)]" />
        </div>
      }
      reverse
    >
      <div className="flex h-[360px] w-full max-w-[380px] items-center justify-center rounded-2xl border border-dashed border-amber-200/70 bg-white/75 text-sm font-medium text-amber-500 backdrop-blur">
        Display goes here.
      </div>
    </FeatureLayout>
  );
}
