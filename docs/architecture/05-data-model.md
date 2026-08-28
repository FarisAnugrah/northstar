# 05 — Data Model (ERD)

```mermaid
erDiagram
  WORKSPACE ||--o{ PROJECT : has
  WORKSPACE ||--|| SUBSCRIPTION : has
  WORKSPACE ||--o{ MEMBER : has
  USER ||--o{ MEMBER : joins
  PROJECT ||--o{ PRD : contains
  PROJECT ||--|| INTAKE : has
  PRD ||--o{ PRD_VERSION : versions
  PRD_VERSION ||--o{ PRD_SECTION : contains
  PRD_VERSION ||--o{ COMMENT : receives
  USER ||--o{ COMMENT : writes
  USER ||--o{ AUDIT_LOG : triggers

  WORKSPACE {
    uuid id PK
    string name
    uuid owner_id FK
    string plan
    string stripe_customer_id
    timestamp created_at
  }
  PROJECT {
    uuid id PK
    uuid workspace_id FK
    string name
    string industry
    string status
  }
  PRD {
    uuid id PK
    uuid project_id FK
    uuid current_version_id FK
    string status
  }
  PRD_VERSION {
    uuid id PK
    uuid prd_id FK
    int version_no
    jsonb content
    uuid created_by FK
    timestamp created_at
  }
  PRD_SECTION {
    uuid id PK
    uuid version_id FK
    string key
    text content
    int order_idx
  }
  INTAKE {
    uuid id PK
    uuid project_id FK
    jsonb payload
  }
  COMMENT {
    uuid id PK
    uuid version_id FK
    uuid section_id FK
    uuid user_id FK
    text body
  }
  SUBSCRIPTION {
    uuid id PK
    uuid workspace_id FK
    string stripe_sub_id
    string status
    timestamp current_period_end
  }
  MEMBER {
    uuid user_id FK
    uuid workspace_id FK
    string role
  }
  AUDIT_LOG {
    uuid id PK
    uuid user_id FK
    string action
    jsonb meta
    timestamp created_at
  }
```

## Notes
- **RLS (Row Level Security)** enabled on every table; policy = `workspace_id = auth.jwt()->>'workspace_id'`.
- `prd_versions.content` is a `jsonb` snapshot — enables diff & rollback without parsing Tiptap JSON.
- `audit_log` is append-only (no UPDATE/DELETE policy) for compliance.
- Indexes: `prds(project_id)`, `prd_versions(prd_id, version_no DESC)`, `comments(version_id)`, `subscriptions(stripe_sub_id)`.
