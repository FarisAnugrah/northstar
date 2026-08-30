import type { IntakeData } from "@/lib/intake-schema";

export function IntakeViewer({
  intake,
  onEdit,
}: {
  intake: IntakeData;
  onEdit: () => void;
}) {
  const sections: { title: string; fields: { label: string; value: string }[] }[] =
    [
      {
        title: "Problem",
        fields: [
          { label: "Title", value: intake.problem.title },
          { label: "Pain point", value: intake.problem.pain },
          { label: "Audience", value: intake.problem.audience },
        ],
      },
      {
        title: "Users",
        fields: [
          { label: "Personas", value: intake.users.personas },
          { label: "Jobs to be done", value: intake.users.jobsToBeDone },
        ],
      },
      {
        title: "Goals",
        fields: [
          { label: "Product goal", value: intake.goals.productGoal },
          { label: "Business goal", value: intake.goals.businessGoal },
        ],
      },
      {
        title: "Metrics",
        fields: [
          { label: "Success metrics", value: intake.metrics.successMetrics },
          { label: "Out of scope", value: intake.metrics.nonGoals },
        ],
      },
      {
        title: "Constraints",
        fields: [
          { label: "Constraints", value: intake.constraints.constraints },
          { label: "Assumptions", value: intake.constraints.assumptions },
        ],
      },
    ];

  return (
    <div className="rounded-3xl bg-surface p-8 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Intake</h2>
        <button
          onClick={onEdit}
          className="px-4 py-2 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
        >
          Edit intake
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-primary">{section.title}</h3>
            <dl className="mt-2 space-y-2">
              {section.fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-sm text-muted-foreground">{f.label}</dt>
                  <dd className="text-foreground">{f.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
