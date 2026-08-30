"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/lib/auth";
import { intakeSchema } from "@/lib/intake-schema";

const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  industry: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export async function createProject(formData: FormData) {
  const { user, workspace } = await requireWorkspace();

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(", ") ||
        "Invalid project data",
    );
  }

  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      industry: parsed.data.industry ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      action: "project.created",
      meta: { projectId: project.id, name: project.name },
    },
  });

  redirect(`/projects/${project.id}`);
}

export async function saveIntake(projectId: string, data: unknown) {
  const { user, workspace } = await requireWorkspace();

  // Verify project belongs to this workspace
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: workspace.id },
  });
  if (!project) throw new Error("Project not found");

  const parsed = intakeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(", ") ||
        "Invalid intake data",
    );
  }

  await prisma.intake.upsert({
    where: { projectId },
    create: {
      projectId,
      payload: parsed.data as object,
    },
    update: {
      payload: parsed.data as object,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      action: "intake.saved",
      meta: { projectId },
    },
  });

  return { ok: true };
}
