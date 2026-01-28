#!/usr/bin/env node

/**
 * Backfill script for community_growth_day135 emails
 *
 * This script schedules the 135-day community growth email for existing users
 * who signed up before the feature was added (January 22, 2026).
 *
 * Usage:
 *   DRY_RUN=true node scripts/backfill-community-growth-emails.js  # Preview only
 *   node scripts/backfill-community-growth-emails.js               # Actually insert
 *
 * Required environment variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (not anon key)
 */

const { createClient } = require('@supabase/supabase-js');

const FEATURE_RELEASE_DATE = '2026-01-22T00:00:00Z';
const EMAIL_TYPE = 'community_growth_day135';
const DAYS_AFTER_SIGNUP = 135;

async function backfillCommunityGrowthEmails() {
  const isDryRun = process.env.DRY_RUN === 'true';

  console.log('='.repeat(60));
  console.log('COMMUNITY GROWTH EMAIL BACKFILL SCRIPT');
  console.log('='.repeat(60));
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log(`Feature release date: ${FEATURE_RELEASE_DATE}`);
  console.log(`Email type: ${EMAIL_TYPE}`);
  console.log(`Days after signup: ${DAYS_AFTER_SIGNUP}`);
  console.log('');

  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:');
    if (!supabaseUrl) console.error('  - SUPABASE_URL');
    if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Usage:');
    console.error(
      '  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-community-growth-emails.js'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Step 1: Verify email_catalog has the email type
  console.log('Step 1: Verifying email_catalog entry...');
  const { data: catalogEntry, error: catalogError } = await supabase
    .from('email_catalog')
    .select('id, description, enabled')
    .eq('id', EMAIL_TYPE)
    .single();

  if (catalogError || !catalogEntry) {
    console.error(`Email type "${EMAIL_TYPE}" not found in email_catalog table.`);
    console.error('You need to add it first:');
    console.error(`  INSERT INTO email_catalog (id, description, enabled)`);
    console.error(`  VALUES ('${EMAIL_TYPE}', '135-day community growth email', true);`);
    process.exit(1);
  }

  console.log(`  Found: ${catalogEntry.id} - ${catalogEntry.description}`);
  console.log(`  Enabled: ${catalogEntry.enabled}`);
  console.log('');

  // Step 2: Find users who signed up before the feature was added
  console.log('Step 2: Finding users who signed up before feature release...');
  const { data: existingUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, first_name, created_at')
    .lt('created_at', FEATURE_RELEASE_DATE)
    .order('created_at', { ascending: true });

  if (usersError) {
    console.error('Failed to fetch users:', usersError.message);
    process.exit(1);
  }

  console.log(`  Found ${existingUsers.length} users who signed up before ${FEATURE_RELEASE_DATE}`);
  console.log('');

  if (existingUsers.length === 0) {
    console.log('No users to backfill. Exiting.');
    process.exit(0);
  }

  // Step 3: Check which users already have this email scheduled
  console.log('Step 3: Checking for existing scheduled emails...');
  const userIds = existingUsers.map((u) => u.id);

  const { data: existingScheduled, error: scheduledError } = await supabase
    .from('scheduled_emails')
    .select('user_id')
    .eq('email_type', EMAIL_TYPE)
    .in('user_id', userIds);

  if (scheduledError) {
    console.error('Failed to fetch existing scheduled emails:', scheduledError.message);
    process.exit(1);
  }

  const alreadyScheduledUserIds = new Set(existingScheduled?.map((e) => e.user_id) || []);
  console.log(`  ${alreadyScheduledUserIds.size} users already have this email scheduled`);
  console.log('');

  // Step 4: Filter to users who need the email scheduled
  const usersToBackfill = existingUsers.filter((user) => !alreadyScheduledUserIds.has(user.id));
  console.log(`Step 4: ${usersToBackfill.length} users need backfilling`);
  console.log('');

  if (usersToBackfill.length === 0) {
    console.log('All existing users already have this email scheduled. Nothing to do.');
    process.exit(0);
  }

  // Step 5: Calculate run_after dates and prepare inserts
  console.log('Step 5: Preparing scheduled email records...');
  const now = new Date();
  const emailsToInsert = [];
  const immediateEmails = [];
  const futureEmails = [];

  for (const user of usersToBackfill) {
    const signupDate = new Date(user.created_at);
    const runAfter = new Date(signupDate);
    runAfter.setDate(runAfter.getDate() + DAYS_AFTER_SIGNUP);

    const record = {
      user_id: user.id,
      email_type: EMAIL_TYPE,
      run_after: runAfter.toISOString(),
      payload: {},
    };

    emailsToInsert.push(record);

    if (runAfter <= now) {
      immediateEmails.push({ user, runAfter });
    } else {
      futureEmails.push({ user, runAfter });
    }
  }

  console.log(`  ${immediateEmails.length} emails will be sent immediately (135 days already passed)`);
  console.log(`  ${futureEmails.length} emails will be sent in the future`);
  console.log('');

  // Show sample of immediate emails
  if (immediateEmails.length > 0) {
    console.log('Sample of users whose 135 days have passed:');
    for (const { user, runAfter } of immediateEmails.slice(0, 5)) {
      const signupDate = new Date(user.created_at);
      const daysSinceSignup = Math.floor((now - signupDate) / (1000 * 60 * 60 * 24));
      console.log(
        `  - ${user.email || user.id}: signed up ${signupDate.toISOString().split('T')[0]}, ${daysSinceSignup} days ago`
      );
    }
    if (immediateEmails.length > 5) {
      console.log(`  ... and ${immediateEmails.length - 5} more`);
    }
    console.log('');
  }

  // Show sample of future emails
  if (futureEmails.length > 0) {
    console.log('Sample of users who will receive email in the future:');
    for (const { user, runAfter } of futureEmails.slice(0, 5)) {
      const daysUntilEmail = Math.ceil((runAfter - now) / (1000 * 60 * 60 * 24));
      console.log(
        `  - ${user.email || user.id}: will receive email on ${runAfter.toISOString().split('T')[0]} (${daysUntilEmail} days)`
      );
    }
    if (futureEmails.length > 5) {
      console.log(`  ... and ${futureEmails.length - 5} more`);
    }
    console.log('');
  }

  // Step 6: Insert records (or dry run)
  if (isDryRun) {
    console.log('='.repeat(60));
    console.log('DRY RUN COMPLETE - No changes were made');
    console.log('='.repeat(60));
    console.log('');
    console.log('To actually insert these records, run without DRY_RUN=true:');
    console.log('  node scripts/backfill-community-growth-emails.js');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${emailsToInsert.length} scheduled_emails records would be inserted`);
    console.log(`  - ${immediateEmails.length} emails would be sent on next cron run`);
    console.log(`  - ${futureEmails.length} emails would be sent in the future`);
    process.exit(0);
  }

  console.log('Step 6: Inserting scheduled email records...');

  // Insert in batches of 100 to avoid timeouts
  const BATCH_SIZE = 100;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < emailsToInsert.length; i += BATCH_SIZE) {
    const batch = emailsToInsert.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase.from('scheduled_emails').insert(batch);

    if (insertError) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, insertError.message);
      errorCount += batch.length;
    } else {
      insertedCount += batch.length;
      console.log(
        `  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(emailsToInsert.length / BATCH_SIZE)} (${insertedCount}/${emailsToInsert.length})`
      );
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('BACKFILL COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Successfully inserted: ${insertedCount}`);
  console.log(`  Failed: ${errorCount}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. The cron job at /api/cron/process-scheduled-emails runs daily at 9 AM UTC');
  console.log(`  2. ${immediateEmails.length} emails will be sent on the next cron run`);
  console.log(`  3. ${futureEmails.length} emails will be sent on their scheduled dates`);
  console.log('');
  console.log('To manually trigger processing now:');
  console.log('  curl https://www.shareskippy.com/api/cron/process-scheduled-emails');
}

// Run the script
backfillCommunityGrowthEmails().catch((error) => {
  console.error('Script failed with error:', error);
  process.exit(1);
});
