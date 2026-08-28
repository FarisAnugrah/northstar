# 15 — Beta → Launch Strategy

Strategi validasi pasar sebelum monetisasi. **Prinsip: bukti willingness to pay sebelum launch paid.**

---

## Filosofi

1. **Bukti dulu, uang kemudian.** Jangan monetize sebelum ada signal kuat.
2. **Beta gratis = riset, bukan marketing.** Target: belajar, bukan revenue.
3. **Decision = data, bukan optimism.** Threshold jelas, bukan "feeling".
4. **Rollback-friendly.** Kalau signal lemah, pivot tanpa burn.

---

## Fase Beta: 2–3 Bulan

### Struktur Tier (Saat Beta)

| Tier | Harga | Limit | Tujuan |
|---|---|---|---|
| **Beta Free** | $0 | 10 PRD/bulan, 1 user | Volume & feedback |
| **Beta Pro** | $19/mo (locked-in) | 50 PRD/bulan, 5 seats | Validate willingness to pay |
| **Beta Lifetime** | $199 one-time, max 30 user | Unlimited, all features | Cash upfront + evangelist |

**Catatan penting**:
- **Beta Pro $19 = diskon dari final $29**, sebagai reward early adopter.
- **Lifetime deal dibatasi 30 user** supaya nggak jadi beban seumur hidup.
- **Free tier 10 PRD/bulan** = cukup untuk validasi, terlalu banyak = boncos LLM.
- **Stripe tetap pakai test mode** sampai final launch (kecuali kamu mau real money di beta — bisa, tapi hati-hati refund).

### Timeline Beta

| Minggu | Aktivitas | Target |
|---|---|---|
| 1–2 | Onboard 10 personal network | 10 signup, 8 active |
| 3–4 | Post ke komunitas (IH, Reddit, Twitter) | +40 signup |
| 5–6 | Cold outreach 50 founder | +20 signup, 5–10 aktif |
| 7–8 | Survey NPS + willingness to pay | Data terkumpul |
| 9 | Evaluasi metrics → keputusan go/no-go | Decision point |
| 10–12 | Kalau GO: prepare paid launch | Stripe live, pricing page |

---

## Metrics yang Di-track

### Activation & Engagement

| Metric | Definisi | Target minimum |
|---|---|---|
| **Signup → 1st PRD** | % user yang generate minimal 1 PRD dalam 7 hari | > 40% |
| **7-day retention** | % user yang balik dalam 7 hari setelah signup | > 30% |
| **PRD completion** | % PRD yang di-export (vs abandoned) | > 60% |
| **Edit-after-AI rate** | % PRD yang di-edit minimal 1 section setelah AI generate | > 70% |

### Quality Signal

| Metric | Definisi | Target |
|---|---|---|
| **NPS** | Dari survey 30 hari | > 30 |
| **"Mau bayar" rate** | Survey: "Kalau berbayar $29/mo, mau lanjut?" | > 40% bilang "ya" |
| **Feedback score** | Rata-rata rating (1–5) di in-app feedback | > 3.8 |

### Conversion

| Metric | Definisi | Target |
|---|---|---|
| **Free → paid** | % free user yang upgrade ke Pro dalam 60 hari | > 5% |
| **Time to convert** | Median hari dari signup → paid | < 30 hari |
| **Lifetime deal sold** | Jumlah LTD yang terjual | 10–30 (capped) |

### Unit Economics (Track Real Cost)

| Metric | Definisi | Catatan |
|---|---|---|
| **COGS per active user** | LLM + infra ÷ user aktif | Target < $3 |
| **LLM token per PRD** | Rata-rata token usage | Monitor trend |
| **Free tier abuse rate** | % free user yang hit limit | < 20% (kalau tinggi, naikkan limit atau turunkan LLM cost) |

---

## Decision Framework: GO / NO-GO / ITERATE

Di akhir minggu 8, evaluasi pakai **scoring system**:

| Signal | Bobot | Pass | Fail |
|---|---|---|---|
| 7-day retention > 30% | 3x | Yes | No |
| NPS > 30 | 2x | Yes | No |
| "Mau bayar" > 40% | 3x | Yes | No |
| Edit-after-AI > 70% | 2x | Yes | No |
| Free→paid pilot (5+ user) | 3x | Yes | No |
| COGS < $4/user | 2x | Yes | No |
| Negative feedback dominan | 2x | No issues | Major issues |

**Hitung total**:
- **Skor 12+ dari 15 max** → **GO** (launch paid)
- **Skor 8–11** → **ITERATE** (3 bulan lagi, fix weak signals)
- **Skor < 8** → **PIVOT atau side project** (jangan paksa)

### Contoh Skenario

**Skenario A (GO)**:
- 150 signup, 50 aktif mingguan
- 7-day retention: 45%
- NPS: 42
- 8 user upgrade ke Pro $19 (5.3% conversion)
- COGS: $2.80/user
- → Launch paid dengan confidence.

**Skenario B (ITERATE)**:
- 200 signup, tapi cuma 20 aktif
- 7-day retention: 18%
- NPS: 25
- 1 user upgrade
- Feedback dominan: "AI hasilnya generic"
- → Improve prompt + tambah section customization, beta diperpanjang 6 minggu.

