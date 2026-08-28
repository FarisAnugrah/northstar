# 14 — Implementation Timeline

Urutan eksekusi build, dari fondasi sampai scale. Setiap fase punya **deliverable konkret** + **verifikasi** sebelum lanjut.

---

## Phase 0 — Project Bootstrap (1–2 hari)

**Tujuan**: Repo jalan, infra terkoneksi, schema applied.

| # | Task | Deliverable |
|---|---|---|
| 0.1 | `create-next-app` + TypeScript + Tailwind + ESLint | Repo Next.js 14 App Router |
| 0.2 | Install deps: `prisma`, `@prisma/client`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `stripe` | `package.json` updated |
| 0.3 | Setup Supabase project (cloud), copy URL + keys ke `.env.local` | `.env.local` lengkap |
| 0.4 | Init Prisma: `prisma init`, tulis `schema.prisma` (lihat `05-data-model.md`) | `prisma/schema.prisma` |
| 0.5 | `prisma migrate dev --name init` | Tables created di Supabase |
| 0.6 | Enable RLS: raw SQL di Supabase SQL editor (lihat snippet di bawah) | RLS aktif di semua table |
| 0.7 | Init shadcn/ui: `npx shadcn@latest init` | `components/ui/` ready |
| 0.8 | Bikin `lib/db.ts` (Prisma singleton), `lib/supabase/server.ts`, `lib/supabase/client.ts` | Helpers siap |
| 0.9 | `middleware.ts` untuk refresh Supabase session | Protected routes works |

**Verifikasi**: `npm run dev` → buka `/` → login pakai magic link → row `users` terbuat.

**RLS snippet** (jalankan di Supabase SQL editor):
```sql
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ... ulangi untuk semua table
-- Policy: user hanya bisa akses workspace mereka
CREATE POLICY "workspace_isolation" ON projects
  USING (workspace_id = current_setting('app.current_workspace_id', true)::uuid);
```

---

## Phase 1 — Auth + Workspace (3–4 hari)

**Tujuan**: User bisa signup, create workspace, invite member (basic).

| # | Task | Deliverable |
|---|---|---|
| 1.1 | `/signup` page + server action (email + password via Supabase Auth) | User row created |
| 1.2 | `/login` page + callback handler | Session cookie set |
| 1.3 | Auto-create `Workspace` + `Membership(role=OWNER)` saat first signup | Onboarding mulus |
| 1.4 | `/(app)/dashboard` — protected layout, list workspaces | Protected route works |
| 1.5 | `/(app)/settings/workspace` — rename, lihat members | Settings page |
| 1.6 | Invite member (email input, send magic link via Supabase) | Member rows bertambah |
| 1.7 | Switch workspace (kalau user是多 workspace) | Workspace context switching |

**Verifikasi**:
- Signup user A → workspace A created otomatis.
- Invite user B sebagai MEMBER → B lihat workspace A.
- Logout → cookie cleared, protected route redirect ke `/login`.

**Skipped** (tambah nanti): role permission matrix detail, audit log UI.

---

## Phase 2 — Project + Intake (3–4 hari)

**Tujuan**: User bisa buat project, isi intake form.

| # | Task | Deliverable |
|---|---|---|
| 2.1 | `/(app)/projects` — list project dalam workspace | Project list UI |
| 2.2 | `/(app)/projects/new` — form: name, industry, description | Project row created |
| 2.3 | `/(app)/projects/[id]` — detail page dengan tab: Overview / Intake / PRD | Tab navigation |
| 2.4 | Multi-step intake form (5 steps: Problem, Users, Goals, Metrics, Constraints) | Form dengan progress bar |
| 2.5 | Simpan intake sebagai `Json` di `intakes.payload` | Intake persisted |
| 2.6 | Validasi pakai `zod` schema | Invalid input → error message |
| 2.7 | Edit intake (sampai PRD digenerate) | Intake bisa diupdate |

**Verifikasi**:
- Create project → isi intake lengkap → row `intakes` punya payload JSON valid.
- Reload page → intake masih ada.

**Skipped**: intake template variants per industry (add saat Phase 5).

---

## Phase 3 — AI Generation Pipeline (5–7 hari)

**Tujuan**: AI bisa generate PRD sections dari intake.

