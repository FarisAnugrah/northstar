import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  content: z.string().max(50000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    // Load section + verify access through project/workspace
    const section = await prisma.prdSection.findUnique({
      where: { id },
      include: {
        version: {
          include: {
            prd: { include: { project: { include: { workspace: true } } } },
          },
        },
      },
    });
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: section.version.prd.project.workspaceId,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.prdSection.update({
      where: { id },
      data: { content: parsed.data.content },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("update section error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
