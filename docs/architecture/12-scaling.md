# 12 — Scaling Strategy (High Traffic)

```mermaid
flowchart TB
  subgraph Edge[Edge Layer]
    CDN[Vercel CDN<br/>static + ISR]
    RateLimit[Upstash Rate Limit<br/>token bucket per IP+user]
  end

  subgraph API[API Layer]
    LB[Serverless autoscaling<br/>Vercel functions]
    Queue[Upstash Redis Queue<br/>delayed jobs + retry]
    DLQ[Dead Letter Queue<br/>after 3 retries]
  end

  subgraph Worker[Worker Layer]
    W1[Worker 1<br/>Fly.io / Railway]
    W2[Worker 2]
    W3[Worker N<br/>horizontal autoscale]
  end

  subgraph Cache[Cache Layer]
    R1[Redis Hot<br/>sessions, rate, locks]
    R2[Redis Warm<br/>workspace meta, templates]
  end

  subgraph DB[Data Layer]
    PGPrimary[(Postgres Primary<br/>writes)]
    PGRead[(Read Replica 1)]
    PGRead2[(Read Replica 2)]
    Conn[PgBouncer<br/>connection pool]
  end

  User --> CDN
  CDN --> RateLimit
  RateLimit --> LB
  LB --> Queue
  LB --> R1
  LB --> R2
  Queue --> W1
  Queue --> W2
  Queue --> W3
  W1 --> Conn
  Conn --> PGPrimary
  PGPrimary --> PGRead
  PGPrimary --> PGRead2
  W1 --> LLM[LLM with<br/>circuit breaker]
  W1 -->|failed 3x| DLQ
  DLQ --> Alert[PagerDuty / Slack]
```

## Bottlenecks & Mitigations

| Bottleneck | Symptom | Mitigation |
|---|---|---|
| LLM rate limit | 429 from Anthropic/OpenAI | Provider-level queue + per-key concurrency cap; user-facing backoff with exponential retry |
| Postgres connections | `too many connections` | PgBouncer pool, max 100 conn/function instance |
| Editor concurrent edit | Lost writes | Postgres advisory lock per `prd_version` + last-write-wins on section |
| Export job slow | PDF gen > 30s | Move to worker, stream result via SSE + signed URL |
| Stripe webhook spike | Race conditions | Idempotency key = `event.id`, dedupe table |
| Cold start | Latency spike | Vercel Fluid Compute / keep-warm ping every 4 min |

## Cost Ceilings (rule of thumb)
- **< 1k users**: free tier semua service di atas cukup.
- **1k–10k users**: tambah 1 Postgres read replica, naikin worker ke 2 instance.
- **10k+ users**: pindah queue ke AWS SQS, Postgres ke Aurora, pertimbangkan multi-region.
