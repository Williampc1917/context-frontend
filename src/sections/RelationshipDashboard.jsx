import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle, Calendar, Mail, TrendingUp } from "lucide-react";

export default function RelationshipDashboard() {
  const [selectedId, setSelectedId] = useState(null);

  // Demo data - 10 relationships with varying health
  const relationships = [
    { id: 1, name: "Jennifer", company: "Acme Corp", status: "cold", lastContact: "9 days ago", pending: "Pricing proposal overdue", score: 32, ring: 1, angle: -90 },
    { id: 2, name: "Mike", company: "Leadership", status: "cold", lastContact: "12 days ago", pending: "No meeting scheduled", score: 28, ring: 1, angle: 0 },
    { id: 3, name: "Sarah", company: "Design Co", status: "healthy", lastContact: "2 days ago", pending: "None", score: 95, ring: 1, angle: 90 },
    { id: 4, name: "David", company: "TechStart", status: "healthy", lastContact: "1 day ago", pending: "None", score: 92, ring: 1, angle: 180 },
    { id: 5, name: "Noah", company: "Operations", status: "due", lastContact: "5 days ago", pending: "Contract review needed", score: 58, ring: 2, angle: -135 },
    { id: 6, name: "Amy", company: "Sales Inc", status: "healthy", lastContact: "3 days ago", pending: "None", score: 88, ring: 2, angle: -60 },
    { id: 7, name: "Priya", company: "Customer Success", status: "healthy", lastContact: "2 days ago", pending: "None", score: 90, ring: 2, angle: 15 },
    { id: 8, name: "Liam", company: "BigClient", status: "due", lastContact: "6 days ago", pending: "Meeting follow-up", score: 62, ring: 2, angle: 75 },
    { id: 9, name: "Maya", company: "Investors", status: "cold", lastContact: "15 days ago", pending: "Q4 update overdue", score: 25, ring: 2, angle: 150 },
    { id: 10, name: "Alex", company: "Partner Co", status: "healthy", lastContact: "1 day ago", pending: "None", score: 94, ring: 2, angle: 210 },
  ];

  // Sort by priority (cold first, then due, then healthy)
  const sortedRelationships = [...relationships].sort((a, b) => {
    const priority = { cold: 0, due: 1, healthy: 2 };
    return priority[a.status] - priority[b.status];
  });

  const getStatusColor = (status) => {
    if (status === "healthy") return "emerald";
    if (status === "due") return "amber";
    return "rose";
  };

  const getStatusText = (status) => {
    if (status === "healthy") return "Healthy";
    if (status === "due") return "Needs attention";
    return "Urgent";
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mb-10 max-w-3xl text-center"
      >
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          One view. Twenty relationships. Zero anxiety.
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Context's relationship intelligence analyzes patterns, detects issues, and prioritizes what matters.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-6 md:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
          {/* LEFT: Network Graph */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Network Health</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-emerald-500" />
                  Healthy
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-amber-500" />
                  Attention
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-rose-500" />
                  Urgent
                </span>
              </div>
            </div>

            <NetworkGraph 
              relationships={relationships} 
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="mt-0.5 shrink-0" />
                <div>
                  <strong>Algorithm at work:</strong> Context analyzes email frequency, response times, meeting cadence, and sentiment to calculate each relationship's health score.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Priority List */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Priority View</h3>
              <span className="text-xs text-gray-500">
                {sortedRelationships.filter(r => r.status !== "healthy").length} need attention
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "520px" }}>
              {sortedRelationships.map((person) => (
                <RelationshipCard
                  key={person.id}
                  person={person}
                  isSelected={selectedId === person.id}
                  onClick={() => setSelectedId(person.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-3 text-center text-xs text-gray-500">
        Demo visualization. Live dashboard updates in real-time in the app.
      </div>
    </div>
  );
}

function NetworkGraph({ relationships, selectedId, onSelect }) {
  const SIZE = 380;
  const C = SIZE / 2;
  const R = { inner: 90, outer: 160 };

  const toXY = (angle, radius) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)];
  };

  const getStatusStyle = (status, isSelected) => {
    const base = isSelected ? "ring-2 ring-offset-2" : "";
    if (status === "healthy") return `${base} bg-emerald-100 ring-emerald-400 border-emerald-300`;
    if (status === "due") return `${base} bg-amber-100 ring-amber-400 border-amber-300`;
    return `${base} bg-rose-100 ring-rose-400 border-rose-300 animate-pulse`;
  };

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="absolute inset-0">
        {/* Center rings */}
        <circle cx={C} cy={C} r={R.inner} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <circle cx={C} cy={C} r={R.outer} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        
        {/* Center "You" */}
        <foreignObject x={C - 40} y={C - 40} width="80" height="80">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-50 text-center text-xs font-semibold text-indigo-900">
            You
          </div>
        </foreignObject>

        {/* Connections */}
        {relationships.map((person) => {
          const radius = person.ring === 1 ? R.inner : R.outer;
          const [x, y] = toXY(person.angle, radius);
          return (
            <line
              key={`line-${person.id}`}
              x1={C}
              y1={C}
              x2={x}
              y2={y}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Nodes */}
        {relationships.map((person) => {
          const radius = person.ring === 1 ? R.inner : R.outer;
          const [x, y] = toXY(person.angle, radius);
          const isSelected = selectedId === person.id;

          return (
            <foreignObject
              key={person.id}
              x={x - 30}
              y={y - 30}
              width="60"
              height="60"
              className="cursor-pointer"
              onClick={() => onSelect(person.id)}
            >
              <div
                className={`flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 text-center text-xs font-medium transition-all ${getStatusStyle(person.status, isSelected)}`}
              >
                {person.name}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

function RelationshipCard({ person, isSelected, onClick }) {
  const statusColors = {
    healthy: "border-emerald-200 bg-emerald-50/50",
    due: "border-amber-200 bg-amber-50/50",
    cold: "border-rose-200 bg-rose-50/50",
  };

  const iconColors = {
    healthy: "text-emerald-600",
    due: "text-amber-600",
    cold: "text-rose-600",
  };

  const StatusIcon = person.status === "healthy" ? CheckCircle : AlertCircle;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
        statusColors[person.status]
      } ${isSelected ? "ring-2 ring-indigo-400 ring-offset-2" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusIcon size={14} className={iconColors[person.status]} />
            <h4 className="truncate text-sm font-semibold text-gray-900">{person.name}</h4>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-600">{person.company}</p>
          
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {person.lastContact}
            </span>
            {person.pending !== "None" && (
              <span className="flex items-center gap-1">
                <Mail size={12} />
                {person.pending}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="text-lg font-bold text-gray-900">{person.score}</div>
          <div className="text-xs text-gray-500">score</div>
        </div>
      </div>
    </button>
  );
}