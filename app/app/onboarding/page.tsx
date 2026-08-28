import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await requireUser();
  const existingMembership = await prisma.membership.findFirst({
    where: { userId: user.id },
  });
  if (existingMembership) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Welcome!</h1>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Let&apos;s set up your workspace.
        </p>
        <OnboardingForm defaultName={user.name ?? ""} />
      </div>
    </main>
  );
}
