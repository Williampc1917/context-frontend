import FeatureLayout from "./FeatureLayout.jsx";
import RelationshipIntelligenceVisual from "./RelationshipIntelligenceVisual.jsx";

export default function RelationshipIntelligenceCard() {
  return (
    <FeatureLayout
      eyebrow="Feature 03"
      title="Relationship intelligence that maps your world."
      description={[
        <p key="primary" className="text-base leading-relaxed text-gray-700">
          Claro builds a simple, living picture of the people around you: recent
          interactions, shifting priorities, and the connections that matter
          most. It’s context you can actually use.
        </p>,
        <p key="secondary" className="text-sm leading-relaxed text-gray-500">
          Otherwise you’re left piecing things together from scattered threads
          and half-remembered conversations.
        </p>,
      ]}
    >
      <RelationshipIntelligenceVisual />
    </FeatureLayout>
  );
}
