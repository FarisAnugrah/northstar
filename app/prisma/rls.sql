-- RLS Policies for PRD AI
-- Run this in Supabase SQL Editor after running prisma migrate.
-- Defense-in-depth: Prisma filters at app level, RLS enforces at DB level.

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "intakes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prd_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prd_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE "userId" = auth.uid()
    AND "workspaceId" = ws_id
  );
$$;

-- users: can read own user
CREATE POLICY "users_read_own" ON "users"
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE
  USING (id = auth.uid());

-- workspaces: members can read; owner can update
CREATE POLICY "workspaces_read_members" ON "workspaces"
  FOR SELECT
  USING (is_workspace_member(id));

CREATE POLICY "workspaces_update_owner" ON "workspaces"
  FOR UPDATE
  USING ("ownerId" = auth.uid());

CREATE POLICY "workspaces_insert_authenticated" ON "workspaces"
  FOR INSERT
  WITH CHECK ("ownerId" = auth.uid());

-- memberships: can read memberships in your workspace
CREATE POLICY "memberships_read_workspace" ON "memberships"
  FOR SELECT
  USING (is_workspace_member("workspaceId"));

CREATE POLICY "memberships_insert_owner" ON "memberships"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = "workspaceId" AND w."ownerId" = auth.uid()
    )
  );

CREATE POLICY "memberships_delete_owner" ON "memberships"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = "workspaceId" AND w."ownerId" = auth.uid()
    )
  );

-- projects: workspace members can read/write
CREATE POLICY "projects_read_workspace" ON "projects"
  FOR SELECT
  USING (is_workspace_member("workspaceId"));

CREATE POLICY "projects_write_workspace" ON "projects"
  FOR ALL
  USING (is_workspace_member("workspaceId"))
  WITH CHECK (is_workspace_member("workspaceId"));

-- intakes: same as projects
CREATE POLICY "intakes_read_workspace" ON "intakes"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = "projectId" AND is_workspace_member(p."workspaceId")
    )
  );

-- prds, prd_versions, prd_sections, comments: same pattern
CREATE POLICY "prds_read_workspace" ON "prds"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = "projectId" AND is_workspace_member(p."workspaceId")
    )
  );

CREATE POLICY "prd_versions_read_workspace" ON "prd_versions"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prds p
      JOIN projects pr ON pr.id = p."projectId"
      WHERE p.id = "prdId" AND is_workspace_member(pr."workspaceId")
    )
  );

CREATE POLICY "prd_sections_read_workspace" ON "prd_sections"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prd_versions v
      JOIN prds p ON p.id = v."prdId"
      JOIN projects pr ON pr.id = p."projectId"
      WHERE v.id = "versionId" AND is_workspace_member(pr."workspaceId")
    )
  );

CREATE POLICY "comments_read_workspace" ON "comments"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prd_versions v
      JOIN prds p ON p.id = v."prdId"
      JOIN projects pr ON pr.id = p."projectId"
      WHERE v.id = "versionId" AND is_workspace_member(pr."workspaceId")
    )
  );

-- subscriptions: only workspace owner
CREATE POLICY "subscriptions_read_owner" ON "subscriptions"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = "workspaceId" AND (w."ownerId" = auth.uid() OR is_workspace_member("workspaceId"))
    )
  );

-- audit_logs: workspace members can read, but not write directly (only via service role)
CREATE POLICY "audit_logs_read_workspace" ON "audit_logs"
  FOR SELECT
  USING (
    "workspaceId" IS NULL OR is_workspace_member("workspaceId")
  );

-- Important: no INSERT/UPDATE/DELETE policy for audit_logs means
-- only service role can write. App code must use prisma with service role context.
