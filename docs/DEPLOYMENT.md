# Deployment Guide

This document describes the deployment and approval processes for ShareSkippy.

## Database Migration Approval Process

Database migrations require manual approval before they are applied to the production database. This is implemented using GitHub Environment Protection Rules.

### How It Works

1. **PR Review & Merge**: Code changes (including migrations) go through normal PR review and are merged to `main`
2. **Automatic Trigger**: When migrations are pushed to `main`, the CI workflow automatically triggers
3. **Approval Gate**: The workflow pauses and waits for manual approval from designated reviewers
4. **Notification**: Designated reviewers receive a notification to approve the deployment
5. **Review**: Reviewers examine the migration files and approve or reject the deployment
6. **Execution**: Once approved, the migration runs automatically against the production database

### Setting Up Environment Protection (Repository Admins)

If you are a repository administrator and need to configure the production environment protection:

1. Navigate to **Settings** → **Environments** in the GitHub repository
2. Create a new environment named `production` (if it doesn't exist)
3. Configure the following protection rules:
   - ✅ Enable **Required reviewers**
   - Add 1-2 trusted maintainers who have database expertise
   - Optionally set a **Wait timer** (e.g., 5 minutes) to allow time for review
4. Configure environment secrets (if needed):
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_REF`

### Approving a Migration Deployment

When a migration is ready for approval:

1. Go to **Actions** tab in the repository
2. Find the running workflow (it will show "Waiting" status)
3. Click on the workflow run
4. Click **Review deployments**
5. Review the migration files in the associated PR or commit
6. Check the "production" environment checkbox
7. Click **Approve and deploy** (or **Reject** if issues are found)

### Best Practices

- **Review Before Approval**: Always examine the migration SQL before approving
- **Check for Risks**: Look for:
  - `DROP` statements that could delete data
  - Schema changes that might break the running application
  - Missing rollback strategies
  - Performance impacts (missing indexes, full table scans)
- **Coordinate Deployments**: Ensure the application code is compatible with the migration
- **Monitor After Deployment**: Watch logs and metrics after the migration runs

### Benefits of This Approach

- **Separation of Concerns**: Code review (PR approval) is separate from deployment approval
- **Audit Trail**: All deployment approvals are logged with reviewer identity and timestamp
- **Flexibility**: Can approve/reject based on timing, current system state, or other factors
- **Safety**: Prevents accidental automatic deployment of potentially destructive migrations
- **Fast PR Workflow**: PRs can be merged quickly; deployment happens on its own schedule

## Frontend/Application Deployment

The Next.js application is automatically deployed to Vercel on every push to `main`. No manual approval is required for application code deployments.

Vercel provides:
- Automatic preview deployments for PRs
- Production deployments from `main`
- Rollback capability through the Vercel dashboard

## Emergency Procedures

### Rolling Back a Migration

If a migration causes issues in production:

1. **Immediate**: If the migration is still running, reject it in GitHub Actions
2. **Post-deployment**: Create a rollback migration that reverses the changes
3. **Critical**: If data loss occurred, contact the database administrator immediately

### Bypassing Approval (Emergency Only)

In extreme emergencies, repository administrators can:

1. Temporarily disable environment protection in Settings → Environments
2. Re-run the workflow
3. **Immediately re-enable** protection after the emergency is resolved

This should only be used for critical production incidents and must be documented in a post-mortem.
