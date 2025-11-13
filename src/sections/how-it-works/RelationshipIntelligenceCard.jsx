import FeatureLayout from "./FeatureLayout.jsx";

export default function RelationshipIntelligenceCard() {
  return (
    <FeatureLayout
      eyebrow="Feature 03"
      title="Relationship intelligence (placeholder)"
      description={[
        <p key="placeholder" className="text-sm leading-relaxed text-gray-500">
          Display goes here. Explanation goes here.
        </p>,
      ]}
      background={
        <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-6xl opacity-50 blur-[110px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(93,234,212,0.12),transparent_70%)]" />
        </div>
      }
    >
      <div className="flex h-[360px] w-full max-w-[380px] items-center justify-center rounded-2xl border border-dashed border-emerald-200/70 bg-white/75 text-sm font-medium text-emerald-500 backdrop-blur">
        Display goes here.
      </div>
    </FeatureLayout>
  );
}
