# Northstar

Your north star for product specs. AI-powered generator for BRD, PRD, SRS, FSD, TSD documents.

## Structure

```
northstar/
├── docs/                    # Architecture, planning, strategy
│   └── architecture/        # 19 .md files (diagrams, roadmap, positioning)
│       ├── 00-index.md
│       ├── 01-context.md
│       └── ...
└── app/                     # Next.js application
    ├── README.md            # Setup & development
    ├── package.json
    ├── prisma/              # Schema + RLS
    ├── lib/                 # Helpers (db, auth, supabase)
    └── app/                 # Next.js App Router pages
```

## Quick Start

```bash
cd app
npm install
cp .env.example .env.local
# Isi env vars (Supabase, LLM keys, Stripe)
npm run prisma:migrate
npm run dev
```

Lihat [app/README.md](app/README.md) untuk detail.

## Documentation

- **Architecture diagrams**: [docs/architecture/](docs/architecture/)
- **Implementation timeline**: [docs/architecture/14-implementation-timeline.md](docs/architecture/14-implementation-timeline.md)
- **Positioning**: [docs/architecture/16-positioning.md](docs/architecture/16-positioning.md)
- **Beta strategy**: [docs/architecture/15-beta-launch-strategy.md](docs/architecture/15-beta-launch-strategy.md)

## Branch Strategy

| Branch | Purpose | Deploy to |
|---|---|---|
| `main` | Production code, always stable | Production (northstar.ai) |
| `staging` | Pre-prod testing, mirrors prod | Staging env |
| `develop` | Integration branch for features | Preview env (auto) |
| `feature/*` | Individual features | Preview env per PR |
| `fix/*` | Bug fixes | Preview env per PR |
| `docs/*` | Documentation only | No deploy |

### Workflow

1. **Create feature branch** dari `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/project-crud
   ```

2. **Develop & commit** di feature branch, push ke origin:
   ```bash
   git push -u origin feature/project-crud
   ```

3. **Open PR** ke `develop` → auto-deploy ke preview.

4. **Merge ke develop** setelah review → test integration.

5. **Release ke staging**: PR `develop` → `staging` → manual QA.

6. **Release ke production**: PR `staging` → `main` → deploy production.

### Emergency Hotfix

```bash
git checkout main
git checkout -b fix/critical-bug
# ... fix ...
git push -u origin fix/critical-bug
# PR ke main langsung, merge, deploy
# Lalu cherry-pick ke develop & staging
```

## License

Proprietary, all rights reserved.
