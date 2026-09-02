import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Northstar.",
    features: [
      "1 workspace",
      "Up to 3 projects",
      "Standard AI generation (Claude 3 Haiku)",
      "Basic export (Markdown)",
    ],
    cta: "Get Started Free",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For small teams and individual PMs.",
    features: [
      "Everything in Free",
      "Unlimited projects",
      "Advanced AI generation (Claude 3.5 Sonnet)",
      "PDF & DOCX Exports",
      "Up to 5 team members",
    ],
    cta: "Start Pro Trial",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$99",
    period: "/mo",
    description: "For product organizations scaling up.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Custom branding for exports",
      "Priority email support",
      "Custom intake templates",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@northstar.ai",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your team&apos;s needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 flex flex-col bg-surface border ${
                plan.highlight 
                  ? "border-primary shadow-lg ring-1 ring-primary" 
                  : "border-border shadow-soft"
              }`}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground h-12">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <Check className="h-5 w-5 text-accent-emerald shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-colors ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lift"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
