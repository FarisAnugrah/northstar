import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { intakeSchema } from "@/lib/intake-schema";

const bodySchema = z.object({
  projectId: z.string().uuid(),
  intake: intakeSchema,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const { projectId, intake } = parsed.data;

    // Find the workspace for this project, verify membership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: project.workspaceId } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.intake.upsert({
      where: { projectId },
      create: { projectId, payload: intake as object },
      update: { payload: intake as object },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("save intake error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
