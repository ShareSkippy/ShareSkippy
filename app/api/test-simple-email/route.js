import { sendEmail } from '@/libs/resend';

export async function GET() {
  // DISABLED: This endpoint was sending unwanted test emails
  return Response.json({
    success: false,
    message: 'Test email endpoint has been disabled to prevent unwanted emails'
  }, { status: 403 });

  // Original code below (disabled):
  /*
  try {
    const testEmail = 'kaia@kaia.dev';
    
    console.log('🧪 Testing simple email...');

    // Simple test email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ShareSkippy Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">🐕 ShareSkippy</h1>
          <p style="color: #6b7280;">Email System Test</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Welcome to ShareSkippy! 🎉</h2>
          <p>Hi Test User,</p>
          <p>This is a test email to verify that your ShareSkippy email system is working correctly!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://shareskippy.com" 
               style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Visit ShareSkippy
            </a>
          </div>
          
          <p>If you received this email, your email system is working perfectly! 🎉</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>Happy tails,<br>The ShareSkippy Team 🐕</p>
        </div>
      </body>
      </html>
    `;

    const text = `Welcome to ShareSkippy! 🎉

Hi Test User,

This is a test email to verify that your ShareSkippy email system is working correctly!

If you received this email, your email system is working perfectly! 🎉

Happy tails,
The ShareSkippy Team 🐕`;

    await sendEmail({
      to: testEmail,
      subject: 'ShareSkippy Email System Test ✅',
      html,
      text,
    });

    console.log('✅ Test email sent successfully!');

    return Response.json({
      success: true,
      message: 'Test email sent successfully!',
      testEmail: testEmail
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Email test failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

