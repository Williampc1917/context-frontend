import FeatureLayout from "./FeatureLayout.jsx";

export default function FollowUpsCard() {
  return (
    <FeatureLayout
      eyebrow="Feature 02"
      title="Follow-up autopilot (placeholder)"
      description={[
        <p key="placeholder" className="text-sm leading-relaxed text-gray-500">
          Display goes here. Explanation goes here.
        </p>,
      ]}
      background={
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-6xl opacity-40 blur-[110px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(56,189,248,0.12),transparent_70%)]" />
        </div>
      }
      reverse
    >
      <div className="flex h-[360px] w-full max-w-[380px] items-center justify-center rounded-2xl border border-dashed border-blue-200/70 bg-white/75 text-sm font-medium text-blue-500 backdrop-blur">
        Display goes here.
      </div>
    </FeatureLayout>
  );
}