| # | Task | Deliverable |
|---|---|---|
| 3.1 | Setup Upstash Redis + queue abstraction (`lib/queue.ts`) | Queue ready |
| 3.2 | Setup LLM client abstraction (`lib/llm/index.ts`): `generateSection(prompt, provider)` | Multi-provider support |
| 3.3 | Prompt templates per section key (8 sections lihat `06-ai-pipeline.md`) | `lib/prompts/*.ts` |
| 3.4 | Worker process: pull job, call LLM per section, save ke `prd_sections` | Worker running |
| 3.5 | `POST /api/prd/generate` → enqueue job, return 202 + jobId | API endpoint |
| 3.6 | SSE endpoint `GET /api/prd/[id]/stream` → push section-ready events | Real-time UI update |
| 3.7 | `Prd` row created, `currentVersionId` di-set setelah first section ready | DB state correct |
| 3.8 | Error handling: retry max 3x per section, DLQ untuk failed jobs | Robust pipeline |
| 3.9 | Rate limit: max 5 concurrent LLM call per workspace | Prevent abuse |

**Verifikasi**:
- Submit intake → click Generate → dalam ~30s, 8 sections muncul satu per satu di UI (SSE).
- Inspect DB: `prd.status = ready`, 8 rows di `prd_sections`.
- Inject error di LLM call → retry jalan, lalu DLQ.

**Cost guard**: log token usage per job, alert kalau > budget.

---

## Phase 4 — Tiptap Editor + Version (4–5 hari)

**Tujuan**: User bisa edit PRD, save version, rollback.

| # | Task | Deliverable |
|---|---|---|
| 4.1 | Install Tiptap, basic starter kit | Editor mounts |
| 4.2 | Bind Tiptap content per section (load from `prd_sections`) | Initial content renders |
| 4.3 | Autosave (debounce 1.5s) → `PATCH /api/sections/[id]` | Edits persisted |
| 4.4 | "Save Version" button → `POST /api/prd/[id]/versions` → snapshot | Version history grows |
| 4.5 | Version list panel: lihat v1, v2, v3, ... + diff preview | History UI |
| 4.6 | Rollback action → clone sections dari old version ke new version | Rollback works |
| 4.7 | Section regenerate (per-section AI re-run) | Regenerate button works |
| 4.8 | Postgres advisory lock untuk concurrent edit safety | No lost writes |

**Verifikasi**:
- Edit section → tutup browser → buka lagi → edit masih ada.
- Save 3 versions → rollback ke v1 → new version v4 created dengan content v1.
- 2 browser edit same section bersamaan → second save ditolak / merged dengan last-write-wins policy.

**Skipped**: real-time collaborative editing (Y.js/CRDT) — add saat scale phase.

---

## Phase 5 — Stripe Subscription (3–4 hari)

**Tujuan**: Monetisasi aktif, seat enforcement jalan.

| # | Task | Deliverable |
|---|---|---|
| 5.1 | Stripe products + prices setup (FREE, PRO, TEAM) | Dashboard configured |
| 5.2 | `POST /api/billing/checkout` → Stripe Checkout Session | Redirect works |
| 5.3 | Webhook handler: `customer.subscription.created/updated/deleted` | DB sync |
| 5.4 | Plan gating middleware: check `workspace.plan` untuk fitur premium | Gating works |
| 5.5 | Seat enforcement: block `Membership` create kalau over limit | 402 returned |
| 5.6 | Billing portal link (`POST /api/billing/portal`) | User manage sendiri |
| 5.7 | Grace period: 4 hari untuk `past_due` | Read-only + email |
| 5.8 | Webhook idempotency table (event.id sebagai PK) | No double-charge |

**Verifikasi**:
- User upgrade ke PRO → `subscriptions.status = active` dalam 5s.
- Tambah 6th member di PRO plan (limit 5) → 402 error.
- Stripe CLI: `stripe trigger invoice.payment_failed` → workspace jadi `past_due`, email terkirim.

**Test mode dulu**, jangan production keys sampai Phase 5 selesai.

---

## Phase 6 — Export PDF/DOCX (2–3 hari)

**Tujuan**: User bisa download PRD.

| # | Task | Deliverable |
|---|---|---|
| 6.1 | Markdown export (simple, just concat sections) | `.md` download |
| 6.2 | PDF export (puppeteer / @react-pdf/renderer) | `.pdf` download |
| 6.3 | DOCX export (`docx` npm package) | `.docx` download |
| 6.4 | Export job di-worker (kalau > 5s) — non-blocking | No UI freeze |
| 6.5 | Signed URL untuk download (Supabase Storage) | Secure download |