**Skenario C (PIVOT)**:
- 50 signup setelah 2 bulan outreach habis-habisan
- Retention: 10%
- 0 paid
- Feedback: "Lebih gampang pakai ChatGPT langsung"
- → Jadi side project, atau pivot ke niche lain (misal: PRD khusus untuk B2B SaaS only).

---

## Cara Cari Beta User (Budget $0)

### Tier 1: Personal Network (Minggu 1–2)
- 10–20 PM/BA yang kamu kenal langsung
- Kirim personal message, bukan blast
- Minta mereka pakai 2 minggu, kasih feedback
- **Conversion expected**: 60–80% signup, 50% aktif

### Tier 2: Communities (Minggu 3–4)
- **Indie Hackers**: post di "Show IH" + komentar di thread relevan
- **Reddit**: r/ProductManagement, r/SaaS, r/Entrepreneur (value-first, jangan hard sell)
- **Twitter/X**: #buildinpublic thread harian, tag founder tools
- **Slack communities**: Product School, Mind the Product, MicroConf
- **Conversion expected**: 2–5% dari view → signup

### Tier 3: Cold Outreach (Minggu 5–6)
- 50 founder startup kecil (indie, pre-seed, seed)
- Email template: 1 paragraf, jelasin value, no attachment
- Subject line: "Quick question about your PRD process"
- **Conversion expected**: 10–20% reply, 30% signup dari yang reply

### Tier 4: Content (Ongoing)
- Tulis 2–3 blog post tentang "cara nulis PRD" atau "PRD template gratis"
- SEO keyword: "PRD template", "AI product manager", "PRD generator"
- Include subtle CTA: "Coba generator otomatisnya di [link]"
- **Conversion expected**: lambat tapi compounding

---

## Anti-Pattern: Yang Jangan Dilakukan

| Anti-pattern | Kenapa bahaya |
|---|---|
| **Lifetime deal unlimited** | Burn cash tanpa lock-in, support beban seumur hidup |
| **Beta terlalu panjang (>4 bulan)** | User bosan, momentum hilang, opportunity cost naik |
| **Discount terlalu besar untuk non-paying** | Orang yang nggak mau bayar tetap nggak akan bayar |
| **Hard-sell ke free user** | Churn spike, brand rusak |
| **LDR (long decision reasoning) tanpa data** | Optimisme ≠ market fit |
| **Skip beta, langsung launch paid** | Salah positioning, refund spike, churn tinggi |
| **Terlalu banyak fitur sebelum launch** | Engineering burn, distract dari core value |

---

## Post-Beta: Launch Plan (Kalau GO)

### Minggu 9–10: Persiapan
- Enable Stripe live mode
- Pricing page final (bandingkan tier, FAQ)
- Onboarding email sequence (3 emails: welcome, tips, upgrade)
- Status page (statuspage.io free tier)
- Update privacy policy + ToS untuk commercial

### Minggu 11: Product Hunt + Indie Hackers Launch
- Submit ke ProductHunt (siapkan assets: logo, GIF demo, screenshots)
- Post di IH "Launch" section
- Email blast ke beta user (mereka dapat loyalty discount)

### Minggu 12+: Iterate Based on Paid Feedback
- Weekly review churn reason
- Monthly release notes
- Quarterly pricing review

---

## Risk Mitigation

| Risiko | Mitigasi |
|---|---|
| **LLM provider outage saat demo** | Multi-provider abstraction, fallback logic |
| **Free tier abuse** (bot) | Email verification, rate limit per IP + user |
| **Refund spike** setelah paid launch | 30-day money-back guarantee, clear expectation setting |
| **Customer support overwhelm** | Help center + Discord/forum (komunitas bantu jawab) |
| **Competitor copy fitur** | Speed of iteration, niche specialization, real customer lock-in |
| **LTD buyer churn setelah launch** | Limit LTD features (e.g., no team seats, no integrations) |

---

## Prinsip yang Tidak Bisa Dikompromi

1. **RLS aktif dari day 1** — keamanan bukan feature, baseline.
2. **Stripe webhook idempotency** — no double charge, no race condition.
3. **Quota enforcement** — free tier benar-benar dibatasi, jangan bocor.
4. **Data export milik user** — kapan pun bisa export semua PRD mereka.
5. **No dark pattern** — jangan trap user, transparan tentang limit.

**Skipped dari strategi**: paid ads budget, SEO content calendar detail, partnership strategy, PR/media plan.
**Add when**: sudah ada 10+ paying customer dan cashflow positif, baru invest di growth.

---

## Definisi Sukses untuk Beta Ini

**Minimum viable success**:
- 50 active user di minggu ke-8
- 5+ user upgrade ke paid (walaupun cuma $19)
- 1 testimonial positif yang bisa dipakai untuk marketing
- COGS di bawah $4/user
- Clear understanding: siapa ICP (ideal customer profile)

**Stretch success**:
- 200+ active user
- 20+ paid conversion
- NPS > 50
- Organic word-of-mouth (>30% signup dari referral)
- Inbound interest (orang DM/email mau demo)

Kalau cuma minimum → lanjut iterasi. Kalau stretch → fuel untuk launch lebih agresif.
