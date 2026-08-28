# 17 — Project Backlog (Setelah SaaS Doc Generator)

Ide-ide project yang bisa kamu eksekusi **setelah** SaaS AI Doc Generator stabil (atau sebagai pivot kalau doc generator nggak dapat traction).

**Prinsip backlog ini**:
- Leverage skill yang sama (AI + workflow + product sense)
- Beda problem domain supaya nggak overlap market
- Bisa berdiri sendiri sebagai side project
- Estimasi effort & impact kasar

---

## Tier 1: Pivot Alami (Paling Dekat dengan Skill Sekarang)

### A. AI Workflow Automation for Product Managers

**Problem**: PM spend 2–3 jam/hari di meeting admin, standup notes, sprint planning, action item tracking. Repetitive, low-leverage work.

**Solusi**: Tool yang:
- Capture meeting transcript (Zoom/Meet integration)
- Auto-extract action items + assignees + deadlines
- Sync ke Jira/Linear/Asana
- Generate weekly status report dari activity
- Suggest next sprint priorities based on velocity

**Kenapa menarik**:
- Pain lebih acute dari PRD generator (daily vs monthly)
- Integration moat (sulit di-replicate cuma pakai moyra/claude-sonnet-5)
- Higher willingness to pay ($49–99/mo) karena impact harian

**Effort**: 2–3 bulan MVP | **Revenue potential**: lebih tinggi dari doc generator

**Lean canvas**:
| Aspek | Detail |
|---|---|
| ICP | PM di startup Series A–C, 10–100 orang |
| Channel | Sama dengan doc generator (IH, Twitter, PM communities) |
| Pricing | $49/mo solo, $99/mo team (3 seats) |
| Tech stack | Sama persis (Next.js + Supabase + LLM) |

---

### B. AI PRD Reviewer / Quality Checker

**Problem**: Orang udah nulis PRD manual (atau pakai AI), tapi nggak tau apakah PRD-nya "bagus" atau ada section yang missing/unclear.

**Solusi**: Upload PRD existing → AI analyze → scored feedback:
- Section completeness check
- SMART criteria untuk success metrics
- Clarity score (Flesch reading ease)
- Ambiguity detection ("user" terlalu vague?)
- Suggestion konkret per section

**Kenapa menarik**:
- Complementary, bukan competitor doc generator
- Cost jauh lebih rendah (token per review << token per generate)
- Bisa kasih free tier generous (5 review/bulan)
- Bisa di-bundle dengan doc generator sebagai upsell

**Effort**: 1–1.5 bulan MVP | **Revenue potential**: moderate, tapi margin tinggi

**Unique angle**: bukan generator, tapi **co-pilot untuk improve dokumen existing**. Beda positioning.

---

### C. Vertical-Specific Spec Generator

**Problem**: Generic AI docs kurang paham regulasi industry-specific. Fintech butuh risk section + compliance checklist. Healthcare butuh HIPAA considerations.

**Solusi**: 3 specialized generators:
- **AI Product Spec Generator** (untuk AI/ML products) — model card, eval criteria, bias check, data governance
- **Fintech App Spec Generator** — risk assessment, regulatory compliance (PCI DSS, PSD2), fraud prevention
- **Healthcare App Spec Generator** — HIPAA, patient data handling, clinical workflow

**Kenapa menarik**:
- Deep domain moat — butuh riset regulasi yang kompetitor generic AI nggak punya
- Higher pricing ($79–149/mo) karena specialized value
- Easier sales (compliance officers understand value instantly)
- Less competition di niche ini

**Effort**: 2–3 bulan per vertical | **Revenue potential**: tinggi tapi TAM lebih kecil

**Risk**: Harus riset domain dulu, atau partner dengan expert di vertical tersebut.

---

## Tier 2: Adjacent (Skill Transfer, Different Domain)

### D. AI User Research Synthesis Tool

**Problem**: UX researcher dapet 20–50 interview transcript, butuh 2 minggu untuk synthesize jadi insight yang actionable.

**Solusi**: 
- Upload transcript batch
- AI extract themes, pain points, quotes
- Auto-generate affinity diagram (visual)
- Export ke research report + persona
- Collaboration dengan PM/Designer

**Market**: UX research tools (Dovetail $100+/mo, UserTesting mahal). AI-first alternative belum ada yang dominate.

**Effort**: 2–3 bulan MVP | **Revenue potential**: tinggi, B2B willing to pay

---

### E. AI Content Brief Generator for SEO Writers

**Problem**: SEO/content writer butuh brief detail (keyword, search intent, outline, competitor analysis) sebelum nulis. Brief ini makan 1–2 jam per artikel.

**Solusi**:
- Input: target keyword + target audience
- Output: comprehensive brief (outline, entities to cover, FAQ, internal link suggestions, meta description)
- Optional: AI draft first paragraph untuk kickstart

**Market**: Content marketing tools (Surfer SEO, Frase, MarketMuse) — semua sudah ada AI. Tapi masih banyak yang generic, niche-specific (e.g., for B2B SaaS blog only) bisa beda.

**Effort**: 1.5–2 bulan MVP | **Revenue potential**: moderate, crowded market

**Honest take**: kompetisi sudah ramai, mungkin bukan best pick.

---

### F. AI Meeting → Action Item Sync

