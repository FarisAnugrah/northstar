import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

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
    const body = await request.json().catch(() => ({}));
    const versionNo = Number(body?.versionNo);
    if (!Number.isInteger(versionNo) || versionNo < 1) {
      return NextResponse.json({ error: "Invalid versionNo" }, { status: 400 });
    }

    const prd = await prisma.prd.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!prd) return NextResponse.json({ error: "PRD not found" }, { status: 404 });

    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: prd.project.workspaceId } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const target = await prisma.prdVersion.findFirst({
      where: { prdId: prd.id, versionNo },
      include: { sections: true },
    });
    if (!target) return NextResponse.json({ error: "Version not found" }, { status: 404 });

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
            create: target.sections.map((s) => ({
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
    console.error("rollback error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
