"use client";

import { useState } from "react";
import type { IntakeData } from "@/lib/intake-schema";
import { IntakeViewer } from "./intake-viewer";

export function IntakeForm({
  projectId,
  initialIntake,
  onSaved,
}: {
  projectId: string;
  initialIntake: IntakeData;
  onSaved: (data: IntakeData) => void;
}) {
  const [data, setData] = useState<IntakeData>(initialIntake);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const wasSaved = initialIntake.problem.title !== "";

  const totalSteps = 5;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, intake: data }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to save intake");
      }
      onSaved(data);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (wasSaved && !isEditing) {
    return <IntakeViewer intake={data} onEdit={() => setIsEditing(true)} />;
  }

  const steps = [
    { key: "problem", label: "Problem" },
    { key: "users", label: "Users" },
    { key: "goals", label: "Goals" },
    { key: "metrics", label: "Metrics" },
    { key: "constraints", label: "Constraints" },
  ];

  return (
    <div className="rounded-3xl bg-surface p-8 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Project Intake</h2>
        <span className="text-sm text-muted-foreground">
          Step {step + 1} of {totalSteps}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {step === 0 && (
          <>
            <Field
              label="What's the product / project title?"
              value={data.problem.title}
              onChange={(v) =>
                setData({ ...data, problem: { ...data.problem, title: v } })
              }
            />
            <Field
              label="Describe the problem (1-2 sentences)"
              value={data.problem.pain}
              onChange={(v) =>
                setData({ ...data, problem: { ...data.problem, pain: v } })
              }
              textarea
            />
            <Field
              label="Who experiences this problem?"
              value={data.problem.audience}
              onChange={(v) =>
                setData({ ...data, problem: { ...data.problem, audience: v } })
              }
            />
          </>
        )}

        {step === 1 && (
          <>
            <Field
              label="Who are the primary users / personas?"
              value={data.users.personas}
              onChange={(v) =>
                setData({ ...data, users: { ...data.users, personas: v } })
              }
            />
            <Field
              label="What jobs are they trying to get done?"
              value={data.users.jobsToBeDone}
              onChange={(v) =>
                setData({
                  ...data,
                  users: { ...data.users, jobsToBeDone: v },
                })
              }
              textarea
            />
          </>
        )}

        {step === 2 && (
          <>
            <Field
              label="What does the product aim to achieve?"
              value={data.goals.productGoal}
              onChange={(v) =>
                setData({
                  ...data,
                  goals: { ...data.goals, productGoal: v },
                })
              }
              textarea
            />
            <Field
              label="What does the business aim to achieve?"
              value={data.goals.businessGoal}
              onChange={(v) =>
                setData({
                  ...data,
                  goals: { ...data.goals, businessGoal: v },
                })
              }
              textarea
            />
          </>
        )}

        {step === 3 && (
          <>
            <Field
              label="How will success be measured? (optional)"
              value={data.metrics.successMetrics}
              onChange={(v) =>
                setData({
                  ...data,
                  metrics: { ...data.metrics, successMetrics: v },
                })
              }
              textarea
            />
            <Field
              label="What's explicitly out of scope? (optional)"
              value={data.metrics.nonGoals}
              onChange={(v) =>
                setData({ ...data, metrics: { ...data.metrics, nonGoals: v } })
              }
              textarea
            />
          </>
        )}

        {step === 4 && (
          <>
            <Field
              label="Any constraints (technical, legal, timeline)? (optional)"
              value={data.constraints.constraints}
              onChange={(v) =>
                setData({
                  ...data,
                  constraints: { ...data.constraints, constraints: v },
                })
              }
              textarea
            />
            <Field
              label="What assumptions are being made? (optional)"
              value={data.constraints.assumptions}
              onChange={(v) =>
                setData({
                  ...data,
                  constraints: { ...data.constraints, assumptions: v },
                })
              }
              textarea
            />
          </>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-accent-rose">{error}</p>}

      <div className="mt-6 flex gap-3 justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-soft hover:bg-primary-hover transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-soft hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save intake"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls =
    "mt-1 w-full px-3 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40";
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}
