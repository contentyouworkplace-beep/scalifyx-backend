// Seed admin user in Supabase
// Run: node seed-admin.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_EMAIL = 'scalifyxpro@gmail.com';
const ADMIN_PASSWORD = 'Vardaan@RM5678';
const ADMIN_NAME = 'Scalify Admin';

async function seedAdmin() {
  console.log('Creating admin user...');

  // Create auth user
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME },
  });

  if (createError) {
    if (createError.message.includes('already been registered')) {
      console.log('Admin user already exists. Updating role & password...');
      // Find existing user
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const adminUser = users.find(u => u.email === ADMIN_EMAIL);
      if (adminUser) {
        // Update password
        await supabase.auth.admin.updateUserById(adminUser.id, {
          password: ADMIN_PASSWORD,
        });
        // Upsert profile role
        await supabase
          .from('profiles')
          .upsert({ id: adminUser.id, role: 'admin', name: ADMIN_NAME, email: ADMIN_EMAIL }, { onConflict: 'id' });
        console.log('Admin role & password updated!');
      }
      return;
    }
    console.error('Error creating admin:', createError.message);
    return;
  }

  // Set admin role in profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', name: ADMIN_NAME, email: ADMIN_EMAIL })
    .eq('id', user.user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError.message);
    return;
  }

  console.log('');
  console.log('✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Use 5-tap on logo in login screen to enter admin mode.');
}

seedAdmin().catch(console.error);
