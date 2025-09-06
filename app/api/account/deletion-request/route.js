import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

// POST /api/account/deletion-request - Request account deletion
export async function POST(request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Log the authentication attempt for debugging
    console.log('Auth check:', { user: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    // Check if user already has a pending deletion request
    const { data: existingRequest, error: checkError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending account deletion request' 
      }, { status: 400 });
    }

    // Create new deletion request
    const { data: deletionRequest, error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        reason: reason || null
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      deletionRequest,
      message: 'Account deletion request submitted. Your account will be deleted in 30 days unless you cancel the request.'
    });

  } catch (error) {
    console.error('Error creating deletion request:', error);
    return NextResponse.json({ 
      error: 'Failed to submit deletion request. Please try again.' 
    }, { status: 500 });
  }
}

// GET /api/account/deletion-request - Get user's deletion request status
export async function GET() {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Log the authentication attempt for debugging
    console.log('GET Auth check:', { user: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.log('GET Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's deletion request status
    const { data: deletionRequest, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!deletionRequest) {
      return NextResponse.json({ 
        hasPendingRequest: false,
        deletionRequest: null 
      });
    }

    // Calculate days remaining
    const now = new Date();
    const scheduledDate = new Date(deletionRequest.scheduled_deletion_date);
    const daysRemaining = Math.ceil((scheduledDate - now) / (1000 * 60 * 60 * 24));

    return NextResponse.json({ 
      hasPendingRequest: true,
      deletionRequest: {
        ...deletionRequest,
        daysRemaining: Math.max(0, daysRemaining)
      }
    });

  } catch (error) {
    console.error('Error fetching deletion request:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch deletion request status' 
    }, { status: 500 });
  }
}

// DELETE /api/account/deletion-request - Cancel deletion request
export async function DELETE() {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, check if there's a pending deletion request
    const { data: existingRequest, error: checkError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (!existingRequest) {
      return NextResponse.json({ 
        error: 'No pending deletion request found to cancel' 
      }, { status: 404 });
    }

    // Cancel the pending deletion request
    const { error: updateError } = await supabase
      .from('account_deletion_requests')
      .update({ 
        status: 'cancelled',
        processed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account deletion request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling deletion request:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel deletion request. Please try again.' 
    }, { status: 500 });
  }
}
