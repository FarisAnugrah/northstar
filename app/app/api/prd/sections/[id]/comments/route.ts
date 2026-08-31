import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  body: z.string().min(1).max(2000),
});

async function requireSectionAccess(userId: string, sectionId: string) {
  const section = await prisma.prdSection.findUnique({
    where: { id: sectionId },
    include: {
      version: { include: { prd: { include: { project: { include: { workspace: true } } } } } },
    },
  });
  if (!section) return { section: null, error: "Section not found", status: 404 };
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: userId,
        workspaceId: section.version.prd.project.workspaceId,
      },
    },
  });
  if (!membership) return { section: null, error: "Forbidden", status: 403 };
  return { section, error: null, status: 200 };
}

export async function GET(
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
    const access = await requireSectionAccess(user.id, id);
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });

    const comments = await prisma.comment.findMany({
      where: { sectionId: id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ comments });
  } catch (e) {
    console.error("list comments error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(
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
    if (!parsed.success) return NextResponse.json({ error: "Invalid comment" }, { status: 400 });

    const access = await requireSectionAccess(user.id, id);
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });

    const comment = await prisma.comment.create({
      data: {
        versionId: access.section!.versionId,
        sectionId: id,
        userId: user.id,
        body: parsed.data.body,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ comment });
  } catch (e) {
    console.error("create comment error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
