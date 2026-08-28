# 06 — AI Generation Pipeline

```mermaid
flowchart LR
  A[Intake Payload] --> B[Prompt Assembly<br/>template + context + history]
  B --> C{Select Provider}
  C -->|Claude| D1[Anthropic API]
  C -->|OpenAI| D2[OpenAI API]
  D1 --> E[Stream Sections]
  D2 --> E
  E --> F[Section Parser<br/>JSON schema validate]
  F --> G{Valid?}
  G -->|No| H[Retry with<br/>error feedback]
  H --> B
  G -->|Yes| I[Persist to DB<br/>prd_sections]
  I --> J[Update PRD status=ready]
  J --> K[SSE push to client]
  K --> L[Editor renders]
```

## Prompt Strategy
- One prompt per **section** (not whole PRD) → smaller context, lower cost, easier regenerate.
- Section keys: `problem`, `goals`, `users`, `success_metrics`, `requirements`, `out_of_scope`, `timeline`, `risks`.
- System prompt is static + workspace-level "voice" override.
- Temperature: `0.4` for generation, `0.2` for refinement.
