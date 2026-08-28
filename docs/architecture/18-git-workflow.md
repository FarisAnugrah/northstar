# GitHub Setup & Branch Protection

Setelah push repo ke GitHub, setup branch protection di Settings → Branches.

## Branch Protection Rules

### `production`
- ✅ Require pull request reviews before merging (min 1 approver)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - `lint`
  - `typecheck`
  - `build`
- ✅ Require linear history (no merge commits)
- ❌ Allow force push (blocked)
- ❌ Allow deletion (blocked)

### `staging`
- ✅ Require pull request reviews (min 1 approver)
- ✅ Require status checks to pass
  - `lint`
  - `typecheck`
  - `build`
- ✅ Require linear history
- ❌ Allow force push
- ❌ Allow deletion

### `development` (default)
- ❌ No required reviews (solo dev workflow)
- ✅ Require status checks
  - `lint`
  - `typecheck`
- ✅ Allow force push (with lease, untuk rebase)
- ❌ Allow deletion

## Setup Commands

```bash
# 1. Create repo di GitHub (UI, kosong, no README/license/.gitignore)
# 2. Add remote
git remote add origin git@github.com:yourusername/northstar.git

# 3. Push semua branches
git push -u origin production
git push -u origin staging
git push -u origin development

# 4. Set default branch di GitHub Settings → General → Default branch → development
```

## GitHub Actions (akan di-setup di Phase 9)

CI workflow `.github/workflows/ci.yml`:
- Trigger: PR ke `development`, `staging`, `production`
- Steps: install → lint → typecheck → build → test
- Required status check name: `lint`, `typecheck`, `build`

## Convention Commit

Format: `<type>(<scope>): <subject>`

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance (deps, config) |
| `docs` | Documentation only |
| `refactor` | Code refactor, no behavior change |
| `test` | Add/update tests |
| `style` | Formatting, no logic change |

Example: `feat(intake): add multi-step form with zod validation`

## PR Template

Akan disimpan di `.github/PULL_REQUEST_TEMPLATE.md` saat mulai pakai PR di Phase 1+.
