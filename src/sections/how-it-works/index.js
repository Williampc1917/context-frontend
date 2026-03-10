import { lazy } from "react";

const EmailCard = lazy(() => import("./EmailCard.jsx"));
const FollowUpsCard = lazy(() => import("./FollowUpsCard.jsx"));
const RelationshipIntelligenceCard = lazy(() => import("./RelationshipIntelligenceCard.jsx"));
const PromiseTrackerCard = lazy(() => import("./PromiseTrackerCard.jsx"));

export const howItWorksFeatures = [
  { id: "feature-email", Component: EmailCard },
  { id: "feature-follow-ups", Component: FollowUpsCard },
  { id: "feature-relationship", Component: RelationshipIntelligenceCard },
  { id: "feature-promises", Component: PromiseTrackerCard },
];
