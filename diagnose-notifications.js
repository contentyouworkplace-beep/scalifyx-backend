#!/usr/bin/env node
/**
 * Push Notifications Diagnostic Script
 * Checks the complete notification flow
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE credentials in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function diagnose() {
  console.log('🔍 Scalify Push Notifications Diagnostic\n');
  console.log('═'.repeat(50) + '\n');

  // 1. Check VAPID Keys
  console.log('1️⃣  VAPID Keys Configuration:');
  const hasPublicKey = !!process.env.VAPID_PUBLIC_KEY;
  const hasPrivateKey = !!process.env.VAPID_PRIVATE_KEY;
  const hasEmail = !!process.env.VAPID_EMAIL;
  console.log(`   ✓ Public Key:  ${hasPublicKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ✓ Private Key: ${hasPrivateKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ✓ Email:       ${hasEmail ? '✅ Set' : '❌ Missing'}\n`);

  // 2. Check web-push package
  console.log('2️⃣  Web-Push Package:');
  try {
    const webpush = require('web-push');
    console.log(`   ✅ web-push module loaded successfully\n`);
  } catch {
    console.log(`   ❌ web-push module not found\n`);
  }

  // 3. Check web_push_subscriptions table
  console.log('3️⃣  Database Tables:');
  try {
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('web_push_subscriptions')
      .select('*', { count: 'exact' })
      .limit(0);

    if (subError) {
      console.log(`   ❌ web_push_subscriptions table: ${subError.message}`);
    } else {
      const count = subscriptions?.length || 0;
      console.log(`   ✅ web_push_subscriptions table exists`);
      console.log(`   📊 Total subscriptions stored: ${count}\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error checking subscriptions: ${err.message}\n`);
  }

  // 4. Check Admin Users
  console.log('4️⃣  Admin Users:');
  try {
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, role')
      .eq('role', 'admin');

    if (adminError) {
      console.log(`   ⚠️  Error querying admins: ${adminError.message}`);
    } else if (!admins || admins.length === 0) {
      console.log(`   ❌ No admin users found in profiles table`);
      console.log(`   💡 Check: Does your admin user have role='admin'?\n`);
    } else {
      console.log(`   ✅ Found ${admins.length} admin user(s):`);
      admins.forEach((admin, i) => {
        console.log(`      ${i + 1}. ${admin.name || admin.email} (ID: ${admin.id.slice(0, 8)}...)`);
      });
      console.log();

      // 5. Check subscriptions for each admin
      console.log('5️⃣  Admin Subscriptions:');
      for (const admin of admins) {
        const { data: subs, error: subError } = await supabaseAdmin
          .from('web_push_subscriptions')
          .select('*')
          .eq('user_id', admin.id);

        if (subError) {
          console.log(`   ❌ ${admin.email}: Error - ${subError.message}`);
        } else if (!subs || subs.length === 0) {
          console.log(`   ⚠️  ${admin.email}: No subscriptions saved`);
          console.log(`      💡 Has the admin clicked "Enable Notifications"?`);
        } else {
          console.log(`   ✅ ${admin.email}: ${subs.length} subscription(s) saved`);
          subs.forEach((sub, i) => {
            const hasKeys = sub.subscription?.keys && sub.subscription.keys.auth && sub.subscription.keys.p256dh;
            const endpoint = sub.endpoint ? sub.endpoint.slice(0, 50) + '...' : 'N/A';
            console.log(`      ${i + 1}. Endpoint: ${endpoint}`);
            console.log(`         Keys valid: ${hasKeys ? '✅ Yes' : '❌ No'}`);
          });
        }
      }
    }
  } catch (err) {
    console.log(`   ❌ Error checking admin users: ${err.message}\n`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('\n📋 Summary & Next Steps:\n');

  console.log('If you see:');
  console.log('  ✅ All items green     → System is ready! Try signing up with a test user.');
  console.log('  ⚠️  Red admin users     → Click "Enable Notifications" in admin panel first.');
  console.log('  ❌ Missing VAPID keys   → Check .env file has VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY.');
  console.log('\n');
}

diagnose()
  .catch(err => {
    console.error('❌ Diagnostic error:', err.message);
    process.exit(1);
  });