**Problem**: Meeting decisions hilang atau nggak di-followup karena分散 di Google Docs, Slack threads, Notion pages.

**Solusi**:
- Zoom/Meet/Teams integration → transcript capture
- AI extract: decisions, action items, blockers
- Auto-sync ke Jira/Linear/Asana
- Daily digest email: "Kemarin ada 3 action items yang belum di-claim"
- Slackbot untuk claim item langsung dari chat

**Market**: Already ada beberapa (Spinach AI, Granola, Tactiq). Tapi space masih early, no clear winner.

**Effort**: 2 bulan MVP | **Revenue potential**: tinggi, tapi crowded

---

## Tier 3: Wildcards (Longer Shot, But Higher Upside)

### G. AI Pair Programming Companion (untuk non-developers)

**Problem**: Non-tech founder punya ide tapi nggak bisa code. Mau bikin prototype simple tanpa hire developer.

**Solusi**: 
- Natural language → simple web app (using LLM + sandboxed env)
- Real-time preview saat ngetik
- Deploy ke subdomain langsung
- Export code (kalau mau maintain sendiri nanti)

**Market**: Ada Bubble, Glide, Softr (no-code). Plus Cursor, v0, Replit Agent (AI code gen). Tapi gap untuk "non-tech yang mau bikin web app simple" masih ada.

**Effort**: 3+ bulan MVP (kompleks) | **Revenue potential**: sangat tinggi kalau hit

**Risk**: teknis, AI code masih sering error, support cost tinggi.

---

### H. AI Second Brain for Personal Knowledge

**Problem**: Orang save artikel, bookmark, notes di banyak tempat (Notion, browser, Apple Notes). Nggak pernah di-review lagi.

**Solusi**:
- Capture dari banyak source (browser ext, mobile share, email forward)
- AI auto-tag, summarize, connect dengan existing notes
- Daily/weekly "what you saved this week" digest
- Smart search: cari bukan by keyword tapi by concept

**Market**: Mem AI, Reflect, NotebookLM — semua udah masuk. Tapi personal AI masih very early, belum ada winner.

**Effort**: 2–3 bulan MVP | **Revenue potential**: tinggi, viral potential

---

### I. AI Consultant for Solo Founders

**Problem**: Solo founder butuh advice tapi nggak punya co-founder, mentor, atau $500/jam consultant.

**Solusi**:
- Chat interface, trained dengan knowledge dari Y Combinator, Paul Graham essays, SaaS metrics, growth playbooks
- Bisa akses "mentor" 24/7
- Specific use case: "Aku punya churn 8%/bulan, gimana?", "Ready to raise seed round?"

**Market**: Advice/media bisnis udah crowded (Twitter threads, newsletters, podcasts). Tapi interactive AI mentor belum banyak.

**Effort**: 1 bulan MVP (mostly prompt engineering) | **Revenue potential**: moderate, B2C

**Honest take**: harder to monetize, value perception rendah dibanding SaaS B2B.

---

## Prioritas Rekomendasi

| Urutan | Project | Alasan |
|---|---|---|
| **1** | SaaS Doc Generator (sekarang) | Mulai eksekusi |
| **2** | AI Workflow for PMs (A) | Pivot natural kalau doc generator nggak dapat traction |
| **3** | AI PRD Reviewer (B) | Bisa di-bundle dengan doc generator |
| **4** | AI User Research Synthesis (D) | Market menarik, skill transfer |
| **5** | Vertical Spec Generator (C) | Setelah ada capital & waktu |

**Setelah doc generator stabil** (Phase 8+), pilih berdasarkan:
- **Paling related** ke user base yang sudah ada → AI Workflow for PMs (A)
- **Paling different** untuk diversification → AI User Research (D)
- **Paling defensible** long-term → Vertical Spec (C)

---

## Heuristik Memilih Project Berikutnya

1. **Kalau user doc generator minta "ada tool X juga"** → bangun itu (existing demand)
2. **Kalau ada market baru yang suddenly hot** (e.g., AI agents) → eksplorasi cepat, 1–2 minggu prototype
3. **Kalau bosan dengan problem space yang sama** → pilih yang beda domain (Tier 2/3)
4. **Kalau ada co-founder/partner** → pilih yang lebih kompleks (Vertical Spec)
5. **Kalau solo + butuh cashflow** → pilih yang paling deket dengan monetization (PRD Reviewer)

---

## Yang TIDAK akan aku tambahin

- **Mobile app** (effort besar, ROI lama)
- **Hardware/IoT** (di luar skill)
- **Marketplace/UGC platform** (chicken-and-egg problem, susah solo)
- **Game/entertainment** (commoditized, AI belum bisa compete dengan studio)

**Itu terlalu random atau terlalu besar untuk solo dev side project.**

---

## Update Berkala

Backlog ini akan aku update kalau:
- Doc generator launch & ada signal dari user (request fitur, masalah yang mereka sebutkan)
- Market baru muncul (AI agent, voice AI, dsb)
- Kamu dapat insight baru soal problem yang kamu temuin di build

Review setiap 3 bulan: tambah ide baru, archive yang udah nggak relevan.

**Definisi sukses untuk backlog ini**:
- 1 project berhasil dapat traction (100+ paid user) per tahun
- 2–3 project di-explorasi (prototype + early feedback) per tahun
- 1 pivot per tahun (kalau project utama stuck)
