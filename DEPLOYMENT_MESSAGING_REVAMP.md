# Messaging Revamp - Deployment Guide

## Branch: `messaging-improvemnets`

This guide covers deploying the messaging revamp features to your environment.

## ✅ Pre-Deployment Checklist

- [x] Code committed and pushed to `messaging-improvemnets` branch
- [ ] Database migrations run
- [ ] Branch deployed to staging/production
- [ ] Features tested

## 📋 Step 1: Run Database Migrations

**IMPORTANT:** Run these migrations in order in your Supabase SQL Editor.

### Migration 1: Schema Updates
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of: `supabase/migrations/20250127120000_messaging_revamp.sql`
3. Review the migration (it adds columns, indexes, and constraints)
4. Click "Run" to execute

**What this does:**
- Adds `last_active_at` to `profiles` table
- Adds `read_at` to `messages` table
- Adds indexes for performance
- Updates conversation constraints
- Adds role validation

### Migration 2: Backfill Legacy Data
1. In the same SQL Editor
2. Copy and paste the contents of: `supabase/migrations/20250127120001_backfill_conversation_ids.sql`
3. Review the backfill script
4. Click "Run" to execute

**What this does:**
- Creates conversations for existing message pairs
- Assigns `conversation_id` to legacy messages
- Normalizes participant order (p1 < p2)
- Merges duplicate conversations
- Updates `last_message_at` timestamps

**⚠️ Note:** The backfill script is idempotent and can be run multiple times safely.

## 🚀 Step 2: Deploy Branch to Vercel

### Option A: Automatic Deployment (if branch previews enabled)
If your Vercel project has branch previews enabled, the branch should automatically deploy when pushed. Check your Vercel dashboard for the deployment.

### Option B: Manual Deployment
1. Go to your Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Click "Create Deployment"
5. Select branch: `messaging-improvemnets`
6. Click "Deploy"

### Option C: Via Vercel CLI
```bash
vercel --prod --branch messaging-improvemnets
```

## 🧪 Step 3: Test Deployment

After deployment, test these features:

1. **Deep Linking**
   - Navigate to `/messages?c=<conversationId>`
   - Should load the specific conversation

2. **Optimistic Sending**
   - Send a message
   - Should appear immediately before server confirmation

3. **Read Receipts**
   - Send a message to another user
   - Have them read it
   - Should show "Seen at [timestamp]" below your message

4. **Profile/Availability Cards**
   - Open a conversation
   - Check right sidebar (desktop) for profile and availability cards

5. **Filter Pills**
   - Click "All" and "Unread" filters
   - Should filter conversations correctly
   - Selection should persist on page reload

6. **Login Toast**
   - Log out and log back in with unread messages
   - Should see toast notification

## 🔍 Verification Queries

Run these in Supabase SQL Editor to verify migrations:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('last_active_at', 'role');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'read_at';

-- Check if indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'messages' 
AND indexname LIKE 'idx_messages%';

-- Check conversation_id backfill
SELECT 
  COUNT(*) as total_messages,
  COUNT(conversation_id) as messages_with_conv_id,
  COUNT(*) - COUNT(conversation_id) as messages_without_conv_id
FROM messages;
```

## 🐛 Troubleshooting

### Migration Errors
- If constraint already exists: The migration uses `IF NOT EXISTS` and `DROP CONSTRAINT IF EXISTS`, so it should be safe to re-run
- If backfill fails: Check for duplicate conversations manually and resolve conflicts

### Deployment Issues
- Check Vercel build logs for errors
- Verify environment variables are set
- Check that all new API routes are accessible

### Feature Issues
- Check browser console for errors
- Verify Supabase RLS policies allow access
- Check that migrations ran successfully

## 📝 Rollback Plan

If you need to rollback:

1. **Code Rollback**: Deploy previous branch/commit
2. **Database Rollback**: 
   - The new columns (`last_active_at`, `read_at`) are nullable, so they won't break existing code
   - The unique constraint can be dropped if needed:
     ```sql
     DROP INDEX IF EXISTS conversations_participants_unique;
     ```
   - The backfill script is non-destructive (only adds `conversation_id`, doesn't remove data)

## ✅ Post-Deployment

- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Verify all features working
- [ ] Monitor database performance

---

**Branch:** `messaging-improvemnets`  
**Commit:** Latest commit on branch  
**Do NOT merge to main** until testing is complete.

