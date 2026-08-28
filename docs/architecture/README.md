# Architecture Docs — Northstar

Visual architecture & flow diagrams untuk Northstar, AI spec generator (BRD/PCR/PRD/SRS/FSD/TSD).

## Stack
- **Frontend + API**: Next.js (App Router, Edge + Node runtime)
- **DB / Auth / Storage**: Supabase (Postgres + RLS + GoTrue + S3)
- **Queue**: Upstash Redis (MVP) → AWS SQS (scale)
- **Worker**: Node/Python, Fly.io / Railway
- **LLM**: Anthropic Claude + OpenAI (multi-provider)
- **Billing**: Stripe
- **Email**: Resend

## Diagrams

| # | File | Topic |
|---|---|---|
| 00 | [00-index.md](00-index.md) | Mindmap index |
| 01 | [01-context.md](01-context.md) | System context (C4 L1) |
| 02 | [02-architecture.md](02-architecture.md) | High-level architecture |
| 03 | [03-user-flow.md](03-user-flow.md) | User journey |
| 04 | [04-prd-lifecycle.md](04-prd-lifecycle.md) | PRD state machine |
| 05 | [05-data-model.md](05-data-model.md) | ERD + notes |
| 06 | [06-ai-pipeline.md](06-ai-pipeline.md) | AI generation flow |
| 07 | [07-sequence-generate.md](07-sequence-generate.md) | Sequence: generate PRD |
| 08 | [08-sequence-edit.md](08-sequence-edit.md) | Sequence: edit + version |
| 09 | [09-billing-flow.md](09-billing-flow.md) | Stripe subscription flow |
| 10 | [10-deployment.md](10-deployment.md) | Deployment topology |
| 11 | [11-roadmap.md](11-roadmap.md) | Development roadmap |
| 12 | [12-scaling.md](12-scaling.md) | Scaling strategy + bottlenecks |
| 13 | [13-subscription.md](13-subscription.md) | Subscription state + edge cases |
| 14 | [14-implementation-timeline.md](14-implementation-timeline.md) | Urutan build, estimasi, verifikasi per phase |
| 15 | [15-beta-launch-strategy.md](15-beta-launch-strategy.md) | Strategi beta gratis → validasi → launch paid |
| 16 | [16-positioning.md](16-positioning.md) | Positioning, diferensiasi vs ChatGPT/Notion, ICP, messaging |
| 17 | [17-project-backlog.md](17-project-backlog.md) | Ide project selanjutnya (pivot, adjacent, wildcards) |
| 18 | [18-git-workflow.md](18-git-workflow.md) | Branch protection, commit convention, GitHub setup |

## How to View
- **GitHub**: render otomatis.
- **VSCode**: install extension `bierner.markdown-mermaid` (atau `Markdown Preview Mermaid Support`).
- **Web**: paste ke [mermaid.live](https://mermaid.live) untuk export PNG/SVG.

## Conventions
- Semua diagram dibungkus di code block ` ```mermaid `.
- Naming: `NN-topic.md` (NN = urutan, 2 digit).
- High-traffic & subscription concerns: lihat [12-scaling.md](12-scaling.md) & [13-subscription.md](13-subscription.md).