**Verifikasi**:
- Export PRD v3 ke PDF → file downloaded, content lengkap dengan formatting.

**Skipped**: branded export template (logo, header/footer) — polish nanti.

---

## Phase 7 — Comment + Review (2–3 hari)

**Tujuan**: Kolaborasi dasar.

| # | Task | Deliverable |
|---|---|---|
| 7.1 | Comment thread per section | UI works |
| 7.2 | `@mention` member (basic, no real-time yet) | Notification triggered |
| 7.3 | Submit for review → `prd.status = in_review` | State transition works |
| 7.4 | Reviewer approve/reject → state transition | Approval flow |
| 7.5 | Email notification (Resend) untuk review request + decision | Email terkirim |

**Verifikasi**:
- User A submit review → User B dapat email → approve → User A dapat email.

---

## Phase 8 — Soft Launch (ongoing)

**Tujuan**: Real users, real feedback.

| # | Task | Deliverable |
|---|---|---|
| 8.1 | Landing page + pricing page | Marketing site |
| 8.2 | Onboarding tour (3 steps in-app) | First-time UX |
| 8.3 | Error monitoring (Sentry) | Errors caught |
| 8.4 | Analytics (PostHog / Plausible) | Behavior tracked |
| 8.5 | Privacy policy + Terms of Service | Legal compliance |
| 8.6 | Beta cohort: 20 users, manual feedback | Insights collected |

**Definition of Done untuk Phase 8**:
- 1 PRD generated end-to-end tanpa error.
- 1 paid conversion.
- NPS > 30 dari beta users.

---

## Phase 9 — Scale Prep (post-launch, +30 hari)

**Tujuan**: Siap untuk 10x traffic.

| # | Task | Kapan |
|---|---|---|
| 9.1 | PgBouncer setup (kalau belum) | Saat connection errors naik |
| 9.2 | Read replica untuk dashboard | Saat DB CPU > 70% |
| 9.3 | Worker autoscale (Fly.io machines) | Saat queue lag > 1 menit |
| 9.4 | LLM circuit breaker | Saat ada 1 provider outage |
| 9.5 | CDN cache invalidation strategy | Saat ISR mulai sering stale |
| 9.6 | Stripe Tax enable | Saat go international |
| 9.7 | Background job: export jobs ke dedicated queue | Saat PDF gen mulai block API |

---

## Tambah Jenis Dokumen (Phase 10+)

Setelah PRD stabil, ulangi pattern untuk BRD → SRS → FSD → TSD.

| Doc | Kompleksitas | Notes |
|---|---|---|
| BRD | Medium | Mirip PRD tapi business-focused |
| SRS | Medium | Technical requirements |
| FSD | High | Functional spec detail per feature |
| TSD | High | Technical spec, butuh diagram integration |

Document chain (BRD → PRD → FSD → TSD) = feature tambahan, bukan duplicate.

---

## Total Estimasi

| Phase | Days | Cumulative |
|---|---|---|
| 0 Bootstrap | 1–2 | 2 |
| 1 Auth + Workspace | 3–4 | 6 |
| 2 Project + Intake | 3–4 | 10 |
| 3 AI Pipeline | 5–7 | 17 |
| 4 Editor + Version | 4–5 | 22 |
| 5 Stripe | 3–4 | 26 |
| 6 Export | 2–3 | 29 |
| 7 Comment + Review | 2–3 | 32 |
| 8 Soft Launch | ongoing | — |
| 9 Scale Prep | triggered | — |

**MVP siap launch**: ~26–32 hari kerja (1 developer full-time).

---

## Prinsip Build

1. **Setiap phase punya verifikasi** — jangan lanjut kalau belum pass.
2. **RLS aktif dari day 1** — jangan retro-fit security.
3. **AI = third-party dependency** — selalu ada retry + fallback + budget guard.
4. **Billing = last functional feature sebelum launch** — biar uang masuk sebelum scale.
5. **Export = polish** — bisa jalan tanpa perfect formatting.
6. **Collaboration = nice-to-have** — single-user flow harus sempurna dulu.

**Skipped dari timeline ini**: mobile app, offline mode, AI model fine-tuning, marketplace template, advanced analytics dashboard.
**Add when**: post-launch, based on actual user demand (not assumptions).
