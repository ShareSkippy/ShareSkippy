export async function GET() {
  // DISABLED: This endpoint was accessible publicly
  return Response.json({
    success: false,
    message: 'Test endpoint has been disabled'
  }, { status: 403 });

  try {
    console.log('🧪 Testing Resend configuration...');
    
    // Check if RESEND_API_KEY is set
    const hasApiKey = !!process.env.RESEND_API_KEY;
    console.log('RESEND_API_KEY exists:', hasApiKey);
    
    if (!hasApiKey) {
      return Response.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment variables'
      }, { status: 500 });
    }
    
    // Try to import and use Resend
    const { Resend } = await import('resend');
    new Resend(process.env.RESEND_API_KEY);
    
    console.log('Resend instance created successfully');
    
    return Response.json({
      success: true,
      message: 'Resend configuration is working',
      hasApiKey: true,
      apiKeyLength: process.env.RESEND_API_KEY.length
    });

  } catch (error) {
    console.error('❌ Resend test failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Resend test failed', 
        details: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    );
  }
}

