"use client";

import { useState } from "react";
import { Plan } from "@prisma/client";

interface BillingPanelProps {
  workspaceId: string;
  currentPlan: Plan;
  subscription: any; // Using any for simplicity here to avoid deep importing Prisma types
}

const PLANS = [
  {
    id: "price_fake_pro_monthly", // You'd replace this with real Stripe Price ID
    name: "Pro",
    description: "For small teams starting up",
    price: "$29",
    features: ["Up to 5 team members", "Unlimited AI generations", "PDF & DOCX Export"],
    targetPlan: Plan.PRO,
  },
  {
    id: "price_fake_team_monthly", 
    name: "Team",
    description: "For growing organizations",
    price: "$99",
    features: ["Unlimited team members", "Unlimited AI generations", "Priority support"],
    targetPlan: Plan.TEAM,
  }
];

export function BillingPanel({ workspaceId, currentPlan, subscription }: BillingPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="bg-surface border rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Billing & Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You are currently on the <span className="font-semibold text-foreground">{currentPlan}</span> plan.
          </p>
        </div>
        {subscription?.stripeCustomerId && (
          <button
            onClick={handlePortal}
            disabled={!!loading}
            className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 disabled:opacity-50"
          >
            {loading === "portal" ? "Loading..." : "Manage Billing"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.targetPlan;
          
          return (
            <div 
              key={plan.id} 
              className={`border rounded-xl p-6 flex flex-col ${
                isCurrentPlan ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background"
              }`}
            >
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 flex-grow mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={isCurrentPlan || !!loading}
                className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                  isCurrentPlan 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                } disabled:opacity-50`}
              >
                {loading === plan.id ? "Loading..." : isCurrentPlan ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
