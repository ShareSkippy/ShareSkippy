export async function GET() {
  // DISABLED: This endpoint was sending unwanted test emails
  return Response.json({
    success: false,
    message: 'Test email endpoint has been disabled to prevent unwanted emails'
  }, { status: 403 });

  try {
    console.log('🧪 Testing actual email sending...');
    
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const testEmail = 'kcolban@gmail.com';
    
    console.log('Sending test email to:', testEmail);
    
    const { data, error } = await resend.emails.send({
      from: 'ShareSkippy <onboarding@resend.dev>',
      to: testEmail,
      subject: 'ShareSkippy Test Email ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">🐕 ShareSkippy</h1>
          <h2>Email System Test</h2>
          <p>Hi there!</p>
          <p>This is a test email to verify that your ShareSkippy email system is working correctly!</p>
          <p>If you received this email, your email system is working perfectly! 🎉</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://shareskippy.com" 
               style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Visit ShareSkippy
            </a>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            Happy tails,<br>The ShareSkippy Team 🐕
          </p>
        </div>
      `,
      text: `ShareSkippy Test Email

Hi there!

This is a test email to verify that your ShareSkippy email system is working correctly!

If you received this email, your email system is working perfectly! 🎉

Happy tails,
The ShareSkippy Team 🐕`
    });
    
    if (error) {
      console.error('Resend error:', error);
      return Response.json({
        success: false,
        error: 'Failed to send email',
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ Email sent successfully!', data);
    
    return Response.json({
      success: true,
      message: 'Test email sent successfully!',
      emailId: data.id,
      testEmail: testEmail
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Email test failed', 
        details: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    );
  }
}
