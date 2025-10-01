import { createClient } from '@/libs/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: userError 
      }, { status: 401 });
    }
    
    // Test profile read
    const { data: profile, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Test profile write
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
    
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      profileRead: { data: profile, error: readError },
      profileWrite: { data: writeData, error: writeError }
    });
    
  } catch (error) {
    console.error('Profile test error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

