import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { intakeSchema } from "@/lib/intake-schema";
import { generatePrdStream } from "@/lib/pipeline";

import { DocType } from "@prisma/client";

const querySchema = z.object({
  projectId: z.string().uuid(),
  docType: z.enum(["BRD", "PCR", "PRD", "SRS", "FSD", "TSD"]).default("PRD"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    projectId: searchParams.get("projectId"),
    docType: searchParams.get("docType") || "PRD",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }
  const { projectId, docType } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify project + membership + intake
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true, intake: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: project.workspaceId,
      },
    },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!project.intake) {
    return NextResponse.json(
      { error: "Fill in the intake first" },
      { status: 400 },
    );
  }

  const intake = intakeSchema.parse(project.intake.payload);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      try {
        const gen = generatePrdStream({ projectId, userId: user.id, intake, docType: docType as any });
        for await (const event of gen) {
          send(event);
          if (event.type === "done" || event.type === "error") break;
        }
      } catch (e) {
        send({
          type: "error",
          message: e instanceof Error ? e.message : "Generation failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
