import { sendReviewRequestEmail, sendReviewDecisionEmail } from "@/lib/email/resend";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

type Action = "submit" | "approve" | "reject";

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
    const action = body?.action as Action;
    if (!["submit", "approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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

    // Only ADMIN/OWNER can approve or reject; any member can submit
    if ((action === "approve" || action === "reject") && membership.role === "MEMBER") {
      return NextResponse.json({ error: "Only admins can approve" }, { status: 403 });
    }

    const nextStatus: Record<Action, string> = {
      submit: "in_review",
      approve: "approved",
      reject: "draft",
    };

    const updated = await prisma.prd.update({
      where: { id: prd.id },
      data: { status: nextStatus[action] },
      include: {
        currentVersion: true,
      }
    });

    // Notify users
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const docUrl = `${origin}/projects/${prd.project.id}`;
    const docType = prd.docType;

    if (action === "submit") {
      // Find admins/owners to notify
      const admins = await prisma.membership.findMany({
        where: { 
          workspaceId: prd.project.workspaceId,
          role: { in: ["OWNER", "ADMIN"] } 
        },
        include: { user: true }
      });
      
      const toEmails = admins.map(m => m.user.email);
      if (toEmails.length > 0) {
        await sendReviewRequestEmail(toEmails, docType, prd.project.name, user.email || "A team member", docUrl);
      }
    } else if (action === "approve" || action === "reject") {
      // Notify the person who submitted it (the creator of the current version)
      if (updated.currentVersion) {
        const creator = await prisma.user.findUnique({
          where: { id: updated.currentVersion.createdBy }
        });
        
        if (creator && creator.email) {
          await sendReviewDecisionEmail(
            [creator.email], 
            docType, 
            prd.project.name, 
            user.email || "An admin", 
            action === "approve" ? "approved" : "rejected", 
            docUrl
          );
        }
      }
    }

    return NextResponse.json({ status: updated.status });
  } catch (e) {
    console.error("review action error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
