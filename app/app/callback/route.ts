import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Upsert user into DB
        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name ?? null,
          },
          update: {
            email: user.email!,
            name: user.user_metadata?.name ?? null,
          },
        });

        // If user has no workspace yet, send them to onboarding
        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
        });
        const target = membership ? next : "/onboarding";

        return NextResponse.redirect(`${origin}${target}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
