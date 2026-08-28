import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      memberships: {
        include: { workspace: true },
      },
    },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireWorkspace() {
  const user = await requireUser();
  const membership = user.memberships[0];
  if (!membership) redirect("/onboarding");
  return { user, workspace: membership.workspace, role: membership.role };
}
