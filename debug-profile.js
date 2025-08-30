// Debug script for profile save issues
// Run this in the browser console on the profile edit page

async function debugProfileSave() {
  console.log('=== Profile Save Debug ===');
  
  // Check if user is authenticated
  const { createClient } = await import('/libs/supabase/client.js');
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('❌ User authentication error:', userError);
    return;
  }
  
  if (!user) {
    console.error('❌ No authenticated user found');
    return;
  }
  
  console.log('✅ User authenticated:', user.id);
  
  // Test profile read
  console.log('Testing profile read...');
  const { data: profile, error: readError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (readError) {
    console.error('❌ Profile read error:', readError);
  } else {
    console.log('✅ Profile read successful:', profile);
  }
  
  // Test profile write with minimal data
  console.log('Testing profile write...');
  const testData = {
    id: user.id,
    email: user.email,
    first_name: 'Test',
    last_name: 'User',
    phone_number: '555-1234',
    role: 'dog_owner',
    updated_at: new Date().toISOString()
  };
  
  const { data: writeData, error: writeError } = await supabase
    .from('profiles')
    .upsert(testData, { onConflict: 'id' });
    
  if (writeError) {
    console.error('❌ Profile write error:', writeError);
    console.error('Error details:', {
      code: writeError.code,
      message: writeError.message,
      details: writeError.details,
      hint: writeError.hint
    });
  } else {
    console.log('✅ Profile write successful:', writeData);
  }
  
  // Test RLS policies
  console.log('Testing RLS policies...');
  const { data: policies, error: policyError } = await supabase
    .rpc('get_policies', { table_name: 'profiles' })
    .catch(() => ({ data: null, error: 'RPC not available' }));
    
  if (policyError) {
    console.log('ℹ️ Could not check RLS policies directly:', policyError);
  } else {
    console.log('✅ RLS policies:', policies);
  }
}

// Run the debug function
debugProfileSave();
