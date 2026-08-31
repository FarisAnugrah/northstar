import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    // Ensure the requesting user can only create their own row
    if (parsed.data.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.user.upsert({
      where: { id: parsed.data.userId },
      create: {
        id: parsed.data.userId,
        email: parsed.data.email,
        name: user.user_metadata?.name ?? null,
      },
      update: {
        email: parsed.data.email,
        name: user.user_metadata?.name ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("create user error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
