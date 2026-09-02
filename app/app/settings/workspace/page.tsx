import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { BillingPanel } from "./billing-panel";

export default async function WorkspaceSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    include: { subscription: true, members: { include: { user: true } } },
  });

  if (!workspace) {
    redirect("/dashboard");
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your workspace, billing, and team members.
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-surface border rounded-xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Workspace Name</label>
              <div className="mt-1 flex gap-4">
                <input 
                  type="text" 
                  defaultValue={workspace.name} 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm max-w-sm opacity-50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Workspace renaming is coming soon.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <span className="text-sm text-muted-foreground bg-accent-violet/10 text-accent-violet px-2 py-1 rounded-md">
              {workspace.members.length} / {workspace.plan === "FREE" ? "1" : workspace.plan === "PRO" ? "5" : "Unlimited"} seats
            </span>
          </div>
          
          <div className="space-y-4 mt-6">
            {workspace.members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                    {m.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{m.role.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <BillingPanel 
          workspaceId={workspace.id} 
          currentPlan={workspace.plan} 
          subscription={workspace.subscription} 
        />
      </div>
    </div>
  );
}
