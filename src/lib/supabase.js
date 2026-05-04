const { createClient } = require('@supabase/supabase-js');

let _supabase = null;
let _supabaseAdmin = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return _supabaseAdmin;
}

// Lazy proxies — keep existing `supabase.from(...)` usage working
const supabase = new Proxy({}, {
  get(_, prop) { return getSupabase()[prop]; },
});

const supabaseAdmin = new Proxy({}, {
  get(_, prop) { return getSupabaseAdmin()[prop]; },
});

module.exports = { supabase, supabaseAdmin };
