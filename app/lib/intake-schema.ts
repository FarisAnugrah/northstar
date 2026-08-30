import { z } from "zod";

/**
 * Intake form structure — 5 steps.
 * Payload disimpan sebagai JSON di tabel `intakes`.
 * Step 5 (metrics/constraints) opsional, lainnya wajib.
 */

export const intakeSchema = z.object({
  problem: z
    .object({
      title: z.string().min(3, "Title is required"),
      pain: z.string().min(10, "Describe the problem in a sentence or two"),
      audience: z.string().min(3, "Who experiences this problem?"),
    })
    .strict(),
  users: z
    .object({
      personas: z.string().min(3, "Describe the primary users/personas"),
      jobsToBeDone: z
        .string()
        .min(10, "What are users trying to accomplish?"),
    })
    .strict(),
  goals: z
    .object({
      productGoal: z.string().min(10, "What does the product aim to achieve?"),
      businessGoal: z
        .string()
        .min(10, "What does the business aim to achieve?"),
    })
    .strict(),
  metrics: z
    .object({
      successMetrics: z
        .string()
        .min(5, "How will success be measured? (optional)"),
      nonGoals: z.string().min(5, "What is explicitly out of scope? (optional)"),
    })
    .strict(),
  constraints: z
    .object({
      constraints: z
        .string()
        .min(5, "What are the technical/legal/timeline constraints? (optional)"),
      assumptions: z
        .string()
        .min(5, "What assumptions are being made? (optional)"),
    })
    .strict(),
});

export type IntakeData = z.infer<typeof intakeSchema>;

export const emptyIntake: IntakeData = {
  problem: { title: "", pain: "", audience: "" },
  users: { personas: "", jobsToBeDone: "" },
  goals: { productGoal: "", businessGoal: "" },
  metrics: { successMetrics: "", nonGoals: "" },
  constraints: { constraints: "", assumptions: "" },
};
