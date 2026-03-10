import FeatureLayout from "./FeatureLayout.jsx";
import RelationshipIntelligenceVisual from "./RelationshipIntelligenceVisual.jsx";

export default function RelationshipIntelligenceCard({ theme = "light" }) {
  return (
    <FeatureLayout
      title="Relationship intelligence with real context"
      description={[
        <p
          key="primary"
          className="text-base leading-relaxed text-gray-700 dark:text-slate-200"
        >
          Claro builds a simple, living picture of the people around you: recent
          interactions, shifting priorities, and the connections that matter
          most. It’s context you can actually use
        </p>,
        <p
          key="secondary"
          className="text-sm leading-relaxed text-gray-600 dark:text-slate-400"
        >
          Otherwise you’re left piecing things together from scattered threads
        </p>,
      ]}
    >
      <RelationshipIntelligenceVisual theme={theme} />
    </FeatureLayout>
  );
}
