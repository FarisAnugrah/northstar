import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { version: { include: { prd: { include: { project: true } } } } },
    });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: comment.version.prd.project.workspaceId,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Only author (or admin) can delete
    const isAuthor = comment.userId === user.id;
    const isAdmin = membership.role === "ADMIN" || membership.role === "OWNER";
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete comment error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
