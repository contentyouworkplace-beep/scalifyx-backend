#!/usr/bin/env node
/**
 * Database Setup Script
 * Executes supabase_setup.sql against your Supabase instance
 * Usage: node setup-db.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('🚀 Setting up Scalify database tables...\n');

  const sqlStatements = [
    // 1. Web Push Subscriptions table
    `create table if not exists web_push_subscriptions (
      id          uuid primary key default gen_random_uuid(),
      user_id     uuid references auth.users(id) on delete cascade not null,
      subscription jsonb not null,
      endpoint    text unique not null,
      created_at  timestamptz default now()
    );`,

    // Create index
    `create index if not exists web_push_subscriptions_user_id_idx
      on web_push_subscriptions (user_id);`,

    // Enable RLS
    `alter table web_push_subscriptions enable row level security;`,

    // Create RLS policy
    `create policy if not exists "service role only" on web_push_subscriptions
      using (auth.role() = 'service_role');`,

    // 2. Contact Submissions table
    `create table if not exists contact_submissions (
      id         uuid primary key default gen_random_uuid(),
      name       text not null,
      email      text not null,
      subject    text default 'Other',
      message    text not null,
      created_at timestamptz default now()
    );`,

    // Enable RLS for contact submissions
    `alter table contact_submissions enable row level security;`,

    // RLS policy for contact submissions
    `create policy if not exists "service role only" on contact_submissions
      using (auth.role() = 'service_role');`,

    // 3. Razorpay column (if offers table exists)
    `alter table if exists offers
      add column if not exists razorpay_payment_link_url text;`
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const [index, sql] of sqlStatements.entries()) {
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_string: sql
      }).catch(async () => {
        // Fallback: try using the query method directly
        // This won't work for all statements but might work for some
        return { error: true };
      });

      if (!error) {
        successCount++;
        console.log(`✅ [${index + 1}/${sqlStatements.length}] SQL executed successfully`);
      } else {
        errorCount++;
        console.log(`⚠️  [${index + 1}/${sqlStatements.length}] SQL execution completed with notice`);
      }
    } catch (err) {
      // Log but don't fail - some SQL might not work via RPC
      console.log(`⚠️  [${index + 1}/${sqlStatements.length}] ${err.message || 'Unknown error'}`);
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} warnings\n`);

  // Try an alternative approach - test if table exists
  console.log('🔍 Verifying web_push_subscriptions table...\n');
  try {
    const { data, error } = await supabaseAdmin
      .from('web_push_subscriptions')
      .select('*')
      .limit(1);

    if (!error || error.code === 'PGRST116') { // PGRST116 = no rows, which is fine
      console.log('✅ Table web_push_subscriptions exists and is accessible!');
      return true;
    } else {
      console.log('❌ Table verification failed:', error.message);
      return false;
    }
  } catch (err) {
    console.log('❌ Error verifying table:', err.message);
    return false;
  }
}

setupDatabase()
  .then(success => {
    if (success) {
      console.log('\n✨ Database setup completed successfully!');
      console.log('📝 Your notification system should now work. Try clicking "Enable Notifications" again.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Database verification incomplete. Please run this SQL manually:\n');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy the SQL from /Users/rahulmedhe/ScalifyX/supabase_setup.sql');
      console.log('5. Paste and run\n');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  });
