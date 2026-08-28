"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  workspaceName: z.string().min(2).max(50),
});

export async function createWorkspace(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    workspaceName: formData.get("workspaceName"),
  });
  if (!parsed.success) {
    throw new Error("Invalid workspace name");
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.workspaceName,
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
      subscription: {
        create: { status: "active", plan: "FREE" },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      action: "workspace.created",
      meta: { name: workspace.name },
    },
  });

  redirect("/dashboard");
}
