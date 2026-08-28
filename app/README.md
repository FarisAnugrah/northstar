# Northstar — AI Spec Generator

Your north star for product specs. AI-powered generator for BRD, PRD, SRS, FSD, TSD documents. Phase 0 bootstrap.

## Stack
- **Next.js 14** (App Router, Server Actions)
- **Supabase** (Auth + Postgres + Storage)
- **Prisma** (ORM)
- **Tiptap** (Editor, phase 4)
- **Stripe** (Billing, phase 5)
- **Claude + OpenAI** (LLM, phase 3)

## Setup

### 1. Install deps
```bash
cd app
npm install
```

### 2. Setup Supabase
1. Create project di [supabase.com](https://supabase.com)
2. Copy `Project URL` + `anon key` + `service_role key`
3. Copy database connection string (Settings → Database → Connection string)

### 3. Setup env
```bash
cp .env.example .env.local
# Isi semua value dari Supabase + LLM keys + Stripe
```

### 4. Run migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Enable RLS (di Supabase SQL editor)
Jalankan SQL di `prisma/rls.sql` (akan dibuat di phase 0.6).

### 6. Run dev
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Phase Status

- [x] **0. Bootstrap** — Next.js + Prisma + Supabase setup
- [ ] **1. Auth + Workspace** — basic flow
- [ ] **2. Project + Intake**
- [ ] **3. AI Generation Pipeline**
- [ ] **4. Tiptap Editor + Version**
- [ ] **5. Stripe Subscription**
- [ ] **6. Export PDF/DOCX**
- [ ] **7. Comment + Review**
- [ ] **8. Soft Launch**

Lihat detail di `../docs/architecture/14-implementation-timeline.md`.

## File Structure
```
app/
├── app/
│   ├── page.tsx              # landing
│   ├── login/                # magic link login
│   ├── signup/               # signup
│   ├── callback/route.ts     # Supabase OAuth callback
│   ├── onboarding/           # create first workspace
│   └── dashboard/            # protected, list projects
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # session helpers
│   └── supabase/
│       ├── server.ts         # server client
│       └── client.ts         # browser client
├── prisma/
│   └── schema.prisma         # DB schema
├── middleware.ts             # Supabase session refresh
└── .env.example
```

## Verification (Phase 0)

✅ `npm run dev` jalan tanpa error
✅ `npm run prisma:generate` sukses
✅ Supabase project connected
✅ `/` render landing page
✅ `/login` bisa kirim magic link
✅ `/signup` bisa create user
✅ `/callback` handle OAuth redirect
✅ `/onboarding` create workspace
✅ `/dashboard` list projects (kosong untuk user baru)

Lanjut ke Phase 1 (Project CRUD + Intake form) setelah ini pass.
