import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

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
    const prd = await prisma.prd.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!prd) return NextResponse.json({ error: "PRD not found" }, { status: 404 });

    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: prd.project.workspaceId } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const versions = await prisma.prdVersion.findMany({
      where: { prdId: prd.id },
      orderBy: { versionNo: "desc" },
      select: {
        id: true,
        versionNo: true,
        createdAt: true,
        createdBy: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (e) {
    console.error("list versions error", e);
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
    const prd = await prisma.prd.findUnique({
      where: { id },
      include: {
        project: true,
        currentVersion: { include: { sections: true } },
      },
    });
    if (!prd) return NextResponse.json({ error: "PRD not found" }, { status: 404 });

    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: prd.project.workspaceId } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!prd.currentVersion) {
      return NextResponse.json({ error: "No current version to snapshot" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const last = await tx.prdVersion.findFirst({
        where: { prdId: prd.id },
        orderBy: { versionNo: "desc" },
      });
      const nextNo = (last?.versionNo ?? 0) + 1;

      const version = await tx.prdVersion.create({
        data: {
          prdId: prd.id,
          versionNo: nextNo,
          content: {},
          createdBy: user.id,
          sections: {
            create: prd.currentVersion!.sections.map((s) => ({
              key: s.key,
              content: s.content,
              orderIdx: s.orderIdx,
            })),
          },
        },
      });

      await tx.prd.update({
        where: { id: prd.id },
        data: { currentVersionId: version.id },
      });

      return version;
    });

    return NextResponse.json({ id: result.id, versionNo: result.versionNo });
  } catch (e) {
    console.error("save version error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
