# 01 — System Context (C4 Level 1)

```mermaid
flowchart LR
  PM[Product Manager] -->|creates/edits PRDs| WebApp
  BA[Business Analyst] -->|reviews/refines| WebApp
  Admin[Workspace Admin] -->|manages billing/members| WebApp
  WebApp[SaaS Web App<br/>Next.js + Supabase]
  WebApp -->|payments| Stripe[Stripe]
  WebApp -->|auth emails| Email[Email Service<br/>Resend/SES]
  WebApp -->|LLM inference| LLM[LLM Providers<br/>Claude + OpenAI]
  WebApp -->|object storage| Storage[(S3-compatible)]
```
