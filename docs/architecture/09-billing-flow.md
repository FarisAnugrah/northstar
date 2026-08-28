# 09 — Billing Flow (Stripe Subscription)

```mermaid
flowchart TD
  A[User pilih Plan] --> B[POST /billing/checkout]
  B --> C[Stripe Checkout Session]
  C --> D{Payment success?}
  D -->|No| E[Show error, return to pricing]
  D -->|Yes| F[Stripe Webhook:<br/>customer.subscription.created]
  F --> G[Verify signature]
  G -->|Invalid| H[Drop + log]
  G -->|Valid| I[Upsert subscriptions row<br/>status=active]
  I --> J[Update workspace.plan]
  J --> K[Send welcome email]
  K --> L[Redirect to dashboard]

  M[Stripe Webhook:<br/>invoice.payment_failed] --> N[subscriptions.status = past_due]
  N --> O[Notify workspace owner<br/>3-day grace]
  O --> P{Day 4 paid?}
  P -->|Yes| Q[Restore active]
  P -->|No| R[subscriptions.status = canceled]
  R --> S[Downgrade to free<br/>read-only access]
```

## Seat Enforcement
- Each `MEMBER` row counts as 1 seat.
- On `member.created` event: if `count(workspace.seats) > workspace.plan.max_seats` → reject with 402.
- Webhook `customer.subscription.updated` re-syncs `plan.max_seats`.
